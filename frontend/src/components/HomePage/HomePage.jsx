import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSweet } from '../../contexts/SweetContext';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaEye, FaStar, FaHeart, FaTag, FaLeaf } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './HomePage.css';

// --- Hero Component with Image Collage ---
const SweetHero = () => {
  // Paths to images in the public folder
  const image1 = '/HomePageSweet1.png'; 
  const image2 = '/HomePageSweet2.png'; 

  return (
    <div className="hero-container">
      <Row className="hero-row">
        {/* Left Column: Text and CTA (Emerald Green) */}
        <Col lg={6} className="hero-text-col">
          <div className='hero-text-container' style={{'margin': '2px 100px'}}>
            <h1 className="hero-title">
              Taste the Sweetness
            </h1>
            <p className="hero-subtitle">
              Discover our curated collection, crafted with the finest ingredients and a passion for flavor.
            </p>
            <a 
              href="#sweets-list"
              className="hero-cta-btn"
            >
              Explore Our Collection
            </a>
          </div>
        </Col>

        {/* Right Column: Image Collage and Logo (Sand Yellow) */}
        <Col lg={6} className="hero-image-col">
          {/* Main Image 1 (Baklava style) - prominent, slightly tilted/shadowed */}
          <div className="main-image">
          </div>

          {/* Secondary Image 2 (Indian/Boxed Sweets) - small overlay corner */}
          <img 
            src={image2} 
            alt="Traditional Indian Sweets" 
            className="secondary-image"
          />

          {/* Shop Name/Logo Placeholder */}
          <div className="shop-logo">
            SWEET SHOP
          </div>
        </Col>
      </Row>
    </div>
  );
};

// --- Custom Sweet Card Component ---
const SweetCard = ({ sweet, onPurchase }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Generate random rating between 3.5 and 5
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

  return (
    <div 
      className="sweet-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`sweet-card ${isHovered ? 'sweet-card-hovered' : ''}`}
      >
        {/* Premium Badge */}
        {sweet.price > 40 && (
          <div className="premium-badge">
            <FaTag className="badge-icon" />
            <span>Premium</span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
        >
          <FaHeart className="like-icon" />
        </button>

        {/* Image Container - Reduced height */}
        <div className="image-container">
          <img 
            src={getImageUrl(sweet.imageUrl)} 
            alt={sweet.name}
            className={`sweet-image ${isHovered ? 'image-hovered' : ''}`}
            onError={(e) => handleImageError(e, sweet.imageUrl)}
          />
          {/* Gradient Overlay */}
          <div className="image-gradient" />
        </div>

        {/* Content - Adjusted padding for shorter card */}
        <div className="sweet-content">
          {/* Title and Category */}
          <div className="sweet-header">
            <h3 className="sweet-title">
              {sweet.name}
            </h3>
            <div className="sweet-meta">
              <span className="category-badge">
                {sweet.category}
              </span>
              {/* Rating */}
              <div className="rating-container">
                <FaStar className="star-icon" />
                <span className="rating-value">
                  {rating}
                </span>
              </div>
            </div>
          </div>

          {/* Description - Reduced lines */}
          <p className="sweet-description">
            {sweet.description || 'A delicious treat crafted with premium ingredients...'}
          </p>

          {/* Price and Stock - Adjusted spacing */}
          <div className="price-stock-container">
            <div>
              <div className="sweet-price">
                ₹{sweet.price.toFixed(2)}
              </div>
              <div className="price-unit">
                per piece
              </div>
            </div>
            <div className="stock-info">
              <div className="stock-status">
                <div className={`stock-indicator ${sweet.quantity > 0 ? 'in-stock' : 'out-of-stock'}`} />
                <span className={`stock-text ${sweet.quantity > 0 ? 'in-stock-text' : 'out-of-stock-text'}`}>
                  {sweet.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {sweet.quantity > 0 && (
                <span className="stock-quantity">
                  {sweet.quantity} available
                </span>
              )}
            </div>
          </div>

          {/* Buttons - Adjusted spacing */}
          <div className="action-buttons"> 
            <Link 
              to={`/sweets/${sweet._id}`}
              className="view-btn"
            >
              <FaEye className="view-icon" /> View
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                onPurchase(sweet._id, sweet.name);
              }}
              disabled={sweet.quantity === 0}
              className={`add-to-cart-btn ${sweet.quantity === 0 ? 'disabled' : ''}`}
            >
              <FaShoppingCart className="cart-icon" /> Add to Cart
            </button>
          </div>
        </div>

        {/* Added by footer - Reduced padding */}
        <div className="sweet-footer">
          <small className="added-by">
            <FaLeaf className="leaf-icon" />
            Added by {sweet.createdBy?.username || 'Unknown'}
          </small>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { sweets, loading, error, fetchSweets, purchaseSweet } = useSweet();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const categories = [
    'All', 'Chocolate', 'Candy', 'Pastry', 'Cookie', 'Cake', 'Ice Cream', 'Traditional', 'Sugar-Free', 'Other'
  ];

  useEffect(() => {
    fetchSweets();
  }, [fetchSweets]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSweets({
      query: searchTerm,
      category: categoryFilter === 'All' ? '' : categoryFilter,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setPriceRange({ min: '', max: '' });
    fetchSweets();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Container className="text-center mt-5 ">
          <Spinner animation="border" role="status" className="loading-spinner">
            <span className="visually-hidden">Loading sweets...</span>
          </Spinner>
          <p className="loading-text">Loading delicious sweets...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="danger" className="error-alert">
          <Alert.Heading>Error Loading Sweets</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <Container fluid className="homepage-container"> 
      
      {/* 1.  Hero Section - Kept Original */}
      <SweetHero />
      
      <Container fluid className="content-container">
        
        <Row className="page-header">
          <Col>
            <h2 className="page-title">
              Browse Our Sweet Collection
            </h2>
          </Col>
        </Row>

        {/* Enhanced Search and Filter Section - Wider */}
        <div className="search-filter-section">
          <Form onSubmit={handleSearch}>
            <Row className="filter-row">
              {/* Search Input - Larger */}
              <Col lg={4} md={12}>
                <Form.Group>
                  <Form.Label className="filter-label">
                    🔍 Search Sweets
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="What sweet are you craving for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </Form.Group>
              </Col>
              
              {/* Category Filter - Larger */}
              <Col lg={3} md={6}>
                <Form.Group>
                  <Form.Label className="filter-label">
                    🍰 Category
                  </Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="category-select"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Price Range - Larger */}
              <Col lg={4} md={6}>
                <Form.Label className="filter-label">
                  💰 Price Range
                </Form.Label>
                <Row className="price-range-row">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Control 
                        type="number" 
                        placeholder="Min Price (₹)" 
                        value={priceRange.min} 
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} 
                        min="0" 
                        step="0.01"
                        className="price-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Control 
                        type="number" 
                        placeholder="Max Price (₹)" 
                        value={priceRange.max} 
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} 
                        min="0" 
                        step="0.01"
                        className="price-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              
              {/* Search Button - Larger */}
              <Col lg={1} md={12} className="search-btn-col">
                <button
                  type="submit"
                  className="search-btn"
                >
                  Search
                </button>
              </Col>
            </Row>
            
            {/* Clear Filters Button */}
            <div className="clear-filters-container">
              <button
                type="button"
                className="clear-filters-btn"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            </div>
          </Form>
        </div>

        {/* Sweets Grid - 3 cards per row */}
        <div id="sweets-list" className="sweets-grid-container">
          <Container fluid className="sweets-grid">
            {sweets.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="sweets-row">
                {sweets.map((sweet) => (
                  <Col key={sweet._id} className="sweet-col">
                    <SweetCard 
                      sweet={sweet} 
                      onPurchase={handlePurchase}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Col xs={12}>
                <div className="no-sweets-found">
                  <h3 className="no-sweets-title">
                    😔 No Sweets Found
                  </h3>
                  <p className="no-sweets-message">
                    Try resetting your filters or check back later!
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="show-all-btn"
                  >
                    Show All Sweets
                  </button>
                </div>
              </Col>
            )}
          </Container>
        </div>

      </Container>
    </Container>
  );
};

export default HomePage;