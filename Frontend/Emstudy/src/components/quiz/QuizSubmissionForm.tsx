import React, { useState } from "react";
import { Quiz, Question, Answer } from "../../types";
import Button from "../ui/Button";

interface QuizSubmissionFormProps {
  quiz: Quiz;
  onSubmit: (answers: Answer[]) => void;
  isLoading: boolean;
}

const QuizSubmissionForm: React.FC<QuizSubmissionFormProps> = ({
  quiz,
  onSubmit,
  isLoading,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});

  const handleAnswerSelect = (
    questionId: number,
    answerId: number,
    questionType: string
  ) => {
    setSelectedAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];

      if (questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") {
        // Single selection for these types
        return { ...prev, [questionId]: [answerId] };
      } else if (questionType === "MULTI_SELECT") {
        // Toggle selection for multi-select
        if (currentAnswers.includes(answerId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((id) => id !== answerId),
          };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, answerId] };
        }
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionAnswers: Answer[] = [];

    // Create answer objects for submission
    Object.entries(selectedAnswers).forEach(([questionId, answerIds]) => {
      answerIds.forEach((answerId) => {
        // Find the actual answer object from the quiz
        const question = quiz.questions.find(
          (q) => q.questionId === Number(questionId)
        );
        if (question) {
          const answer = question.answers?.find((a) => a.answerId === answerId);
          if (answer) {
            submissionAnswers.push({
              answerId: answer.answerId,
              answerText: answer.answerText,
              question: { questionId: question.questionId } as Question,
              correct: false, // This will be determined by the server
            });
          }
        }
      });
    });

    onSubmit(submissionAnswers);
  };

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div>No questions available for this quiz.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {quiz.questions.map((question, index) => (
        <div
          key={question.questionId}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {index + 1}. {question.questionText}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {question.questionType === "MULTI_SELECT"
              ? "Select all that apply"
              : "Select one answer"}
          </p>

          <div className="space-y-2">
            {question.answers?.map((answer) => {
              const isSelected =
                selectedAnswers[question.questionId]?.includes(
                  answer.answerId
                ) || false;

              return (
                <div
                  key={answer.answerId}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() =>
                    handleAnswerSelect(
                      question.questionId,
                      answer.answerId,
                      question.questionType
                    )
                  }
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-5 w-5 mt-0.5 border rounded ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700 cursor-pointer">
                        {answer.answerText}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </form>
  );
};

export default QuizSubmissionForm;
