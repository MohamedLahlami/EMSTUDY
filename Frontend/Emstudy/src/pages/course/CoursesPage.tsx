import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/course/CourseCard';
import Button from '../../components/ui/Button';

const CoursesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserCourses, loading } = useCourses();
  
  const courses = getUserCourses();
  const isTeacher = currentUser?.role === 'teacher';
  
  return (
    <PageLayout
      title="My Courses"
      description={`${isTeacher ? 'Courses you teach' : 'Courses you are enrolled in'}`}
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </h2>
        </div>
        
        <div>
          {isTeacher ? (
            <Link to="/courses/create">
              <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
              >
                Create Course
              </Button>
            </Link>
          ) : (
            <Link to="/enroll">
              <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
              >
                Enroll in Course
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isTeacher ? 'Create your first course' : 'Enroll in a course'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isTeacher
              ? 'Start creating your course by adding a name, description, and other details.'
              : 'Enter a course code provided by your teacher to enroll in a course.'}
          </p>
          {isTeacher ? (
            <Link to="/courses/create">
              <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
              >
                Create Course
              </Button>
            </Link>
          ) : (
            <Link to="/enroll">
              <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
              >
                Enroll in Course
              </Button>
            </Link>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default CoursesPage;