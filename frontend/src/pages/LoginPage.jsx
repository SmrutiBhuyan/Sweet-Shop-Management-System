import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaCandyCane, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';

// Define the Color Palette
const COLORS = {
  emeraldGreen: '#008080',
  sandYellow: '#F4D090',
  darkText: '#343a40',
  lightText: '#ffffff',
  primaryAccent: '#FFC107',
  lightGray: '#f8f9fa',
  mediumGray: '#e9ecef',
  coral: '#FF6B8B',
  lavender: '#A29BFE',
  darkEmerald: '#006666'
};

// Sweet images for the background collage
const SWEET_IMAGES = [
  '/HomePageSweet1.png', // Baklava/Pistachio Sweets
  '/HomePageSweet2.png', // Indian/Dry Fruit Sweets
];

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
      <Container 
        className="text-center d-flex justify-content-center align-items-center" 
        style={{ minHeight: '100vh', backgroundColor: COLORS.sandYellow }}
      >
        <div>
          <Spinner 
            animation="border" 
            role="status" 
            style={{ color: COLORS.emeraldGreen, width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3" style={{ color: COLORS.darkText, fontSize: '1.2rem' }}>
            Checking authentication...
          </p>
        </div>
      </Container>
    );
  }

  // Don't render login form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <Container 
      fluid 
      className="p-0" 
      style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Sweets Collage */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: `linear-gradient(135deg, ${COLORS.sandYellow}20 0%, ${COLORS.emeraldGreen}10 100%)`,
        opacity: 0.9
      }}>
        {/* Top left sweets pattern */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '120px',
          height: '120px',
          backgroundImage: `url(${SWEET_IMAGES[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '20px',
          transform: 'rotate(-15deg)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          border: '4px solid white'
        }} />
        
        {/* Bottom right sweets pattern */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '150px',
          height: '150px',
          backgroundImage: `url(${SWEET_IMAGES[1]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '20px',
          transform: 'rotate(10deg)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
          border: '4px solid white'
        }} />
        
        {/* Center decorative element */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${COLORS.emeraldGreen}20 0%, transparent 70%)`,
          borderRadius: '50%'
        }} />
        
        {/* Decorative sweet icons */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          fontSize: '2.5rem',
          color: COLORS.emeraldGreen,
          opacity: 0.3
        }}>
          🍬🍭
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          fontSize: '2.5rem',
          color: COLORS.coral,
          opacity: 0.3
        }}>
          🍰🎂
        </div>
      </div>

      <Row className="justify-content-center align-items-center w-100 m-0" style={{ minHeight: '100vh', zIndex: 1, position: 'relative' }}>
        <Col xs={12} md={10} lg={8} xl={6} style={{"width":"100vw"}}>
          <Row className="g-0 shadow-lg" style={{ borderRadius: '25px', overflow: 'hidden' }}>
            {/* Left Side - Visual Section with Sweets */}
            <Col md={6} className="d-none d-md-block p-0 position-relative">
              <div style={{
                height: '100%',
                background: `linear-gradient(135deg, ${COLORS.emeraldGreen} 0%, ${COLORS.darkEmerald} 100%)`,
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: COLORS.lightText,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Overlay pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 2px, transparent 2px)',
                  backgroundSize: '30px 30px',
                  opacity: 0.3
                }} />
                
                {/* Large Sweet Image */}
                <div style={{
                  width: '200px',
                  height: '200px',
                  backgroundImage: `url(${SWEET_IMAGES[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '50%',
                  marginBottom: '2rem',
                  border: '6px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                }} />
                
                <h2 style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '800', 
                  marginBottom: '1rem',
                  textAlign: 'center',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Welcome Back to <br />Sweet Delights
                </h2>
                
                <p style={{ 
                  fontSize: '1.1rem', 
                  opacity: 0.9, 
                  textAlign: 'center',
                  marginBottom: '2rem',
                  maxWidth: '300px'
                }}>
                  Your favorite sweets are waiting! Login to explore our delicious collection.
                </p>
                
                {/* Feature List */}
                <div style={{ width: '100%', maxWidth: '300px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      🍬
                    </div>
                    <span>Premium Sweet Collection</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      🚚
                    </div>
                    <span>Fast Delivery</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem'
                    }}>
                      ⭐
                    </div>
                    <span>Exclusive Member Offers</span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right Side - Login Form */}
            <Col xs={12} md={6}>
              <Card className="border-0 h-100" style={{ borderRadius: '0' }}>
                <Card.Body className="p-4 p-md-5 d-flex flex-column justify-content-center">
                  <div className="text-center mb-4">
                    <div style={{
                      backgroundColor: COLORS.emeraldGreen,
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem auto',
                      boxShadow: `0 6px 20px ${COLORS.emeraldGreen}40`
                    }}>
                      <FaUser size={30} color="white" />
                    </div>
                    <h2 style={{ 
                      color: COLORS.darkText, 
                      fontWeight: '700',
                      marginBottom: '0.5rem'
                    }}>
                      Welcome Back
                    </h2>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '1rem',
                      marginBottom: '2rem'
                    }}>
                      Sign in to your account to continue
                    </p>
                  </div>
                  
                  {/* Display errors */}
                  {(error || loginError) && (
                    <Alert 
                      variant="danger" 
                      className="text-center border-0 mb-4"
                      style={{
                        backgroundColor: `${COLORS.coral}10`,
                        color: COLORS.coral,
                        border: `1px solid ${COLORS.coral}30`,
                        borderRadius: '12px',
                        fontWeight: '600',
                        padding: '0.75rem'
                      }}
                    >
                      {error || loginError}
                    </Alert>
                  )}
                  
                  {/* Login Form */}
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email Field */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: COLORS.darkText, 
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        fontSize: '0.95rem'
                      }}>
                        <FaEnvelope className="me-2" size={14} color={COLORS.emeraldGreen} />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        isInvalid={!!errors.email}
                        {...register('email')}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: `1.5px solid ${errors.email ? COLORS.coral : COLORS.mediumGray}`,
                          fontSize: '1rem',
                          backgroundColor: COLORS.lightGray
                        }}
                      />
                      <Form.Control.Feedback type="invalid" style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Password Field */}
                    <Form.Group className="mb-4">
                      <Form.Label style={{ 
                        color: COLORS.darkText, 
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        fontSize: '0.95rem'
                      }}>
                        <FaLock className="me-2" size={14} color={COLORS.emeraldGreen} />
                        Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        isInvalid={!!errors.password}
                        {...register('password')}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: `1.5px solid ${errors.password ? COLORS.coral : COLORS.mediumGray}`,
                          fontSize: '1rem',
                          backgroundColor: COLORS.lightGray
                        }}
                      />
                      <Form.Control.Feedback type="invalid" style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {/* Remember Me and Forgot Password */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Group className="mb-0">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          id="rememberMe"
                          style={{ 
                            fontWeight: '500', 
                            color: COLORS.darkText,
                            fontSize: '0.95rem'
                          }}
                        />
                      </Form.Group>
                      <Link 
                        to="/forgot-password" 
                        className="text-decoration-none"
                        style={{ 
                          color: COLORS.emeraldGreen, 
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}
                      >
                        Forgot password?
                      </Link>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="d-grid mb-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading || authLoading}
                        style={{
                          backgroundColor: COLORS.emeraldGreen,
                          border: 'none',
                          borderRadius: '10px',
                          padding: '0.875rem',
                          fontWeight: '700',
                          fontSize: '1rem',
                          boxShadow: `0 4px 15px ${COLORS.emeraldGreen}30`
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Logging in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </div>
                    
                    {/* Divider */}
                    <div className="position-relative text-center my-4">
                      <div style={{
                        height: '1px',
                        backgroundColor: COLORS.mediumGray,
                        width: '100%'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '0 1rem',
                        color: '#666',
                        fontSize: '0.9rem'
                      }}>
                        Or continue with
                      </span>
                    </div>
                    
                    {/* Social Login Buttons */}
                    <div className="d-grid gap-2 mb-4">
                      <Button 
                        variant="outline-secondary"
                        style={{
                          border: `1.5px solid ${COLORS.mediumGray}`,
                          borderRadius: '10px',
                          padding: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: 'white'
                        }}
                      >
                        <img 
                          src="https://www.google.com/favicon.ico" 
                          alt="Google" 
                          style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}
                        />
                        Continue with Google
                      </Button>
                    </div>
                    
                    {/* Register Link */}
                    <div className="text-center">
                      <p style={{ 
                        color: COLORS.darkText, 
                        fontSize: '0.95rem',
                        marginBottom: 0
                      }}>
                        Don't have an account?{' '}
                        <Link 
                          to="/register" 
                          className="text-decoration-none fw-bold"
                          style={{ 
                            color: COLORS.emeraldGreen
                          }}
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
          <div className="text-center mt-4">
            <p style={{ 
              color: '#666', 
              fontSize: '0.85rem',
              marginBottom: '0.5rem'
            }}>
              By signing in, you agree to our{' '}
              <Link to="/terms" style={{ color: COLORS.emeraldGreen, textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: COLORS.emeraldGreen, textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </p>
            <p style={{ 
              color: '#999', 
              fontSize: '0.8rem',
              marginBottom: 0
            }}>
              © {new Date().getFullYear()} Sweet Delights. All rights reserved.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

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

export default LoginPage;