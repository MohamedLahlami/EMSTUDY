import { User, Course, Material, Assignment, Submission, Grade, Question } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock users
export const users: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    password: "password123",
    role: "teacher",
    profilePicture: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
    lastLogin: "2025-01-30T14:35:20.000Z"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    password: "password123",
    role: "teacher",
    profilePicture: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
    lastLogin: "2025-01-29T09:12:45.000Z"
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    password: "password123",
    role: "student",
    profilePicture: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
    lastLogin: "2025-01-30T08:45:30.000Z"
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    password: "password123",
    role: "student",
    profilePicture: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600",
    lastLogin: "2025-01-28T16:20:10.000Z"
  },
  {
    id: "5",
    name: "Jessica Wilson",
    email: "jessica.wilson@example.com",
    password: "password123",
    role: "student",
    profilePicture: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=600",
    lastLogin: "2025-01-30T11:05:45.000Z"
  }
];

// Mock courses
export const courses: Course[] = [
  {
    id: "1",
    name: "Introduction to Computer Science",
    code: "CS101",
    description: "An introductory course to the fundamentals of computer science, programming concepts, and algorithms.",
    teacherId: "1",
    startDate: "2025-01-15",
    endDate: "2025-05-30",
    studentIds: ["3", "4", "5"],
    coverImage: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "2",
    name: "Advanced Mathematics",
    code: "MATH202",
    description: "A comprehensive course covering calculus, linear algebra, and probability theory.",
    teacherId: "2",
    startDate: "2025-01-15",
    endDate: "2025-05-30",
    studentIds: ["3", "5"],
    coverImage: "https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "3",
    name: "Data Structures and Algorithms",
    code: "CS201",
    description: "Learn about fundamental data structures and algorithms for efficient problem-solving.",
    teacherId: "1",
    startDate: "2025-01-15",
    endDate: "2025-05-30",
    studentIds: ["4"],
    coverImage: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

// Mock materials
export const materials: Material[] = [
  {
    id: "1",
    courseId: "1",
    title: "Introduction to Programming Concepts",
    description: "Learn the basics of programming concepts and syntax.",
    type: "pdf",
    content: "https://example.com/intro-programming.pdf",
    dateAdded: "2025-01-16",
    availableFrom: "2025-01-16"
  },
  {
    id: "2",
    courseId: "1",
    title: "Algorithms Fundamentals",
    description: "Introduction to basic algorithms and their analysis.",
    type: "video",
    content: "https://example.com/algorithms-video",
    dateAdded: "2025-01-20",
    availableFrom: "2025-01-23"
  },
  {
    id: "3",
    courseId: "2",
    title: "Calculus Review",
    description: "A comprehensive review of differential calculus.",
    type: "pdf",
    content: "https://example.com/calculus-review.pdf",
    dateAdded: "2025-01-17",
    availableFrom: "2025-01-17"
  }
];

// Mock questions
export const questions: Question[] = [
  {
    id: "1",
    text: "What is the time complexity of binary search?",
    type: "multiple_choice",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswers: ["1"], // Index of O(log n)
    points: 5
  },
  {
    id: "2",
    text: "True or False: JavaScript is a statically typed language.",
    type: "true_false",
    options: ["True", "False"],
    correctAnswers: ["1"], // Index of False
    points: 3
  },
  {
    id: "3",
    text: "Select all data structures that have O(1) time complexity for access operation:",
    type: "multiple_select",
    options: ["Array", "Linked List", "Hash Table", "Binary Search Tree"],
    correctAnswers: ["0", "2"], // Indices of Array and Hash Table
    points: 7
  }
];

// Mock assignments
export const assignments: Assignment[] = [
  {
    id: "1",
    courseId: "1",
    title: "Programming Basics Quiz",
    description: "A quiz to test your understanding of basic programming concepts.",
    type: "quiz",
    totalPoints: 15,
    dueDate: "2025-02-01",
    questions: [questions[0], questions[1], questions[2]]
  },
  {
    id: "2",
    courseId: "1",
    title: "Implement a Sorting Algorithm",
    description: "Implement and analyze a sorting algorithm of your choice.",
    type: "homework",
    totalPoints: 20,
    dueDate: "2025-02-15"
  },
  {
    id: "3",
    courseId: "2",
    title: "Calculus Problem Set",
    description: "Solve the calculus problems provided in this assignment.",
    type: "homework",
    totalPoints: 25,
    dueDate: "2025-02-10"
  }
];

// Mock submissions
export const submissions: Submission[] = [
  {
    id: "1",
    assignmentId: "1",
    studentId: "3",
    submissionDate: "2025-01-30",
    status: "submitted",
    answers: [
      {
        questionId: "1",
        selectedOptions: ["1"] // Selected O(log n)
      },
      {
        questionId: "2",
        selectedOptions: ["1"] // Selected False
      },
      {
        questionId: "3",
        selectedOptions: ["0", "2"] // Selected Array and Hash Table
      }
    ]
  },
  {
    id: "2",
    assignmentId: "2",
    studentId: "3",
    submissionDate: "2025-02-14",
    status: "submitted",
    files: ["https://example.com/submission2.zip"],
    comments: "I implemented merge sort and analyzed its time complexity."
  },
  {
    id: "3",
    assignmentId: "1",
    studentId: "4",
    submissionDate: "2025-01-29",
    status: "graded",
    answers: [
      {
        questionId: "1",
        selectedOptions: ["1"] // Selected O(log n)
      },
      {
        questionId: "2",
        selectedOptions: ["1"] // Selected False
      },
      {
        questionId: "3",
        selectedOptions: ["0", "3"] // Selected Array and BST (partially wrong)
      }
    ]
  }
];

// Mock grades
export const grades: Grade[] = [
  {
    id: "1",
    submissionId: "3",
    score: 13,
    feedback: "Good work on the first two questions, but remember that BST access is O(log n), not O(1).",
    gradedBy: "1",
    gradedDate: "2025-02-01"
  }
];

// Helper functions to manipulate data
export const addUser = (user: Omit<User, "id">): User => {
  const newUser = { ...user, id: uuidv4() };
  users.push(newUser);
  return newUser;
};

export const addCourse = (course: Omit<Course, "id">): Course => {
  const newCourse = { ...course, id: uuidv4() };
  courses.push(newCourse);
  return newCourse;
};

export const addMaterial = (material: Omit<Material, "id" | "dateAdded">): Material => {
  const newMaterial = { 
    ...material, 
    id: uuidv4(), 
    dateAdded: new Date().toISOString()
  };
  materials.push(newMaterial);
  return newMaterial;
};

export const addAssignment = (assignment: Omit<Assignment, "id">): Assignment => {
  const newAssignment = { ...assignment, id: uuidv4() };
  assignments.push(newAssignment);
  return newAssignment;
};

export const addSubmission = (submission: Omit<Submission, "id" | "submissionDate">): Submission => {
  const newSubmission = { 
    ...submission, 
    id: uuidv4(), 
    submissionDate: new Date().toISOString(),
    status: new Date() > new Date(getAssignmentById(submission.assignmentId)?.dueDate || "") 
      ? "late" 
      : "submitted"
  };
  submissions.push(newSubmission);
  return newSubmission;
};

export const addGrade = (grade: Omit<Grade, "id" | "gradedDate">): Grade => {
  const newGrade = { 
    ...grade, 
    id: uuidv4(), 
    gradedDate: new Date().toISOString() 
  };
  grades.push(newGrade);
  
  // Update submission status
  const submission = submissions.find(s => s.id === grade.submissionId);
  if (submission) {
    submission.status = "graded";
  }
  
  return newGrade;
};

// Helper functions to get data
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

export const getAssignmentById = (id: string): Assignment | undefined => {
  return assignments.find(assignment => assignment.id === id);
};

export const getSubmissionById = (id: string): Submission | undefined => {
  return submissions.find(submission => submission.id === id);
};

export const getGradeBySubmissionId = (submissionId: string): Grade | undefined => {
  return grades.find(grade => grade.submissionId === submissionId);
};

export const getSubmissionsByAssignmentId = (assignmentId: string): Submission[] => {
  return submissions.filter(submission => submission.assignmentId === assignmentId);
};

export const getSubmissionsByStudentId = (studentId: string): Submission[] => {
  return submissions.filter(submission => submission.studentId === studentId);
};

export const getCoursesByStudentId = (studentId: string): Course[] => {
  return courses.filter(course => course.studentIds.includes(studentId));
};

export const getCoursesByTeacherId = (teacherId: string): Course[] => {
  return courses.filter(course => course.teacherId === teacherId);
};

export const getMaterialsByCourseId = (courseId: string): Material[] => {
  return materials.filter(material => material.courseId === courseId);
};

export const getAssignmentsByCourseId = (courseId: string): Assignment[] => {
  return assignments.filter(assignment => assignment.courseId === courseId);
};

export const getStudentsByCourseId = (courseId: string): User[] => {
  const course = getCourseById(courseId);
  if (!course) return [];
  return users.filter(user => course.studentIds.includes(user.id));
};

export const enrollStudentInCourse = (studentId: string, courseCode: string): boolean => {
  const course = courses.find(c => c.code === courseCode);
  if (!course) return false;
  
  if (!course.studentIds.includes(studentId)) {
    course.studentIds.push(studentId);
  }
  
  return true;
};