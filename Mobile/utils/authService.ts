import { apiService } from './apiService';
import { appState } from './appState';
import { storage } from './storage';
import { toast } from 'sonner-native';

/**
 * Service centralisant la logique d'authentification
 */
class AuthService {
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    return await apiService.isAuthenticated();
  }

  /**
   * Tente de connecter l'utilisateur
   * @param email Email de l'utilisateur
   * @param password Mot de passe
   * @returns Résultat de la connexion
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await apiService.login(email, password);
      
      // Mise à jour de l'état global de l'application
      appState.setState({
        isLoggedIn: true,
        user: {
          role: response.role,
          token: response.token
        }
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please check your credentials.');
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      await apiService.logout();
      
      // Redirection vers l'écran d'accueil se fera automatiquement grâce 
      // aux listeners d'état dans App.tsx
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout properly.');
      
      // Forcer la déconnexion même en cas d'erreur
      await storage.removeItem('auth_token');
      await storage.removeItem('user_role');
      
      appState.setState({
        isLoggedIn: false,
        user: null
      });
    }
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  async getUserRole(): Promise<string | null> {
    return await apiService.getUserRole();
  }

  /**
   * Récupère le token d'authentification
   */
  async getAuthToken(): Promise<string | null> {
    return await storage.getItem('auth_token');
  }

  /**
   * Vérifie si le token est valide (pourrait faire une requête au backend)
   */
  async validateToken(): Promise<boolean> {
    const token = await this.getAuthToken();
    if (!token) return false;
    
    // Ici on pourrait faire une requête au backend pour valider le token
    // Pour l'instant, on considère qu'un token présent est valide
    return true;
  }

  /**
   * S'enregistre avec un nouveau compte
   */
  async register(userData: any): Promise<boolean> {
    try {
      await apiService.register(userData);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return false;
    }
  }
}

export const authService = new AuthService(); 