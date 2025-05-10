import React, { useState } from "react";
import { Quiz, Question, Answer } from "../../types";
import Button from "../ui/Button";

interface QuizSubmissionFormProps {
  quiz: Quiz;
  onSubmit: (answerIds: number[]) => void;
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

    // Collect all selected answer IDs into a flat array
    const answerIds: number[] = [];

    // Create answer objects for submission
    if (quiz.questions) {
      quiz.questions.forEach((question) => {
        const selectedAnswerIds = selectedAnswers[question.questionId] || [];
        
        // If the question is required and no answer is selected, we could show an error
        if (selectedAnswerIds.length === 0) {
          // Optional: Show an error for unanswered questions
          // For now, we'll just skip this question
          return;
        }
        
        // Add each selected answer ID to the flat array
        selectedAnswerIds.forEach((answerId) => {
          answerIds.push(answerId);
        });
      });
    }

    // Submit answer IDs only if we have some
    if (answerIds.length > 0) {
      onSubmit(answerIds);
    } else {
      // Optional: Show an error if no answers were selected
      console.warn("No answers selected for submission");
    }
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
          
          {/* Show a warning if no answer is selected */}
          {!selectedAnswers[question.questionId]?.length && (
            <div className="mt-2 text-sm text-amber-600">
              Please select an answer
            </div>
          )}
        </div>
      ))}

      <div className="mt-6">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isLoading || Object.keys(selectedAnswers).length === 0}
        >
          {isLoading ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </form>
  );
};

export default QuizSubmissionForm;
