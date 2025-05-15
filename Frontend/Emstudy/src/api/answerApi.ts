import api from "./apiClient";
import { Answer } from "../types";

export const getAnswerById = async (answerId: number): Promise<Answer> => {
  const res = await api.get<Answer>(`/answers/${answerId}`);
  return res.data;
};

export const updateAnswer = async (
  answerId: number,
  answer: Answer
): Promise<Answer> => {
  const res = await api.put<Answer>(`/answers/${answerId}`, answer);
  return res.data;
};

export const deleteAnswer = async (answerId: number): Promise<void> => {
  await api.delete(`/answers/${answerId}`);
};

export const getAnswersByQuestion = async (
  questionId: number
): Promise<Answer[]> => {
  const res = await api.get<Answer[]>(`/answers/question/${questionId}`);
  return res.data;
};

export const createAnswer = async (
  questionId: number,
  answer: Answer
): Promise<Answer> => {
  const res = await api.post<Answer>(`/answers/question/${questionId}`, answer);
  return res.data;
};
