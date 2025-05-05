export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
  profilePicture?: string;
  lastLogin?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  studentIds: string[];
  coverImage?: string;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "text";
  content: string; // URL for links, videos, or PDFs; text content for text
  dateAdded: string;
  availableFrom: string;
  availableTo?: string;
}

export type AssignmentType = "homework" | "quiz";
export type QuestionType = "multiple_choice" | "true_false" | "multiple_select";

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: AssignmentType;
  totalPoints: number;
  dueDate: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswers?: string[]; // Indices of correct answers
  points: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  status: "draft" | "submitted" | "late" | "graded";
  answers?: Answer[];
  files?: string[]; // URLs
  comments?: string;
}

export interface Answer {
  questionId: string;
  selectedOptions?: string[]; // Indices of selected options
  textResponse?: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  score: number;
  feedback?: string;
  gradedBy: string;
  gradedDate: string;
}