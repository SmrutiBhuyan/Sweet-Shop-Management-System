import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaCandyCane, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';
import './LoginPage.css';

// Sweet images for the background collage
const SWEET_IMAGES = [
  '/HomePageSweet1.png', // Baklava/Pistachio Sweets
  '/HomePageSweet2.png', // Indian/Dry Fruit Sweets
];

// Validation schema for login form
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage = () => {
  const { login, error, loading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access before login
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError('');
    
    const result = await login(data);
    
    if (result.success) {
      toast.success('Login successful!');
      reset(); // Clear form
      navigate(from, { replace: true }); // Redirect to intended page
    } else {
      setLoginError(result.error || 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setLoginError('');
    };
  }, []);

  // Check if user is already logged in - wait for auth to finish loading
  useEffect(() => {
    // Only redirect if auth has finished loading and user exists
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Show loading state while auth is checking
  if (authLoading) {
    return (
      <div className="auth-loading-container">
        <div>
          <Spinner 
            animation="border" 
            role="status" 
            className="auth-loading-spinner"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="auth-loading-text">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <Container fluid className="login-page-container">
      {/* Background Sweets Collage */}
      <div className="login-background">
        {/* Top left sweets pattern */}
        <div className="background-sweet-1" />
        
        {/* Bottom right sweets pattern */}
        <div className="background-sweet-2" />
        
        {/* Center decorative element */}
        <div className="background-radial-gradient" />
        
        {/* Decorative sweet icons */}
        <div className="sweet-icons-1">
          🍬🍭
        </div>
        <div className="sweet-icons-2">
          🍰🎂
        </div>
      </div>

      <Row className="login-content-row">
        <Col xs={12} md={10} lg={8} xl={6} className="login-col">
          <Row className="login-main-row">
            {/* Left Side - Visual Section with Sweets */}
            <Col md={6} className="login-visual-col">
              <div className="visual-content">
                {/* Overlay pattern */}
                <div className="visual-overlay" />
                
                {/* Large Sweet Image */}
                <div className="visual-sweet-image" />
                
                <h2 className="visual-title">
                  Welcome Back to <br />Sweet Delights
                </h2>
                
                <p className="visual-subtitle">
                  Your favorite sweets are waiting! Login to explore our delicious collection.
                </p>
                
                {/* Feature List */}
                <div className="features-container">
                  <div className="feature-item">
                    <div className="feature-icon">
                      🍬
                    </div>
                    <span className="feature-text">Premium Sweet Collection</span>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      🚚
                    </div>
                    <span className="feature-text">Fast Delivery</span>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      ⭐
                    </div>
                    <span className="feature-text">Exclusive Member Offers</span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Side - Login Form */}
            <Col xs={12} md={6}>
              <Card className="login-form-card">
                <Card.Body className="login-form-body">
                  <div className="form-header">
                    <div className="form-header-icon">
                      <FaUser className="form-header-icon-svg" />
                    </div>
                    <h2 className="form-title">
                      Welcome Back
                    </h2>
                    <p className="form-subtitle">
                      Sign in to your account to continue
                    </p>
                  </div>
                  
                  {/* Display errors */}
                  {(error || loginError) && (
                    <Alert 
                      variant="danger" 
                      className="error-alert"
                    >
                      {error || loginError}
                    </Alert>
                  )}
                  
                  {/* Login Form */}
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Field */}
                    <Form.Group className="form-group">
                      <Form.Label className="form-label">
                        <FaEnvelope className="label-icon" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        isInvalid={!!errors.email}
                        {...register('email')}
                        className="form-input"
                      />
                      <Form.Control.Feedback type="invalid" className="error-feedback">
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Password Field */}
                    <Form.Group className="form-group">
                      <Form.Label className="form-label">
                        <FaLock className="label-icon" />
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        isInvalid={!!errors.password}
                        {...register('password')}
                        className="form-input"
                      />
                      <Form.Control.Feedback type="invalid" className="error-feedback">
                        {errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Remember Me and Forgot Password */}
                    <div className="form-options">
                      <Form.Group className="remember-check">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          id="rememberMe"
                          className="remember-checkbox"
                        />
                      </Form.Group>
                      <Link 
                        to="/forgot-password" 
                        className="forgot-password-link"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="submit-container">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading || authLoading}
                        className="submit-button"
                      >
                        {isLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="submit-spinner"
                            />
                            Logging in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </div>
                    
                    {/* Divider */}
                    <div className="form-divider">
                      <div className="divider-line" />
                      <span className="divider-text">
                        Or continue with
                      </span>
                    </div>
                    
                    {/* Social Login Buttons */}
                    <div className="social-login-container">
                      <Button 
                        variant="outline-secondary"
                        className="social-login-button"
                      >
                        <img 
                          src="https://www.google.com/favicon.ico" 
                          alt="Google" 
                          className="social-login-icon"
                        />
                        Continue with Google
                      </Button>
                    </div>
                    
                    {/* Register Link */}
                    <div className="register-link-container">
                      <p className="register-link-text">
                        Don't have an account?{' '}
                        <Link 
                          to="/register" 
                          className="register-link"
                        >
                          Sign up now
                        </Link>
                      </p>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Footer */}
          <div className="login-footer">
            <p className="footer-terms">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="footer-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </p>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Sweet Delights. All rights reserved.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;