import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';
import Carousel from 'react-bootstrap/Carousel'; // Import Carousel for a dynamic header

// --- New Aesthetic Hero Component ---
const SweetHero = () => {
  return (
    <div className="sweet-hero-section mb-5">
      <Carousel controls={false} indicators={false} interval={5000} pause={false}>
        {/* Slide 1: Using the box of sweets/almonds image */}
        <Carousel.Item>
          <div 
            className="hero-image-overlay" 
            style={{ 
              backgroundImage: 'url(/HomePageSweet1.png)', 
              height: '450px', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Dark Overlay for Readability */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}></div>
            
            {/* Content centered on top of the image */}
            <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                <h1 className="display-2 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    Indulge in Sweet Perfection
                </h1>
                <p className="lead fs-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    Exquisite flavors crafted just for you.
                </p>
                <Button variant="light" size="lg" as={Link} to="#sweets-list" className="mt-3 shadow-lg">
                    Shop Now
                </Button>
            </div>
          </div>
        </Carousel.Item>

        {/* Slide 2: Using the baklava-style sweets image */}
        <Carousel.Item>
          <div 
            className="hero-image-overlay" 
            style={{ 
              backgroundImage: 'url(/HomePageSweet2.png)', 
              height: '450px', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {/* Dark Overlay for Readability */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}></div>
            
            {/* Content centered on top of the image */}
            <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
                <h1 className="display-2 fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    Artisan Treats & Delights
                </h1>
                <p className="lead fs-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>
                    Handmade goodness from around the world.
                </p>
                <Button variant="warning" size="lg" as={Link} to="#sweets-list" className="mt-3 shadow-lg">
                    View Our Collection
                </Button>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
};
// --- End New Aesthetic Hero Component ---


const HomePage = () => {
  const { sweets, loading, error, fetchSweets, purchaseSweet } = useSweet();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Available categories for filter
  const categories = [
    'All',
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

  // Fetch sweets on component mount
  useEffect(() => {
    fetchSweets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSweets({
      query: searchTerm,
      category: categoryFilter === 'All' ? '' : categoryFilter,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  // Handle purchase
  const handlePurchase = async (sweetId, sweetName) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      toast.error('Please login to make a purchase');
      return;
    }
    
    try {
      await purchaseSweet(sweetId, 1);
      toast.success(`Successfully added ${sweetName} to cart!`);
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceRange({ min: '', max: '' });
    fetchSweets();
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading sweets...</span>
        </Spinner>
        <p className="mt-3">Loading delicious sweets...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>Error Loading Sweets</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container fluid className="p-0"> {/* Use fluid container for full-width hero */}
      
      {/* 1. New Aesthetic Hero Section with Images */}
      <SweetHero />
      
      <Container> {/* Wrap the rest of the content in a standard container */}
        
        <Row className="mb-5 text-center">
          <Col>
            <h1 className="display-4 text-primary mb-3">
              🍬 Browse Our Sweet Collection
            </h1>
            <p className="lead">
              Use the filters below to find exactly what you crave!
            </p>
          </Col>
        </Row>

        {/* Search and Filter Section */}
        <Card className="mb-5 shadow-lg border-0 bg-light">
          <Card.Body>
            <Form onSubmit={handleSearch}>
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Search Sweets</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Category</Form.Label>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Min Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Max Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={1} className="d-flex align-items-end">
                  <Button type="submit" variant="primary" className="w-100">
                    🔍 Search
                  </Button>
                </Col>
              </Row>
              
              <div className="text-center mt-3">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleResetFilters}
                    size="sm"
                  >
                    ✕ Clear Filters
                  </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Sweets Grid */}
        <div id="sweets-list">
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
              {sweets.length > 0 ? (
                sweets.map((sweet) => (
                  <Col key={sweet._id}>
                    <Card className="h-100 shadow-sm sweet-card-hover">
                      <Card.Img 
                        variant="top" 
                        src={sweet.imageUrl} 
                        alt={sweet.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          // Fallback to default image if loading fails
                          e.target.src = 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Sweet+Image';
                        }}
                      />
                      
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="text-primary fw-bold">{sweet.name}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          <Badge bg="info" className="p-2">{sweet.category}</Badge>
                        </Card.Subtitle>
                        
                        <Card.Text className="flex-grow-1 text-truncate-3-lines">
                          {sweet.description || 'A delicious treat for your sweet tooth!'}
                        </Card.Text>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="h4 text-success mb-0">
                              ₹{sweet.price.toFixed(2)}
                            </span>
                            <Badge 
                              bg={sweet.quantity > 0 ? 'success' : 'danger'}
                              className="px-3 py-2 fw-normal"
                            >
                              {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                            </Badge>
                          </div>
                          
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-primary"
                              as={Link}
                              to={`/sweets/${sweet._id}`}
                            >
                              View Details
                            </Button>
                            
                            <Button
                              variant="success"
                              disabled={sweet.quantity === 0}
                              onClick={() => handlePurchase(sweet._id, sweet.name)}
                            >
                              {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                      
                      <Card.Footer className="text-end bg-light">
                        <small className="text-muted">
                          Added by {sweet.createdBy?.username || 'Unknown'}
                        </small>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <Alert variant="info" className="text-center my-5 p-4">
                    <Alert.Heading>😔 No Sweets Found</Alert.Heading>
                    <p>Try resetting your filters or check back later!</p>
                    <Button variant="info" onClick={handleResetFilters}>
                        Show All Sweets
                    </Button>
                  </Alert>
                </Col>
              )}
            </Row>
        </div>

        {/* Stats Section */}
        <Row className="mt-5 mb-5">
          <Col>
            <Card className="text-center shadow-lg bg-primary text-white">
              <Card.Body>
                <Row>
                  <Col md={3} className="border-end border-white">
                    <h3 className="display-6">{sweets.length}</h3>
                    <p className="fw-bold mb-0">Total Sweets</p>
                  </Col>
                  <Col md={3} className="border-end border-white">
                    <h3 className="display-6">
                      {sweets.filter(s => s.quantity > 0).length}
                    </h3>
                    <p className="fw-bold mb-0">In Stock</p>
                  </Col>
                  <Col md={3} className="border-end border-white">
                    <h3 className="display-6">
                      {sweets.filter(s => s.quantity === 0).length}
                    </h3>
                    <p className="fw-bold mb-0">Out of Stock</p>
                  </Col>
                  <Col md={3}>
                    <h3 className="display-6">
                      ₹{sweets.reduce((sum, sweet) => sum + sweet.price, 0).toFixed(2)}
                    </h3>
                    <p className="fw-bold mb-0">Total Value</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
      </Container>
    </Container>
  );
};

export default HomePage;