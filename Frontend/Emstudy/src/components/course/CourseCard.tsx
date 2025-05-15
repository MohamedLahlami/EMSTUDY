import React from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { Course } from "../../types";
import { Card, CardContent } from "../ui/Card";
import { format } from "date-fns";

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/courses/${course.courseId}`);
  };

  // Calculate enrollment count
  const enrollmentCount = course.enrollments?.length || 0;

  return (
    <Card
      className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleClick}
      hover
    >
      <div className="relative h-40 bg-gray-200">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: "linear-gradient(to right, #008d36,rgb(65, 199, 117))",
          }}
        >
          <span className="text-white text-2xl font-bold">
            {course.name.charAt(0)}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-lg font-semibold line-clamp-1">
            {course.name}
          </h3>
          <p className="text-white/80 text-sm line-clamp-1">
            Join Code: {course.joinCode}
          </p>
        </div>
      </div>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {course.description}
        </p>
        {course.creationDate && (
          <p className="text-gray-500 text-xs mb-2">
            Created on: {format(new Date(course.creationDate), "MMM d, yyyy")}
          </p>
        )}
        <div className="flex items-center text-gray-500 text-xs">
          <Users size={14} className="mr-1" />
          <span>{enrollmentCount} students</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
