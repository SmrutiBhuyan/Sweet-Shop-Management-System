import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSweet } from '../contexts/SweetContext';
import { sweetAPI } from '../services/api';
import { toast } from 'react-toastify';

// Validation schema for sweet form (same as AddSweetPage)
const sweetSchema = yup.object().shape({
  name: yup
    .string()
    .required('Sweet name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  description: yup
    .string()
    .max(500, 'Description cannot exceed 500 characters'),
  category: yup
    .string()
    .required('Category is required')
    .oneOf([
      'Chocolate',
      'Candy',
      'Pastry',
      'Cookie',
      'Cake',
      'Ice Cream',
      'Traditional',
      'Sugar-Free',
      'Other'
    ], 'Invalid category'),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price cannot be negative')
    .max(1000, 'Price cannot be more than 1000'),
  quantity: yup
    .number()
    .min(0, 'Quantity cannot be negative'),
  imageUrl: yup
    .string()
    .url('Please enter a valid URL'),
});

const EditSweetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSweetById, updateSweet } = useSweet();
  
  const [sweet, setSweet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    'Chocolate',
    'Candy',
    'Pastry',
    'Cookie',
    'Cake',
    'Ice Cream',
    'Traditional',
    'Sugar-Free',
    'Other'
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(sweetSchema),
  });

  useEffect(() => {
    fetchSweet();
  }, [id]);

  const fetchSweet = async () => {
    setFetching(true);
    setError('');
    
    try {
      const result = await getSweetById(id);
      setSweet(result.data.sweet);
      
      // Set form values
      setValue('name', result.data.sweet.name);
      setValue('description', result.data.sweet.description || '');
      setValue('category', result.data.sweet.category);
      setValue('price', result.data.sweet.price);
      setValue('quantity', result.data.sweet.quantity);
      setValue('imageUrl', result.data.sweet.imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to load sweet');
      toast.error('Failed to load sweet details');
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await updateSweet(id, data);
      
      if (result.success) {
        toast.success('Sweet updated successfully!');
        navigate('/admin');
      } else {
        setError(result.error || 'Failed to update sweet');
      }
    } catch (err) {
      setError(err.message || 'Failed to update sweet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) {
      try {
        await sweetAPI.deleteSweet(id);
        toast.success('Sweet deleted successfully!');
        navigate('/admin');
      } catch (err) {
        toast.error(err.message || 'Failed to delete sweet');
      }
    }
  };

  if (fetching) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading sweet details...</span>
        </Spinner>
        <p className="mt-3">Loading sweet details...</p>
      </Container>
    );
  }

  if (error || !sweet) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Sweet</Alert.Heading>
          <p>{error || 'Sweet not found'}</p>
          <Button variant="primary" onClick={() => navigate('/admin')}>
            Back to Admin Panel
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-primary">Edit Sweet 🍬</h2>
                <p className="text-muted">Update the details of {sweet.name}</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Name Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Sweet Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter sweet name"
                    isInvalid={!!errors.name}
                    {...register('name')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {/* Description Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter sweet description"
                    isInvalid={!!errors.description}
                    {...register('description')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description?.message}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Maximum 500 characters
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  {/* Category Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category *</Form.Label>
                      <Form.Select
                        isInvalid={!!errors.category}
                        {...register('category')}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  {/* Price Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max="1000"
                        placeholder="0.00"
                        isInvalid={!!errors.price}
                        {...register('price')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  {/* Quantity Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="0"
                        isInvalid={!!errors.quantity}
                        {...register('quantity')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.quantity?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  {/* Image URL Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        isInvalid={!!errors.imageUrl}
                        {...register('imageUrl')}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.imageUrl?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Image Preview */}
                <Form.Group className="mb-4 text-center">
                  <Form.Label>Current Image</Form.Label>
                  <div className="mt-2">
                    <img
                      src={sweet.imageUrl}
                      alt={sweet.name}
                      style={{ 
                        width: '300px', 
                        height: '200px', 
                        objectFit: 'cover',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Current image preview
                  </Form.Text>
                </Form.Group>
                
                {/* Stats */}
                <Card className="mb-4 bg-light">
                  <Card.Body>
                    <h6>Sweet Statistics</h6>
                    <Row>
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Created:</strong> {new Date(sweet.createdAt).toLocaleDateString()}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Created by:</strong> {sweet.createdBy?.username || 'Unknown'}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                
                {/* Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                  >
                    Delete Sweet
                  </Button>
                  
                  <div>
                    <Button
                      variant="secondary"
                      onClick={handleCancel}
                      className="me-md-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
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
                          Updating...
                        </>
                      ) : (
                        'Update Sweet'
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditSweetPage;