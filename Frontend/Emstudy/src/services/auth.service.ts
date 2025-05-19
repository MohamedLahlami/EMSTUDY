import axios from 'axios';
import { AuthResponse, User } from '../types';

const API_URL = 'http://localhost:8080/api';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async register(username: string, email: string, password: string, role: 'TEACHER' | 'STUDENT'): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
      role,
    });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return userData.user;
    }
    return null;
  },

  getToken(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return userData.token;
    }
    return null;
  },
}; 