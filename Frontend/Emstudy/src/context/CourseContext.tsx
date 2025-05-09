import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as courseApi from "../api/courseApi";
import * as enrollmentApi from "../api/enrollmentApi";
import * as courseItemApi from "../api/courseItemApi";
import * as materialApi from "../api/materialApi";
import * as quizApi from "../api/quizApi";
import * as submissionApi from "../api/submissionApi";
import * as completedItemApi from "../api/completedItemApi";
import {
  Course,
  CourseMaterial,
  Quiz,
  Enrollment,
  CompletedCourseItem,
  Submission,
  Question,
  Answer,
} from "../types";
import { useAuth } from "./AuthContext";

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  error: string | null;
  getAllCourses: () => Promise<void>;
  getCourseById: (id: number) => Promise<Course | undefined>;
  createCourse: (course: Course) => Promise<void>;
  enrollInCourse: (joinCode: string) => Promise<void>;
  getItemsByCourse: (courseId: number) => Promise<(CourseMaterial | Quiz)[]>;
  createMaterial: (
    title: string,
    courseId: number,
    file: File
  ) => Promise<void>;
  createQuiz: (courseId: number, quiz: Quiz) => Promise<void>;
  addQuestion: (quizId: number, question: Question) => Promise<void>;
  startSubmission: (quizId: number) => Promise<Submission>;
  submitSubmission: (
    submissionId: number,
    answers: Answer[]
  ) => Promise<Submission>;
  getSubmissionById: (id: number) => Promise<Submission>;
  markItemAsCompleted: (itemId: number) => Promise<void>;
  getCompletedItemsByCourse: (
    courseId: number
  ) => Promise<CompletedCourseItem[]>;
  removeCompletedItem: (completedItemId: number) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
}

export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAuthenticated } = useAuth();

  const getAllCourses = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getAllCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getCourseById = async (id: number) => {
    try {
      return await courseApi.getCourseById(id);
    } catch (err) {
      console.error(`Failed to get course with ID ${id}:`, err);
      setError("Failed to load course details. Please try again later.");
      return undefined;
    }
  };

  const createCourse = async (course: Course) => {
    setLoading(true);
    setError(null);
    try {
      await courseApi.createCourse(course);
      await getAllCourses();
    } catch (err) {
      console.error("Failed to create course:", err);
      setError("Failed to create course. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (joinCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await enrollmentApi.enrollInCourse(joinCode);
      await getAllCourses();
    } catch (err) {
      console.error("Failed to enroll in course:", err);
      setError(
        "Failed to enroll in course. Please check the join code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getItemsByCourse = async (courseId: number) => {
    try {
      return await courseItemApi.getItemsByCourse(courseId);
    } catch (err) {
      console.error(`Failed to get items for course ${courseId}:`, err);
      setError("Failed to load course items. Please try again later.");
      return [];
    }
  };

  const createMaterial = async (
    title: string,
    courseId: number,
    file: File
  ) => {
    setLoading(true);
    setError(null);
    try {
      await materialApi.createMaterial(title, courseId, file);
    } catch (err) {
      console.error("Failed to create material:", err);
      setError("Failed to upload material. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (courseId: number, quiz: Quiz) => {
    setLoading(true);
    setError(null);
    try {
      await quizApi.createQuiz(courseId, quiz);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      setError("Failed to create quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (quizId: number, question: Question) => {
    setLoading(true);
    setError(null);
    try {
      await quizApi.addQuestion(quizId, question);
    } catch (err) {
      console.error("Failed to add question:", err);
      setError("Failed to add question. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const startSubmission = async (quizId: number) => {
    try {
      return await submissionApi.startSubmission(quizId);
    } catch (err) {
      console.error("Failed to start submission:", err);
      setError("Failed to start quiz. Please try again later.");
      throw err; // Need to throw to handle in the component
    }
  };

  const submitSubmission = async (submissionId: number, answers: Answer[]) => {
    try {
      return await submissionApi.submitSubmission(submissionId, answers);
    } catch (err) {
      console.error("Failed to submit answers:", err);
      setError("Failed to submit quiz. Please try again later.");
      throw err; // Need to throw to handle in the component
    }
  };

  const getSubmissionById = async (id: number) => {
    try {
      return await submissionApi.getSubmissionById(id);
    } catch (err) {
      console.error(`Failed to get submission ${id}:`, err);
      setError("Failed to load submission. Please try again later.");
      throw err;
    }
  };

  const markItemAsCompleted = async (itemId: number) => {
    setError(null);
    try {
      await completedItemApi.markItemAsCompleted(itemId);
    } catch (err) {
      console.error("Failed to mark item as completed:", err);
      setError("Failed to update progress. Please try again later.");
    }
  };

  const getCompletedItemsByCourse = async (courseId: number) => {
    try {
      return await completedItemApi.getCompletedItemsByCourse(courseId);
    } catch (err) {
      console.error("Failed to get completed items:", err);
      setError("Failed to load progress data. Please try again later.");
      return [];
    }
  };

  const removeCompletedItem = async (completedItemId: number) => {
    setError(null);
    try {
      await completedItemApi.removeCompletedItem(completedItemId);
    } catch (err) {
      console.error("Failed to remove completed item:", err);
      setError("Failed to update progress. Please try again later.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAllCourses();
    }
  }, [isAuthenticated]);

  const value = {
    courses,
    loading,
    error,
    getAllCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    getItemsByCourse,
    createMaterial,
    createQuiz,
    addQuestion,
    startSubmission,
    submitSubmission,
    getSubmissionById,
    markItemAsCompleted,
    getCompletedItemsByCourse,
    removeCompletedItem,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
