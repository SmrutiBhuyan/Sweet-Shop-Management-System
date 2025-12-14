import api from './api.service'

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response
  },

  // Get current user
  getCurrentUser: async (token) => {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.user
  },

  // Update user details
  updateUser: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData)
    return response
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/updatepassword', {
      currentPassword,
      newPassword
    })
    return response
  },

  // Logout user
  logout: async () => {
    const response = await api.get('/auth/logout')
    return response
  }
}

export { authService }