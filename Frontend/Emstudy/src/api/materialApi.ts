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

/**
 * Fetches the actual file content of a material.
 * @param materialId The ID of the material.
 * @param forDownload If true, requests the content with Content-Disposition: attachment.
 *                    If false, requests inline disposition.
 * @returns A promise that resolves to a Blob.
 */
export const getMaterialFileContent = async (
  materialId: number,
  forDownload: boolean
): Promise<Blob> => {
  const res = await api.get(
    `/materials/${materialId}?download=${forDownload}`,
    {
      // Added ?download=${forDownload}
      responseType: "blob",
    }
  );
  return res.data;
};

export const getMaterialById = async (
  // This one fetches metadata
  itemId: number
): Promise<CourseMaterial> => {
  const res = await api.get<CourseMaterial>(`/materials/${itemId}`); // This endpoint might now be just for metadata
  return res.data;
};

export const getMarkdownMaterial = async (
  materialId: number
): Promise<string> => {
  // Assuming markdown is always fetched for inline display and has a separate endpoint
  const res = await api.get(`/materials/markdown/${materialId}`, {
    responseType: "text",
  });
  return res.data;
};
