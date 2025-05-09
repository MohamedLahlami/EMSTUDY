import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, AuthResponse, LoginRequest, UserDTO } from '../api/authApi';

interface AuthContextType {
  currentUser: any; // You can refine this type if you have a user info endpoint
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: UserDTO) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const user = parseJwt(token);
      if (user && user.role) {
        if (user.role === 'TEACHER') user.role = 'Teacher';
        if (user.role === 'STUDENT') user.role = 'Student';
      }
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponse = await apiLogin({ email, password });
      localStorage.setItem('jwt', res.token);
      const user = parseJwt(res.token);
      if (user && user.role) {
        if (user.role === 'TEACHER') user.role = 'Teacher';
        if (user.role === 'STUDENT') user.role = 'Student';
      }
      setCurrentUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jwt');
  };

  const register = async (data: UserDTO) => {
    setIsLoading(true);
    try {
      await apiRegister(data);
      // Optionally, auto-login after registration
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};