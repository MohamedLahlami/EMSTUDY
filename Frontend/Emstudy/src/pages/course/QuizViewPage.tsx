import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { format } from "date-fns";
import {
  FileText,
  Clock,
  ArrowLeft,
  Users,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import QuizSubmissionForm from "../../components/quiz/QuizSubmissionForm";
import { Quiz, Submission, Answer, Course } from "../../types";

const QuizViewPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getCourseById,
    getItemsByCourse,
    startSubmission,
    submitSubmission,
    getSubmissionById,
    getSubmissionByQuizAndStudent,
    hasAttemptedQuiz,
  } = useCourses();

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerInterval, setTimerInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !quizId) {
        setError("Missing courseId or quizId");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load course
        const courseData = await getCourseById(Number(courseId));
        if (!courseData) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Load course items to find the quiz
        const items = await getItemsByCourse(Number(courseId));
        const quizData = items.find(
          (item) => item.itemType === "Q" && item.itemId === Number(quizId)
        ) as Quiz | undefined;

        if (!quizData) {
          setError("Quiz not found");
          setLoading(false);
          return;
        }

        setQuiz(quizData);

        // If student, check for existing submission
        if (
          currentUser &&
          currentUser.role === "Student" &&
          currentUser.userId
        ) {
          try {
            // Check if user has already attempted this quiz
            const hasAttempted = await hasAttemptedQuiz(Number(quizId));
            setAlreadyAttempted(hasAttempted);

            if (hasAttempted) {
              try {
                // Try to get the existing submission details
                const existingSubmission = await getSubmissionByQuizAndStudent(
                  Number(quizId)
                );

                if (existingSubmission) {
                  setSubmission(existingSubmission);
                }
              } catch (err) {
                console.log("Could not fetch submission details");
              }
            } else {
              // If not attempted, check if there's an in-progress submission
              try {
                const existingSubmission = await getSubmissionByQuizAndStudent(
                  Number(quizId)
                );

                if (existingSubmission) {
                  setSubmission(existingSubmission);
                  // If submission exists and was already submitted, show completed state
                  if (existingSubmission.submitted) {
                    setQuizStarted(false);
                  }
                  // If submission exists but was not submitted (was started but interrupted)
                  else {
                    setQuizStarted(true);
                    setShowSubmissionForm(true);

                    // Calculate remaining time
                    if (
                      existingSubmission.endTime &&
                      quizData.durationInMinutes
                    ) {
                      const endTime = new Date(
                        existingSubmission.endTime
                      ).getTime();
                      const now = new Date().getTime();
                      const remainingMs = Math.max(0, endTime - now);
                      const remainingSec = Math.floor(remainingMs / 1000);

                      if (remainingSec > 0) {
                        setTimeRemaining(remainingSec);
                      } else {
                        // Time already expired
                        setTimeRemaining(0);
                      }
                    }
                  }
                }
              } catch (err) {
                // No submission found, which is fine
                console.log("No existing submission found");
              }
            }
          } catch (err) {
            console.error("Error checking quiz attempts:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading quiz data:", err);
        setError("Failed to load quiz. Please try again later.");
        setLoading(false);
      }
    };

    loadData();
  }, [
    courseId,
    quizId,
    getCourseById,
    getItemsByCourse,
    currentUser,
    getSubmissionByQuizAndStudent,
    hasAttemptedQuiz,
  ]);

  // Start quiz timer when quiz is started
  useEffect(() => {
    if (quizStarted && quiz && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            // Don't auto-submit with empty answers, just show a time expired message
            setTimeRemaining(0);
            setError(
              "Time expired! Your quiz has automatically been submitted."
            );
            setQuizStarted(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      setTimerInterval(interval);

      return () => clearInterval(interval);
    }
  }, [quizStarted, quiz, timeRemaining]);

  // Handle submit function
  const handleSubmit = async (answerIds: number[]) => {
    if (!submission || !submission.submissionId) {
      console.error("No active submission to submit");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitSubmission(submission.submissionId, answerIds);
      setSubmission(result);
      setIsSubmitting(false);
      setQuizStarted(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setIsSubmitting(false);
      setError("Failed to submit your answers. Please try again.");
    }
  };

  // Clear timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleStartQuiz = async () => {
    if (!quiz || !quiz.itemId) return;

    try {
      // Double-check if the quiz has already been attempted
      const hasAttempted = await hasAttemptedQuiz(quiz.itemId);
      if (hasAttempted) {
        setAlreadyAttempted(true);
        setError("You have already taken this quiz and cannot retake it.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      const newSubmission = await startSubmission(quiz.itemId);
      setSubmission(newSubmission);

      // Set timer based on submission end time
      if (newSubmission.endTime) {
        const endTime = new Date(newSubmission.endTime).getTime();
        const now = new Date().getTime();
        const remainingMs = Math.max(0, endTime - now);
        const remainingSec = Math.floor(remainingMs / 1000);
        setTimeRemaining(remainingSec);
      } else if (quiz.durationInMinutes) {
        // Fallback to quiz duration if no end time
        setTimeRemaining(quiz.durationInMinutes * 60);
      }

      setQuizStarted(true);
      setShowSubmissionForm(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      setError("Failed to start quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !quiz || !course) {
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

  const isTeacher = currentUser?.role === "Teacher";
  const isPastDue = quiz.addDate && new Date(quiz.addDate) < new Date(); // Using addDate as dueDate for now
  const hasSubmitted = submission?.submitted === true;

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

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {quiz.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                {quiz.durationInMinutes && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Duration: {quiz.durationInMinutes} minutes</span>
                  </div>
                )}
                <div>
                  Show Correct Answers: {quiz.showCorrectAnswers ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTeacher ? (
        // Teacher View
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
              <div className="space-y-4">
                {quiz.questions && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Quiz Questions
                    </h3>
                    {quiz.questions.map((question, index) => (
                      <div
                        key={question.questionId}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <p className="font-medium text-gray-900">
                          {index + 1}. {question.questionText}
                        </p>
                        <div className="mt-2 space-y-1">
                          {question.answers &&
                            question.answers.map((answer) => (
                              <div
                                key={answer.answerId}
                                className={`flex items-center space-x-2 text-sm ${
                                  answer.correct
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                <span>{answer.correct ? "✓" : "○"}</span>
                                <span>{answer.answerText}</span>
                              </div>
                            ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Points: {question.points}
                        </div>
                        {question.explanation && (
                          <div className="mt-2 text-sm text-blue-600">
                            Explanation: {question.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Student View
        <div className="space-y-6">
          {quizStarted ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-blue-800">Time Remaining</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>

              {submission && showSubmissionForm && quiz && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Quiz Questions
                    </h2>
                    <QuizSubmissionForm
                      quiz={quiz}
                      onSubmit={handleSubmit}
                      isLoading={isSubmitting}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : hasSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Quiz Submitted
              </h3>
              <p className="text-green-700 mb-6">
                Your submission has been received.
              </p>

              {submission && submission.score !== undefined && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-green-800">
                    Score: {submission.score.toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          ) : alreadyAttempted ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-amber-800 mb-2">
                Quiz Already Completed
              </h3>
              <p className="text-amber-700 mb-2">
                You have already taken this quiz. Each student can only take a
                quiz once.
              </p>
              {submission && submission.score !== undefined && (
                <div className="mt-4">
                  <p className="text-lg font-semibold text-amber-800">
                    Your score: {submission.score.toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Quiz Instructions</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>
                  You will have <b>{quiz.durationInMinutes || 30}</b> minutes to
                  complete this quiz.
                </li>
                <li>Once you start, you cannot pause the timer.</li>
                <li>Answer all questions before submitting.</li>
                <li>
                  <b>Important:</b> You can only take this quiz once.
                </li>
                {quiz.showCorrectAnswers && (
                  <li>
                    You will be able to see the correct answers after
                    submission.
                  </li>
                )}
              </ul>

              <Button
                variant="primary"
                disabled={isSubmitting}
                onClick={handleStartQuiz}
              >
                {isSubmitting ? "Starting Quiz..." : "Start Quiz"}
              </Button>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default QuizViewPage;
