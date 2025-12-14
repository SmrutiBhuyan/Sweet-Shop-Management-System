import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaEye, FaStar, FaHeart, FaTag, FaLeaf } from 'react-icons/fa';

// --- Define the Color Palette ---
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
};

// --- Aesthetic Hero Component with Image Collage ---
const AestheticSweetHero = () => {
  // Paths to images in the public folder
  const image1 = '/HomePageSweet1.png'; // Baklava/Pistachio Sweets
  const image2 = '/HomePageSweet2.png'; // Indian/Dry Fruit Sweets

  return (
    <div 
      className="mb-5 shadow-lg"
      style={{
        backgroundColor: COLORS.sandYellow,
        padding: '0',
        overflow: 'hidden',
        display: 'flex',
        minHeight: '450px',
        width: '116%',
        position: 'relative',
        right: '101px'
      }}
    >
      <Row className="g-0 w-100">
        {/* Left Column: Text and CTA (Emerald Green) */}
        <Col lg={6} 
          className="d-flex align-items-center p-5 p-md-5 p-lg-5"
          style={{ 
            backgroundColor: COLORS.emeraldGreen,
            color: COLORS.lightText,
            minHeight: '450px',
            width: '33%'
          }}
        >
          <div>
            <h1 
              className="display-4 fw-bold mb-3"
              style={{ letterSpacing: '2px' }}
            >
              Taste the Sweetness
            </h1>
            <p className="lead mb-4">
              Discover our curated collection, crafted with the finest ingredients and a passion for flavor.
            </p>
            <a 
              href="#sweets-list"
              className="btn btn-warning btn-lg"
              style={{ color: COLORS.darkText, fontWeight: 'bold', textDecoration: 'none' }}
            >
              Explore Our Collection
            </a>
          </div>
        </Col>

        {/* Right Column: Image Collage and Logo (Sand Yellow) */}
        <Col lg={6} 
          className="d-flex justify-content-center align-items-center position-relative p-4"
        >
          {/* Main Image 1 (Baklava style) - prominent, slightly tilted/shadowed */}
          <div style={{
            position: 'absolute',
            width: '85%',
            height: '85%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${image1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '10px',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            zIndex: 1,
          }}>
          </div>

          {/* Secondary Image 2 (Indian/Boxed Sweets) - small overlay corner */}
          <img 
            src={image2} 
            alt="Traditional Indian Sweets" 
            style={{
              position: 'absolute',
              width: '30%',
              height: 'auto',
              bottom: '5%',
              right: '5%',
              borderRadius: '5px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4)',
              zIndex: 2,
            }}
          />

          {/* Shop Name/Logo Placeholder */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            padding: '10px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: COLORS.emeraldGreen,
            borderRadius: '5px',
            fontWeight: '900',
            fontSize: '1.2rem',
            zIndex: 3
          }}>
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
      style={{
        width: '100%',
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="sweet-card"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isHovered 
            ? '0 15px 35px rgba(0, 128, 128, 0.15)'
            : '0 5px 15px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          border: `1px solid ${COLORS.sandYellow}50`,
          position: 'relative'
        }}
      >
        {/* Premium Badge */}
        {sweet.price > 40 && (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            backgroundColor: COLORS.coral,
            color: 'white',
            padding: '6px 15px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <FaTag size={12} />
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
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isLiked ? COLORS.coral : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: isLiked ? 'white' : COLORS.darkText
          }}
        >
          <FaHeart size={16} />
        </button>

        {/* Image Container - Reduced height */}
        <div 
          style={{
            height: '180px', // Reduced from 220px
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <img 
            src={sweet.imageUrl} 
            alt={sweet.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
          }} />
        </div>

        {/* Content - Adjusted padding for shorter card */}
        <div 
          style={{
            padding: '1.2rem', // Reduced from 1.5rem
            flexGrow: '1',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Title and Category */}
          <div style={{ marginBottom: '0.8rem' }}>
            <h3 
              style={{
                color: COLORS.emeraldGreen,
                fontSize: '1.2rem', // Slightly reduced
                fontWeight: '700',
                marginBottom: '0.4rem', // Reduced
                lineHeight: '1.3'
              }}
            >
              {sweet.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                backgroundColor: `${COLORS.sandYellow}30`,
                color: COLORS.darkText,
                padding: '4px 10px', // Adjusted
                borderRadius: '10px', // Adjusted
                fontSize: '0.8rem', // Reduced
                fontWeight: '600'
              }}>
                {sweet.category}
              </span>
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaStar size={12} color={COLORS.primaryAccent} /> {/* Smaller */}
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: COLORS.darkText }}>
                  {rating}
                </span>
              </div>
            </div>
          </div>

          {/* Description - Reduced lines */}
          <p 
            style={{
              color: '#666',
              fontSize: '0.9rem', // Reduced
              lineHeight: '1.4', // Reduced
              marginBottom: '1rem', // Reduced from 1.5rem
              flexGrow: '1',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {sweet.description || 'A delicious treat crafted with premium ingredients...'}
          </p>

          {/* Price and Stock - Adjusted spacing */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem', // Reduced from 1.5rem
              padding: '0.6rem', // Reduced from 0.8rem
              backgroundColor: `${COLORS.emeraldGreen}08`,
              borderRadius: '10px', // Adjusted
              border: `1px solid ${COLORS.emeraldGreen}20`
            }}
          >
            <div>
              <div style={{
                fontSize: '1.6rem', // Reduced from 1.8rem
                fontWeight: '800',
                color: COLORS.emeraldGreen,
                lineHeight: '1'
              }}>
                ₹{sweet.price.toFixed(2)}
              </div>
              <div style={{
                fontSize: '0.8rem', // Reduced
                color: '#666',
                marginTop: '2px' // Reduced
              }}>
                per piece
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '2px' // Reduced
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: sweet.quantity > 0 ? '#28a745' : '#dc3545',
                  animation: sweet.quantity > 0 ? 'pulse 2s infinite' : 'none'
                }} />
                <span style={{
                  fontWeight: '600',
                  color: sweet.quantity > 0 ? '#28a745' : '#dc3545',
                  fontSize: '0.85rem' // Reduced
                }}>
                  {sweet.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {sweet.quantity > 0 && (
                <span style={{
                  fontSize: '0.75rem', // Reduced
                  color: '#666'
                }}>
                  {sweet.quantity} available
                </span>
              )}
            </div>
          </div>

          {/* Buttons - Adjusted spacing */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '8px' // Reduced
          }}>
            <Link 
              to={`/sweets/${sweet._id}`}
              className="btn"
              style={{
                textDecoration: 'none',
                textAlign: 'center',
                padding: '10px', // Reduced from 12px
                border: `2px solid ${COLORS.emeraldGreen}`,
                color: COLORS.emeraldGreen,
                borderRadius: '8px', // Reduced
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px', // Reduced
                transition: 'all 0.3s ease',
                backgroundColor: 'transparent'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${COLORS.emeraldGreen}10`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <FaEye size={12} /> View
            </Link>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                onPurchase(sweet._id, sweet.name);
              }}
              disabled={sweet.quantity === 0}
              style={{
                background: sweet.quantity > 0 
                  ? `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.emeraldGreen}dd)`
                  : '#ccc',
                color: 'white',
                border: 'none',
                padding: '10px', // Reduced from 12px
                borderRadius: '8px', // Reduced
                fontWeight: '700',
                fontSize: '0.9rem', // Reduced
                cursor: sweet.quantity > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px', // Reduced
                boxShadow: sweet.quantity > 0 
                  ? `0 4px 15px ${COLORS.emeraldGreen}40` // Reduced
                  : 'none'
              }}
              onMouseOver={(e) => {
                if (sweet.quantity > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.emeraldGreen}60`; // Reduced
                }
              }}
              onMouseOut={(e) => {
                if (sweet.quantity > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${COLORS.emeraldGreen}40`; // Reduced
                }
              }}
            >
              <FaShoppingCart size={12} /> Add to Cart
            </button>
          </div>
        </div>

        {/* Added by footer - Reduced padding */}
        <div 
          style={{
            padding: '0.8rem 1.2rem', // Reduced
            backgroundColor: COLORS.lightGray,
            borderTop: `1px solid ${COLORS.mediumGray}`,
            textAlign: 'right'
          }}
        >
          <small style={{ 
            color: '#666', 
            fontSize: '0.8rem', // Reduced
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px'
          }}>
            <FaLeaf size={10} color={COLORS.emeraldGreen} /> {/* Smaller */}
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
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" style={{ color: COLORS.emeraldGreen }}>
          <span className="visually-hidden">Loading sweets...</span>
        </Spinner>
        <p className="mt-3" style={{ color: COLORS.darkText }}>Loading delicious sweets...</p>
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
    <Container fluid className="p-0"> 
      
      {/* 1. Aesthetic Hero Section - Kept Original */}
      <AestheticSweetHero />
      
      <Container fluid className="px-4"> {/* Wider container for content */}
        
        <Row className="my-5 text-center">
          <Col>
            <h2 
              className="display-5" 
              style={{ color: COLORS.sandYellow, fontWeight: '600' }}
            >
              Browse Our Sweet Collection
            </h2>
          </Col>
        </Row>

        {/* Enhanced Search and Filter Section - Wider */}
        <div 
          className="mb-5"
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0, 128, 128, 0.08)',
            borderTop: `4px solid ${COLORS.emeraldGreen}`,
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto 3rem auto',
                width: '112%',
    position: 'relative',
    right: '82px'
          }}
        >
          <Form onSubmit={handleSearch}>
            <Row className="g-4 align-items-end">
              {/* Search Input - Larger */}
              <Col lg={4} md={12}>
                <Form.Group>
                  <Form.Label style={{ 
                    color: COLORS.darkText, 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    marginBottom: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🔍 Search Sweets
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="What sweet are you craving for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      border: `2px solid ${COLORS.mediumGray}`,
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.emeraldGreen;
                      e.target.style.boxShadow = `0 0 0 3px ${COLORS.emeraldGreen}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = COLORS.mediumGray;
                      e.target.style.boxShadow = 'none';
                    }}
                    size="lg"
                  />
                </Form.Group>
              </Col>
              
              {/* Category Filter - Larger */}
              <Col lg={3} md={6}>
                <Form.Group>
                  <Form.Label style={{ 
                    color: COLORS.darkText, 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    marginBottom: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🍰 Category
                  </Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      border: `2px solid ${COLORS.mediumGray}`,
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                    size="lg"
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
                <Form.Label style={{ 
                  color: COLORS.darkText, 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  marginBottom: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💰 Price Range
                </Form.Label>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Control 
                        type="number" 
                        placeholder="Min Price (₹)" 
                        value={priceRange.min} 
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} 
                        min="0" 
                        step="0.01"
                        style={{
                          padding: '1rem 1.5rem',
                          fontSize: '1.1rem',
                          borderRadius: '12px',
                          border: `2px solid ${COLORS.mediumGray}`
                        }}
                        size="lg"
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
                        style={{
                          padding: '1rem 1.5rem',
                          fontSize: '1.1rem',
                          borderRadius: '12px',
                          border: `2px solid ${COLORS.mediumGray}`
                        }}
                        size="lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              
              {/* Search Button - Larger */}
              <Col lg={1} md={12} className="d-flex align-items-end">
                <button
                  type="submit"
                  className="btn w-100"
                  style={{ 
                    backgroundColor: COLORS.emeraldGreen, 
                    borderColor: COLORS.emeraldGreen,
                    color: 'white',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#006666';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.emeraldGreen;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Search
                </button>
              </Col>
            </Row>
            
            {/* Clear Filters Button */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="btn"
                onClick={handleResetFilters}
                style={{
                  backgroundColor: 'transparent',
                  color: COLORS.emeraldGreen,
                  border: `2px solid ${COLORS.emeraldGreen}`,
                  padding: '0.7rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = `${COLORS.emeraldGreen}10`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Clear Filters
              </button>
            </div>
          </Form>
        </div>

        {/* Sweets Grid - 3 cards per row */}
        <div id="sweets-list">
          <Container fluid className="px-0">
            {sweets.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4"> {/* Changed to lg={3} for 3 cards per row */}
                {sweets.map((sweet) => (
                  <Col key={sweet._id} className="d-flex">
                    <SweetCard 
                      sweet={sweet} 
                      onPurchase={handlePurchase}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Col xs={12}>
                <div 
                  className="text-center p-5"
                  style={{
                    backgroundColor: '#d1ecf1',
                    color: '#0c5460',
                    borderRadius: '16px',
                    margin: '3rem 0'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1.8rem', 
                    marginBottom: '1rem',
                    fontWeight: '700'
                  }}>
                    😔 No Sweets Found
                  </h3>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    Try resetting your filters or check back later!
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="btn"
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      padding: '0.75rem 2rem',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#138496';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#17a2b8';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Show All Sweets
                  </button>
                </div>
              </Col>
            )}
          </Container>
        </div>

      </Container>

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .sweet-card-container {
          perspective: 1000px;
          width: 100%;
        }
        
        .sweet-card {
          height: 580px; /* Set fixed shorter height */
          width: 100%; /* Take full width of column */
        }
        
        .sweet-card:hover {
          box-shadow: 0 20px 40px rgba(0, 128, 128, 0.2) !important;
        }
      `}</style>
    </Container>
  );
};

export default HomePage;