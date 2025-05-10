import api from "./apiClient";
import { CompletedCourseItem } from "../types";

export const markItemAsCompleted = async (itemId: number): Promise<any> => {
  const res = await api.post(`/completed-items/?itemId=${itemId}`);
  return res.data;
};

export const getCompletedItemsByCourse = async (
  courseId: number
): Promise<CompletedCourseItem[]> => {
  const res = await api.get<CompletedCourseItem[]>(
    `/completed-items/course/${courseId}`
  );
  return res.data;
};

export const removeCompletedItem = async (
  completedItemId: number
): Promise<any> => {
  const res = await api.delete(`/completed-items/${completedItemId}`);
  return res.data;
};

export const getCompletedItem = async (
  completedItemId: number
): Promise<CompletedCourseItem> => {
  const res = await api.get<CompletedCourseItem>(
    `/completed-items/${completedItemId}`
  );
  return res.data;
};
