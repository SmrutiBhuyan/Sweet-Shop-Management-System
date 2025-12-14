import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSweet } from '../../contexts/SweetContext';
import { sweetAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './EditSweetPage.css';

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
    watch,
  } = useForm({
    resolver: yupResolver(sweetSchema),
  });

  // Watch form values for real-time updates
  const watchName = watch('name');
  const watchDescription = watch('description');
  const watchPrice = watch('price');
  const watchImageUrl = watch('imageUrl');

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
        navigate('/dashboard');
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
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.')) {
      try {
        await sweetAPI.deleteSweet(id);
        toast.success('Sweet deleted successfully!');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.message || 'Failed to delete sweet');
      }
    }
  };

  if (fetching) {
    return (
      <div className="edit-sweet-loading">
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status" className="loading-spinner">
            <span className="visually-hidden">Loading sweet details...</span>
          </Spinner>
          <p className="mt-3 loading-text">Loading sweet details...</p>
        </Container>
      </div>
    );
  }

  if (error || !sweet) {
    return (
      <div className="edit-sweet-error">
        <Container className="mt-5">
          <Alert variant="danger" className="error-alert">
            <Alert.Heading>Error Loading Sweet</Alert.Heading>
            <p>{error || 'Sweet not found'}</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
              className="error-back-btn"
            >
              Back to Dashboard
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="edit-sweet-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header Card */}
            <Card className="edit-sweet-header-card">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="mb-3">
                      <h1 className="display-6 fw-bold mb-3">
                        Edit Sweet 🍬
                      </h1>
                      <p className="lead mb-0 header-subtitle">
                        Update the details of <strong>"{sweet.name}"</strong>
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="text-end d-none d-md-block">
                    <div className="header-icon">
                      <span>✏️</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Form Card */}
            <Card className="edit-sweet-form-card">
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="error-alert">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit(onSubmit)}>
                  {/* Two Column Layout for Form */}
                  <Row className="g-4">
                    {/* Left Column - Form Fields */}
                    <Col lg={6}>
                      {/* Name Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          🏷️ Sweet Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter sweet name (e.g., Chocolate Truffle Cake)"
                          isInvalid={!!errors.name}
                          {...register('name')}
                          className="form-control-custom"
                        />
                        <div className="d-flex justify-content-between mt-1">
                          <Form.Control.Feedback type="invalid" className="error-feedback">
                            {errors.name?.message}
                          </Form.Control.Feedback>
                          <span className={`char-counter ${watchName?.length > 80 ? 'char-counter-warning' : ''}`}>
                            {watchName?.length || 0}/100
                          </span>
                        </div>
                      </Form.Group>
                      
                      {/* Category and Price Row */}
                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="form-label">
                              📁 Category *
                            </Form.Label>
                            <Form.Select
                              isInvalid={!!errors.category}
                              {...register('category')}
                              className="form-select-custom"
                            >
                              <option value="">Select category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid" className="error-feedback">
                              {errors.category?.message}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="form-label">
                              💰 Price (₹) *
                            </Form.Label>
                            <div className="input-group">
                              <span className="input-group-text price-prefix">
                                ₹
                              </span>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                max="1000"
                                placeholder="0.00"
                                isInvalid={!!errors.price}
                                {...register('price')}
                                className="price-input"
                              />
                            </div>
                            <Form.Control.Feedback type="invalid" className="error-feedback">
                              {errors.price?.message}
                            </Form.Control.Feedback>
                            <div className="price-preview">
                              {watchPrice ? `₹${parseFloat(watchPrice).toFixed(2)}` : 'Enter price'}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {/* Quantity Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          📦 Quantity
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="0"
                          isInvalid={!!errors.quantity}
                          {...register('quantity')}
                          className="form-control-custom"
                        />
                        <Form.Control.Feedback type="invalid" className="error-feedback">
                          {errors.quantity?.message}
                        </Form.Control.Feedback>
                        <div className="field-hint">
                          Current stock quantity
                        </div>
                      </Form.Group>
                      
                      {/* Description Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          📝 Description
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Describe your sweet... (What makes it special? Ingredients? Flavor profile?)"
                          isInvalid={!!errors.description}
                          {...register('description')}
                          className="form-control-custom textarea-custom"
                        />
                        <div className="d-flex justify-content-between mt-1">
                          <Form.Control.Feedback type="invalid" className="error-feedback">
                            {errors.description?.message}
                          </Form.Control.Feedback>
                          <span className={`char-counter ${watchDescription?.length > 450 ? 'char-counter-warning' : ''}`}>
                            {watchDescription?.length || 0}/500
                          </span>
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Right Column - Image & Stats */}
                    <Col lg={6}>
                      {/* Image URL Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          🖼️ Image URL
                        </Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          isInvalid={!!errors.imageUrl}
                          {...register('imageUrl')}
                          className="form-control-custom"
                        />
                        <Form.Control.Feedback type="invalid" className="error-feedback">
                          {errors.imageUrl?.message}
                        </Form.Control.Feedback>
                      </Form.Group>

                      {/* Image Preview */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          🎯 Image Preview
                        </Form.Label>
                        <div className="image-preview-container mb-3">
                          <img
                            src={watchImageUrl || sweet.imageUrl}
                            alt={watchName || sweet.name}
                            className="image-preview"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                            }}
                          />
                        </div>
                        <div className="field-hint text-center">
                          Live preview of the image URL
                        </div>
                      </Form.Group>

                      {/* Stats Card */}
                      <Card className="stats-card">
                        <Card.Body className="p-3">
                          <h6 className="stats-title">
                            📊 Sweet Statistics
                          </h6>
                          <div className="stats-content">
                            <div className="stat-item">
                              <span className="stat-label">Created:</span>
                              <span className="stat-value">
                                {new Date(sweet.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Created by:</span>
                              <span className="stat-value">
                                {sweet.createdBy?.username || 'Unknown'}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Last updated:</span>
                              <span className="stat-value">
                                {new Date(sweet.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Sweet ID:</span>
                              <span className="stat-value">
                                {sweet._id}
                              </span>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Warning Card */}
                      <Card className="warning-card mt-4">
                        <Card.Body className="p-3">
                          <h6 className="warning-title">
                            ⚠️ Important Notes
                          </h6>
                          <ul className="warning-list">
                            <li>All changes are saved immediately</li>
                            <li>Image URLs must be publicly accessible</li>
                            <li>Deleting a sweet cannot be undone</li>
                            <li>Verify all information before saving</li>
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  {/* Action Buttons */}
                  <div className="form-actions">
                    <Button
                      variant="danger"
                      onClick={handleDelete}
                      className="delete-btn"
                    >
                      🗑️ Delete Sweet
                    </Button>
                    
                    <div className="action-buttons">
                      <Button
                        variant="outline-secondary"
                        onClick={handleCancel}
                        className="cancel-btn"
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        className="submit-btn"
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
                          <>
                            💾 Update Sweet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Footer Note */}
            <div className="footer-note">
              <p>
                Make sure all information is accurate before saving. 
                Changes will be reflected immediately across the platform.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditSweetPage;