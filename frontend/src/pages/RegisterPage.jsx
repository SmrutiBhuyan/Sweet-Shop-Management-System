import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaCrown, FaUsers } from 'react-icons/fa';

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
  '/HomePageSweet1.png',
  '/HomePageSweet2.png',
];

// Validation schema for registration form
const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['customer', 'admin'], 'Invalid role selected')
    .required('Please select a role'),
});

const RegisterPage = () => {
  const { register: registerUser, error, loading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  // Watch password for real-time validation
  const password = watch('password');

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setRegistrationError('');
    
    // Remove confirmPassword from data before sending to API
    const { confirmPassword, ...userData } = data;
    
    const result = await registerUser(userData);
    
    if (result.success) {
      setRegistrationSuccess(true);
      toast.success('Registration successful! Welcome to Sweet Shop!');
      reset(); // Clear form
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setRegistrationError(result.error || 'Registration failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      setRegistrationError('');
      setRegistrationSuccess(false);
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

  // Don't render register form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <Container 
      fluid 
      className="p-0 d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden',
        padding: '1rem'
      }}
    >
      {/* Background Sweets Collage - Minimal */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: `linear-gradient(135deg, ${COLORS.sandYellow}10 0%, ${COLORS.emeraldGreen}05 100%)`,
      }}>
        {/* Subtle decorative elements */}
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '80px',
          height: '80px',
          backgroundImage: `url(${SWEET_IMAGES[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '15px',
          transform: 'rotate(10deg)',
          opacity: 0.4,
          border: '3px solid white'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '80px',
          height: '80px',
          backgroundImage: `url(${SWEET_IMAGES[1]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '15px',
          transform: 'rotate(-10deg)',
          opacity: 0.4,
          border: '3px solid white'
        }} />
      </div>

      {/* Compact Registration Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '1000px',
        zIndex: 1,
        position: 'relative'
      }}>
        <Row className="g-0 shadow-lg" style={{ 
          borderRadius: '20px', 
          overflow: 'hidden',
          maxHeight: '90vh',
          width:"80vw",
          position:"relative",
          right:"110px",
        }}>
          {/* Left Side - Compact Visual Section */}
          <Col md={5} className="d-none d-md-block p-0 position-relative" >
            <div style={{
              height: '100%',
              background: `linear-gradient(135deg, ${COLORS.emeraldGreen} 0%, ${COLORS.darkEmerald} 100%)`,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: COLORS.lightText,
              position: 'relative'
            }}>
              {/* Brand Logo */}
              <div className="text-center mb-3">
                <h1 style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '800',
                  marginBottom: '0.5rem',
                  letterSpacing: '1px'
                }}>
                  SWEET SHOP
                </h1>
                <p style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.9,
                  marginBottom: '1.5rem'
                }}>
                  Join our community of sweet lovers
                </p>
              </div>

              {/* Small Sweet Image */}
              <div style={{
                width: '120px',
                height: '120px',
                backgroundImage: `url(${SWEET_IMAGES[1]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '50%',
                marginBottom: '1.5rem',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
              }} />

              {/* Quick Benefits - Compact */}
              <div style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>🎁</span>
                  <span style={{ fontSize: '0.9rem' }}>Welcome Discount</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>⭐</span>
                  <span style={{ fontSize: '0.9rem' }}>Exclusive Rewards</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>🚚</span>
                  <span style={{ fontSize: '0.9rem' }}>Fast Delivery</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Compact Registration Form */}
          <Col xs={12} md={7}>
            <Card className="border-0 h-100" style={{ borderRadius: '0' }}>
              <Card.Body className="p-4 p-md-4">
                <div className="text-center mb-3">
                  <div style={{
                    backgroundColor: COLORS.emeraldGreen,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem auto',
                    boxShadow: `0 4px 12px ${COLORS.emeraldGreen}40`
                  }}>
                    <FaUser size={20} color="white" />
                  </div>
                  <h3 style={{ 
                    color: COLORS.darkText, 
                    fontWeight: '700',
                    marginBottom: '0.25rem',
                    fontSize: '1.4rem'
                  }}>
                    Create Account
                  </h3>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem'
                  }}>
                    Fill in your details to get started
                  </p>
                </div>
                
                {/* Display success message */}
                {registrationSuccess && (
                  <Alert 
                    variant="success" 
                    className="text-center border-0 mb-3"
                    style={{
                      backgroundColor: `${COLORS.emeraldGreen}10`,
                      color: COLORS.emeraldGreen,
                      border: `1px solid ${COLORS.emeraldGreen}30`,
                      borderRadius: '10px',
                      fontWeight: '600',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    Registration Successful! Redirecting...
                  </Alert>
                )}
                
                {/* Display errors */}
                {(error || registrationError) && (
                  <Alert 
                    variant="danger" 
                    className="text-center border-0 mb-3"
                    style={{
                      backgroundColor: `${COLORS.coral}10`,
                      color: COLORS.coral,
                      border: `1px solid ${COLORS.coral}30`,
                      borderRadius: '10px',
                      fontWeight: '600',
                      padding: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    {error || registrationError}
                  </Alert>
                )}
                
                {/* Compact Registration Form */}
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row className="g-2 mb-2">
                    {/* Username Field */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          fontSize: '0.85rem'
                        }}>
                          <FaUser className="me-1" size={12} color={COLORS.emeraldGreen} />
                          Username
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Choose username"
                          autoComplete="username"
                          isInvalid={!!errors.username}
                          {...register('username')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${errors.username ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '0.9rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        {errors.username && (
                          <div style={{ color: COLORS.coral, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {errors.username.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Email Field */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          fontSize: '0.85rem'
                        }}>
                          <FaEnvelope className="me-1" size={12} color={COLORS.emeraldGreen} />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          isInvalid={!!errors.email}
                          {...register('email')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${errors.email ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '0.9rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        {errors.email && (
                          <div style={{ color: COLORS.coral, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {errors.email.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-2 mb-2">
                    {/* Password Field */}
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          fontSize: '0.85rem'
                        }}>
                          <FaLock className="me-1" size={12} color={COLORS.emeraldGreen} />
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          autoComplete="new-password"
                          isInvalid={!!errors.password}
                          {...register('password')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${errors.password ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '0.9rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        {errors.password && (
                          <div style={{ color: COLORS.coral, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {errors.password.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Confirm Password Field */}
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          fontSize: '0.85rem'
                        }}>
                          <FaLock className="me-1" size={12} color={COLORS.emeraldGreen} />
                          Confirm
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          isInvalid={!!errors.confirmPassword}
                          {...register('confirmPassword')}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1.5px solid ${errors.confirmPassword ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '0.9rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        {errors.confirmPassword && (
                          <div style={{ color: COLORS.coral, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {errors.confirmPassword.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Password Requirements - Minimal */}
                    {password && (
                      <Col xs={12}>
                        <div className="mt-1" style={{ fontSize: '0.7rem' }}>
                          <div className={`d-inline-block me-2 ${password?.length >= 6 ? 'text-success' : 'text-muted'}`}>
                            ✓ 6+ chars
                          </div>
                          <div className={`d-inline-block ${password && watch('confirmPassword') === password ? 'text-success' : 'text-muted'}`}>
                            ✓ Match
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  {/* Role Selection - Compact */}
                  <Form.Group className="mb-3">
                    <Form.Label style={{ 
                      color: COLORS.darkText, 
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      fontSize: '0.85rem'
                    }}>
                      Account Type
                    </Form.Label>
                    <div className="d-flex gap-1">
                      <Button
                        type="button"
                        variant={watch('role') === 'customer' ? 'primary' : 'outline-secondary'}
                        onClick={() => reset({ ...watch(), role: 'customer' })}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          padding: '0.5rem',
                          border: `1.5px solid ${watch('role') === 'customer' ? COLORS.emeraldGreen : COLORS.mediumGray}`,
                          backgroundColor: watch('role') === 'customer' ? COLORS.emeraldGreen : 'white',
                          color: watch('role') === 'customer' ? 'white' : COLORS.darkText,
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}
                      >
                        <FaUsers className="me-1" size={12} />
                        Customer
                      </Button>
                      <Button
                        type="button"
                        variant={watch('role') === 'admin' ? 'primary' : 'outline-secondary'}
                        onClick={() => reset({ ...watch(), role: 'admin' })}
                        style={{
                          flex: 1,
                          borderRadius: '8px',
                          padding: '0.5rem',
                          border: `1.5px solid ${watch('role') === 'admin' ? COLORS.emeraldGreen : COLORS.mediumGray}`,
                          backgroundColor: watch('role') === 'admin' ? COLORS.emeraldGreen : 'white',
                          color: watch('role') === 'admin' ? 'white' : COLORS.darkText,
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}
                      >
                        <FaCrown className="me-1" size={12} />
                        Admin
                      </Button>
                    </div>
                    <input type="hidden" {...register('role')} />
                    <div style={{ 
                      color: '#666', 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem',
                      fontStyle: 'italic'
                    }}>
                      {watch('role') === 'admin' 
                        ? 'Can manage inventory'
                        : 'Browse and purchase sweets'}
                    </div>
                  </Form.Group>

                  {/* Terms and Conditions - Compact */}
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="terms"
                      label={
                        <span style={{ fontSize: '0.85rem' }}>
                          I agree to{' '}
                          <Link to="/terms" style={{ color: COLORS.emeraldGreen, textDecoration: 'none' }}>
                            Terms
                          </Link>{' '}
                          &{' '}
                          <Link to="/privacy" style={{ color: COLORS.emeraldGreen, textDecoration: 'none' }}>
                            Privacy
                          </Link>
                        </span>
                      }
                      required
                      style={{ fontWeight: '500' }}
                    />
                  </Form.Group>
                  
                  {/* Submit Button */}
                  <div className="d-grid mb-2">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || authLoading || registrationSuccess}
                      style={{
                        backgroundColor: COLORS.emeraldGreen,
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        boxShadow: `0 4px 10px ${COLORS.emeraldGreen}30`
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
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                  
                  {/* Login Link */}
                  <div className="text-center mt-3 pt-2" style={{ borderTop: `1px solid ${COLORS.mediumGray}` }}>
                    <p style={{ 
                      color: COLORS.darkText, 
                      fontSize: '0.85rem',
                      marginBottom: 0
                    }}>
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        className="text-decoration-none fw-bold"
                        style={{ 
                          color: COLORS.emeraldGreen
                        }}
                      >
                        Login here
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Compact Footer */}
        <div className="text-center mt-3">
          <p style={{ 
            color: '#999', 
            fontSize: '0.75rem',
            marginBottom: 0
          }}>
            © {new Date().getFullYear()} Sweet Shop. All rights reserved.
          </p>
        </div>
      </div>
    </Container>
  );
};

export default RegisterPage;