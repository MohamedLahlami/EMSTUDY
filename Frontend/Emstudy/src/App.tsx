import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Course Pages
import CoursesPage from './pages/course/CoursesPage';
import CreateCoursePage from './pages/course/CreateCoursePage';
import EnrollPage from './pages/course/EnrollPage';
import CourseDetailsPage from './pages/course/CourseDetailsPage';
import AssignmentViewPage from './pages/course/AssignmentViewPage';

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
              <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentViewPage />} />
            </Route>
            
            {/* Teacher-only Routes */}
            <Route element={<ProtectedRoute requiredRole="teacher" />}>
              <Route path="/courses/create" element={<CreateCoursePage />} />
            </Route>
            
            {/* Student-only Routes */}
            <Route element={<ProtectedRoute requiredRole="student" />}>
              <Route path="/enroll" element={<EnrollPage />} />
            </Route>
            
            {/* Redirect to login if user is not authenticated */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;