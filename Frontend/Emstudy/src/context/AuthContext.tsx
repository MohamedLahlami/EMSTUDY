import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authApi from "../api/authApi";

// Define the user type based on JWT claims
interface AuthUser {
  userId: number;
  sub: string; // username
  email: string;
  role: "Student" | "Teacher";
  exp: number;
  iat: number;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: "Student" | "Teacher") => boolean;
  clearError: () => void;
}

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse JWT to get user data
  const parseJwt = (token: string): AuthUser => {
    try {
      // Split the token and get the payload
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Failed to parse JWT", err);
      throw new Error("Invalid token");
    }
  };

  // Check if token is expired
  const isTokenExpired = (user: AuthUser): boolean => {
    const currentTime = Math.floor(Date.now() / 1000);
    return user.exp < currentTime;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          const user = parseJwt(token);
          if (!isTokenExpired(user)) {
            setCurrentUser(user);
            // Set Authorization header for all future requests
            authApi.setAuthToken(token);
          } else {
            // Token expired, remove it
            localStorage.removeItem("auth_token");
            setCurrentUser(null);
            authApi.removeAuthToken();
          }
        }
      } catch (err) {
        console.error("Failed to initialize auth", err);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      const token = response.token;
      const user = parseJwt(token);

      // Set current user and store token
      setCurrentUser(user);
      localStorage.setItem("auth_token", token);
      authApi.setAuthToken(token);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(userData);
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_token");
    setCurrentUser(null);
    authApi.removeAuthToken();
  };

  // Check if user has specific role
  const hasRole = (role: "Student" | "Teacher"): boolean => {
    return currentUser?.role === role;
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
