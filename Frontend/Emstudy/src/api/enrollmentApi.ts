import api from "./apiClient";
import { Enrollment } from "../types";

export const enrollInCourse = async (joinCode: string): Promise<Enrollment> => {
  const res = await api.post<Enrollment>(`/enrollments/enroll?joinCode=${joinCode}`);
  return res.data;
};

export const getEnrollmentById = async (enrollmentId: number): Promise<Enrollment> => {
  const res = await api.get<Enrollment>(`/enrollments/${enrollmentId}`);
  return res.data;
};

export const getEnrollmentsByStudent = async (studentId: number): Promise<Enrollment[]> => {
  const res = await api.get<Enrollment[]>(`/enrollments/students/${studentId}`);
  return res.data;
};

export const getEnrollmentsByCourse = async (courseId: number): Promise<Enrollment[]> => {
  const res = await api.get<Enrollment[]>(`/enrollments/courses/${courseId}`);
  return res.data;
}; 