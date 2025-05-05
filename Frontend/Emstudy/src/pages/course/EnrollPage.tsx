import React from 'react';
import { Navigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import EnrollCourseForm from '../../components/course/EnrollCourseForm';
import { useAuth } from '../../context/AuthContext';

const EnrollPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Only students can enroll in courses
  if (!currentUser || currentUser.role !== 'student') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <PageLayout
      title="Enroll in a Course"
      description="Enter a course code to join a course"
    >
      <EnrollCourseForm />
    </PageLayout>
  );
};

export default EnrollPage;