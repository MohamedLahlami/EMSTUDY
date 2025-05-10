import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EnrollPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Only students can enroll in courses
  if (!currentUser || currentUser.role !== 'Student') {
    return <Navigate to="/dashboard" />;
  }
  
  // Redirect to courses page which now has the enrollment functionality
  return <Navigate to="/courses" />;
};

export default EnrollPage;