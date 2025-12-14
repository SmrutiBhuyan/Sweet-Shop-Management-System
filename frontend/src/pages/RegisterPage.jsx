import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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
      role: '', // No default - user must select
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
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Checking authentication...</p>
      </Container>
    );
  }

  // Don't render register form if user is already logged in (will redirect)
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
                <h2 className="text-primary">Join Sweet Shop 🍬</h2>
                <p className="text-muted">Create your account to start shopping</p>
              </div>
              
              {/* Display success message */}
              {registrationSuccess && (
                <Alert variant="success" className="text-center">
                  <Alert.Heading>Registration Successful!</Alert.Heading>
                  <p>Welcome to Sweet Shop! Redirecting to dashboard...</p>
                </Alert>
              )}
              
              {/* Display errors */}
              {(error || registrationError) && (
                <Alert variant="danger" className="text-center">
                  {error || registrationError}
                </Alert>
              )}
              
              {/* Registration Form */}
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Username Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    autoComplete="username"
                    isInvalid={!!errors.username}
                    {...register('username')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    3-20 characters, letters, numbers, and underscores only
                  </Form.Text>
                </Form.Group>
                
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
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    isInvalid={!!errors.password}
                    {...register('password')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Minimum 6 characters
                  </Form.Text>
                </Form.Group>
                
                {/* Confirm Password Field */}
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    isInvalid={!!errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                  <div className="mt-2">
                    <small className={`d-block ${password?.length >= 6 ? 'text-success' : 'text-muted'}`}>
                      ✓ At least 6 characters
                    </small>
                    <small className={`d-block ${password && watch('confirmPassword') === password ? 'text-success' : 'text-muted'}`}>
                      ✓ Passwords match
                    </small>
                  </div>
                </Form.Group>
                
                {/* Role Selection */}
                <Form.Group className="mb-4">
                  <Form.Label>Account Type *</Form.Label>
                  <Form.Select
                    isInvalid={!!errors.role}
                    {...register('role')}
                  >
                    <option value="">Select account type</option>
                    <option value="customer">Customer - Browse and purchase sweets</option>
                    <option value="admin">Admin - Manage inventory and add/update items</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.role?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Choose your account type. Admins can add items and manage inventory.
                  </Form.Text>
                </Form.Group>
                
                {/* Terms and Conditions */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="terms"
                    label={
                      <span>
                        I agree to the{' '}
                        <Link to="/terms" className="text-decoration-none">
                          Terms and Conditions
                        </Link>
                      </span>
                    }
                    required
                  />
                </Form.Group>
                
                {/* Submit Button */}
                <div className="d-grid mb-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || authLoading || registrationSuccess}
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
                
                {/* Login Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Login here
                    </Link>
                  </p>
                </div>
              </Form>
              
              {/* Security Note */}
              <Card className="mt-4 bg-light">
                <Card.Body className="p-3">
                  <p className="mb-0 small text-center text-muted">
                    🔒 Your information is secure and encrypted. We never share your personal details.
                  </p>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;