import api from "./apiClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  role: string;
}

export interface UserDTO {
  username: string;
  email: string;
  password: string;
  role: string;
  bio?: string;
  studentGroup?: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const register = async (data: UserDTO): Promise<any> => {
  const res = await api.post("/auth/register", data);
  return res.data;
}; 