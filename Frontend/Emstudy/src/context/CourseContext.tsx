import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Course, 
  Material, 
  Assignment, 
  Submission, 
  Grade, 
  User 
} from '../types';
import { 
  courses, 
  materials, 
  assignments, 
  submissions, 
  grades, 
  users,
  addCourse,
  addMaterial,
  addAssignment,
  addSubmission,
  addGrade,
  getCoursesByTeacherId,
  getCoursesByStudentId,
  getAssignmentsByCourseId,
  getMaterialsByCourseId,
  getSubmissionsByAssignmentId,
  getSubmissionsByStudentId,
  getGradeBySubmissionId,
  enrollStudentInCourse,
  getStudentsByCourseId
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface CourseContextType {
  courses: Course[];
  materials: Material[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: Grade[];
  loading: boolean;
  getUserCourses: () => Course[];
  getCourseById: (id: string) => Course | undefined;
  createCourse: (course: Omit<Course, 'id' | 'studentIds'>) => Course;
  enrollInCourse: (courseCode: string) => boolean;
  getCourseMaterials: (courseId: string) => Material[];
  getCourseAssignments: (courseId: string) => Assignment[];
  getAssignmentSubmissions: (assignmentId: string) => Submission[];
  getStudentSubmissions: () => Submission[];
  createMaterial: (material: Omit<Material, 'id' | 'dateAdded'>) => Material;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => Assignment;
  submitAssignment: (submission: Omit<Submission, 'id' | 'submissionDate' | 'status'>) => Submission;
  gradeSubmission: (grade: Omit<Grade, 'id' | 'gradedDate'>) => Grade;
  getCourseStudents: (courseId: string) => User[];
  getAssignmentById: (id: string) => Assignment | undefined;
  getStudentSubmission: (assignmentId: string, studentId: string) => Submission | undefined;
  createSubmission: (submission: Omit<Submission, 'id'>) => Submission;
  createGrade: (grade: Omit<Grade, 'id'>) => Grade;
  excludeStudentFromCourse: (courseId: string, studentId: string) => boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const getUserCourses = (): Course[] => {
    if (!currentUser) return [];

    if (currentUser.role === 'teacher') {
      return getCoursesByTeacherId(currentUser.id);
    } else {
      return getCoursesByStudentId(currentUser.id);
    }
  };

  const getCourseById = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  const createCourse = (courseData: Omit<Course, 'id' | 'studentIds'>): Course => {
    const newCourse = addCourse({
      ...courseData,
      studentIds: [],
    });
    return newCourse;
  };

  const enrollInCourse = (courseCode: string): boolean => {
    if (!currentUser || currentUser.role !== 'student') return false;
    return enrollStudentInCourse(currentUser.id, courseCode);
  };

  const getCourseMaterials = (courseId: string): Material[] => {
    return getMaterialsByCourseId(courseId);
  };

  const getCourseAssignments = (courseId: string): Assignment[] => {
    return getAssignmentsByCourseId(courseId);
  };

  const getAssignmentSubmissions = (assignmentId: string): Submission[] => {
    return getSubmissionsByAssignmentId(assignmentId);
  };

  const getStudentSubmissions = (): Submission[] => {
    if (!currentUser || currentUser.role !== 'student') return [];
    return getSubmissionsByStudentId(currentUser.id);
  };

  const createMaterial = (materialData: Omit<Material, 'id' | 'dateAdded'>): Material => {
    return addMaterial(materialData);
  };

  const createAssignment = (assignmentData: Omit<Assignment, 'id'>): Assignment => {
    return addAssignment(assignmentData);
  };

  const submitAssignment = (
    submissionData: Omit<Submission, 'id' | 'submissionDate' | 'status'>
  ): Submission => {
    return addSubmission(submissionData);
  };

  const gradeSubmission = (gradeData: Omit<Grade, 'id' | 'gradedDate'>): Grade => {
    return addGrade(gradeData);
  };

  const getCourseStudents = (courseId: string): User[] => {
    return getStudentsByCourseId(courseId);
  };

  const getAssignmentById = (id: string): Assignment | undefined => {
    return assignments.find(assignment => assignment.id === id);
  };

  const getStudentSubmission = (assignmentId: string, studentId: string): Submission | undefined => {
    return submissions.find(
      submission => submission.assignmentId === assignmentId && submission.studentId === studentId
    );
  };

  const createSubmission = (submissionData: Omit<Submission, 'id'>): Submission => {
    return addSubmission({
      ...submissionData,
      submissionDate: submissionData.submissionDate || new Date().toISOString(),
      status: submissionData.status || 'submitted'
    });
  };

  const createGrade = (gradeData: Omit<Grade, 'id'>): Grade => {
    return addGrade({
      ...gradeData,
      gradedDate: gradeData.gradedDate || new Date().toISOString()
    });
  };

  const excludeStudentFromCourse = (courseId: string, studentId: string): boolean => {
    try {
      const courseIndex = courses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) return false;
      
      const course = courses[courseIndex];
      if (!course.studentIds.includes(studentId)) return false;
      
      // Remove student from course
      courses[courseIndex] = {
        ...course,
        studentIds: course.studentIds.filter(id => id !== studentId)
      };
      
      return true;
    } catch (error) {
      console.error('Failed to exclude student:', error);
      return false;
    }
  };

  const value = {
    courses,
    materials,
    assignments,
    submissions,
    grades,
    loading,
    getUserCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    getCourseMaterials,
    getCourseAssignments,
    getAssignmentSubmissions,
    getStudentSubmissions,
    createMaterial,
    createAssignment,
    submitAssignment,
    gradeSubmission,
    getCourseStudents,
    getAssignmentById,
    getStudentSubmission,
    createSubmission,
    createGrade,
    excludeStudentFromCourse
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};