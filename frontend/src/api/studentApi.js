import axios from 'axios';

// Get backend API base URL from Vite environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Server responded with non-2xx status
      errorMessage = error.response.data?.message || `Server returned error (${error.response.status})`;
    } else if (error.request) {
      // Request made but no response (network error / backend down / CORS issue)
      errorMessage = 'Unable to connect to the backend server. Please verify the backend service is running and CORS is configured properly.';
    } else {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export const studentApi = {
  // Check backend and MongoDB connection health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Get students list with search, filter, and pagination
  getStudents: async (params = {}) => {
    const res = await apiClient.get('/students', { params });
    return res.data;
  },

  // Get aggregated dashboard statistics
  getStats: async () => {
    const res = await apiClient.get('/students/stats');
    return res.data;
  },

  // Search single student by student ID or search keyword
  searchStudent: async (studentId) => {
    const res = await apiClient.get('/students/search', {
      params: { studentId },
    });
    return res.data;
  },

  // Get single student by MongoDB document ID or student ID
  getStudentById: async (id) => {
    const res = await apiClient.get(`/students/${id}`);
    return res.data;
  },

  // Create a new student
  createStudent: async (studentData) => {
    const res = await apiClient.post('/students', studentData);
    return res.data;
  },

  // Update existing student
  updateStudent: async (id, studentData) => {
    const res = await apiClient.put(`/students/${id}`, studentData);
    return res.data;
  },

  // Delete student
  deleteStudent: async (id) => {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  },
};

export default studentApi;
