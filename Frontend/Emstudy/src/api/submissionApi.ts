import api from "./apiClient";
import { Submission, Answer, SubmissionDTO } from "../types";

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
  quizId: number
): Promise<Submission> => {
  const res = await api.get<Submission>(`/submissions/quiz/${quizId}`);
  return res.data;
};

// Get current user's submissions
export const getCurrentUserSubmissions = async (): Promise<Submission[]> => {
  const res = await api.get<Submission[]>("/submissions");
  return res.data;
};

// Get all submissions (admin/teacher only)
export const getAllSubmissions = async (): Promise<Submission[]> => {
  const res = await api.get<Submission[]>("/submissions/all");
  return res.data;
};

export const deleteSubmission = async (id: number): Promise<void> => {
  await api.delete(`/submissions/${id}`);
};

// Utility function to check if a user has already taken a specific quiz
export const hasAttemptedQuiz = async (quizId: number): Promise<boolean> => {
  try {
    const userSubmissions = await getCurrentUserSubmissions();
    return userSubmissions.some(
      (submission) => submission.quiz && submission.quiz.itemId === quizId
    );
  } catch (error) {
    console.error("Error checking quiz attempts:", error);
    return false; // Assume not attempted if there's an error
  }
};

/**
 * Retrieves all submissions for a specific quiz.
 * (Typically for a teacher to view)
 * @param quizId The ID of the quiz.
 * @returns A promise that resolves to an array of quiz submissions.
 */
export const getSubmissionsForQuizByTeacher = async (
  quizId: number
): Promise<SubmissionDTO[]> => {
  const res = await api.get<SubmissionDTO[]>(
    `/materials/quiz/${quizId}/submissions`
  );
  return res.data;
};
