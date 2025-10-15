// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ✅ Your Mac's IP Address (update if it changes)
const YOUR_MAC_IP = '172.28.62.182';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  } else {
    // iOS or physical devices
    return `http://${YOUR_MAC_IP}:5000/api`;
  }
};

const API_URL = getApiUrl();
console.log('🔗 Using API URL:', API_URL);

// Helper: Get saved token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// ===============================
// 🔐 AUTH API
// ===============================
export const authAPI = {
  signup: async (fullName, email, password, role) => {
    try {
      console.log('Attempting signup:', { fullName, email, role });

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const text = await response.text();
      console.log('Signup response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      console.log('Attempting login:', email);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      console.log('Login response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  checkAuth: async () => {
    try {
      const token = await getToken();
      const user = await authAPI.getCurrentUser();
      return { token, user };
    } catch (error) {
      console.error('Check auth error:', error);
      return { token: null, user: null };
    }
  },
};

// ===============================
// 👤 PROFILE API
// ===============================
export const profileAPI = {
  updateProfile: async (userId, updates) => {
    try {
      const token = await getToken();

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const text = await response.text();  // ✅ Consistent: Use text() then parse
      console.log('Update profile response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const token = await getToken();

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();  // ✅ Consistent: Use text() then parse
      console.log('Get profile response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
};

// ===============================
// 📄 UPLOAD API
// ===============================
export const uploadAPI = {
  uploadCV: async (fileUri, fileName, mimeType) => {
    try {
      const token = await getToken();

      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('cv', blob, fileName);
      } else {
        formData.append('cv', {
          uri: fileUri,
          name: fileName,
          type: mimeType || 'application/pdf',
        });
      }

      const uploadUrl = `http://${Platform.OS === 'web' ? 'localhost' : YOUR_MAC_IP}:5000/api/upload/cv`;
      console.log('Uploading to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();  // ✅ Consistent: Use text() then parse
      console.log('Upload response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
        throw new Error(`Server returned invalid JSON: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'CV upload failed');
      }

      return data.cvURL;
    } catch (error) {
      console.error('Upload CV error:', error);
      throw error;
    }
  },
};