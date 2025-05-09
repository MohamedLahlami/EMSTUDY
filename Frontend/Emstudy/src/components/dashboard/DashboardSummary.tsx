import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, ClipboardList, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Course, Quiz, Submission } from '../../types';

const DashboardSummary: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, loading, error, getAllCourses } = useCourses();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  const isTeacher = currentUser?.role === 'Teacher';

  useEffect(() => {
    if (!loading && courses.length > 0) {
      setIsLoading(false);
    }
  }, [loading, courses]);
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome back, {currentUser?.username || 'User'}!
          </h2>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your {isTeacher ? 'courses' : 'learning'} today.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {isTeacher ? (
            <Button
              variant="primary"
              icon={<PlusCircle size={18} />}
              onClick={() => navigate('/courses/create')}
            >
              Create Course
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<PlusCircle size={18} />}
              onClick={() => navigate('/enroll')}
            >
              Enroll in Course
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              custom={0}
              initial="initial"
              animate="animate"
              variants={cardVariants}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-900">My Courses</h3>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold mt-4">{courses.length}</p>
                  <p className="text-gray-500 mt-1">Active courses</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/courses')}
                  >
                    View all courses
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              custom={1}
              initial="initial"
              animate="animate"
              variants={cardVariants}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {isTeacher ? 'Quizzes' : 'Assessments'}
                    </h3>
                    <ClipboardList className="h-8 w-8 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-bold mt-4">
                    {0} {/* Will be replaced with actual quiz count */}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {isTeacher ? 'Total quizzes' : 'Pending quizzes'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/courses')}
                  >
                    Manage {isTeacher ? 'quizzes' : 'assessments'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              custom={2}
              initial="initial"
              animate="animate"
              variants={cardVariants}
            >
              {isTeacher ? (
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">Students</h3>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold mt-4">
                      {0} {/* Will be filled with proper count */}
                    </p>
                    <p className="text-gray-500 mt-1">Total enrolled students</p>
                    <div className="mt-4 text-sm text-gray-500">
                      Across all your courses
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">Completed</h3>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold mt-4">
                      {0} {/* Will be filled with proper count */}
                    </p>
                    <p className="text-gray-500 mt-1">Completed items</p>
                    <div className="mt-4 text-sm text-gray-500">
                      View your progress
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold">Your Courses</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.courseId} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-sm text-gray-500">
                          {course.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <p>No courses found.</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => isTeacher ? navigate('/courses/create') : navigate('/enroll')}
                  >
                    {isTeacher ? 'Create your first course' : 'Enroll in a course'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSummary;