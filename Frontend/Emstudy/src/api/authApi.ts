import api from "./apiClient";
import { AuthResponse, UserDTO } from "../types";

// Set auth token for all future API calls
export const setAuthToken = (token: string): void => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Remove auth token from API calls
export const removeAuthToken = (): void => {
  delete api.defaults.headers.common["Authorization"];
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", credentials);
  return res.data;
};

export const register = async (userData: UserDTO): Promise<any> => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};
