import axios from 'axios';

// Get the API URL from environment variables
// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(data || error.message);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject('Network error. Please check your connection.');
    } else {
      // Something else happened
      return Promise.reject(error.message);
    }
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Sweets API calls
export const sweetAPI = {
  getAllSweets: (params) => api.get('/sweets', { params }),
  searchSweets: (query, filters = {}) => {
    const params = { query };
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    return api.get('/sweets/search', { params });
  },
  getSweetById: (id) => api.get(`/sweets/${id}`),
  createSweet: (sweetData) => {
    // FormData handling is done in the interceptor
    return api.post('/sweets', sweetData);
  },
  updateSweet: (id, sweetData) => {
    // FormData handling is done in the interceptor
    return api.put(`/sweets/${id}`, sweetData);
  },
  deleteSweet: (id) => api.delete(`/sweets/${id}`),
  purchaseSweet: (id, quantity) => api.post(`/sweets/${id}/purchase`, { quantityToPurchase: quantity }),
  restockSweet: (id, quantity) => api.post(`/sweets/${id}/restock`, { quantityToAdd: quantity }),
};

// Purchase API calls
export const purchaseAPI = {
  getUserPurchases: (params) => api.get('/purchases', { params }),
  getUserPurchaseStats: () => api.get('/purchases/stats'),
};

export default api;