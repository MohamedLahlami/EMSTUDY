import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, X, Book, Calendar, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import PageLayout from "../../components/layout/PageLayout";
import CourseCard from "../../components/course/CourseCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { format } from "date-fns";

const CoursesPage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const { 
    myCourses, 
    loading, 
    error, 
    enrollInCourse, 
    refreshCourses 
  } = useCourses();
  
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Open popup if ?enroll=1 is present
  useEffect(() => {
    if (hasRole('Student')) {
      const params = new URLSearchParams(location.search);
      if (params.get("enroll") === "1") {
        setShowEnrollPopup(true);
      }
    }
  }, [location.search, hasRole]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      setEnrollmentError("Please enter a join code");
      return;
    }
    
    setEnrollmentError(null);
    setEnrollmentSuccess(null);
    setEnrollmentLoading(true);

    try {
      const success = await enrollInCourse(joinCode);
      
      if (success) {
        setEnrollmentSuccess("Successfully enrolled in course!");
        setJoinCode("");
        
        // Close the popup after a delay
        setTimeout(() => {
          setShowEnrollPopup(false);
          setEnrollmentSuccess(null);
          // Remove ?enroll=1 from URL if present
          const params = new URLSearchParams(location.search);
          if (params.get("enroll") === "1") {
            params.delete("enroll");
            navigate({ search: params.toString() }, { replace: true });
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to enroll:", err);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const renderEmptyState = () => {
    if (hasRole('Student')) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Book className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You are not enrolled in any courses
          </h3>
          <p className="text-gray-500 mb-6">
            Enter a join code provided by your teacher to enroll in a course.
          </p>
          <Button
            variant="primary"
            icon={<PlusCircle size={18} />}
            onClick={() => setShowEnrollPopup(true)}
          >
            Enroll in Course
          </Button>
        </div>
      );
    } else if (hasRole('Teacher')) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You haven't created any courses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first course to add materials and quizzes.
          </p>
          <Link to="/courses/create">
            <Button variant="primary" icon={<PlusCircle size={18} />}>
              Create Course
            </Button>
          </Link>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No courses available
          </h3>
          <p className="text-gray-500">
            Please log in to view your courses.
          </p>
        </div>
      );
    }
  };

  // Create a nice-looking card for each course
  const renderCourseCard = (course: any, index: number) => (
    <motion.div
      key={course.courseId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-3 bg-blue-500"></div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {course.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {course.description || "No description provided."}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            Created: {course.addDate 
              ? format(new Date(course.addDate), "MMM d, yyyy") 
              : "Unknown date"}
          </span>
        </div>
        
        {course.teacher && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <User className="h-4 w-4 mr-2" />
            <span>Teacher: {course.teacher.username || course.teacher.email}</span>
          </div>
        )}
        
        <Link to={`/courses/${course.courseId}`}>
          <Button variant="primary" fullWidth>
            {hasRole('Student') ? "View Course" : "Manage Course"}
          </Button>
        </Link>
      </div>
    </motion.div>
  );

  return (
    <PageLayout
      title="My Courses"
      description={hasRole('Student') 
        ? "Courses you are enrolled in" 
        : hasRole('Teacher') 
          ? "Courses you teach" 
          : "All courses"
      }
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {myCourses.length} {myCourses.length === 1 ? "course" : "courses"}
          </h2>
        </div>

        <div>
          {hasRole('Teacher') ? (
            <Link to="/courses/create">
              <Button variant="primary" icon={<PlusCircle size={18} />}>
                Create Course
              </Button>
            </Link>
          ) : hasRole('Student') && (
            <Button
              variant="primary"
              icon={<PlusCircle size={18} />}
              onClick={() => setShowEnrollPopup(true)}
            >
              Enroll in Course
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : myCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course, index) => renderCourseCard(course, index))}
        </div>
      ) : (
        renderEmptyState()
      )}

      {/* Enrollment Popup for Students */}
      {showEnrollPopup && hasRole('Student') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Enroll in a Course</h2>
              <button
                onClick={() => {
                  setShowEnrollPopup(false);
                  // Remove ?enroll=1 from URL if present
                  const params = new URLSearchParams(location.search);
                  if (params.get("enroll") === "1") {
                    params.delete("enroll");
                    navigate({ search: params.toString() }, { replace: true });
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {enrollmentError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {enrollmentError}
              </div>
            )}

            {enrollmentSuccess && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {enrollmentSuccess}
              </div>
            )}

            <form onSubmit={handleEnroll}>
              <div className="mb-4">
                <Input
                  label="Join Code"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter the course join code"
                  required
                  fullWidth
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={enrollmentLoading}
              >
                Enroll
              </Button>
            </form>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                Ask your teacher for the join code to enroll in their course.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default CoursesPage;
