import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginData, RegisterData } from '../api/auth';
import { tokenUtils } from '../utils/token';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenUtils.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = tokenUtils.getToken();
      if (currentToken) {
        try {
          const userData = await authApi.getCurrentUser(currentToken);
          setUser(userData.user || userData);
          setToken(currentToken);
        } catch (error) {
          console.error('Failed to fetch user on load', error);
          tokenUtils.removeToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      const { token: newToken, user: userData } = response;
      
      tokenUtils.setToken(newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      const { token: newToken, user: userData } = response;
      
      tokenUtils.setToken(newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      tokenUtils.removeToken();
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
