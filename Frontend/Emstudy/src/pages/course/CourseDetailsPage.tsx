import { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import {
  Book,
  FileText,
  Calendar,
  Users,
  Clock,
  Plus,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import PageLayout from "../../components/layout/PageLayout";
import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Course, CourseMaterial, Quiz, Submission } from "../../types";
import api from "../../api/apiClient";
import QuizManager from "../../components/quiz/QuizManager";
import {
  getMaterialFileContent, // Import the updated function
  getMarkdownMaterial,
} from "../../api/materialApi"; // Adjust path if necessary
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteItem } from "../../api/courseItemApi";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizSubmissions, setQuizSubmissions] = useState<{
    [quizId: number]: Submission | null;
  }>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { currentUser } = useAuth();
  const {
    getCourseDetails,
    getCourseItems,
    createMaterial,
    createQuiz,
    getCurrentUserSubmissions,
    deleteCourse,
  } = useCourses();

  // Add state for selected image to view in modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to get file extension from material type
  const getFileExtension = (material: CourseMaterial): string => {
    switch (material.courseMaterialType) {
      case "PDF":
        return ".pdf";
      case "IMAGE":
        return material.url?.split(".").pop()?.toLowerCase().includes("png")
          ? ".png"
          : ".jpg";
      case "VIDEO":
        return ".mp4";
      case "DOCUMENT":
        return ".doc";
      default:
        return "";
    }
  };

  // Function to handle downloading files with authentication
  const handleDownload = async (materialToDownload: CourseMaterial) => {
    if (!materialToDownload.itemId) return;
    try {
      const blob = await getMaterialFileContent(
        materialToDownload.itemId,
        true
      ); // true for download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Try to get a sensible filename
      a.download =
        materialToDownload.title || `material-${materialToDownload.itemId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Error downloading material:", error);
      // Add user feedback (e.g., toast notification)
    }
  };

  // Function to get image data from the API
  const [imageBlobs, setImageBlobs] = useState<Record<number, string>>({});

  const loadImage = async (material: CourseMaterial) => {
    try {
      const response = await api.get(`/materials/image/${material.itemId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      setImageBlobs((prev) => ({
        ...prev,
        [material.itemId!]: url,
      }));
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  // Load images when materials change
  useEffect(() => {
    // Clear previous image blobs first
    Object.values(imageBlobs).forEach((url) => {
      window.URL.revokeObjectURL(url);
    });
    setImageBlobs({});

    // Load new images
    materials.forEach((material) => {
      if (material.courseMaterialType === "IMAGE") {
        loadImage(material);
      }
    });

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(imageBlobs).forEach((url) => {
        window.URL.revokeObjectURL(url);
      });
    };
  }, [materials]);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Load course
        const courseData = await getCourseDetails(Number(courseId));
        if (!courseData) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Load course items
        const items = await getCourseItems(Number(courseId));
        // Separate materials and quizzes
        const materialsData = items.filter(
          (item) => item.itemType === "CM"
        ) as CourseMaterial[];
        const quizzesData = items.filter(
          (item) => item.itemType === "Q"
        ) as Quiz[];

        setMaterials(materialsData);
        setQuizzes(quizzesData);

        // If user is a student, load their quiz submissions
        if (currentUser?.role === "Student" && quizzesData.length > 0) {
          setLoadingSubmissions(true);
          try {
            const submissions = await getCurrentUserSubmissions();
            const submissionsMap: { [quizId: number]: Submission | null } = {};

            // Map submissions to quiz IDs
            submissions.forEach((submission) => {
              if (submission.quiz && submission.quiz.itemId) {
                submissionsMap[submission.quiz.itemId] = submission;
              }
            });

            setQuizSubmissions(submissionsMap);
          } catch (err) {
            console.error("Error loading quiz submissions:", err);
          } finally {
            setLoadingSubmissions(false);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading course data:", err);
        setError("Failed to load course data. Please try again later.");
        setLoading(false);
      }
    };

    loadData();
  }, [
    courseId,
    getCourseDetails,
    getCourseItems,
    currentUser,
    getCurrentUserSubmissions,
  ]);

  const isTeacher = currentUser?.role === "Teacher";

  useEffect(() => {
    if (isTeacher && activeTab === "students" && courseId) {
      const fetchEnrollments = async () => {
        try {
          const res = await api.get(`/enrollments/courses/${courseId}`);
          setStudentEnrollments(res.data);
        } catch (err) {
          setStudentEnrollments([]);
        }
      };
      fetchEnrollments();
    }
  }, [activeTab, isTeacher, courseId]);

  if (!courseId) {
    return <Navigate to="/courses" />;
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !course) {
    return (
      <PageLayout>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Failed to load course"}
        </div>
        <Button variant="outline" onClick={() => navigate("/courses")}>
          Back to Courses
        </Button>
      </PageLayout>
    );
  }

  const handleAddMaterial = async (materialData: {
    title: string;
    file: File;
  }) => {
    try {
      await createMaterial(
        Number(courseId),
        materialData.title,
        materialData.file
      );
      setShowAddMaterial(false);
      // Refresh materials
      const items = await getCourseItems(Number(courseId));
      const materialsData = items.filter(
        (item) => item.itemType === "CM"
      ) as CourseMaterial[];
      setMaterials(materialsData);
    } catch (error) {
      console.error("Failed to add material:", error);
    }
  };

  const handleCreateQuiz = async (quizData: Quiz) => {
    try {
      await createQuiz(Number(courseId), quizData);
      setShowCreateQuiz(false);
      // Refresh quizzes
      const items = await getCourseItems(Number(courseId));
      const quizzesData = items.filter(
        (item) => item.itemType === "Q"
      ) as Quiz[];
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  const handleViewQuiz = (quiz: Quiz) => {
    navigate(`/courses/${courseId}/quizzes/${quiz.itemId}`);
  };

  // Student quiz cards now showing score instead of Start button when quiz is completed
  const renderStudentQuizList = () => {
    if (quizzes.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-500">
            Your teacher has not created any quizzes yet.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const submission = quizSubmissions[quiz.itemId!];
          const hasSubmitted = submission?.submitted === true;

          return (
            <Card key={quiz.itemId}>
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    <FileText className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {quiz.title}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration: {quiz.durationInMinutes} minutes</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {hasSubmitted ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-green-600 mb-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        {submission.score !== undefined && (
                          <div className="text-lg font-semibold text-gray-800">
                            Score: {submission.score.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewQuiz(quiz)}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  console.log("All materials:", materials);
  materials.forEach((m) => {
    console.log("Material type:", m.courseMaterialType, "ID:", m.itemId, m);
  });

  function MaterialCard({
    material,
    imageBlobs,
    setSelectedImage,
    handleDownload,
    isTeacher,
    onDelete,
  }: {
    material: CourseMaterial;
    imageBlobs: Record<number, string>;
    setSelectedImage: (url: string) => void;
    handleDownload: (material: CourseMaterial) => void;
    isTeacher: boolean;
    onDelete: (itemId: number) => void;
  }) {
    // MARKDOWN
    if (material.courseMaterialType === "MARKDOWN") {
      const [content, setContent] = useState("");
      const [loading, setLoading] = useState(false);
      useEffect(() => {
        let isMounted = true;
        const fetchMarkdown = async () => {
          setLoading(true);
          try {
            const text = await getMarkdownMaterial(material.itemId!);
            if (isMounted) setContent(text);
          } catch (e) {
            if (isMounted) setContent("Failed to load markdown content.");
          } finally {
            if (isMounted) setLoading(false);
          }
        };
        fetchMarkdown();
        return () => {
          isMounted = false;
        };
      }, [material.itemId]);
      return (
        <Card key={material.itemId}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {material.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Added:{" "}
                    {material.addDate
                      ? format(new Date(material.addDate), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                {loading ? (
                  <div className="text-gray-400 italic">
                    Loading markdown...
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                )}
              </div>
              <div className="ml-4 flex gap-2">
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this item?"
                        )
                      ) {
                        onDelete(material.itemId!);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    // IMAGE
    if (
      material.courseMaterialType === "IMAGE" &&
      imageBlobs[material.itemId!]
    ) {
      return (
        <Card key={material.itemId}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {material.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Added:{" "}
                    {material.addDate
                      ? format(new Date(material.addDate), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                <div className="mt-3">
                  <img
                    src={imageBlobs[material.itemId!]}
                    alt={material.title}
                    className="max-w-full max-h-96 rounded-md shadow-sm cursor-pointer"
                    onClick={() =>
                      setSelectedImage(imageBlobs[material.itemId!])
                    }
                  />
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(imageBlobs[material.itemId!])}
                  disabled={!imageBlobs[material.itemId!]}
                >
                  View Full Size
                </Button>
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this item?"
                        )
                      ) {
                        onDelete(material.itemId!);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    // PDF
    if (material.courseMaterialType === "PDF") {
      const [pdfUrl, setPdfUrl] = useState<string | null>(null);
      const [pdfLoading, setPdfLoading] = useState(false);

      useEffect(() => {
        let isMounted = true;
        if (material.itemId) {
          setPdfLoading(true);
          getMaterialFileContent(material.itemId, false) // false for inline display
            .then((blob) => {
              if (isMounted) {
                const objectUrl = URL.createObjectURL(blob);
                setPdfUrl(objectUrl);
              }
            })
            .catch((err) => {
              console.error("Failed to load PDF for inline display", err);
              if (isMounted) setPdfUrl(null); // Or set an error state
            })
            .finally(() => {
              if (isMounted) setPdfLoading(false);
            });
        }
        return () => {
          isMounted = false;
          if (pdfUrl && pdfUrl.startsWith("blob:")) {
            URL.revokeObjectURL(pdfUrl); // Clean up object URL
          }
        };
      }, [material.itemId]); // Removed pdfUrl from dependencies to avoid re-fetch loops

      return (
        <Card key={material.itemId}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {material.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Added:{" "}
                    {material.addDate
                      ? format(new Date(material.addDate), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                <div className="mt-3">
                  {pdfLoading && <p>Loading PDF preview...</p>}
                  {!pdfLoading && pdfUrl && (
                    <iframe
                      src={pdfUrl} // Use the object URL
                      title={material.title}
                      width="100%"
                      height="500px"
                      className="rounded-md border"
                    />
                  )}
                  {!pdfLoading && !pdfUrl && <p>Could not load PDF preview.</p>}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)} // Uses the updated handleDownload
                >
                  Download
                </Button>
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this item?"
                        )
                      ) {
                        onDelete(material.itemId!);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    // VIDEO
    if (material.courseMaterialType === "VIDEO") {
      return (
        <Card key={material.itemId}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {material.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Added:{" "}
                    {material.addDate
                      ? format(new Date(material.addDate), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                <div className="mt-3">
                  {material.url ? (
                    <video
                      src={material.url}
                      controls
                      width="100%"
                      className="rounded-md border"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <p>Video URL not available.</p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)} // Uses the updated handleDownload
                >
                  Download
                </Button>
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this item?"
                        )
                      ) {
                        onDelete(material.itemId!);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    // Plain text (txt)
    if (
      (material.courseMaterialType === "DOCUMENT" ||
        material.courseMaterialType === "OTHER") &&
      material.url &&
      material.url.endsWith(".txt")
    ) {
      const [content, setContent] = useState("");
      const [loading, setLoading] = useState(false);
      useEffect(() => {
        let isMounted = true;
        const fetchText = async () => {
          setLoading(true);
          try {
            const res = await fetch(material.url);
            const text = await res.text();
            if (isMounted) setContent(text);
          } catch (e) {
            if (isMounted) setContent("Failed to load text file.");
          } finally {
            if (isMounted) setLoading(false);
          }
        };
        fetchText();
        return () => {
          isMounted = false;
        };
      }, [material.url]);
      return (
        <Card key={material.itemId}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {material.title}
                </h3>
                {material.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {material.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Added:{" "}
                    {material.addDate
                      ? format(new Date(material.addDate), "MMM d, yyyy")
                      : "Unknown date"}
                  </span>
                </div>
                <div className="mt-3">
                  {loading ? (
                    <div className="text-gray-400 italic">Loading text...</div>
                  ) : (
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {content}
                    </pre>
                  )}
                </div>
              </div>
              <div className="ml-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)}
                >
                  Download
                </Button>
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this item?"
                        )
                      ) {
                        onDelete(material.itemId!);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    // Fallback: download only
    return (
      <Card key={material.itemId}>
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {material.title}
              </h3>
              {material.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {material.description}
                </p>
              )}
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Added:{" "}
                  {material.addDate
                    ? format(new Date(material.addDate), "MMM d, yyyy")
                    : "Unknown date"}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Preview not available for this file type.
              </p>
            </div>
            <div className="ml-4 flex gap-2">
              <Button
                variant="primary" // Or outline
                size="sm"
                onClick={() => handleDownload(material)} // Uses the updated handleDownload
              >
                Download {material.courseMaterialType?.toLowerCase()}
              </Button>
              {isTeacher && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this item?"
                      )
                    ) {
                      onDelete(material.itemId!);
                    }
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem(itemId);
      // Refresh items
      if (courseId) {
        const items = await getCourseItems(Number(courseId));
        const materialsData = items.filter(
          (item) => item.itemType === "CM"
        ) as CourseMaterial[];
        const quizzesData = items.filter(
          (item) => item.itemType === "Q"
        ) as Quiz[];
        setMaterials(materialsData);
        setQuizzes(quizzesData);
      }
    } catch (err) {
      alert("Failed to delete item. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-white text-opacity-90 mt-1">
              Join Code: {course.joinCode}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "materials"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("materials")}
          >
            Materials
          </button>

          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "quizzes"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("quizzes")}
          >
            Quizzes
          </button>

          {isTeacher && (
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "students"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("students")}
            >
              Students
            </button>
          )}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Course Description</h2>
                {isTeacher && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                  >
                    Delete Course
                  </Button>
                )}
              </div>
              <p className="text-gray-700 mb-6">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveTab("students")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-medium">
                          Enrolled Students
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        {course.enrollments?.length || 0} students
                      </p>
                    </CardContent>
                  </div>
                </Card>

                <Card>
                  <div
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setActiveTab("materials")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <Book className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-medium">Course Content</h3>
                      </div>
                      <p className="text-gray-600">
                        {materials.length} materials, {quizzes.length} quizzes
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Course Materials</h2>
                {isTeacher && (
                  <Button
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowAddMaterial(true)}
                  >
                    Add Material
                  </Button>
                )}
              </div>

              {materials.length > 0 ? (
                <div className="space-y-4">
                  {materials.map((material) => (
                    <MaterialCard
                      key={material.itemId}
                      material={material}
                      imageBlobs={imageBlobs}
                      setSelectedImage={setSelectedImage}
                      handleDownload={handleDownload}
                      isTeacher={isTeacher}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No course materials yet
                  </h3>
                  <p className="text-gray-500">
                    {isTeacher
                      ? "Add your first material to help your students learn."
                      : "Your teacher has not added any materials yet."}
                  </p>
                </div>
              )}

              {showAddMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Add Material</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const title = (
                          form.elements.namedItem("title") as HTMLInputElement
                        ).value;
                        const file = (
                          form.elements.namedItem("file") as HTMLInputElement
                        ).files?.[0];

                        if (title && file) {
                          handleAddMaterial({ title, file });
                        }
                      }}
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File
                        </label>
                        <input
                          type="file"
                          name="file"
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setShowAddMaterial(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Add Material
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Image Viewer Modal */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="max-w-[90vw] max-h-[90vh] relative">
                    <img
                      src={selectedImage}
                      alt="Full size"
                      className="max-w-full max-h-[90vh] rounded-md"
                    />
                    <button
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div>
              {isTeacher ? (
                // Teacher view - use the new QuizManager component
                <QuizManager courseId={Number(courseId)} />
              ) : (
                // Student view - use the new renderStudentQuizList function
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Quizzes</h2>
                  </div>

                  {loadingSubmissions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">
                        Loading quiz records...
                      </p>
                    </div>
                  ) : (
                    renderStudentQuizList()
                  )}
                </>
              )}

              {/* Remove the teacher's quiz creation modal since it's handled in QuizManager now */}
              {isTeacher && showCreateQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                    <h2 className="text-xl font-bold mb-4">Create Quiz</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const title = (
                          form.elements.namedItem("title") as HTMLInputElement
                        ).value;
                        const duration = parseInt(
                          (
                            form.elements.namedItem(
                              "duration"
                            ) as HTMLInputElement
                          ).value
                        );
                        const showCorrectAnswers = (
                          form.elements.namedItem(
                            "showCorrectAnswers"
                          ) as HTMLInputElement
                        ).checked;

                        if (title && duration) {
                          const newQuiz: Quiz = {
                            itemId: 0, // Will be set by the server
                            title,
                            addDate: new Date().toISOString(),
                            itemType: "Q",
                            durationInMinutes: duration,
                            showCorrectAnswers,
                            questions: [],
                          };

                          handleCreateQuiz(newQuiz);
                        }
                      }}
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          min="1"
                          defaultValue="30"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="showCorrectAnswers"
                            className="h-4 w-4 text-blue-600 mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Show correct answers after submission
                          </span>
                        </label>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Note: You'll be able to add questions after creating the
                        quiz.
                      </p>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setShowCreateQuiz(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Create Quiz
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "students" && isTeacher && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Enrolled Students</h2>
              {studentEnrollments && studentEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {studentEnrollments.map((enrollment) => (
                    <Card key={enrollment.enrollmentId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {enrollment.student?.username || "Student"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {enrollment.student?.email || "No email"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Enrolled:{" "}
                              {format(
                                new Date(enrollment.enrollmentDate),
                                "MMM d, yyyy"
                              )}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              /* Handle remove student */
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No students enrolled
                  </h3>
                  <p className="text-gray-500">
                    Share your course join code with students to enroll them.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Delete Course?
            </h2>
            <p className="mb-6">
              Are you sure you want to delete this course? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isLoading={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    if (courseId) {
                      const success = await deleteCourse(Number(courseId));
                      if (success) {
                        navigate("/courses");
                      } else {
                        alert("Failed to delete course. Please try again.");
                      }
                    }
                  } finally {
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CourseDetailsPage;
