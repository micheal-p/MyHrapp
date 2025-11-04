// services/api.js (Complete - Added getProfileById)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const YOUR_MAC_IP = '172.20.10.10';  // New IP

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  } else {
    return `http://${YOUR_MAC_IP}:5000/api`;
  }
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// ===============================
// AUTH API
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
        console.error('Failed to parse JSON:', e);
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
        console.error('Failed to parse JSON:', e);
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
// PROFILE API (Added getProfileById)
// ===============================
export const profileAPI = {
  updateProfile: async (userId, updates) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

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
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      const userData = data.user || data;
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // FIXED: NEW - Get profile by ID (for employer viewing candidates)
  getProfileById: async (userId) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw getProfileById response:', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Parse error in getProfileById:', e);
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      const userData = data.user || data;
      return userData;
    } catch (error) {
      console.error('Get profile by ID error:', error);
      throw error;
    }
  }
};

// ===============================
// UPLOAD API (FIXED - No expo-file-system)
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
      console.log('Uploading CV to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();
      console.log('CV Upload response text:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
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

  // === ADD THIS TO uploadAPI ===
uploadImage: async (fileUri, fileName = 'image.jpg', mimeType = 'image/jpeg') => {
  try {
    const token = await getToken();

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('image', blob, fileName);
    } else {
      formData.append('image', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      });
    }

    const uploadUrl = `http://${Platform.OS === 'web' ? 'localhost' : YOUR_MAC_IP}:5000/api/upload/image`;
    console.log('Uploading image to:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    console.log('Image Upload response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned invalid JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Image upload failed');
    }

    return data.imageURL;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
},

  uploadDocument: async (formData) => {
    try {
      const token = await getToken();

      const uploadUrl = `http://${Platform.OS === 'web' ? 'localhost' : YOUR_MAC_IP}:5000/api/upload/document`;
      console.log('Uploading document to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();
      console.log('Document upload response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Document upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },
};




// ===============================
// DOCUMENT API
// ===============================
export const documentAPI = {
  getMyDocuments: async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/upload/documents`, { // Added () around fetch
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch documents');
      return data.documents || [];
    } catch (error) {
      console.error('Get documents error:', error);
      return [];
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/upload/documents/${documentId}`, { // Added () around fetch
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete document');
      return data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  },
};

// ===============================
// EXAM API
// ===============================
export const examAPI = {
  getAvailableExamsCount: async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/available/count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch count');
      }

      return data.count;
    } catch (error) {
      console.error('Get available exams count error:', error);
      return 0;
    }
  },

  getAvailableExams: async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/available`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch exams');
      }

      return data.exams;
    } catch (error) {
      console.error('Get available exams error:', error);
      throw error;
    }
  },

  getExam: async (examId) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/${examId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch exam');
      }

      return data.exam;
    } catch (error) {
      console.error('Get exam error:', error);
      throw error;
    }
  },

  submitExam: async (examId, answers, timeTaken) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, timeTaken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit exam');
      }

      return data;
    } catch (error) {
      console.error('Submit exam error:', error);
      throw error;
    }
  },

  getMyResults: async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/results/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      return data.results;
    } catch (error) {
      console.error('Get results error:', error);
      throw error;
    }
  },

  createExam: async (examData) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch exam');
      }

      return data;
    } catch (error) {
      console.error('Create exam error:', error);
      throw error;
    }
  },
};

// ===============================
// RANKINGS API
// ===============================
export const rankingsAPI = {
  getEmployeeLeaderboard: async (region = null, stack = null, location = null) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (region) params.append('view', region);
      if (stack) params.append('stack', stack);
      if (location) params.append('location', location);
      const url = `${API_URL}/rankings/leaderboard?${params.toString()}`;
      
      console.log('Leaderboard URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw response (first 200 chars):', text.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error(`Invalid response (likely 404 HTML): ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data.leaderboard || [];
    } catch (error) {
      console.error('Get employee leaderboard error:', error);
      throw error;
    }
  },

  getEmployerCandidates: async (stack = null, location = null, minScore = null) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (stack) params.append('stack', stack);
      if (location) params.append('location', location);
      params.append('view', 'country');
      const url = `${API_URL}/rankings/leaderboard?${params.toString()}`;
      
      console.log('Candidates URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw candidates response:', text.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error for candidates:', parseErr);
        throw new Error(`Invalid response (likely 404 HTML): ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candidates');
      }

      return data.leaderboard || [];
    } catch (error) {
      console.error('Get employer candidates error:', error);
      throw error;
    }
  },
};

// ===============================
// JOB API
// ===============================
export const jobAPI = {
  postJob: async (jobData) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      const text = await response.text();
      console.log('Post job raw response (first 200 chars):', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error for postJob:', e);
        throw new Error(`Invalid response (likely server error): ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${text.substring(0, 100)}...`);
      }

      await profileAPI.getProfile();

      return data;
    } catch (error) {
      console.error('Post job error:', error);
      throw error;
    }
  },

  getAllJobs: async () => {
    try {
      const token = await getToken();
      
      console.log('Fetching jobs URL:', `${API_URL}/jobs`);
      
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw jobs response (first 200 chars):', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error for getAllJobs:', parseErr);
        throw new Error(`Invalid response (likely 404 or server error): ${text.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${text.substring(0, 100)}...`);
      }

      return data.jobs || [];
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  },

  // YOUR EXACT SNIPPET — NO CHANGES
  applyToJob: async (jobId, applyData = {}, resumeUrl = null) => {
    try {
      const token = await getToken();
      
      const body = {
        ...applyData,
        resumeUrl: resumeUrl || applyData.resumeUrl, // Allow override
      };

      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }

      if (!response.ok) throw new Error(data.error || 'Apply failed');
      return data;
    } catch (error) {
      console.error('Apply error:', error);
      throw error;
    }
  },

  getApplicationCount: async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/applications/count`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log('Raw applications/count response (first 200 chars):', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error in getApplicationCount:', parseErr);
        console.error('Likely HTML error page (404?):', text.substring(0, 100));
        return 0;
      }

      if (!response.ok) {
        console.error('HTTP error in getApplicationCount:', response.status, text.substring(0, 100));
        return 0;
      }

      return data.count || 0;
    } catch (error) {
      console.error('Get application count error:', error);
      return 0;
    }
  },

  getMyApplications: async () => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/applications`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }

      return data.applications || [];
    } catch (error) {
      console.error('Get applications error:', error);
      throw error;
    }
  },

  getApplications: async () => {
    return jobAPI.getMyApplications();
  },

  updateApplicationStatus: async (appId, updates) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      return data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },
};

// ===============================
// ADMIN API
// ===============================
export const adminAPI = {
  getStats: async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/admin/stats`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch stats');
      return data;
    } catch (error) {
      console.error('Admin stats error:', error);
      throw error;
    }
  },

  createExam: async (examData) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/exams/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exam');
      }

      return data;
    } catch (error) {
      console.error('Create exam error:', error);
      throw error;
    }
  },

  getUsers: async (role = null, search = null) => {
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (search) params.append('search', search);
      const url = `${API_URL}/admin/users?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
      return data.users;
    } catch (error) {
      console.error('Admin users error:', error);
      throw error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update user');
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete user');
      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
};