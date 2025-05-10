import api from "./apiClient";
import { Question } from "../types";

export const getAllQuestions = async (): Promise<Question[]> => {
  const res = await api.get<Question[]>("/questions/");
  return res.data;
};

export const getQuestionById = async (
  questionId: number
): Promise<Question> => {
  const res = await api.get<Question>(`/questions/${questionId}`);
  return res.data;
};

export const updateQuestion = async (
  questionId: number,
  question: Question
): Promise<Question> => {
  const res = await api.put<Question>(`/questions/${questionId}`, question);
  return res.data;
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

export const getQuestionsByQuizId = async (
  quizId: number
): Promise<Question[]> => {
  const res = await api.get<Question[]>(`/questions/quiz/${quizId}`);
  return res.data;
};
