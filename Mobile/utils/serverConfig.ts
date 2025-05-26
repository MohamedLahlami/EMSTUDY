import { storage } from "./storage";
import { Platform } from "react-native";

/**
 * Configuration du serveur avec possibilité de la modifier
 */
class ServerConfig {
  private _customUrl: string | null = null;
  private _debugMode: boolean = __DEV__; // Activé automatiquement en développement

  /**
   * Obtient l'URL de base en fonction de la plateforme
   */
  getBaseUrl(): string {
    // Si une URL personnalisée a été définie, l'utiliser
    if (this._customUrl) {
      return this._customUrl;
    }

    // Sinon, utiliser les valeurs par défaut selon la plateforme
    if (Platform.OS === "web") {
      // En local, utiliser 192.168.11.170
      return "http://192.168.11.170:8080";
    } else if (Platform.OS === "android") {
      // Pour les émulateurs Android, 10.0.2.2 correspond à 192.168.11.170 de la machine hôte
      return "http://10.0.2.2:8080";
    } else if (Platform.OS === "ios") {
      // Pour les simulateurs iOS
      return "http://192.168.11.170:8080";
    }

    // Appareil physique, utiliser l'adresse IP locale par défaut
    return "http://192.168.1.100:8080";
  }

  /**
   * Définit une URL personnalisée pour le serveur
   */
  async setCustomUrl(url: string): Promise<void> {
    // Normaliser l'URL (retirer les slashes à la fin)
    url = url.trim();
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }

    this._customUrl = url;
    await storage.setItem("server_url", url);

    if (this._debugMode) {
      console.log(`[ServerConfig] URL du serveur définie à: ${url}`);
    }
  }

  /**
   * Charge l'URL personnalisée depuis le stockage au démarrage
   */
  async init(): Promise<void> {
    try {
      const savedUrl = await storage.getItem("server_url");
      if (savedUrl) {
        this._customUrl = savedUrl;
        if (this._debugMode) {
          console.log(
            `[ServerConfig] URL chargée depuis le stockage: ${savedUrl}`
          );
        }
      }
    } catch (error) {
      console.error(
        "[ServerConfig] Erreur lors du chargement de la config:",
        error
      );
    }
  }

  /**
   * Active ou désactive le mode debug
   */
  setDebugMode(enabled: boolean): void {
    this._debugMode = enabled;
  }

  /**
   * Teste la connexion au serveur
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = this.getBaseUrl();
      const endpoint = "/health";
      const fullUrl = `${url}${endpoint}`;

      if (this._debugMode) {
        console.log(`[ServerConfig] Test de connexion vers: ${fullUrl}`);
      }

      // Utiliser un timeout de 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(fullUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (this._debugMode) {
          console.log(
            `[ServerConfig] Réponse du serveur: ${response.status} ${response.statusText}`
          );
        }

        return response.ok;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
          console.error("[ServerConfig] La requête a expiré - timeout");
        } else {
          console.error(`[ServerConfig] Erreur réseau:`, error);
        }

        return false;
      }
    } catch (error) {
      console.error("[ServerConfig] Erreur lors du test de connexion:", error);
      return false;
    }
  }

  /**
   * Réinitialise la configuration du serveur
   */
  async reset(): Promise<void> {
    this._customUrl = null;
    await storage.removeItem("server_url");

    if (this._debugMode) {
      console.log("[ServerConfig] Configuration réinitialisée");
    }
  }

  /**
   * Vérifie si le serveur est accessible et affiche des informations de diagnostic
   */
  async diagnose(): Promise<{
    baseUrl: string;
    connected: boolean;
    platform: string;
    customUrl: boolean;
    error?: string;
  }> {
    const baseUrl = this.getBaseUrl();
    const hasCustomUrl = !!this._customUrl;
    let connected = false;
    let error = undefined;

    try {
      connected = await this.testConnection();
      if (!connected) {
        error = "Impossible de se connecter au serveur";
      }
    } catch (err) {
      error = err.message || "Erreur inconnue";
    }

    return {
      baseUrl,
      connected,
      platform: Platform.OS,
      customUrl: hasCustomUrl,
      error,
    };
  }
}

// Exporter une instance du service
export const serverConfig = new ServerConfig();

// Initialiser la configuration au démarrage de l'application
serverConfig.init().catch(console.error);
