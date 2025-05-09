import api from "./apiClient";
import { Quiz, Question } from "../types";

export const createQuiz = async (courseId: number, quiz: Quiz): Promise<Quiz> => {
  const res = await api.post<Quiz>(`/quizzes?courseId=${courseId}`, quiz);
  return res.data;
};

export const addQuestion = async (quizId: number, question: Question): Promise<Quiz> => {
  const res = await api.post<Quiz>(`/quizzes/${quizId}/questions`, question);
  return res.data;
};

export const getQuestionsByQuizId = async (quizId: number): Promise<Question[]> => {
  const res = await api.get<Question[]>(`/questions/quiz/${quizId}`);
  return res.data;
}; 