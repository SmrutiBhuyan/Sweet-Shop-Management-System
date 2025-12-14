import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  Badge,
  Form,
  InputGroup,
  ProgressBar,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';
import { sweetAPI } from '../services/api';
import { 
  FaShoppingCart, 
  FaPlus, 
  FaEdit, 
  FaBox, 
  FaRupeeSign, 
  FaChartLine, 
  FaHistory, 
  FaTag,
  FaStar,
  FaHeart,
  FaFire,
  FaShoppingBag,
  FaCrown,
  FaUsers,
  FaStore
} from 'react-icons/fa';

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

// Sweet Card Component - Modern Design
const SweetDashboardCard = ({ sweet, onPurchase, onRestock, isAdmin }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="position-relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: '100%',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Card
        className="border-0 h-100 overflow-hidden"
        style={{
          ...glassStyle,
          borderRadius: '20px',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: isHovered 
            ? '0 20px 40px rgba(0, 128, 128, 0.15)' 
            : '0 8px 32px rgba(0, 128, 128, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Image Container with Gradient Overlay */}
        <div 
          className="position-relative"
          style={{ 
            height: '200px', 
            overflow: 'hidden'
          }}
        >
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="w-100 h-100"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          
          {/* Gradient Overlay */}
          <div 
            className="position-absolute w-100 h-100"
            style={{
              background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 100%)',
            }}
          />
          
          {/* Top Badges */}
          <div className="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between">
            <Badge
              className="px-3 py-2"
              style={{
                backgroundColor: sweet.quantity > 0 ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)',
                backdropFilter: 'blur(4px)',
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '10px'
              }}
            >
              {sweet.quantity > 0 ? `Stock: ${sweet.quantity}` : 'Sold Out'}
            </Badge>
            
            {sweet.price > 40 && (
              <Badge
                className="px-3 py-2 d-flex align-items-center"
                style={{
                  backgroundColor: 'rgba(255, 107, 139, 0.9)',
                  backdropFilter: 'blur(4px)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  borderRadius: '10px'
                }}
              >
                <FaCrown size={10} className="me-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Like Button */}
          <button
            className="position-absolute top-3 end-3 border-0 rounded-circle p-2"
            onClick={() => setIsLiked(!isLiked)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <FaHeart size={14} color={isLiked ? COLORS.coral : '#666'} />
          </button>
        </div>

        <Card.Body className="p-4 d-flex flex-column">
          <div className="mb-3">
            <Badge 
              className="px-3 py-2 mb-2"
              style={{
                backgroundColor: `${COLORS.emeraldGreen}20`,
                color: COLORS.emeraldGreen,
                fontSize: '0.75rem',
                fontWeight: '700',
                borderRadius: '8px'
              }}
            >
              {sweet.category}
            </Badge>
            
            <Card.Title 
              className="mb-2"
              style={{ 
                fontSize: '1.3rem', 
                fontWeight: '800',
                color: COLORS.darkText,
                lineHeight: '1.3'
              }}
            >
              {sweet.name}
            </Card.Title>
            
            <div className="d-flex align-items-center mb-2">
              <FaStar size={14} color={COLORS.gold} className="me-1" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.darkText }}>
                4.8
              </span>
              <span className="mx-2" style={{ color: COLORS.mediumGray }}>•</span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {sweet.quantity > 50 ? 'Popular' : 'Limited'}
              </span>
            </div>
          </div>
          
          <Card.Text 
            className="flex-grow-1"
            style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              lineHeight: '1.6'
            }}
          >
            {sweet.description?.substring(0, 100)}...
          </Card.Text>
          
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '900',
                  color: COLORS.emeraldGreen,
                  lineHeight: '1'
                }}>
                  <FaRupeeSign size={16} className="mb-2" />
                  {sweet.price.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  per piece
                </div>
              </div>
              
              <div className="text-end">
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {sweet.createdBy?.username || 'Sweet Shop'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                  Added 2 days ago
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="primary"
                className="flex-grow-1 py-2"
                onClick={() => onPurchase(sweet)}
                disabled={sweet.quantity === 0}
                style={{
                  background: sweet.quantity > 0 
                    ? `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.darkEmerald})`
                    : '#ccc',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaShoppingCart className="me-2" />
                {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestock(sweet._id, sweet.name)}
                  style={{
                    border: `2px solid ${COLORS.primaryAccent}`,
                    color: COLORS.primaryAccent,
                    borderRadius: '10px',
                    fontWeight: '700'
                  }}
                >
                  <FaBox size={14} />
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { sweets, loading, error, fetchSweets, purchaseSweet } = useSweet();
  
  const [purchaseModalShow, setPurchaseModalShow] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [userPurchases, setUserPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalSweets: 0,
    inStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalPurchases: 0,
    revenue: 2450,
    customers: 124,
  });

  // Fetch sweets and calculate stats
  useEffect(() => {
    fetchSweets();
    
    // Simulate fetching user purchase history
    const mockPurchases = [
      { id: 1, name: 'Gulab Jamun', quantity: 2, price: 25.00, date: 'Today', status: 'Delivered', image: '🍮' },
      { id: 2, name: 'Rasgulla', quantity: 1, price: 30.00, date: 'Yesterday', status: 'Processing', image: '🍬' },
      { id: 3, name: 'Jalebi', quantity: 3, price: 20.00, date: 'Jan 12', status: 'Delivered', image: '🥨' },
      { id: 4, name: 'Kaju Katli', quantity: 1, price: 45.00, date: 'Jan 10', status: 'Delivered', image: '🍫' },
    ];
    setUserPurchases(mockPurchases);
  }, [fetchSweets]);

  // Update stats when sweets change
  useEffect(() => {
    if (sweets.length > 0) {
      const totalSweets = sweets.length;
      const inStock = sweets.filter(s => s.quantity > 0).length;
      const outOfStock = sweets.filter(s => s.quantity === 0).length;
      const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
      const totalPurchases = userPurchases.reduce((sum, p) => sum + p.quantity, 0);
      
      setStats({
        totalSweets,
        inStock,
        outOfStock,
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalPurchases,
        revenue: 2450,
        customers: 124,
      });
    }
  }, [sweets, userPurchases]);

  // Handle purchase modal open
  const handlePurchaseClick = (sweet) => {
    if (sweet.quantity === 0) {
      toast.error('This item is out of stock');
      return;
    }
    
    setSelectedSweet(sweet);
    setPurchaseQuantity(1);
    setPurchaseModalShow(true);
  };

  // Handle purchase confirmation
  const handleConfirmPurchase = async () => {
    if (!selectedSweet) return;
    
    try {
      await purchaseSweet(selectedSweet._id, purchaseQuantity);
      
      toast.success(`Successfully purchased ${purchaseQuantity} ${selectedSweet.name}(s)!`);
      setPurchaseModalShow(false);
      fetchSweets(); // Refresh sweets list
      
      // Add to purchase history
      const newPurchase = {
        id: userPurchases.length + 1,
        name: selectedSweet.name,
        quantity: purchaseQuantity,
        price: selectedSweet.price,
        date: 'Today',
        status: 'Processing',
        image: '🎉'
      };
      setUserPurchases([newPurchase, ...userPurchases]);
      
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    }
  };

  // Handle restock (admin only)
  const handleRestock = async (sweetId, sweetName) => {
    const quantityToAdd = prompt(`Enter quantity to add to ${sweetName}:`, '10');
    
    if (!quantityToAdd || isNaN(quantityToAdd) || parseInt(quantityToAdd) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    try {
      await sweetAPI.restockSweet(sweetId, parseInt(quantityToAdd));
      toast.success(`Successfully restocked ${sweetName} with ${quantityToAdd} items!`);
      fetchSweets(); // Refresh sweets list
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  if (loading) {
    return (
      <Container 
        className="d-flex justify-content-center align-items-center"  
        style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="text-center">
          <Spinner 
            animation="border" 
            role="status" 
            style={{ 
              color: COLORS.lightText, 
              width: '4rem', 
              height: '4rem',
              borderWidth: '3px'
            }}
          />
          <p className="mt-4 text-white" style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            Preparing your sweet dashboard...
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert 
          variant="danger" 
          style={{ 
            ...glassStyle,
            maxWidth: '500px',
            borderRadius: '20px',
            border: 'none'
          }}
        >
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      {/* Custom CSS for wider container on large screens */}
      <style>
        {`
          @media (min-width: 1400px) {
            .container, .container-lg, .container-md, .container-sm, .container-xl, .container-xxl {
              max-width: 1500px;
            }
            
            /* Adjust grid for wider screens */
            .wide-screen-grid .row-cols-xxl-5 > * {
              flex: 0 0 auto;
              width: 20%;
            }
            
            .wide-screen-grid .row-cols-xxl-3 > * {
              flex: 0 0 auto;
              width: 33.333333%;
            }
          }
          
          /* Additional responsive improvements */
          @media (min-width: 1600px) {
            .container {
              max-width: 1600px;
            }
          }
        `}
      </style>

      <Container fluid="xxl">
        {/* Header Section */}
        <Row className="mb-5">
          <Col>
            <div 
              className="p-5 rounded-4 shadow-lg position-relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emeraldGreen} 0%, ${COLORS.darkEmerald} 100%)`,
                color: COLORS.lightText
              }}
            >
              {/* Background Pattern */}
              <div 
                className="position-absolute top-0 end-0 w-50 h-100"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 2px, transparent 2px)',
                  backgroundSize: '40px 40px',
                  opacity: 0.3
                }}
              />
              
              <Row className="align-items-center position-relative">
                <Col lg={8} xl={9} xxl={10}>
                  <div className="mb-4">
                    <Badge 
                      className="px-3 py-2 mb-3"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        borderRadius: '10px'
                      }}
                    >
                      {isAdmin() ? '🎮 Admin Dashboard' : '👋 Welcome Back'}
                    </Badge>
                    
                    <h1 className="display-5 fw-bold mb-3">
                      Hello, {user?.username}!
                      <span className="d-block" style={{ fontSize: '2.5rem', opacity: 0.9 }}>
                        {isAdmin() ? 'Manage Your Sweet Empire' : 'Your Sweet Journey Awaits'}
                      </span>
                    </h1>
                    
                    <p className="lead mb-0" style={{ opacity: 0.9 }}>
                      {isAdmin() 
                        ? 'Track sales, manage inventory, and grow your business.'
                        : 'Discover new sweets, track orders, and enjoy exclusive offers.'
                      }
                    </p>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <Button 
                      variant="light"
                      className="px-4 py-2 rounded-pill"
                      style={{ fontWeight: '700' }}
                      href="/"
                    >
                      <FaShoppingBag className="me-2" />
                      Shop Now
                    </Button>
                    
                    {isAdmin() && (
                      <Button 
                        variant="outline-light"
                        className="px-4 py-2 rounded-pill"
                        style={{ fontWeight: '700' }}
                        href="/add-sweet"
                      >
                        <FaPlus className="me-2" />
                        Add Sweet
                      </Button>
                    )}
                  </div>
                </Col>
                
                <Col lg={4} xl={3} xxl={2} className="text-center d-none d-lg-block">
                  <div 
                    className="rounded-circle p-4 mx-auto"
                    style={{
                      width: '200px',
                      height: '200px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px)',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '6rem' }}>🍭</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Stats Grid - Adjusted for wider screens */}
        <Row className="g-4 mb-5 wide-screen-grid">
          {[
            { 
              title: 'Total Sweets', 
              value: stats.totalSweets, 
              icon: '🍬',
              color: COLORS.emeraldGreen,
              change: '+12%',
              bg: `${COLORS.emeraldGreen}15`
            },
            { 
              title: 'In Stock', 
              value: stats.inStock, 
              icon: '✅',
              color: '#28a745',
              change: '+5%',
              bg: '#28a74515'
            },
            { 
              title: 'Out of Stock', 
              value: stats.outOfStock, 
              icon: '⏸️',
              color: COLORS.coral,
              change: '+2%',
              bg: `${COLORS.coral}15`
            },
            { 
              title: 'Revenue', 
              value: `₹${stats.revenue}`, 
              icon: '💰',
              color: COLORS.primaryAccent,
              change: '+18%',
              bg: `${COLORS.primaryAccent}15`
            },
            { 
              title: 'Customers', 
              value: stats.customers, 
              icon: '👥',
              color: COLORS.lavender,
              change: '+8%',
              bg: `${COLORS.lavender}15`
            }
          ].map((stat, index) => (
            <Col xl={3} xxl={true} className="col-xxl" key={index}>
              <Card 
                className="border-0 h-100"
                style={{
                  ...glassStyle,
                  borderRadius: '20px',
                  transition: 'transform 0.3s ease',
                  minHeight: '180px'
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-4">
                    <div 
                      className="rounded-3 p-3"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                    </div>
                    <Badge 
                      className="px-3 py-2"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '10px'
                      }}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <h3 
                    className="mb-2"
                    style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: '800',
                      color: stat.color
                    }}
                  >
                    {stat.value}
                  </h3>
                  
                  <p 
                    className="mb-0"
                    style={{ 
                      fontSize: '1rem', 
                      color: COLORS.darkText,
                      fontWeight: '600'
                    }}
                  >
                    {stat.title}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Featured Sweets - Wider layout on large screens */}
          <Col xxl={9} lg={8}>
            <Card 
              className="border-0 mb-4"
              style={{
                ...glassStyle,
                borderRadius: '20px'
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 
                      className="mb-1"
                      style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '800',
                        color: COLORS.darkText
                      }}
                    >
                      <FaFire className="me-2" color={COLORS.coral} />
                      Featured Sweets
                    </h3>
                    <p className="mb-0" style={{ color: '#666', fontSize: '0.9rem' }}>
                      Most popular picks this week
                    </p>
                  </div>
                  <Button 
                    variant="outline-primary"
                    href="/"
                    className="px-4 py-2 rounded-pill"
                    style={{
                      borderColor: COLORS.emeraldGreen,
                      color: COLORS.emeraldGreen,
                      fontWeight: '700'
                    }}
                  >
                    View All ({sweets.length})
                  </Button>
                </div>
                
                {/* Adjusted grid for wider screens */}
                <Row xs={1} md={2} xl={3} xxl={4} className="g-4">
                  {sweets.slice(0, 8).map((sweet) => (
                    <Col key={sweet._id}>
                      <SweetDashboardCard 
                        sweet={sweet}
                        onPurchase={handlePurchaseClick}
                        onRestock={handleRestock}
                        isAdmin={isAdmin()}
                      />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Recent Activity & Inventory Status */}
            <Row className="g-4">
              <Col xxl={8}>
                <Card 
                  className="border-0 h-100"
                  style={{
                    ...glassStyle,
                    borderRadius: '20px'
                  }}
                >
                  <Card.Body className="p-4">
                    <h3 
                      className="mb-4"
                      style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '800',
                        color: COLORS.darkText
                      }}
                    >
                      <FaHistory className="me-2" color={COLORS.emeraldGreen} />
                      Recent Activity
                    </h3>
                    
                    <div className="d-flex flex-column gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {userPurchases.map((purchase) => (
                        <div 
                          key={purchase.id}
                          className="d-flex align-items-center p-3 rounded-3"
                          style={{
                            backgroundColor: COLORS.lightGray,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div 
                            className="rounded-circle p-3 me-3 flex-shrink-0"
                            style={{
                              backgroundColor: `${COLORS.emeraldGreen}20`,
                              width: '50px',
                              height: '50px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>{purchase.image}</span>
                          </div>
                          
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0" style={{ fontWeight: '700' }}>
                                {purchase.name}
                              </h6>
                              <span style={{ fontWeight: '700', color: COLORS.emeraldGreen }}>
                                ₹{(purchase.price * purchase.quantity).toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <span className="me-3" style={{ fontSize: '0.85rem', color: '#666' }}>
                                  {purchase.quantity} item{purchase.quantity > 1 ? 's' : ''}
                                </span>
                                <Badge 
                                  className="px-2 py-1"
                                  style={{
                                    backgroundColor: purchase.status === 'Delivered' ? '#28a74520' : `${COLORS.primaryAccent}20`,
                                    color: purchase.status === 'Delivered' ? '#28a745' : COLORS.primaryAccent,
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    borderRadius: '6px'
                                  }}
                                >
                                  {purchase.status}
                                </Badge>
                              </div>
                              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                {purchase.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xxl={4}>
                <Card 
                  className="border-0 h-100"
                  style={{
                    ...glassStyle,
                    borderRadius: '20px'
                  }}
                >
                  <Card.Body className="p-4">
                    <h3 
                      className="mb-4"
                      style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '800',
                        color: COLORS.darkText
                      }}
                    >
                      📊 Inventory Health
                    </h3>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Stock Level</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.emeraldGreen }}>
                          {Math.round((stats.inStock / stats.totalSweets) * 100)}%
                        </span>
                      </div>
                      <ProgressBar 
                        now={(stats.inStock / stats.totalSweets) * 100} 
                        style={{ 
                          height: '8px',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.emeraldGreen }}>
                          {stats.inStock}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>In Stock</div>
                      </div>
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.coral }}>
                          {stats.outOfStock}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Out of Stock</div>
                      </div>
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.primaryAccent }}>
                          {sweets.filter(s => s.quantity < 10 && s.quantity > 0).length}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Low Stock</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary"
                      className="w-100 py-2 rounded-pill"
                      style={{
                        borderColor: COLORS.emeraldGreen,
                        color: COLORS.emeraldGreen,
                        fontWeight: '700'
                      }}
                      href="/inventory"
                    >
                      View Full Inventory
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Sidebar - Adjusted for wider screens */}
          <Col xxl={3} lg={4}>
            {/* Quick Stats */}
            <Card 
              className="border-0 mb-4"
              style={{
                ...glassStyle,
                borderRadius: '20px'
              }}
            >
              <Card.Body className="p-4">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '800',
                    color: COLORS.darkText
                  }}
                >
                  <FaChartLine className="me-2" color={COLORS.emeraldGreen} />
                  Quick Stats
                </h3>
                
                {[
                  { label: 'Inventory Value', value: `₹${stats.totalValue}`, progress: 75, color: COLORS.emeraldGreen },
                  { label: 'Out of Stock', value: stats.outOfStock, progress: 20, color: COLORS.coral },
                  { label: 'Customer Satisfaction', value: '4.8/5', progress: 96, color: COLORS.primaryAccent },
                  { label: 'Order Completion', value: '98%', progress: 98, color: '#28a745' },
                ].map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: item.color }}>{item.value}</span>
                    </div>
                    <ProgressBar 
                      now={item.progress} 
                      style={{ 
                        height: '6px',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                ))}
                
                <Button 
                  variant="primary"
                  className="w-100 py-3 rounded-pill mt-3"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.darkEmerald})`,
                    border: 'none',
                    fontWeight: '700'
                  }}
                  href="/analytics"
                >
                  View Detailed Analytics
                </Button>
              </Card.Body>
            </Card>

            {/* Admin Tools or User Stats */}
            {isAdmin() ? (
              <Card 
                className="border-0"
                style={{
                  ...glassStyle,
                  borderRadius: '20px'
                }}
              >
                <Card.Body className="p-4">
                  <h3 
                    className="mb-4"
                    style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '800',
                      color: COLORS.darkText
                    }}
                  >
                    ⚡ Quick Actions
                  </h3>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success"
                      className="py-3 rounded-3 mb-2"
                      href="/add-sweet"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, #28a745)`,
                        border: 'none',
                        fontWeight: '700'
                      }}
                    >
                      <FaPlus className="me-2" />
                      Add New Sweet
                    </Button>
                    
                    <Button 
                      variant="outline-primary"
                      className="py-3 rounded-3 mb-2"
                      href="/admin"
                      style={{
                        borderColor: COLORS.emeraldGreen,
                        color: COLORS.emeraldGreen,
                        fontWeight: '700'
                      }}
                    >
                      <FaStore className="me-2" />
                      Manage Store
                    </Button>
                    
                    <Button 
                      variant="outline-warning"
                      className="py-3 rounded-3"
                      onClick={() => fetchSweets()}
                      style={{
                        borderColor: COLORS.primaryAccent,
                        color: COLORS.darkText,
                        fontWeight: '700'
                      }}
                    >
                      🔄 Refresh Data
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card 
                className="border-0"
                style={{
                  ...glassStyle,
                  borderRadius: '20px'
                }}
              >
                <Card.Body className="p-4 text-center">
                  <div 
                    className="rounded-circle p-4 mx-auto mb-4"
                    style={{
                      width: '120px',
                      height: '120px',
                      background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.tealLight})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaUsers size={40} color="white" />
                  </div>
                  
                  <h4 
                    className="mb-3"
                    style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '800',
                      color: COLORS.darkText
                    }}
                  >
                    Sweet Rewards
                  </h4>
                  
                  <p style={{ color: '#666', marginBottom: '2rem' }}>
                    You're <strong>{12 - stats.totalPurchases}</strong> purchases away from your next reward!
                  </p>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Progress</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.emeraldGreen }}>
                        {stats.totalPurchases}/12
                      </span>
                    </div>
                    <ProgressBar 
                      now={(stats.totalPurchases / 12) * 100} 
                      style={{ 
                        height: '8px',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  <Button 
                    variant="primary"
                    className="w-100 py-3 rounded-pill"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.tealLight})`,
                      border: 'none',
                      fontWeight: '700'
                    }}
                    href="/rewards"
                  >
                    🎁 View Rewards
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Purchase Modal */}
      <Modal
        show={purchaseModalShow}
        onHide={() => setPurchaseModalShow(false)}
        centered
        size="lg"
        className="border-0"
      >
        <Modal.Body 
          className="p-0 rounded-4 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 128, 128, 0.2)'
          }}
        >
          {selectedSweet && (
            <Row className="g-0">
              <Col md={6} className="p-0">
                <div 
                  className="h-100"
                  style={{
                    backgroundImage: `url(${selectedSweet.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '400px',
                    position: 'relative'
                  }}
                >
                  <div 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background: 'linear-gradient(to right, rgba(0, 128, 128, 0.1), transparent)'
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4">
                    <Badge 
                      className="px-3 py-2"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: COLORS.emeraldGreen,
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        borderRadius: '10px'
                      }}
                    >
                      🏷️ {selectedSweet.category}
                    </Badge>
                  </div>
                </div>
              </Col>
              
              <Col md={6} className="p-5">
                <button
                  onClick={() => setPurchaseModalShow(false)}
                  className="btn-close position-absolute top-3 end-3"
                  style={{ zIndex: 1 }}
                />
                
                <div className="mb-4">
                  <h3 
                    className="mb-3"
                    style={{ 
                      fontSize: '2rem', 
                      fontWeight: '800',
                      color: COLORS.darkText
                    }}
                  >
                    {selectedSweet.name}
                  </h3>
                  
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {selectedSweet.description}
                  </p>
                  
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Price</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '900', color: COLORS.emeraldGreen }}>
                        <FaRupeeSign size={24} className="mb-2" />
                        {selectedSweet.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Available</div>
                      <div 
                        className="px-3 py-2 rounded-3"
                        style={{
                          backgroundColor: selectedSweet.quantity > 0 ? `${COLORS.emeraldGreen}20` : `${COLORS.coral}20`,
                          color: selectedSweet.quantity > 0 ? COLORS.emeraldGreen : COLORS.coral,
                          fontWeight: '700'
                        }}
                      >
                        {selectedSweet.quantity} units
                      </div>
                    </div>
                  </div>
                </div>
                
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                    Select Quantity
                  </Form.Label>
                  <InputGroup className="mb-3">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      className="px-4"
                      style={{ borderColor: COLORS.mediumGray }}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const value = Math.max(1, Math.min(selectedSweet.quantity, parseInt(e.target.value) || 1));
                        setPurchaseQuantity(value);
                      }}
                      min="1"
                      max={selectedSweet.quantity}
                      className="text-center border-0"
                      style={{ fontSize: '1.2rem', fontWeight: '700' }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setPurchaseQuantity(Math.min(selectedSweet.quantity, purchaseQuantity + 1))}
                      className="px-4"
                      style={{ borderColor: COLORS.mediumGray }}
                    >
                      +
                    </Button>
                  </InputGroup>
                </Form.Group>
                
                <div className="border-top pt-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Amount</div>
                      <h2 
                        className="text-success mb-0"
                        style={{ fontWeight: '900' }}
                      >
                        <FaRupeeSign size={20} className="mb-2" />
                        {(selectedSweet.price * purchaseQuantity).toFixed(2)}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success"
                      className="py-3 rounded-3"
                      onClick={handleConfirmPurchase}
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.darkEmerald})`,
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}
                    >
                      <FaShoppingCart className="me-2" />
                      Confirm Purchase
                    </Button>
                    
                    <Button 
                      variant="outline-secondary"
                      className="py-3 rounded-3"
                      onClick={() => setPurchaseModalShow(false)}
                      style={{ fontWeight: '700' }}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardPage;