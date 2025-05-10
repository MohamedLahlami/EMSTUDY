import api from "./apiClient";
import { Submission, Answer } from "../types";

export const startSubmission = async (quizId: number): Promise<Submission> => {
  const res = await api.post<Submission>(
    `/submissions/start/?quizId=${quizId}`
  );
  return res.data;
};

export const submitSubmission = async (
  submissionId: number,
  answerIds: number[]
): Promise<Submission> => {
  const res = await api.put<Submission>(
    `/submissions/${submissionId}`,
    answerIds
  );
  return res.data;
};

export const getSubmissionById = async (id: number): Promise<Submission> => {
  const res = await api.get<Submission>(`/submissions/${id}`);
  return res.data;
};

export const getSubmissionByQuizAndStudent = async (
  quizId: number,
  studentId: number
): Promise<Submission> => {
  const res = await api.get<Submission>(
    `/submissions/student/${studentId}/quiz/${quizId}`
  );
  return res.data;
};

export const getAllSubmissions = async (): Promise<Submission[]> => {
  const res = await api.get<Submission[]>("/submissions");
  return res.data;
};

export const deleteSubmission = async (id: number): Promise<void> => {
  await api.delete(`/submissions/${id}`);
};
