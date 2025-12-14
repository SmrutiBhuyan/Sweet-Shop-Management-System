import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Checking authentication...</p>
      </Container>
    );
  }

  // Don't render login form if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="text-primary">Welcome Back! 🍭</h2>
                <p className="text-muted">Please login to your account</p>
              </div>
              
              {/* Display errors */}
              {(error || loginError) && (
                <Alert variant="danger" className="text-center">
                  {error || loginError}
                </Alert>
              )}
              
              {/* Login Form */}
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Email Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    isInvalid={!!errors.email}
                    {...register('email')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {/* Password Field */}
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    isInvalid={!!errors.password}
                    {...register('password')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {/* Remember Me Checkbox */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    id="rememberMe"
                  />
                </Form.Group>
                
                {/* Submit Button */}
                <div className="d-grid mb-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || authLoading}
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
                      'Login'
                    )}
                  </Button>
                </div>
                
                {/* Links */}
                <div className="text-center">
                  <p className="mb-2">
                    <Link to="/forgot-password" className="text-decoration-none">
                      Forgot your password?
                    </Link>
                  </p>
                  <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      Register here
                    </Link>
                  </p>
                </div>
              </Form>
              
              {/* Demo Accounts Info */}
              <Card className="mt-4 bg-light">
                <Card.Body>
                  <h6 className="text-center mb-3">Demo Accounts:</h6>
                  <div className="small">
                    <p className="mb-1">
                      <strong>Admin:</strong> admin@example.com / password123
                    </p>
                    <p className="mb-0">
                      <strong>Customer:</strong> customer@example.com / password123
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;