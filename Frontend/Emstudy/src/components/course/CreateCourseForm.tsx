import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';

const CreateCourseForm: React.FC = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createCourse } = useCourses();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentUser || currentUser.role !== 'teacher') {
      setError('Only teachers can create courses');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newCourse = createCourse({
        name,
        code,
        description,
        teacherId: currentUser.id,
        startDate,
        endDate,
        coverImage: coverImage || undefined,
      });
      
      navigate(`/courses/${newCourse.id}`);
    } catch (err) {
      setError('Failed to create course');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Create a New Course</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Course Name"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="e.g. Introduction to Computer Science"
            />
          </div>
          
          <div>
            <Input
              label="Course Code"
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              fullWidth
              placeholder="e.g. CS101"
              helperText="Students will use this code to join the course"
            />
          </div>
          
          <div>
            <Input
              label="Cover Image URL (optional)"
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="sm:col-span-2">
            <TextArea
              label="Course Description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              placeholder="Provide a detailed description of the course"
              rows={4}
            />
          </div>
          
          <div>
            <Input
              label="Start Date"
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              fullWidth
            />
          </div>
          
          <div>
            <Input
              label="End Date"
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              fullWidth
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/courses')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={<CheckCircle size={18} />}
          >
            Create Course
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourseForm;