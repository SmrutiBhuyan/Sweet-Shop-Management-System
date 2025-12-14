import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaCrown, FaUsers } from 'react-icons/fa';
import './RegisterPage.css';

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

  // Don't render register form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="register-page-container">
      {/* Background Sweets Collage - Minimal */}
      <div className="register-background">
        {/* Subtle decorative elements */}
        <div className="background-sweet-1" />
        <div className="background-sweet-2" />
      </div>

      {/* Compact Registration Card */}
      <div className="register-card-container">
        <Row className="register-main-row">
          {/* Left Side - Compact Visual Section */}
          <Col md={5} className="register-visual-col">
            {/* Brand Logo */}
            <div className="brand-logo">
              <h1 className="brand-title">
                SWEET SHOP
              </h1>
              <p className="brand-subtitle">
                Join our community of sweet lovers
              </p>
            </div>

            {/* Small Sweet Image */}
            <div className="sweet-image-circle" />

            {/* Quick Benefits - Compact */}
            <div className="benefits-container">
              <div className="benefit-item">
                <span className="benefit-icon">🎁</span>
                <span className="benefit-text">Welcome Discount</span>
              </div>
              
              <div className="benefit-item">
                <span className="benefit-icon">⭐</span>
                <span className="benefit-text">Exclusive Rewards</span>
              </div>
              
              <div className="benefit-item">
                <span className="benefit-icon">🚚</span>
                <span className="benefit-text">Fast Delivery</span>
              </div>
            </div>
          </Col>

          {/* Right Side - Compact Registration Form */}
          <Col xs={12} md={7}>
            <Card className="register-form-card">
              <Card.Body className="register-form-body">
                <div className="form-header">
                  <div className="form-header-icon">
                    <FaUser className="form-header-icon-svg" />
                  </div>
                  <h3 className="form-title">
                    Create Account
                  </h3>
                  <p className="form-subtitle">
                    Fill in your details to get started
                  </p>
                </div>
                
                {/* Display success message */}
                {registrationSuccess && (
                  <Alert 
                    variant="success" 
                    className="success-alert"
                  >
                    Registration Successful! Redirecting...
                  </Alert>
                )}
                
                {/* Display errors */}
                {(error || registrationError) && (
                  <Alert 
                    variant="danger" 
                    className="error-alert"
                  >
                    {error || registrationError}
                  </Alert>
                )}
                
                {/* Compact Registration Form */}
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row className="form-row">
                    {/* Username Field */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="form-label">
                          <FaUser className="label-icon" />
                          Username
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Choose username"
                          autoComplete="username"
                          isInvalid={!!errors.username}
                          {...register('username')}
                          className="form-input"
                        />
                        {errors.username && (
                          <div className="error-text">
                            {errors.username.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Email Field */}
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="form-label">
                          <FaEnvelope className="label-icon" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          isInvalid={!!errors.email}
                          {...register('email')}
                          className="form-input"
                        />
                        {errors.email && (
                          <div className="error-text">
                            {errors.email.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="form-row">
                    {/* Password Field */}
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="form-label">
                          <FaLock className="label-icon" />
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          autoComplete="new-password"
                          isInvalid={!!errors.password}
                          {...register('password')}
                          className="form-input"
                        />
                        {errors.password && (
                          <div className="error-text">
                            {errors.password.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Confirm Password Field */}
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="form-label">
                          <FaLock className="label-icon" />
                          Confirm
                        </Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm password"
                          autoComplete="new-password"
                          isInvalid={!!errors.confirmPassword}
                          {...register('confirmPassword')}
                          className="form-input"
                        />
                        {errors.confirmPassword && (
                          <div className="error-text">
                            {errors.confirmPassword.message}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    
                    {/* Password Requirements - Minimal */}
                    {password && (
                      <Col xs={12}>
                        <div className="password-requirements">
                          <div className={`requirement ${password?.length >= 6 ? 'requirement-met' : 'requirement-not-met'}`}>
                            ✓ 6+ chars
                          </div>
                          <div className={`requirement ${password && watch('confirmPassword') === password ? 'requirement-met' : 'requirement-not-met'}`}>
                            ✓ Match
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  {/* Role Selection - Compact */}
                  <Form.Group className="role-selection">
                    <Form.Label className="form-label">
                      Account Type
                    </Form.Label>
                    <div className="role-buttons">
                      <Button
                        type="button"
                        className={`role-button ${watch('role') === 'customer' ? 'role-button-active' : 'role-button-inactive'}`}
                        onClick={() => reset({ ...watch(), role: 'customer' })}
                      >
                        <FaUsers className="role-icon" />
                        Customer
                      </Button>
                      <Button
                        type="button"
                        className={`role-button ${watch('role') === 'admin' ? 'role-button-active' : 'role-button-inactive'}`}
                        onClick={() => reset({ ...watch(), role: 'admin' })}
                      >
                        <FaCrown className="role-icon" />
                        Admin
                      </Button>
                    </div>
                    <input type="hidden" {...register('role')} />
                    <div className="role-hint">
                      {watch('role') === 'admin' 
                        ? 'Can manage inventory'
                        : 'Browse and purchase sweets'}
                    </div>
                  </Form.Group>

                  {/* Terms and Conditions - Compact */}
                  <Form.Group className="terms-check">
                    <Form.Check
                      type="checkbox"
                      id="terms"
                      label={
                        <span className="terms-text">
                          I agree to{' '}
                          <Link to="/terms" className="terms-link">
                            Terms
                          </Link>{' '}
                          &{' '}
                          <Link to="/privacy" className="terms-link">
                            Privacy
                          </Link>
                        </span>
                      }
                      required
                      className="terms-checkbox"
                    />
                  </Form.Group>
                  
                  {/* Submit Button */}
                  <div className="submit-container">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || authLoading || registrationSuccess}
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
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                  
                  {/* Login Link */}
                  <div className="login-link-container">
                    <p className="login-link-text">
                      Already have an account?{' '}
                      <Link 
                        to="/login" 
                        className="login-link"
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
        <div className="register-footer">
          <p className="footer-text">
            © {new Date().getFullYear()} Sweet Shop. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;