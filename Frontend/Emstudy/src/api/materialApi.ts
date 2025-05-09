import api from "./apiClient";
import { CourseMaterial } from "../types";

export const createMaterial = async (title: string, courseId: number, file: File): Promise<CourseMaterial> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<CourseMaterial>(`/materials?title=${title}&courseId=${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateMaterial = async (itemId: number, material: CourseMaterial): Promise<CourseMaterial> => {
  const res = await api.put<CourseMaterial>(`/materials/${itemId}`, material);
  return res.data;
};

export const deleteMaterial = async (itemId: number): Promise<any> => {
  const res = await api.delete(`/materials/${itemId}`);
  return res.data;
};

export const downloadMaterial = async (materialId: number): Promise<Blob> => {
  const res = await api.get(`/materials/${materialId}/download`, { responseType: "blob" });
  return res.data;
}; 