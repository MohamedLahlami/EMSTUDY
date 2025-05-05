import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { Course } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { format } from 'date-fns';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/courses/${course.id}`);
  };
  
  return (
    <Card 
      className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleClick}
      hover
    >
      <div className="relative h-40 bg-gray-200">
        {course.coverImage ? (
          <img 
            src={course.coverImage} 
            alt={course.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
            <span className="text-white text-2xl font-bold">{course.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold line-clamp-1">{course.name}</h3>
          <p className="text-white/80 text-sm line-clamp-1">Code: {course.code}</p>
        </div>
      </div>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
        <div className="flex items-center text-gray-500 text-xs">
          <Calendar size={14} className="mr-1" />
          <span className="mr-3">
            {format(new Date(course.startDate), 'MMM d, yyyy')} - {format(new Date(course.endDate), 'MMM d, yyyy')}
          </span>
          <Users size={14} className="mr-1" />
          <span>{course.studentIds.length} students</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;