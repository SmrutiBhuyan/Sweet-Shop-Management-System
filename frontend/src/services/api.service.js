import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error
    
    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 401:
          // Clear token and redirect to login if unauthorized
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error('Unknown error')
      }
      
      // Throw error with message from server
      throw new Error(response.data?.error || 'Something went wrong')
    }
    
    // Network error
    if (error.message === 'Network Error') {
      console.error('Network error - please check your connection')
      throw new Error('Network error - please check your connection')
    }
    
    throw error
  }
)

export default api