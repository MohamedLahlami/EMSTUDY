import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8080'; // À modifier selon votre configuration

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const courseService = {
  getCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  },
  
  getCourseById: async (courseId: number) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },
  
  enrollInCourse: async (joinCode: string) => {
    const response = await api.post('/enrollments/enroll', { joinCode });
    return response.data;
  },
};

export const materialService = {
  getMaterials: async (courseId: number) => {
    const response = await api.get(`/materials?courseId=${courseId}`);
    return response.data;
  },
  
  uploadMaterial: async (courseId: number, title: string, file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('courseId', courseId.toString());
    
    const response = await api.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const quizService = {
  getQuizzes: async (courseId: number) => {
    const response = await api.get(`/quizzes?courseId=${courseId}`);
    return response.data;
  },
  
  getQuizById: async (quizId: number) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },
  
  submitQuiz: async (quizId: number, answers: any[]) => {
    const response = await api.post(`/submissions`, {
      quizId,
      answers,
    });
    return response.data;
  },
};

export default api; 