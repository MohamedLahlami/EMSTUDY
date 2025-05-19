import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Définir l'URL de base en fonction de la plateforme
const baseURL = Platform.select({
  web: 'http://localhost:8080',
  default: 'http://10.0.2.2:8080', // Pour l'émulateur Android
});

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return config;
  }
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.removeItem('jwt');
      // Vous pouvez ajouter ici la logique pour rediriger vers l'écran de connexion
    }
    return Promise.reject(error);
  }
);

export default api; 