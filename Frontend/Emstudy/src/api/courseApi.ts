import api from "./apiClient";
import { Course } from "../types";

export const getAllCourses = async (): Promise<Course[]> => {
  const res = await api.get<Course[]>("/courses");
  return res.data;
};

export const getCourseById = async (courseId: number): Promise<Course> => {
  const res = await api.get<Course>(`/courses/${courseId}`);
  return res.data;
};

export const createCourse = async (course: Course): Promise<any> => {
  const res = await api.post("/courses", course);
  return res.data;
};

export const updateCourse = async (course: Course): Promise<Course> => {
  const res = await api.put<Course>("/courses", course);
  return res.data;
};

export const deleteCourse = async (courseId: number): Promise<any> => {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
}; 