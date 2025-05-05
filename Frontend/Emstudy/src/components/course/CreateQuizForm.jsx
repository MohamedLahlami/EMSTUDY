import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';

const CreateQuizForm = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'multiple_choice',
    points: 1,
    explanation: '',
    options: [],
    correctAnswers: []
  });
  const [currentOption, setCurrentOption] = useState('');

  const addOption = () => {
    if (currentOption.trim()) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, currentOption.trim()]
      }));
      setCurrentOption('');
    }
  };

  const toggleCorrectAnswer = (index) => {
    const isCorrect = currentQuestion.correctAnswers.includes(index.toString());
    let newCorrectAnswers;

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') {
      newCorrectAnswers = [index.toString()];
    } else {
      newCorrectAnswers = isCorrect
        ? currentQuestion.correctAnswers.filter(i => i !== index.toString())
        : [...currentQuestion.correctAnswers, index.toString()];
    }

    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswers: newCorrectAnswers
    }));
  };

  const addQuestion = () => {
    if (currentQuestion.text && currentQuestion.options.length > 0) {
      setQuestions(prev => [...prev, currentQuestion]);
      setCurrentQuestion({
        text: '',
        type: 'multiple_choice',
        points: 1,
        explanation: '',
        options: [],
        correctAnswers: []
      });
    }
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type: 'quiz',
      dueDate,
      questions,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
        />

        <TextArea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />

        <Input
          label="Due Date"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          fullWidth
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Questions</h3>
        
        {questions.map((question, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{question.text}</p>
                <p className="text-sm text-gray-500">
                  Type: {question.type} | Points: {question.points}
                </p>
                <div className="mt-2">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className={question.correctAnswers.includes(i.toString()) ? 'text-green-600' : 'text-gray-600'}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        <div className="bg-white p-4 rounded-lg border">
          <div className="space-y-4">
            <Input
              label="Question Text"
              value={currentQuestion.text}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
              fullWidth
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="multiple_select">Multiple Select</option>
                </select>
              </div>

              <Input
                label="Points"
                type="number"
                min="1"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
              />
            </div>

            <TextArea
              label="Explanation"
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              rows={2}
              placeholder="Explain why the correct answer(s) are correct..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options
              </label>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type={currentQuestion.type === 'multiple_select' ? 'checkbox' : 'radio'}
                      checked={currentQuestion.correctAnswers.includes(index.toString())}
                      onChange={() => toggleCorrectAnswer(index)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex space-x-2">
                <Input
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  placeholder="Add an option..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addOption}
                  variant="outline"
                >
                  Add Option
                </Button>
              </div>
            </div>

            <Button
              type="button"
              onClick={addQuestion}
              variant="secondary"
              icon={<PlusCircle size={18} />}
              fullWidth
            >
              Add Question
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={questions.length === 0}
        >
          Create Quiz
        </Button>
      </div>
    </form>
  );
};

export default CreateQuizForm;