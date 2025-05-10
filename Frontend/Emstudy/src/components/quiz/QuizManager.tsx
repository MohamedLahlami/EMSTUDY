import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, FileText, Users, Clock } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { useCourses } from "../../context/CourseContext";
import { Quiz, Question, Answer } from "../../types";

interface QuizManagerProps {
  courseId: number;
}

const QuizManager: React.FC<QuizManagerProps> = ({ courseId }) => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    getCourseItems,
    createQuiz,
    getQuizDetails,
    addQuestion,
  } = useCourses();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    title: "",
    durationInMinutes: 30,
    showCorrectAnswers: true,
  });

  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      try {
        const items = await getCourseItems(courseId);
        const quizItems = items.filter(
          (item) => item.itemType === "Q"
        ) as Quiz[];
        setQuizzes(quizItems);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, [courseId, getCourseItems]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title) return;

    setIsLoading(true);
    try {
      await createQuiz(courseId, newQuiz);
      // Reset form and refresh quizzes
      setNewQuiz({
        title: "",
        durationInMinutes: 30,
        showCorrectAnswers: true,
      });
      setShowCreateForm(false);

      // Reload quizzes
      const items = await getCourseItems(courseId);
      const quizItems = items.filter(
        (item) => item.itemType === "Q"
      ) as Quiz[];
      setQuizzes(quizItems);
    } catch (err) {
      console.error("Failed to create quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuiz = (quizId: number) => {
    navigate(`/courses/${courseId}/quizzes/${quizId}`);
  };

  const handleEditQuiz = (quizId: number) => {
    navigate(`/courses/${courseId}/quizzes/${quizId}/edit`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Quizzes</h2>
        <Button
          variant="outline"
          icon={<Plus size={16} />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Add Quiz"}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">New Quiz</h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
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
                  value={newQuiz.title}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, title: e.target.value })
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
                  value={newQuiz.durationInMinutes}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      durationInMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showAnswers"
                  checked={newQuiz.showCorrectAnswers}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
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

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !newQuiz.title}
                >
                  {isLoading ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No quizzes yet. Create your first quiz to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.itemId} className="overflow-hidden">
              <div className="p-4 flex justify-between border-b">
                <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <Clock size={14} className="mr-1" />
                  <span>{quiz.durationInMinutes} min</span>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={() => handleViewQuiz(quiz.itemId)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={14} />}
                    onClick={() => handleEditQuiz(quiz.itemId)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Users size={14} />}
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}/quizzes/${quiz.itemId}/submissions`
                      )
                    }
                  >
                    Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizManager;
