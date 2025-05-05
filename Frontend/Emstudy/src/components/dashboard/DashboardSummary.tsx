import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, ClipboardList, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import AssignmentCalendar from './AssignmentCalendar';

const DashboardSummary: React.FC = () => {
  const { currentUser } = useAuth();
  const { getUserCourses, assignments, getStudentSubmissions, materials } = useCourses();
  const navigate = useNavigate();
  
  const courses = getUserCourses();
  const isTeacher = currentUser?.role === 'teacher';
  
  // Get upcoming assignments or submissions
  const upcomingItems = isTeacher 
    ? assignments.filter(a => {
        const course = courses.find(c => c.id === a.courseId);
        return course && new Date(a.dueDate) >= new Date();
      }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 3)
    : getStudentSubmissions()
        .filter(s => s.status !== 'graded' && s.status !== 'submitted')
        .map(s => {
          const assignment = assignments.find(a => a.id === s.assignmentId);
          return { submission: s, assignment };
        })
        .filter(item => item.assignment)
        .sort((a, b) => {
          if (!a.assignment || !b.assignment) return 0;
          return new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime();
        })
        .slice(0, 3);
  
  // Get relevant assignments and materials for the calendar
  const relevantAssignments = assignments.filter(a => 
    courses.some(c => c.id === a.courseId)
  );
  
  const relevantMaterials = materials.filter(m => 
    courses.some(c => c.id === m.courseId)
  );
  
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
            Welcome back, {currentUser?.name}!
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
                  {isTeacher ? 'Assignments' : 'Tasks'}
                </h3>
                <ClipboardList className="h-8 w-8 text-indigo-500" />
              </div>
              {isTeacher ? (
                <>
                  <p className="text-3xl font-bold mt-4">
                    {assignments.filter(a => {
                      const course = courses.find(c => c.id === a.courseId);
                      return !!course;
                    }).length}
                  </p>
                  <p className="text-gray-500 mt-1">Total assignments</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold mt-4">
                    {getStudentSubmissions().filter(s => s.status !== 'graded').length}
                  </p>
                  <p className="text-gray-500 mt-1">Pending tasks</p>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/courses')}
              >
                Manage {isTeacher ? 'assignments' : 'tasks'}
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
                  {new Set(courses.flatMap(c => c.studentIds)).size}
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <p className="text-3xl font-bold mt-4">
                  {getStudentSubmissions().filter(s => s.status === 'graded').length}
                </p>
                <p className="text-gray-500 mt-1">Graded submissions</p>
                <div className="mt-4 text-sm text-gray-500">
                  View your progress
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold">
              {isTeacher ? 'Upcoming Assignment Deadlines' : 'Upcoming Tasks'}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {upcomingItems.length > 0 ? (
              isTeacher ? (
                // Teacher view - upcoming assignments
                upcomingItems.map((assignment, index) => (
                  <div key={assignment.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/courses/${assignment.courseId}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                // Student view - upcoming submissions
                upcomingItems.map((item, index) => {
                  if (!item.assignment) return null;
                  return (
                    <div key={item.submission.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.assignment.title}</h4>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(item.assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/courses/${item.assignment?.courseId}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No upcoming {isTeacher ? 'deadlines' : 'tasks'} at the moment.
              </div>
            )}
          </div>
        </div>
        
        <AssignmentCalendar 
          assignments={relevantAssignments} 
          materials={relevantMaterials} 
        />
      </div>
    </div>
  );
};

export default DashboardSummary;