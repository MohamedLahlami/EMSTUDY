import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Search, Download } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { format } from "date-fns";
import { Quiz, Submission, Student } from "../../types";

// Mock API function for submissions - will be replaced with real API calls
const getSubmissionsByQuiz = async (quizId: number): Promise<Submission[]> => {
  // This is a placeholder - in a real implementation, we'd use an API call
  console.log("Fetching submissions for quiz", quizId);
  return []; // Return empty array for now
};

const QuizSubmissionsPage: React.FC = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getQuizDetails } = useCourses();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

        // Load submissions
        const submissionsData = await getSubmissionsByQuiz(Number(quizId));
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
    const student = submission.student;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.username.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      (student.studentGroup &&
        student.studentGroup.toLowerCase().includes(searchLower))
    );
  });

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
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
                  onClick={() =>
                    alert("Export feature will be implemented later")
                  }
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
                placeholder="Search by student name, email or group..."
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
                    <th className="px-6 py-3 border-b">Student</th>
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
                            {submission.student.username}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {submission.student.email}
                          </div>
                          {submission.student.studentGroup && (
                            <div className="text-gray-500 text-xs">
                              Group: {submission.student.studentGroup}
                            </div>
                          )}
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
                            {submission.score.toFixed(1)}
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
