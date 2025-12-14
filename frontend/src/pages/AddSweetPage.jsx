import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';

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
  } = useForm({
    resolver: yupResolver(sweetSchema),
    defaultValues: {
      quantity: 0,
    },
  });

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
        toast.success('Sweet added successfully!');
        reset();
        setSelectedImage(null);
        setImagePreview(null);
        navigate('/admin');
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
    navigate('/admin');
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-primary">Add New Sweet 🍬</h2>
                <p className="text-muted">Fill in the details to add a new sweet to your shop</p>
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
                      <Form.Text className="text-muted">
                        Price between ₹0 - ₹1000
                      </Form.Text>
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
                      <Form.Text className="text-muted">
                        Initial stock quantity
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  {/* Image Upload Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Image *</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        isInvalid={!!errors.image}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.image?.message}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Upload an image (max 5MB, JPG, PNG, etc.)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                {/* Image Preview */}
                <Form.Group className="mb-4 text-center">
                  <Form.Label>Image Preview</Form.Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ 
                          width: '300px', 
                          height: '200px', 
                          objectFit: 'cover',
                          border: '2px solid #dee2e6',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div
                        style={{ 
                          width: '300px', 
                          height: '200px', 
                          border: '2px dashed #dee2e6',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6c757d',
                          margin: '0 auto'
                        }}
                      >
                        No image selected
                      </div>
                    )}
                  </div>
                </Form.Group>
                
                {/* Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
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
                        Adding...
                      </>
                    ) : (
                      'Add Sweet'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          {/* Quick Tips */}
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Card.Title>Quick Tips</Card.Title>
              <ul className="mb-0">
                <li>Use clear, descriptive names for your sweets</li>
                <li>Add appealing descriptions to attract customers</li>
                <li>Choose appropriate categories for easy filtering</li>
                <li>Set competitive prices based on market research</li>
                <li>Use high-quality images to showcase your sweets</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddSweetPage;