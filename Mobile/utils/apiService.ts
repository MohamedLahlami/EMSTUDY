import { storage } from './storage';
import { appState } from './appState';
import { serverConfig } from './serverConfig';
import { Platform } from 'react-native';

// Interface pour la réponse d'authentification
interface AuthResponse {
  token: string;
  expiresIn: number;
  role: string;
}

// Interface pour la demande de connexion
interface LoginRequest {
  email: string;
  password: string;
}

// Interface pour la demande d'inscription
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  bio?: string;
  studentGroup?: string;
}

// Service API
class ApiService {
  private _debug = __DEV__; // Mode debug activé par défaut en développement
  
  private async getHeaders(requiresAuth = false): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (requiresAuth) {
      const token = await storage.getItem('auth_token');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  // Méthode pour gérer les erreurs
  private handleError(error: any): never {
    console.error('API Error:', error);
    
    // Créer un message d'erreur plus descriptif selon le type d'erreur
    if (error.name === 'AbortError') {
      throw new Error('La requête a expiré. Vérifiez votre connexion ou le serveur.');
    } else if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
      throw new Error('Connexion au serveur impossible. Vérifiez que votre backend est démarré sur le port 8080.');
    }
    
    throw error;
  }

  // Définir le mode debug
  setDebug(enabled: boolean): void {
    this._debug = enabled;
  }

  // Méthode pour effectuer une requête
  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    requiresAuth = false,
    timeout = 10000 // Timeout par défaut de 10 secondes
  ): Promise<T> {
    try {
      const headers = await this.getHeaders(requiresAuth);
      const baseUrl = serverConfig.getBaseUrl();
      const url = `${baseUrl}${endpoint}`;
      
      if (this._debug) {
        console.log(`Making ${method} request to: ${url}`);
      }
      
      // Configuration avec timeout
      const config: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      // Utiliser un controller pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      config.signal = controller.signal;
      
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId); // Nettoyer le timeout
      
        // Gérer les réponses non-JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const responseData = await response.json();
          
          if (!response.ok) {
            const errorMessage = responseData.message || 
              `Erreur ${response.status}: ${response.statusText || 'Une erreur est survenue'}`;
            throw new Error(errorMessage);
          }
          
          return responseData;
        } else {
          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText || 'Une erreur est survenue'}`);
          }
          return {} as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('La requête a expiré. Vérifiez votre connexion ou le serveur.');
        }
        throw error;
      }
    } catch (error) {
      // Gérer les erreurs de connexion de manière plus descriptive
      if (error.message === 'Failed to fetch' || 
          error.message.includes('Network') ||
          error.message.includes('connection')) {
        
        const baseUrl = serverConfig.getBaseUrl();
        let errorMessage = 'Connexion au serveur impossible.';
        
        // Ajouter des détails selon la plateforme
        if (Platform.OS === 'web') {
          errorMessage += ' Vérifiez que votre backend est démarré sur localhost:8080.';
        } else if (Platform.OS === 'android') {
          errorMessage += ' Si vous utilisez un émulateur Android, assurez-vous que votre backend est accessible sur 10.0.2.2:8080.';
        } else if (Platform.OS === 'ios') {
          errorMessage += ' Si vous utilisez un simulateur iOS, assurez-vous que votre backend est accessible sur localhost:8080.';
        } else {
          errorMessage += ` Vérifiez que votre backend est démarré et accessible à l'adresse ${baseUrl}.`;
        }
        
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      return this.handleError(error);
    }
  }

  // Méthode de connexion
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await this.request<AuthResponse>('/auth/login', 'POST', loginRequest);
      
      // Stocker le token et les informations utilisateur
      await storage.setItem('auth_token', response.token);
      await storage.setItem('user_role', response.role);
      
      // Mettre à jour l'état global
      appState.setState({
        isLoggedIn: true,
        user: {
          role: response.role,
          token: response.token
        }
      });
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Méthode d'inscription
  async register(userData: RegisterRequest): Promise<any> {
    try {
      return await this.request<any>('/auth/register', 'POST', userData);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Méthode de déconnexion
  async logout(): Promise<void> {
    try {
      // Supprimer les tokens et informations de l'utilisateur
      await storage.removeItem('auth_token');
      await storage.removeItem('user_role');
      
      // Réinitialiser l'état global
      appState.setState({
        isLoggedIn: false,
        user: null
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  // Récupérer le rôle utilisateur
  async getUserRole(): Promise<string | null> {
    try {
      return await storage.getItem('user_role');
    } catch (error) {
      console.error('Get user role error:', error);
      return null;
    }
  }
  
  // Tester la connexion au serveur
  async testServerConnection(): Promise<boolean> {
    return await serverConfig.testConnection();
  }
  
  // Obtenir l'URL du serveur actuelle
  getServerUrl(): string {
    return serverConfig.getBaseUrl();
  }
}

// Exporter une instance du service
export const apiService = new ApiService(); 