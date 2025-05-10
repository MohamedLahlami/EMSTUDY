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

export const updateQuestion = async (questionId: number, question: Question): Promise<Question> => {
  const res = await api.put<Question>(`/questions/${questionId}`, question);
  return res.data;
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await api.delete(`/questions/${questionId}`);
};

export const getQuizById = async (quizId: number): Promise<Quiz> => {
  const res = await api.get<Quiz>(`/quizzes/${quizId}`);
  return res.data;
}; 