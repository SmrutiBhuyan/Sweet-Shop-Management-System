import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { authService } from '../services/auth.service'

// Create Auth Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser(storedToken)
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          localStorage.removeItem('token')
        }
      }
      
      setLoading(false)
    }
    
    initializeAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authService.login(email, password)
      
      const { token, user } = response
      
      // Store token
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      toast.success('Login successful!')
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Login failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      
      const { token, user } = response
      
      // Store token
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      toast.success('Registration successful!')
      navigate('/dashboard')
      return { success: true }
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}