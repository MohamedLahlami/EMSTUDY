import api from "./apiClient";
import { CourseMaterial } from "../types";

export const createMaterial = async (
  title: string,
  courseId: number,
  file: File
): Promise<CourseMaterial> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<CourseMaterial>(
    `/materials?title=${encodeURIComponent(title)}&courseId=${courseId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return res.data;
};

export const updateMaterial = async (
  itemId: number,
  material: CourseMaterial
): Promise<CourseMaterial> => {
  const res = await api.put<CourseMaterial>(`/materials/${itemId}`, material);
  return res.data;
};

export const deleteMaterial = async (itemId: number): Promise<any> => {
  const res = await api.delete(`/materials/${itemId}`);
  return res.data;
};

export const getMaterialsByCourse = async (
  courseId: number
): Promise<CourseMaterial[]> => {
  const res = await api.get<CourseMaterial[]>(`/materials/course/${courseId}`);
  return res.data;
};

export const downloadMaterial = async (materialId: number): Promise<Blob> => {
  const res = await api.get(`/materials/${materialId}`, {
    responseType: "blob",
  });
  return res.data;
};

export const getMaterialById = async (
  itemId: number
): Promise<CourseMaterial> => {
  const res = await api.get<CourseMaterial>(`/materials/${itemId}`);
  return res.data;
};

export const getMarkdownMaterial = async (
  materialId: number
): Promise<string> => {
  const res = await api.get(`/materials/markdown/${materialId}`, {
    responseType: "text",
  });
  return res.data;
};
