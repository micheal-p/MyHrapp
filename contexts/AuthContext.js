// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    setUser(response.user);
    return response;
  };

  const signup = async (fullName, email, password, role) => {
    const response = await authAPI.signup(fullName, email, password, role);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};