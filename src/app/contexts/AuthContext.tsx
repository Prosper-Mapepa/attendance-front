'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'TEACHER' | 'STUDENT') => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    console.log('AuthContext: Token from localStorage:', token);
    
    if (token) {
      // Verify token and get user info
      api.get('/auth/profile')
        .then(response => {
          console.log('AuthContext: Profile response:', response.data);
          setUser(response.data);
        })
        .catch((error) => {
          console.error('AuthContext: Profile error:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('AuthContext: No token found');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { access_token, user: userData } = response.data;
      console.log('Login: Received token:', access_token);
      console.log('Login: Received user:', userData);
      
      localStorage.setItem('token', access_token);
      setUser(userData);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Login error:', error);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: 'TEACHER' | 'STUDENT') => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      setUser(userData);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
