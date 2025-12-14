import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSweet } from '../../contexts/SweetContext';
import { toast } from 'react-toastify';
import { FaUpload, FaImage, FaTag, FaBox, FaRupeeSign, FaInfoCircle, FaPlus } from 'react-icons/fa';
import './AddSweetPage.css';

// Validation schema for sweet form
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
    .min(0, 'Quantity cannot be negative')
    .default(0),
});

const AddSweetPage = () => {
  const { createSweet } = useSweet();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
    watch,
  } = useForm({
    resolver: yupResolver(sweetSchema),
    defaultValues: {
      quantity: 0,
      category: '',
    },
  });

  // Watch form values for real-time updates
  const watchName = watch('name');
  const watchDescription = watch('description');
  const watchPrice = watch('price');

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    // Validate that an image is selected
    if (!selectedImage) {
      setError('Please select an image for the sweet');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('quantity', data.quantity || 0);
      
      // Append image file
      formData.append('image', selectedImage);
      
      const result = await createSweet(formData);
      
      if (result.success) {
        toast.success('Sweet added successfully! 🎉');
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to add sweet');
      }
    } catch (err) {
      setError(err.message || 'Failed to add sweet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="add-sweet-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header Card */}
            <Card className="add-sweet-header-card">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="mb-3">
                      <h1 className="display-6 fw-bold mb-3">
                        Create New Sweet 🍬
                      </h1>
                      <p className="lead mb-0 header-subtitle">
                        Fill in the details to add a new sweet to your collection
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="text-end d-none d-md-block">
                    <div className="header-icon">
                      <span>➕</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Form Card */}
            <Card className="add-sweet-form-card">
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
                          <FaTag className="label-icon" />
                          Sweet Name *
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
                              <FaBox className="label-icon" />
                              Category *
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
                              <FaRupeeSign className="label-icon" />
                              Price (₹) *
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
                          📦 Initial Quantity
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
                          Initial stock quantity (0 if not in stock)
                        </div>
                      </Form.Group>
                      
                      {/* Description Field */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          <FaInfoCircle className="label-icon" />
                          Description
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

                    {/* Right Column - Image Upload & Preview */}
                    <Col lg={6}>
                      {/* Image Upload */}
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">
                          <FaImage className="label-icon" />
                          Product Image *
                        </Form.Label>
                        
                        {!imagePreview ? (
                          <div className="custom-file-upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              id="image-upload"
                              className="file-input"
                            />
                            <label htmlFor="image-upload" className="upload-label">
                              <div className="mb-3">
                                <div className="upload-icon">
                                  <FaUpload className="upload-icon-svg" />
                                </div>
                              </div>
                              <h5 className="upload-title">
                                Upload Image
                              </h5>
                              <p className="upload-subtitle">
                                Click to browse or drag and drop
                              </p>
                              <p className="upload-info">
                                JPG, PNG, WebP (Max 5MB)
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="image-preview-container">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="image-preview"
                            />
                            <div className="image-remove-btn">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="remove-image-btn"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="image-info">
                              <small>
                                {selectedImage?.name} • {(selectedImage?.size / 1024 / 1024).toFixed(2)}MB
                              </small>
                            </div>
                          </div>
                        )}
                        
                        {!selectedImage && (
                          <div className="mt-2">
                            <Form.Text className="image-required-text">
                              * Image is required
                            </Form.Text>
                          </div>
                        )}
                      </Form.Group>

                      {/* Quick Preview Card */}
                      <Card className="preview-card">
                        <Card.Body className="p-3">
                          <h6 className="preview-title">
                            🎯 Sweet Preview
                          </h6>
                          
                          <div className="preview-content">
                            <div className="preview-image-container">
                              {imagePreview ? (
                                <img 
                                  src={imagePreview} 
                                  alt="Preview thumb" 
                                  className="preview-image"
                                />
                              ) : (
                                <FaImage className="preview-placeholder-icon" />
                              )}
                            </div>
                            
                            <div className="preview-details">
                              <div className="preview-name">
                                {watchName || 'Sweet Name'}
                              </div>
                              <div className="preview-category-price">
                                {watch('category') || 'Category'} • 
                                <span className="preview-price ms-1">
                                  ₹{watchPrice ? parseFloat(watchPrice).toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div className="preview-description">
                                {watchDescription?.substring(0, 60) || 'Description will appear here...'}
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Tips Card */}
                      <Card className="tips-card">
                        <Card.Body className="p-3">
                          <h6 className="tips-title">
                            💡 Quick Tips
                          </h6>
                          <ul className="tips-list">
                            <li>Use clear, descriptive names</li>
                            <li>Add appealing descriptions</li>
                            <li>Choose appropriate categories</li>
                            <li>Set competitive prices</li>
                            <li>Use high-quality images</li>
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  {/* Action Buttons */}
                  <div className="form-actions">
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
                      disabled={isLoading || !selectedImage}
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaPlus className="me-2" />
                          Add Sweet to Collection
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Footer Note */}
            <div className="footer-note">
              <p>
                Your sweet will be available immediately after submission. 
                Make sure all information is accurate before publishing.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddSweetPage;