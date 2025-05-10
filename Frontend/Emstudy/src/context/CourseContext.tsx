import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import * as courseApi from "../api/courseApi";
import * as enrollmentApi from "../api/enrollmentApi";
import * as courseItemApi from "../api/courseItemApi";
import * as materialApi from "../api/materialApi";
import * as quizApi from "../api/quizApi";
import * as questionApi from "../api/questionApi";
import * as answerApi from "../api/answerApi";
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
  // Core data
  myCourses: Course[];
  loading: boolean;
  error: string | null;
  clearError: () => void;

  // Student course actions
  enrollInCourse: (joinCode: string) => Promise<boolean>;
  getEnrollments: () => Promise<Enrollment[]>;
  markItemAsCompleted: (itemId: number) => Promise<boolean>;
  getCompletedItems: (courseId: number) => Promise<CompletedCourseItem[]>;

  // Teacher course actions
  createCourse: (courseData: Partial<Course>) => Promise<boolean>;
  updateCourse: (
    courseId: number,
    courseData: Partial<Course>
  ) => Promise<boolean>;
  deleteCourse: (courseId: number) => Promise<boolean>;

  // Course content actions
  getCourseDetails: (courseId: number) => Promise<Course | null>;
  getCourseItems: (courseId: number) => Promise<(CourseMaterial | Quiz)[]>;
  createMaterial: (
    courseId: number,
    title: string,
    file: File
  ) => Promise<boolean>;
  createQuiz: (courseId: number, quizData: Partial<Quiz>) => Promise<boolean>;

  // Quiz actions
  getQuizDetails: (quizId: number) => Promise<Quiz | null>;
  addQuestion: (
    quizId: number,
    questionData: Partial<Question>
  ) => Promise<boolean>;
  submitQuiz: (quizId: number, answerIds: number[]) => Promise<boolean>;

  // Submission methods
  getCurrentUserSubmissions: () => Promise<Submission[]>;
  hasAttemptedQuiz: (quizId: number) => Promise<boolean>;

  // Additional functions used in QuizViewPage
  getCourseById: (courseId: number) => Promise<Course>;
  getItemsByCourse: (courseId: number) => Promise<(CourseMaterial | Quiz)[]>;
  startSubmission: (quizId: number) => Promise<Submission>;
  submitSubmission: (
    submissionId: number,
    answerIds: number[]
  ) => Promise<Submission>;
  getSubmissionById: (id: number) => Promise<Submission>;
  getSubmissionByQuizAndStudent: (quizId: number) => Promise<Submission>;

  // Refresh methods
  refreshCourses: () => Promise<void>;
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
  const { currentUser, isAuthenticated, hasRole } = useAuth();
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utility function to handle errors
  const handleError = (err: any, message: string) => {
    console.error(message, err);
    setError(
      typeof err?.response?.data?.error === "string"
        ? err.response.data.error
        : message
    );
    return false;
  };

  // Clear error
  const clearError = () => setError(null);

  // FETCH COURSES BASED ON ROLE
  const fetchCourses = useCallback(async (): Promise<Course[]> => {
    if (!currentUser || !isAuthenticated) return [];

    try {
      // For Student: Get enrolled courses from enrollments
      if (hasRole("Student")) {
        if (!currentUser.userId) {
          console.warn("Cannot fetch enrollments: User ID is undefined");
          return [];
        }

        // Get enrollments for the student
        const enrollments = await enrollmentApi.getEnrollmentsByStudent(
          currentUser.userId
        );

        // Fetch each course by ID from the enrollments
        const coursesPromises = enrollments.map((enrollment) =>
          courseApi.getCourseById(enrollment.courseId).catch((error) => {
            console.error(
              `Failed to fetch course ${enrollment.courseId}:`,
              error
            );
            return null; // Return null for failed requests
          })
        );

        // Wait for all course requests to complete and filter out any failed requests
        const courses = (await Promise.all(coursesPromises)).filter(
          (course) => course !== null
        ) as Course[];
        return courses;
      }
      // For Teacher: Get courses where teacher.userId matches currentUser.userId
      else if (hasRole("Teacher")) {
        if (!currentUser.userId) {
          console.warn("Cannot fetch courses: User ID is undefined");
          return [];
        }
        const allCourses = await courseApi.getAllCourses();
        return allCourses.filter(
          (course) =>
            course.teacher && course.teacher.userId === currentUser.userId
        );
      }

      return [];
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("Could not load your courses. Please try again.");
      return [];
    }
  }, [currentUser, isAuthenticated, hasRole]);

  // Refresh courses
  const refreshCourses = async (): Promise<void> => {
    setLoading(true);
    clearError();

    try {
      const courses = await fetchCourses();
      setMyCourses(courses);
    } catch (err) {
      console.error("Error refreshing courses:", err);
      setError("Failed to refresh courses.");
    } finally {
      setLoading(false);
    }
  };

  // Load courses on auth changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshCourses();
    } else {
      setMyCourses([]);
    }
  }, [isAuthenticated, currentUser?.userId]);

  // STUDENT METHODS

  // Enroll in a course using join code
  const enrollInCourse = async (joinCode: string): Promise<boolean> => {
    if (!hasRole("Student")) return false;

    setLoading(true);
    clearError();

    try {
      await enrollmentApi.enrollInCourse(joinCode);
      await refreshCourses();
      return true;
    } catch (err) {
      return handleError(
        err,
        "Failed to enroll in course. Please check the join code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get student's enrollments
  const getEnrollments = async (): Promise<Enrollment[]> => {
    if (!hasRole("Student") || !currentUser) return [];

    // Add check for user ID
    if (!currentUser.userId) {
      console.warn("Cannot get enrollments: User ID is undefined");
      return [];
    }

    try {
      return await enrollmentApi.getEnrollmentsByStudent(currentUser.userId);
    } catch (err) {
      handleError(err, "Failed to fetch your enrollments.");
      return [];
    }
  };

  // Mark a course item as completed
  const markItemAsCompleted = async (itemId: number): Promise<boolean> => {
    if (!hasRole("Student")) return false;

    clearError();

    try {
      await completedItemApi.markItemAsCompleted(itemId);
      return true;
    } catch (err) {
      return handleError(err, "Failed to mark item as completed.");
    }
  };

  // Get completed items for a course
  const getCompletedItems = async (
    courseId: number
  ): Promise<CompletedCourseItem[]> => {
    if (!hasRole("Student")) return [];

    try {
      return await completedItemApi.getCompletedItemsByCourse(courseId);
    } catch (err) {
      handleError(err, "Failed to fetch completed items.");
      return [];
    }
  };

  // TEACHER METHODS

  // Create a new course
  const createCourse = async (
    courseData: Partial<Course>
  ): Promise<boolean> => {
    if (!hasRole("Teacher") || !currentUser) return false;

    setLoading(true);
    clearError();

    try {
      // Do not include the teacher object - the backend will automatically use the authenticated user
      const course = { ...courseData };

      await courseApi.createCourse(course as Course);
      await refreshCourses();
      return true;
    } catch (err) {
      return handleError(err, "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  // Update an existing course
  const updateCourse = async (
    courseId: number,
    courseData: Partial<Course>
  ): Promise<boolean> => {
    if (!hasRole("Teacher")) return false;

    setLoading(true);
    clearError();

    try {
      // First get the existing course
      const existingCourse = await courseApi.getCourseById(courseId);

      // Check if this course belongs to this teacher
      if (existingCourse.teacher.userId !== currentUser?.userId) {
        setError("You don't have permission to update this course.");
        return false;
      }

      // Update the course
      const updatedCourse = {
        ...existingCourse,
        ...courseData,
      };

      await courseApi.updateCourse(updatedCourse);
      await refreshCourses();
      return true;
    } catch (err) {
      return handleError(err, "Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a course
  const deleteCourse = async (courseId: number): Promise<boolean> => {
    if (!hasRole("Teacher")) return false;

    setLoading(true);
    clearError();

    try {
      await courseApi.deleteCourse(courseId);
      await refreshCourses();
      return true;
    } catch (err) {
      return handleError(err, "Failed to delete course.");
    } finally {
      setLoading(false);
    }
  };

  // SHARED METHODS (WITH ROLE CHECKS)

  // Get course details
  const getCourseDetails = async (courseId: number): Promise<Course | null> => {
    clearError();

    try {
      // For students, check enrollment and fetch course directly
      if (hasRole("Student") && currentUser) {
        if (!currentUser.userId) {
          console.warn("Cannot get course details: User ID is undefined");
          return null;
        }

        // Get all student enrollments
        const enrollments = await enrollmentApi.getEnrollmentsByStudent(
          currentUser.userId
        );

        // Check if student is enrolled in this course
        const isEnrolled = enrollments.some((e) => e.courseId === courseId);

        if (!isEnrolled) {
          setError("You're not enrolled in this course.");
          return null;
        }

        // Fetch the course directly
        return await courseApi.getCourseById(courseId);
      }

      // For teachers, get it directly and check ownership
      if (hasRole("Teacher")) {
        const course = await courseApi.getCourseById(courseId);

        if (course.teacher.userId === currentUser?.userId) {
          return course;
        }

        setError("You don't have permission to view this course.");
        return null;
      }

      return null;
    } catch (err) {
      handleError(err, "Failed to load course details.");
      return null;
    }
  };

  // Get course items (works for both students and teachers)
  const getCourseItems = async (
    courseId: number
  ): Promise<(CourseMaterial | Quiz)[]> => {
    if (!isAuthenticated) return [];

    clearError();

    try {
      // First verify this user has access to this course
      const courseIds = myCourses.map((c) => c.courseId);

      if (!courseIds.includes(courseId)) {
        setError("You don't have access to this course.");
        return [];
      }

      return await courseItemApi.getItemsByCourse(courseId);
    } catch (err) {
      handleError(err, "Failed to load course items.");
      return [];
    }
  };

  // Create a course material (teacher only)
  const createMaterial = async (
    courseId: number,
    title: string,
    file: File
  ): Promise<boolean> => {
    if (!hasRole("Teacher")) return false;

    setLoading(true);
    clearError();

    try {
      await materialApi.createMaterial(title, courseId, file);
      return true;
    } catch (err) {
      return handleError(err, "Failed to create course material.");
    } finally {
      setLoading(false);
    }
  };

  // Create a quiz (teacher only)
  const createQuiz = async (
    courseId: number,
    quizData: Partial<Quiz>
  ): Promise<boolean> => {
    if (!hasRole("Teacher")) return false;

    setLoading(true);
    clearError();

    try {
      // Set required fields
      const quiz = {
        ...quizData,
        itemType: "Q",
        addDate: new Date().toISOString(),
        questions: quizData.questions || [],
      } as Quiz;

      await quizApi.createQuiz(courseId, quiz);
      return true;
    } catch (err) {
      return handleError(err, "Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  // Get quiz details
  const getQuizDetails = async (quizId: number): Promise<Quiz | null> => {
    clearError();

    try {
      // First check if this quiz belongs to one of the user's courses
      const allItems = await Promise.all(
        myCourses.map((course) =>
          courseItemApi.getItemsByCourse(course.courseId)
        )
      );

      const flatItems = allItems.flat();
      const quiz = flatItems.find(
        (item) => item.itemType === "Q" && item.itemId === quizId
      ) as Quiz | undefined;

      if (!quiz) {
        setError("Quiz not found or you don't have access.");
        return null;
      }

      const questions = await questionApi.getQuestionsByQuizId(quizId);
      return { ...quiz, questions };
    } catch (err) {
      handleError(err, "Failed to load quiz details.");
      return null;
    }
  };

  // Add a question to a quiz (teacher only)
  const addQuestion = async (
    quizId: number,
    questionData: Partial<Question>
  ): Promise<boolean> => {
    if (!hasRole("Teacher")) return false;

    clearError();

    try {
      // Format the question
      const question = {
        ...questionData,
        questionType: questionData.questionType || "MULTIPLE_CHOICE",
      } as Question;

      await quizApi.addQuestion(quizId, question);
      return true;
    } catch (err) {
      return handleError(err, "Failed to add question to quiz.");
    }
  };

  // Submit a quiz (student only)
  const submitQuiz = async (
    quizId: number,
    answerIds: number[]
  ): Promise<boolean> => {
    if (!hasRole("Student")) return false;

    clearError();

    try {
      // Start a submission
      const submission = await submissionApi.startSubmission(quizId);

      // Submit answers
      await submissionApi.submitSubmission(submission.submissionId, answerIds);
      return true;
    } catch (err) {
      return handleError(err, "Failed to submit quiz.");
    }
  };

  // Create an adapter function for the updated API
  const getSubmissionByQuizAdapter = async (
    quizId: number
  ): Promise<Submission> => {
    // The API now doesn't need studentId as it's handled in the backend
    return submissionApi.getSubmissionByQuizAndStudent(quizId);
  };

  const contextValue: CourseContextType = {
    myCourses,
    loading,
    error,
    clearError,

    // Student methods
    enrollInCourse,
    getEnrollments,
    markItemAsCompleted,
    getCompletedItems,

    // Teacher methods
    createCourse,
    updateCourse,
    deleteCourse,

    // Shared methods
    getCourseDetails,
    getCourseItems,
    createMaterial,
    createQuiz,

    // Quiz methods
    getQuizDetails,
    addQuestion,
    submitQuiz,

    // Submission methods
    getCurrentUserSubmissions: submissionApi.getCurrentUserSubmissions,
    hasAttemptedQuiz: submissionApi.hasAttemptedQuiz,

    // Additional functions used in QuizViewPage
    getCourseById: courseApi.getCourseById,
    getItemsByCourse: courseItemApi.getItemsByCourse,
    startSubmission: submissionApi.startSubmission,
    submitSubmission: submissionApi.submitSubmission,
    getSubmissionById: submissionApi.getSubmissionById,
    getSubmissionByQuizAndStudent: getSubmissionByQuizAdapter,

    // Refresh method
    refreshCourses,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
};
