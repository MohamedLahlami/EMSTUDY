import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Search, Download } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { format } from "date-fns";
import { Quiz, SubmissionDTO } from "../../types"; // Changed Submission to SubmissionDTO
import { getSubmissionsForQuizByTeacher } from "../../api/submissionApi";

const QuizSubmissionsPage: React.FC = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getQuizDetails } = useCourses();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDTO[]>([]); // Use SubmissionDTO[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!quizId) return;

      setLoading(true);
      try {
        // Load quiz data
        const quizData = await getQuizDetails(Number(quizId));
        setQuiz(quizData);

        // Load submissions using the new API function
        const submissionsData = await getSubmissionsForQuizByTeacher(
          Number(quizId)
        );
        setSubmissions(submissionsData);

        setLoading(false);
      } catch (err) {
        console.error("Error loading submissions:", err);
        setError("Failed to load quiz submissions");
        setLoading(false);
      }
    };

    loadData();
  }, [quizId, getQuizDetails]);

  // Check if user is a teacher
  if (currentUser?.role !== "Teacher") {
    return (
      <PageLayout>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          You don't have permission to view this page.
        </div>
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </PageLayout>
    );
  }

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter((submission) => {
    if (!submission) {
      // Check if submission itself is defined
      return false;
    }
    const searchLower = searchTerm.toLowerCase();
    // Search directly on submission.username
    return submission.username?.toLowerCase().includes(searchLower);
  });

  const formatDateTime = (dateString: string | undefined) => {
    // Made dateString optional
    if (!dateString) return "N/A"; // Handle undefined dateString
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
  };

  const handleExportResults = () => {
    if (!quiz || filteredSubmissions.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = [
      "Submission ID",
      "Student ID",
      "Student Username",
      "Start Time",
      "End Time",
      "Score",
      "Status",
    ];

    const rows = filteredSubmissions.map((sub) => [
      sub.submissionId,
      sub.studentId,
      sub.username,
      formatDateTime(sub.startTime),
      formatDateTime(sub.endTime),
      sub.score?.toFixed(1) ?? "N/A",
      sub.submitted ? "Submitted" : "In Progress",
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach((rowArray) => {
      const row = rowArray.join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeQuizTitle = quiz.title
      .replace(/[^a-z0-9_]+/gi, "-")
      .toLowerCase();
    link.setAttribute(
      "download",
      `${safeQuizTitle}_submissions_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLayout>
      <div className="mb-4">
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Quiz Submissions</h1>
      {quiz && <h2 className="text-lg text-gray-600 mb-6">{quiz.title}</h2>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Summary</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Total Submissions: {submissions.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  icon={<Download size={16} />}
                  onClick={handleExportResults} // Updated onClick handler
                >
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by student username..." // Updated placeholder
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-500 p-8 rounded-lg text-center">
              No submissions yet for this quiz.
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-500 p-8 rounded-lg text-center">
              No submissions match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b">Student (ID)</th>{" "}
                    {/* Updated Header */}
                    <th className="px-6 py-3 border-b">Start Time</th>
                    <th className="px-6 py-3 border-b">End Time</th>
                    <th className="px-6 py-3 border-b">Score</th>
                    <th className="px-6 py-3 border-b">Status</th>
                    <th className="px-6 py-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.submissionId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {submission.username}{" "}
                            {/* Use submission.username */}
                          </div>
                          <div className="text-gray-500 text-sm">
                            ID: {submission.studentId} {/* Display studentId */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDateTime(submission.startTime)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDateTime(submission.endTime)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {submission.submitted ? (
                          <span className="font-medium">
                            {submission.score?.toFixed(1)}{" "}
                            {/* Optional chaining for score */}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {submission.submitted ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Submitted
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            navigate(
                              `/courses/${courseId}/quizzes/${quizId}/submissions/${submission.submissionId}`
                            )
                          }
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default QuizSubmissionsPage;
