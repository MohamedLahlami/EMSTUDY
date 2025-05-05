import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';

const GradingForm = ({ submission, assignment, onSubmit, isLoading }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      submissionId: submission.id,
      score: parseFloat(score),
      feedback
    });
  };

  const calculateMaxScore = () => {
    if (assignment.questions) {
      return assignment.questions.reduce((total, q) => total + q.points, 0);
    }
    return assignment.totalPoints;
  };

  const maxScore = calculateMaxScore();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Score (max: {maxScore} points)
        </label>
        <input
          type="number"
          min="0"
          max={maxScore}
          step="0.5"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <TextArea
        label="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Provide feedback on the submission..."
        rows={4}
        required
      />

      {submission.answers && assignment.questions && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Quiz Responses</h3>
          {assignment.questions.map((question, index) => {
            const answer = submission.answers[index];
            const isCorrect = answer?.selectedOptions.every(opt => 
              question.correctAnswers.includes(opt)
            ) && answer?.selectedOptions.length === question.correctAnswers.length;

            return (
              <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{question.text}</p>
                    <div className="mt-2 space-y-1">
                      {question.options.map((option, optIndex) => {
                        const isSelected = answer?.selectedOptions.includes(optIndex.toString());
                        const isCorrectOption = question.correctAnswers.includes(optIndex.toString());

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center space-x-2 text-sm ${
                              isSelected
                                ? isCorrectOption
                                  ? 'text-green-700'
                                  : 'text-red-700'
                                : isCorrectOption
                                ? 'text-green-600'
                                : 'text-gray-600'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '○'}</span>
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        icon={<CheckCircle size={18} />}
      >
        Submit Grade
      </Button>
    </form>
  );
};

export default GradingForm;