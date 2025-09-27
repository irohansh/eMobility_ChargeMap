import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && apiClient.isAuthenticated() && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.user) {
        const userData = {
          _id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone || '',
          createdAt: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        const userData = {
          _id: 'temp-id',
          name: email.split('@')[0],
          email,
          phone: '',
          createdAt: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      const response = await apiClient.register({ name, email, password, phone });
      if (response.user) {
        const userData = {
          _id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone || '',
          createdAt: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        const userData = {
          _id: 'temp-id',
          name,
          email,
          phone,
          createdAt: new Date().toISOString(),
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const refreshUser = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
