import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Pages
import DashboardPage from "./pages/dashboard/DashboardPage";

// Course Pages
import CoursesPage from "./pages/course/CoursesPage";
import CreateCoursePage from "./pages/course/CreateCoursePage";
import CourseDetailsPage from "./pages/course/CourseDetailsPage";
import QuizViewPage from "./pages/course/QuizViewPage";
import QuizEditPage from "./pages/course/QuizEditPage";
import QuizSubmissionsPage from "./pages/course/QuizSubmissionsPage";

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes (any authenticated user) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route
                path="/courses/:courseId"
                element={<CourseDetailsPage />}
              />
              <Route
                path="/courses/:courseId/quizzes/:quizId"
                element={<QuizViewPage />}
              />
            </Route>

            {/* Teacher-only Routes */}
            <Route element={<ProtectedRoute requiredRole="Teacher" />}>
              <Route path="/courses/create" element={<CreateCoursePage />} />
              <Route
                path="/courses/:courseId/quizzes/:quizId/edit"
                element={<QuizEditPage />}
              />
              <Route
                path="/courses/:courseId/quizzes/:quizId/submissions"
                element={<QuizSubmissionsPage />}
              />
            </Route>

            {/* Student-only Routes */}
            <Route element={<ProtectedRoute requiredRole="Student" />}>
              {/* Add student-only routes here if needed in the future */}
            </Route>

            {/* Default routes */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
