import React, { useState } from "react";
import { PlusCircle, X, Check } from "lucide-react";
import Button from "../ui/Button";
import { Question, Answer } from "../../types";

interface QuestionEditorProps {
  quizId: number;
  onAddQuestion: (questionData: Partial<Question>) => Promise<boolean>;
  onCancel?: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  quizId,
  onAddQuestion,
  onCancel,
}) => {
  const [questionData, setQuestionData] = useState<Partial<Question>>({
    questionText: "",
    questionType: "MULTIPLE_CHOICE",
    points: 1,
    explanation: "",
  });

  const [answers, setAnswers] = useState<Partial<Answer>[]>([
    { answerText: "", correct: false },
    { answerText: "", correct: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAnswerOption = () => {
    setAnswers([...answers, { answerText: "", correct: false }]);
  };

  const removeAnswerOption = (index: number) => {
    if (answers.length <= 2) {
      setError("A question must have at least 2 answer options");
      return;
    }
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const updateAnswer = (index: number, field: keyof Answer, value: any) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = { ...updatedAnswers[index], [field]: value };

    // For question types that should have only one correct answer
    if (
      field === "correct" &&
      value === true &&
      (questionData.questionType === "MULTIPLE_CHOICE" ||
        questionData.questionType === "TRUE_FALSE")
    ) {
      // Uncheck other answers
      updatedAnswers.forEach((answer, i) => {
        if (i !== index) {
          updatedAnswers[i] = { ...updatedAnswers[i], correct: false };
        }
      });
    }

    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!questionData.questionText) {
      setError("Question text is required");
      return;
    }

    if (answers.filter((a) => a.answerText).length < 2) {
      setError("At least 2 answer options are required");
      return;
    }

    if (!answers.some((a) => a.correct)) {
      setError("At least one answer must be marked as correct");
      return;
    }

    // Process and submit
    setIsSubmitting(true);
    try {
      const completeQuestion: Partial<Question> = {
        ...questionData,
        answers: answers.filter((a) => a.answerText) as Answer[],
      };

      const success = await onAddQuestion(completeQuestion);
      if (success) {
        // Reset form after successful submission
        setQuestionData({
          questionText: "",
          questionType: "MULTIPLE_CHOICE",
          points: 1,
          explanation: "",
        });
        setAnswers([
          { answerText: "", correct: false },
          { answerText: "", correct: false },
        ]);
      }
    } catch (err) {
      console.error("Failed to add question:", err);
      setError("Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine if it's a true/false question
  const isTrueFalse = questionData.questionType === "TRUE_FALSE";

  // Special handling for true/false questions
  const setupTrueFalse = () => {
    if (isTrueFalse) {
      setAnswers([
        { answerText: "True", correct: true },
        { answerText: "False", correct: false },
      ]);
    }
  };

  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    setQuestionData({ ...questionData, questionType: type });

    // If changing to true/false, setup standard true/false answers
    if (type === "TRUE_FALSE") {
      setAnswers([
        { answerText: "True", correct: true },
        { answerText: "False", correct: false },
      ]);
    }
    // If changing from true/false to another type, reset answers
    else if (questionData.questionType === "TRUE_FALSE") {
      setAnswers([
        { answerText: "", correct: false },
        { answerText: "", correct: false },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">Add New Question</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Text */}
        <div>
          <label
            htmlFor="questionText"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Question Text
          </label>
          <textarea
            id="questionText"
            value={questionData.questionText}
            onChange={(e) =>
              setQuestionData({ ...questionData, questionText: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
            required
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={questionData.questionType === "MULTIPLE_CHOICE"}
                onChange={() => handleQuestionTypeChange("MULTIPLE_CHOICE")}
                className="form-radio"
              />
              <span className="ml-2">Multiple Choice</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={questionData.questionType === "MULTI_SELECT"}
                onChange={() => handleQuestionTypeChange("MULTI_SELECT")}
                className="form-radio"
              />
              <span className="ml-2">Multi-Select</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={questionData.questionType === "TRUE_FALSE"}
                onChange={() => handleQuestionTypeChange("TRUE_FALSE")}
                className="form-radio"
              />
              <span className="ml-2">True/False</span>
            </label>
          </div>
        </div>

        {/* Points */}
        <div>
          <label
            htmlFor="points"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Points
          </label>
          <input
            type="number"
            id="points"
            value={questionData.points}
            onChange={(e) =>
              setQuestionData({
                ...questionData,
                points: parseInt(e.target.value),
              })
            }
            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            min="1"
            required
          />
        </div>

        {/* Answer Options */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Answer Options
            </label>
            {!isTrueFalse && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<PlusCircle size={14} />}
                onClick={addAnswerOption}
              >
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1 flex space-x-2">
                  <input
                    type={
                      questionData.questionType === "MULTI_SELECT"
                        ? "checkbox"
                        : "radio"
                    }
                    checked={answer.correct}
                    onChange={(e) =>
                      updateAnswer(index, "correct", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <input
                    type="text"
                    value={answer.answerText}
                    onChange={(e) =>
                      updateAnswer(index, "answerText", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Answer text"
                    disabled={isTrueFalse} // Text input remains disabled for True/False
                    required
                  />
                </div>
                {!isTrueFalse && (
                  <button
                    type="button"
                    onClick={() => removeAnswerOption(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explanation (Optional) */}
        <div>
          <label
            htmlFor="explanation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Explanation (Optional)
          </label>
          <textarea
            id="explanation"
            value={questionData.explanation}
            onChange={(e) =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
            placeholder="Explain why the correct answer is correct (shown after quiz)"
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 flex space-x-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Question"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuestionEditor;
