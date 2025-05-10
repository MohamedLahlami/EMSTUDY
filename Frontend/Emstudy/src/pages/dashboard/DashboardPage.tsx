import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  CheckCircle,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCourses } from "../../context/CourseContext";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";

const DashboardPage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const { myCourses, loading, error, refreshCourses } = useCourses();
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const navigate = useNavigate();

  // Only refresh courses once when the component mounts and when the user changes
  useEffect(() => {
    // Only call refreshCourses if we have a valid user with an ID
    if (currentUser && currentUser.userId) {
      refreshCourses();
    }
  }, [currentUser?.userId]); // Only depend on userId changes, not on refreshCourses itself

  // Set recent courses (last 3)
  useEffect(() => {
    if (myCourses && myCourses.length > 0) {
      // Sort by most recent first (if there's a date field to sort by)
      const sorted = [...myCourses].sort((a, b) => {
        if (!a.addDate && !b.addDate) return 0;
        if (!a.addDate) return 1;
        if (!b.addDate) return -1;
        return new Date(b.addDate).getTime() - new Date(a.addDate).getTime();
      });
      setRecentCourses(sorted.slice(0, 3));
    } else {
      setRecentCourses([]);
    }
  }, [myCourses]);

  const renderStudentDashboard = () => (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {currentUser?.username || "Student"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">My Courses</h3>
              <BookOpen className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">{myCourses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Enrolled courses</p>
            <Button
              variant="outline"
              className="mt-4"
              size="sm"
              onClick={() => navigate("/courses")}
            >
              View All Courses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Progress</h3>
              <CheckCircle className="text-green-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">--</p>
            <p className="text-sm text-gray-500 mt-1">Overall completion</p>
            <Button variant="outline" className="mt-4" size="sm" disabled>
              View Progress
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Upcoming</h3>
              <Users className="text-indigo-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">--</p>
            <p className="text-sm text-gray-500 mt-1">Assignments due</p>
            <Button variant="outline" className="mt-4" size="sm" disabled>
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          {myCourses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/courses")}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              View All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your courses...</p>
          </div>
        ) : recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <Card
                key={course.courseId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {course.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {course.description || "No description provided."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-4">
              You're not enrolled in any courses yet.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/courses?enroll=1")}
              icon={<PlusCircle size={16} />}
            >
              Enroll in a Course
            </Button>
          </div>
        )}
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome back, {currentUser?.username || "Teacher"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">My Courses</h3>
              <BookOpen className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">{myCourses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Courses created</p>
            <Button
              variant="outline"
              className="mt-4"
              size="sm"
              onClick={() => navigate("/courses")}
            >
              View All Courses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Students</h3>
              <Users className="text-green-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">--</p>
            <p className="text-sm text-gray-500 mt-1">Total enrolled</p>
            <Button variant="outline" className="mt-4" size="sm" disabled>
              View Students
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Content</h3>
              <CheckCircle className="text-indigo-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">--</p>
            <p className="text-sm text-gray-500 mt-1">Materials & quizzes</p>
            <Button variant="outline" className="mt-4" size="sm" disabled>
              View Content
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/courses/create")}
              icon={<PlusCircle size={16} />}
              className="mr-2"
            >
              Create Course
            </Button>
            {myCourses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/courses")}
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                View All
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your courses...</p>
          </div>
        ) : recentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentCourses.map((course) => (
              <Card
                key={course.courseId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Join code:{" "}
                    <span className="font-mono">{course.joinCode}</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {course.enrollments?.length || 0} students enrolled
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/courses/${course.courseId}`)}
                  >
                    Manage Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-4">
              You haven't created any courses yet.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/courses/create")}
              icon={<PlusCircle size={16} />}
            >
              Create Your First Course
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <PageLayout>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {hasRole("Student") ? (
        renderStudentDashboard()
      ) : hasRole("Teacher") ? (
        renderTeacherDashboard()
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">
            Please log in to continue
          </h2>
          <p className="text-gray-500">
            You need to log in to view your dashboard.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default DashboardPage;
