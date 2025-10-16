// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

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
      if (currentUser) {
        // ✅ Always fetch full profile from DB on app start
        await refreshUser();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    // ✅ Always fetch full profile from DB after login
    await refreshUser();
    return response;
  };

  const signup = async (fullName, email, password, role) => {
    const response = await authAPI.signup(fullName, email, password, role);
    // ✅ Always fetch full profile from DB after signup
    await refreshUser();
    return response;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // ✅ Fetch fresh data from MongoDB
  const refreshUser = async () => {
    try {
      const freshUser = await profileAPI.getProfile();
      setUser(freshUser);
      console.log('✅ User refreshed from MongoDB:', freshUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails (e.g., invalid token), logout
      if (error.message?.includes('401') || error.message?.includes('Failed to fetch profile')) {
        await logout();
      }
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