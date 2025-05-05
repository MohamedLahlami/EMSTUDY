import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';

const SubmissionForm = ({ assignment, onSubmit, isLoading }) => {
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [answers, setAnswers] = useState(
    assignment.questions?.map(() => ({ selectedOptions: [] })) || []
  );

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const currentAnswer = newAnswers[questionIndex];

      if (assignment.questions[questionIndex].type === 'multiple_choice') {
        newAnswers[questionIndex] = { selectedOptions: [optionIndex.toString()] };
      } else if (assignment.questions[questionIndex].type === 'multiple_select') {
        const selectedOptions = currentAnswer.selectedOptions || [];
        const optionStr = optionIndex.toString();
        
        if (selectedOptions.includes(optionStr)) {
          newAnswers[questionIndex] = {
            selectedOptions: selectedOptions.filter(opt => opt !== optionStr)
          };
        } else {
          newAnswers[questionIndex] = {
            selectedOptions: [...selectedOptions, optionStr]
          };
        }
      }

      return newAnswers;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ files, comments, answers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {assignment.questions && (
        <div className="space-y-6">
          {assignment.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-900 mb-2">
                {qIndex + 1}. {question.text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className="flex items-center space-x-2">
                    <input
                      type={question.type === 'multiple_choice' ? 'radio' : 'checkbox'}
                      name={`question-${qIndex}`}
                      checked={answers[qIndex]?.selectedOptions.includes(oIndex.toString())}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag & drop files here, or click to select files
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: PDF, DOC, DOCX, PNG, JPG
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <TextArea
          label="Comments (optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any comments or notes about your submission..."
          rows={4}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
        >
          Submit Assignment
        </Button>
      </div>
    </form>
  );
};

export default SubmissionForm;