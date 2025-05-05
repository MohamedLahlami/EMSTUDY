import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const EnrollCourseForm: React.FC = () => {
  const [courseCode, setCourseCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { enrollInCourse } = useCourses();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const enrolled = enrollInCourse(courseCode);
      
      if (enrolled) {
        setSuccess(`Successfully enrolled in course with code: ${courseCode}`);
        setCourseCode('');
        
        // Navigate to courses after a short delay
        setTimeout(() => {
          navigate('/courses');
        }, 2000);
      } else {
        setError(`No course found with code: ${courseCode}`);
      }
    } catch (err) {
      setError('Failed to enroll in course');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Enroll in a Course</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Course Code"
            id="courseCode"
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
            fullWidth
            placeholder="Enter the course code provided by your teacher"
            helperText="Ask your teacher for the code to join their course"
          />
        </div>
        
        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            icon={<LogIn size={18} />}
          >
            Enroll
          </Button>
        </div>
      </form>
      
      <div className="mt-8 border-t pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Available Demo Courses:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">CS101</span>
            Introduction to Computer Science
          </li>
          <li className="flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">MATH202</span>
            Advanced Mathematics
          </li>
          <li className="flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">CS201</span>
            Data Structures and Algorithms
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EnrollCourseForm;