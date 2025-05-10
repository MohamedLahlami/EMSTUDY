import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Edit, Trash2, File } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import QuestionEditor from "../../components/quiz/QuestionEditor";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { Quiz, Question } from "../../types";

const QuizEditPage: React.FC = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getQuizDetails, updateCourse, addQuestion } = useCourses();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const [quizForm, setQuizForm] = useState({
    title: "",
    durationInMinutes: 30,
    showCorrectAnswers: true,
  });

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) return;

      setLoading(true);
      try {
        const quizData = await getQuizDetails(Number(quizId));
        if (!quizData) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        setQuiz(quizData);
        setQuizForm({
          title: quizData.title,
          durationInMinutes: quizData.durationInMinutes,
          showCorrectAnswers: quizData.showCorrectAnswers,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setError("Failed to load quiz. Please try again.");
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, getQuizDetails]);

  // Check if user is teacher
  if (currentUser?.role !== "Teacher") {
    return (
      <PageLayout>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          You don't have permission to edit quizzes.
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

  const handleUpdateQuizDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !courseId) return;

    setLoading(true);
    try {
      // Update the quiz with new details
      const updatedQuiz = {
        ...quiz,
        title: quizForm.title,
        durationInMinutes: quizForm.durationInMinutes,
        showCorrectAnswers: quizForm.showCorrectAnswers,
      };

      // TODO: Replace with actual updateQuiz API call when available
      // For now, just update the local state
      setQuiz(updatedQuiz);
      setLoading(false);

      // Show success message
      alert("Quiz details updated successfully");
    } catch (err) {
      console.error("Failed to update quiz:", err);
      setError("Failed to update quiz details. Please try again.");
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionData: Partial<Question>) => {
    if (!quizId) return false;

    try {
      const success = await addQuestion(Number(quizId), questionData);
      if (success) {
        // Refresh quiz data to include the new question
        const updatedQuiz = await getQuizDetails(Number(quizId));
        setQuiz(updatedQuiz);
        setShowQuestionEditor(false);
      }
      return success;
    } catch (err) {
      console.error("Failed to add question:", err);
      setError("Failed to add question. Please try again.");
      return false;
    }
  };

  if (loading && !quiz) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !quiz) {
    return (
      <PageLayout>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Failed to load quiz"}
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

  return (
    <PageLayout>
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<File size={16} />}
            onClick={() => navigate(`/courses/${courseId}/quizzes/${quizId}`)}
          >
            Preview Quiz
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>

      {/* Quiz Details Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>

          <form onSubmit={handleUpdateQuizDetails} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quiz Title
              </label>
              <input
                type="text"
                id="title"
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={quizForm.durationInMinutes}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    durationInMinutes: parseInt(e.target.value),
                  })
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAnswers"
                checked={quizForm.showCorrectAnswers}
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    showCorrectAnswers: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="showAnswers"
                className="ml-2 block text-sm text-gray-700"
              >
                Show correct answers after submission
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : "Save Quiz Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button
            variant="outline"
            icon={<Plus size={16} />}
            onClick={() => setShowQuestionEditor(!showQuestionEditor)}
          >
            {showQuestionEditor ? "Cancel" : "Add Question"}
          </Button>
        </div>

        {showQuestionEditor && (
          <div className="mb-6">
            <QuestionEditor
              quizId={Number(quizId)}
              onAddQuestion={handleAddQuestion}
              onCancel={() => setShowQuestionEditor(false)}
            />
          </div>
        )}

        {quiz.questions && quiz.questions.length > 0 ? (
          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <Card key={question.questionId}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {index + 1}. {question.questionText}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        {question.questionType} • {question.points} point
                        {question.points !== 1 ? "s" : ""}
                      </div>

                      <div className="mt-3 space-y-1">
                        {question.answers?.map((answer) => (
                          <div
                            key={answer.answerId}
                            className={`flex items-center space-x-2 ${
                              answer.correct
                                ? "text-green-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            <span>{answer.correct ? "✓" : "○"}</span>
                            <span>{answer.answerText}</span>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="mt-2 text-sm text-blue-600">
                          <span className="font-medium">Explanation:</span>{" "}
                          {question.explanation}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="Edit question"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No questions yet. Add your first question to get started.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default QuizEditPage;
