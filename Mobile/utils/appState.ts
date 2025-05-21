// Gestionnaire d'état en mémoire pour contourner les problèmes de stockage

// État global de l'application
type AppState = {
  isLoggedIn: boolean;
  user: any;
  isInitialized: boolean;
  courses: any[];
  // Ajouter d'autres états au besoin
};

// État initial
const initialState: AppState = {
  isLoggedIn: false,
  user: null,
  isInitialized: false,
  courses: [],
};

// Singleton pour gérer l'état
class AppStateManager {
  private static instance: AppStateManager;
  private state: AppState;
  private listeners: Array<(state: AppState) => void>;

  private constructor() {
    this.state = { ...initialState };
    this.listeners = [];
  }

  public static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  // Obtenir l'état actuel
  public getState(): AppState {
    return { ...this.state };
  }

  // Mettre à jour l'état
  public setState(partialState: Partial<AppState>): void {
    this.state = { ...this.state, ...partialState };
    this.notifyListeners();
  }

  // S'abonner aux changements d'état
  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    // Renvoyer une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notifier tous les abonnés d'un changement d'état
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Réinitialiser l'état
  public resetState(): void {
    this.state = { ...initialState };
    this.notifyListeners();
  }
}

// Exporter l'instance singleton
export const appState = AppStateManager.getInstance();

// Exporter des hooks personnalisés si nécessaire
export function useAppState() {
  const [state, setState] = React.useState(appState.getState());

  React.useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = appState.subscribe(newState => {
      setState(newState);
    });
    
    // Désabonnement à la destruction du composant
    return unsubscribe;
  }, []);

  return state;
}

// Ce hook sera importé explicitement quand nécessaire
import React from 'react'; 