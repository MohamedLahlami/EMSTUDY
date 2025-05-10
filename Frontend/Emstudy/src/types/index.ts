// Types matching the OpenAPI contract

export interface AuthResponse {
  token: string;
  expiresIn: number;
  role: string;
}

export interface UserDTO {
  username: string;
  email: string;
  password: string;
  role: string;
  bio?: string;
  studentGroup?: string;
}

export interface Teacher {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: string;
  bio?: string;
  courses?: Course[];
}

export interface Student {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: string;
  status?: string;
  studentGroup?: string;
  enrollments?: Enrollment[];
  completedCourseItems?: CompletedCourseItem[];
  submissions?: Submission[];
}

export interface Course {
  courseId: number;
  joinCode: string;
  teacher: Teacher;
  courseItems: (CourseMaterial | Quiz)[];
  completedCourseItems?: CompletedCourseItem[];
  enrollments?: Enrollment[];
  name: string;
  description: string;
}

export interface CourseItem {
  itemId: number;
  title: string;
  addDate: string;
  itemType: string;
  course?: Course;
}

export interface CourseMaterial extends CourseItem {
  courseMaterialType: "PDF" | "VIDEO" | "IMAGE" | "DOCUMENT" | "OTHER";
  url: string;
  description: string;
}

export interface Quiz extends CourseItem {
  durationInMinutes: number;
  showCorrectAnswers: boolean;
  questions: Question[];
}

export interface Enrollment {
  enrollmentId: number;
  courseId: number;
  studentId: number;
  enrollmentDate: string;
  completionDate?: string;
  student?: Student;
  course?: Course;
}

export interface CompletedCourseItem {
  completedCourseItemId: number;
  student: Student;
  course: Course;
  courseItem: CourseMaterial | Quiz;
  completedAt: string;
}

export interface Question {
  questionId: number;
  questionText: string;
  points: number;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";
  quiz?: Quiz;
  answers?: Answer[];
  explanation?: string;
}

export interface Answer {
  answerId: number;
  answerText: string;
  question?: Question;
  correct: boolean;
}

export interface Submission {
  submissionId: number;
  startTime: string;
  endTime: string;
  submitted: boolean;
  score: number;
  answers: Answer[];
  quiz: Quiz;
  student: Student;
}