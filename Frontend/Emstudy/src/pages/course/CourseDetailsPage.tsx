import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Book, FileText, Calendar, Users, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import PageLayout from "../../components/layout/PageLayout";
import { useCourses } from "../../context/CourseContext";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Course, CourseMaterial, Quiz } from "../../types";
import api from "../../api/apiClient";

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

  const { currentUser } = useAuth();
  const { getCourseDetails, getCourseItems, createMaterial, createQuiz } =
    useCourses();

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
  const handleDownload = async (material: CourseMaterial) => {
    try {
      const response = await api.get(`/materials/${material.itemId}`, {
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Add appropriate file extension to the download
      const extension = getFileExtension(material);
      a.download = `${material.title}${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download material:", error);
      alert("Failed to download. Please try again.");
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
        [material.itemId]: url,
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
        setLoading(false);
      } catch (err) {
        console.error("Error loading course data:", err);
        setError("Failed to load course data. Please try again later.");
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, getCourseDetails, getCourseItems]);

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

  const isTeacher = currentUser?.role === "Teacher";

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
              <h2 className="text-xl font-semibold mb-4">Course Description</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium">Enrolled Students</h3>
                    </div>
                    <p className="text-gray-600">
                      {course.enrollments?.length || 0} students
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Book className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium">Course Content</h3>
                    </div>
                    <p className="text-gray-600">
                      {materials.length} materials, {quizzes.length} quizzes
                    </p>
                  </CardContent>
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
                                  ? format(
                                      new Date(material.addDate),
                                      "MMM d, yyyy"
                                    )
                                  : "Unknown date"}
                              </span>
                            </div>

                            {/* Display image if material type is IMAGE and blob is loaded */}
                            {material.courseMaterialType === "IMAGE" &&
                              imageBlobs[material.itemId] && (
                                <div className="mt-3">
                                  <img
                                    src={imageBlobs[material.itemId]}
                                    alt={material.title}
                                    className="max-w-full max-h-96 rounded-md shadow-sm cursor-pointer"
                                    onClick={() =>
                                      setSelectedImage(
                                        imageBlobs[material.itemId]
                                      )
                                    }
                                  />
                                </div>
                              )}
                          </div>
                          <div className="ml-4">
                            {material.courseMaterialType === "IMAGE" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedImage(imageBlobs[material.itemId])
                                }
                                disabled={!imageBlobs[material.itemId]}
                              >
                                View Full Size
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(material)}
                              >
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Quizzes</h2>
                {isTeacher && (
                  <Button
                    variant="primary"
                    icon={<Plus size={18} />}
                    onClick={() => setShowCreateQuiz(true)}
                  >
                    Create Quiz
                  </Button>
                )}
              </div>

              {quizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
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
                              <span>
                                Duration: {quiz.durationInMinutes} minutes
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuiz(quiz)}
                            >
                              {isTeacher ? "Edit" : "Start"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No quizzes yet
                  </h3>
                  <p className="text-gray-500">
                    {isTeacher
                      ? "Create your first quiz to test your students' knowledge."
                      : "Your teacher has not created any quizzes yet."}
                  </p>
                </div>
              )}

              {showCreateQuiz && (
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

              {course.enrollments && course.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {course.enrollments.map((enrollment) => (
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
    </PageLayout>
  );
};

export default CourseDetailsPage;
