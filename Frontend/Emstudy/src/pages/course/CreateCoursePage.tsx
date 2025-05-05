import React from 'react';
import { Navigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import CreateCourseForm from '../../components/course/CreateCourseForm';
import { useAuth } from '../../context/AuthContext';

const CreateCoursePage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Only teachers can create courses
  if (!currentUser || currentUser.role !== 'teacher') {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <PageLayout
      title="Create Course"
      description="Fill out the form below to create a new course"
    >
      <CreateCourseForm />
    </PageLayout>
  );
};

export default CreateCoursePage;