import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';
import { FaUpload, FaImage, FaTag, FaBox, FaRupeeSign, FaInfoCircle, FaPlus } from 'react-icons/fa';

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
  darkEmerald: '#006666',
  tealLight: '#20B2AA',
  gold: '#FFD700'
};

// Glass Morphism Style
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 128, 128, 0.1)',
};

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
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      <Container>
        <style>
          {`
            @media (min-width: 1400px) {
              .container, .container-lg, .container-md, .container-sm, .container-xl, .container-xxl {
                max-width: 1500px;
              }
            }
            
            .custom-file-upload {
              border: 2px dashed ${COLORS.emeraldGreen}60;
              border-radius: 16px;
              padding: 2rem;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s ease;
              background: ${COLORS.lightGray};
            }
            
            .custom-file-upload:hover {
              border-color: ${COLORS.emeraldGreen};
              background: ${COLORS.emeraldGreen}08;
            }
            
            .form-control:focus, .form-select:focus {
              border-color: ${COLORS.emeraldGreen};
              box-shadow: 0 0 0 3px ${COLORS.emeraldGreen}30;
            }
            
            .image-preview-container {
              position: relative;
              overflow: hidden;
              border-radius: 16px;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }
          `}
        </style>

        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Header Card */}
            <Card 
              className="border-0 mb-4"
              style={{
                ...glassStyle,
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${COLORS.emeraldGreen} 0%, ${COLORS.darkEmerald} 100%)`,
                color: COLORS.lightText
              }}
            >
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="mb-3">
                      <h1 className="display-6 fw-bold mb-3">
                        Create New Sweet 🍬
                      </h1>
                      <p className="lead mb-0" style={{ opacity: 0.9 }}>
                        Fill in the details to add a new sweet to your collection
                      </p>
                    </div>
                  </Col>
                  <Col md={4} className="text-end d-none d-md-block">
                    <div 
                      className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(4px)',
                        width: '80px',
                        height: '80px'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>➕</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Form Card */}
            <Card 
              className="border-0 mb-4"
              style={{
                ...glassStyle,
                borderRadius: '20px'
              }}
            >
              <Card.Body className="p-4">
                {error && (
                  <Alert 
                    variant="danger" 
                    className="border-0 mb-4"
                    style={{
                      backgroundColor: `${COLORS.coral}15`,
                      color: COLORS.coral,
                      border: `1px solid ${COLORS.coral}30`,
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}
                  >
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
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaTag size={14} color={COLORS.emeraldGreen} />
                          Sweet Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter sweet name (e.g., Chocolate Truffle Cake)"
                          isInvalid={!!errors.name}
                          {...register('name')}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: `1.5px solid ${errors.name ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '1rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        <div className="d-flex justify-content-between mt-1">
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.85rem' }}>
                            {errors.name?.message}
                          </Form.Control.Feedback>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: watchName?.length > 80 ? COLORS.coral : '#666' 
                          }}>
                            {watchName?.length || 0}/100
                          </span>
                        </div>
                      </Form.Group>
                      
                      {/* Category and Price Row */}
                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ 
                              color: COLORS.darkText, 
                              fontWeight: '600',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <FaBox size={14} color={COLORS.emeraldGreen} />
                              Category *
                            </Form.Label>
                            <Form.Select
                              isInvalid={!!errors.category}
                              {...register('category')}
                              style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: `1.5px solid ${errors.category ? COLORS.coral : COLORS.mediumGray}`,
                                fontSize: '1rem',
                                backgroundColor: COLORS.lightGray,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">Select category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid" style={{ fontSize: '0.85rem' }}>
                              {errors.category?.message}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label style={{ 
                              color: COLORS.darkText, 
                              fontWeight: '600',
                              fontSize: '1rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <FaRupeeSign size={14} color={COLORS.emeraldGreen} />
                              Price (₹) *
                            </Form.Label>
                            <div className="input-group">
                              <span 
                                className="input-group-text border-0"
                                style={{
                                  backgroundColor: COLORS.lightGray,
                                  border: `1.5px solid ${errors.price ? COLORS.coral : COLORS.mediumGray}`,
                                  borderRight: 'none',
                                  borderTopLeftRadius: '12px',
                                  borderBottomLeftRadius: '12px'
                                }}
                              >
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
                                style={{
                                  padding: '0.75rem 1rem',
                                  borderRadius: '0 12px 12px 0',
                                  border: `1.5px solid ${errors.price ? COLORS.coral : COLORS.mediumGray}`,
                                  borderLeft: 'none',
                                  fontSize: '1rem',
                                  backgroundColor: COLORS.lightGray
                                }}
                              />
                            </div>
                            <Form.Control.Feedback type="invalid" style={{ fontSize: '0.85rem' }}>
                              {errors.price?.message}
                            </Form.Control.Feedback>
                            <div className="mt-1" style={{ fontSize: '0.85rem', color: '#666' }}>
                              {watchPrice ? `₹${parseFloat(watchPrice).toFixed(2)}` : 'Enter price'}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {/* Quantity Field */}
                      <Form.Group className="mb-4">
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          📦 Initial Quantity
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="0"
                          isInvalid={!!errors.quantity}
                          {...register('quantity')}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: `1.5px solid ${errors.quantity ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '1rem',
                            backgroundColor: COLORS.lightGray
                          }}
                        />
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.85rem' }}>
                          {errors.quantity?.message}
                        </Form.Control.Feedback>
                        <div className="mt-1" style={{ fontSize: '0.85rem', color: '#666' }}>
                          Initial stock quantity (0 if not in stock)
                        </div>
                      </Form.Group>
                      
                      {/* Description Field */}
                      <Form.Group className="mb-4">
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaInfoCircle size={14} color={COLORS.emeraldGreen} />
                          Description
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Describe your sweet... (What makes it special? Ingredients? Flavor profile?)"
                          isInvalid={!!errors.description}
                          {...register('description')}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: `1.5px solid ${errors.description ? COLORS.coral : COLORS.mediumGray}`,
                            fontSize: '1rem',
                            backgroundColor: COLORS.lightGray,
                            resize: 'vertical'
                          }}
                        />
                        <div className="d-flex justify-content-between mt-1">
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.85rem' }}>
                            {errors.description?.message}
                          </Form.Control.Feedback>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: watchDescription?.length > 450 ? COLORS.coral : '#666' 
                          }}>
                            {watchDescription?.length || 0}/500
                          </span>
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Right Column - Image Upload & Preview */}
                    <Col lg={6}>
                      {/* Image Upload */}
                      <Form.Group className="mb-4">
                        <Form.Label style={{ 
                          color: COLORS.darkText, 
                          fontWeight: '600',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <FaImage size={14} color={COLORS.emeraldGreen} />
                          Product Image *
                        </Form.Label>
                        
                        {!imagePreview ? (
                          <div className="custom-file-upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              id="image-upload"
                              style={{ display: 'none' }}
                            />
                            <label htmlFor="image-upload" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                              <div className="mb-3">
                                <div 
                                  className="rounded-circle p-3 d-inline-flex align-items-center justify-content-center"
                                  style={{
                                    backgroundColor: `${COLORS.emeraldGreen}20`,
                                    width: '60px',
                                    height: '60px'
                                  }}
                                >
                                  <FaUpload size={24} color={COLORS.emeraldGreen} />
                                </div>
                              </div>
                              <h5 style={{ color: COLORS.darkText, fontWeight: '600' }}>
                                Upload Image
                              </h5>
                              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                Click to browse or drag and drop
                              </p>
                              <p style={{ color: '#999', fontSize: '0.8rem' }}>
                                JPG, PNG, WebP (Max 5MB)
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="image-preview-container">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-100"
                              style={{ 
                                height: '250px', 
                                objectFit: 'cover'
                              }}
                            />
                            <div 
                              className="position-absolute top-0 end-0 p-3"
                              style={{ zIndex: 1 }}
                            >
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={handleRemoveImage}
                                style={{
                                  backgroundColor: COLORS.coral,
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.5rem 1rem',
                                  fontWeight: '600'
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                            <div 
                              className="position-absolute bottom-0 start-0 end-0 p-3"
                              style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                color: 'white'
                              }}
                            >
                              <small>
                                {selectedImage?.name} • {(selectedImage?.size / 1024 / 1024).toFixed(2)}MB
                              </small>
                            </div>
                          </div>
                        )}
                        
                        {!selectedImage && (
                          <div className="mt-2">
                            <Form.Text className="text-danger" style={{ fontSize: '0.85rem' }}>
                              * Image is required
                            </Form.Text>
                          </div>
                        )}
                      </Form.Group>

                      {/* Quick Preview Card */}
                      <Card 
                        className="border-0"
                        style={{
                          backgroundColor: `${COLORS.emeraldGreen}08`,
                          border: `1px solid ${COLORS.emeraldGreen}20`,
                          borderRadius: '16px'
                        }}
                      >
                        <Card.Body className="p-3">
                          <h6 style={{ 
                            color: COLORS.emeraldGreen, 
                            fontWeight: '700',
                            fontSize: '1rem',
                            marginBottom: '1rem'
                          }}>
                            🎯 Sweet Preview
                          </h6>
                          
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className="rounded-3 flex-shrink-0"
                              style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: imagePreview ? 'transparent' : `${COLORS.emeraldGreen}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              {imagePreview ? (
                                <img 
                                  src={imagePreview} 
                                  alt="Preview thumb" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <FaImage size={20} color={COLORS.emeraldGreen} />
                              )}
                            </div>
                            
                            <div className="flex-grow-1">
                              <div style={{ fontWeight: '700', fontSize: '1rem', color: COLORS.darkText }}>
                                {watchName || 'Sweet Name'}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                {watch('category') || 'Category'} • 
                                <span style={{ fontWeight: '600', color: COLORS.emeraldGreen }} className="ms-1">
                                  ₹{watchPrice ? parseFloat(watchPrice).toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                                {watchDescription?.substring(0, 60) || 'Description will appear here...'}
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Tips Card */}
                      <Card 
                        className="border-0 mt-4"
                        style={{
                          backgroundColor: `${COLORS.sandYellow}15`,
                          border: `1px solid ${COLORS.sandYellow}30`,
                          borderRadius: '16px'
                        }}
                      >
                        <Card.Body className="p-3">
                          <h6 style={{ 
                            color: COLORS.darkText, 
                            fontWeight: '700',
                            fontSize: '1rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            💡 Quick Tips
                          </h6>
                          <ul className="mb-0" style={{ fontSize: '0.85rem', color: '#666' }}>
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
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-5 pt-4 border-top">
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      className="order-2 order-md-1"
                      style={{
                        borderColor: COLORS.mediumGray,
                        color: COLORS.darkText,
                        borderRadius: '12px',
                        padding: '0.75rem 2rem',
                        fontWeight: '700',
                        minWidth: '160px'
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || !selectedImage}
                      className="order-1 order-md-2"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.darkEmerald})`,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 2rem',
                        fontWeight: '700',
                        minWidth: '200px',
                        boxShadow: `0 6px 20px ${COLORS.emeraldGreen}40`
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
            <div className="text-center mt-4">
              <p style={{ 
                color: '#666', 
                fontSize: '0.9rem',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
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