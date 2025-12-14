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
import { useAuth } from '../../contexts/AuthContext';
import { useSweet } from '../../contexts/SweetContext';
import { toast } from 'react-toastify';
import { sweetAPI, purchaseAPI } from '../../services/api';
import { 
  FaShoppingCart, 
  FaPlus, 
  FaChartLine, 
  FaHistory, 
  FaFire,
  FaShoppingBag,
  FaStore,
  FaRupeeSign,
  FaUsers
} from 'react-icons/fa';
import SweetDashboardCard from './SweetDashboardCard';
import { 
  COLORS, 
  statsConfig, 
  quickStatsConfig,
  calculateStats, 
  generateMockChange, 
  formatPrice, 
  getFeaturedSweets,
  validatePurchaseQuantity,
  calculatePurchaseTotal,
  getUserGreeting,
  getAdminTools,
  getQuickStatsProgress,
  calculateRewardsProgress
} from './dashboardUtils';
import { getImageUrl } from '../../utils/imageUtils';
import './dashboardPage.css';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { sweets, loading, error, fetchSweets, purchaseSweet } = useSweet();
  
  const [purchaseModalShow, setPurchaseModalShow] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [userPurchases, setUserPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [stats, setStats] = useState(calculateStats([], []));

  // Fetch sweets on component mount
  useEffect(() => {
    fetchSweets();
    fetchUserPurchases();
  }, [fetchSweets]);

  // Fetch user purchases from API
  const fetchUserPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const response = await purchaseAPI.getUserPurchases({ limit: 10 });
      // Transform API response to match component format
      const formattedPurchases = response.data.purchases.map((purchase, index) => ({
        id: purchase._id,
        name: purchase.sweet?.name || 'Unknown',
        quantity: purchase.quantity,
        price: purchase.price,
        date: formatPurchaseDate(purchase.purchaseDate),
        status: purchase.status === 'completed' ? 'Delivered' : 'Processing',
        image: getSweetEmoji(purchase.sweet?.category)
      }));
      setUserPurchases(formattedPurchases);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      // Use empty array if fetch fails
      setUserPurchases([]);
    } finally {
      setPurchasesLoading(false);
    }
  };

  // Format purchase date
  const formatPurchaseDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get emoji based on sweet category
  const getSweetEmoji = (category) => {
    const emojiMap = {
      'Chocolate': '🍫',
      'Candy': '🍬',
      'Pastry': '🥐',
      'Cookie': '🍪',
      'Cake': '🎂',
      'Ice Cream': '🍨',
      'Traditional': '🍮',
      'Sugar-Free': '🍯',
      'Other': '🍭'
    };
    return emojiMap[category] || '🎉';
  };

  // Update stats when sweets or purchases change
  useEffect(() => {
    setStats(calculateStats(sweets, userPurchases));
  }, [sweets, userPurchases]);

  // Get featured sweets
  const featuredSweets = getFeaturedSweets(sweets, 8);
  
  // Get greeting message
  const greeting = getUserGreeting(user?.username || 'Guest', isAdmin());
  
  // Get admin tools
  const adminTools = getAdminTools();
  
  // Get quick stats progress
  const quickStatsProgress = getQuickStatsProgress(stats);
  
  // Calculate rewards progress
  const rewardsProgress = calculateRewardsProgress(stats.totalPurchases);

  // Handle purchase click
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
      fetchSweets();
      // Refresh purchase history
      fetchUserPurchases();
      
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
      fetchSweets();
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (value) => {
    if (!selectedSweet) return;
    const validQuantity = validatePurchaseQuantity(value, selectedSweet.quantity);
    setPurchaseQuantity(validQuantity);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="dashboard-loading d-flex justify-content-center align-items-center">
        <div className="text-center">
          <Spinner animation="border" role="status" className="loading-spinner" />
          <p className="mt-4 text-white" style={{ fontSize: '1.2rem', fontWeight: '500' }}>
            Preparing your sweet dashboard...
          </p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-loading d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="glass-effect rounded-modal" style={{ maxWidth: '500px' }}>
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="gradient-light-bg" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <Container fluid="xxl">
        {/* Header Section */}
        <Row className="mb-5">
          <Col>
            <div className="dashboard-header p-5 shadow-lg gradient-emerald">
              <div className="header-pattern position-absolute top-0 end-0 w-50 h-100" />
              
              <Row className="align-items-center position-relative">
                <Col lg={8} xl={9} xxl={10}>
                  <div className="mb-4">
                    <Badge className="top-badge mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      {isAdmin() ? '🎮 Admin Dashboard' : '👋 Welcome Back'}
                    </Badge>
                    
                    <h1 className="display-5 fw-bold mb-3">
                      {greeting}
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
                    <Button variant="light" className="px-4 py-2 rounded-pill-btn" href="/" style={{ fontWeight: '700' }}>
                      <FaShoppingBag className="me-2" />
                      Shop Now
                    </Button>
                    
                    {isAdmin() && (
                      <Button variant="outline-light" className="px-4 py-2 rounded-pill-btn" href="/add-sweet" style={{ fontWeight: '700' }}>
                        <FaPlus className="me-2" />
                        Add Sweet
                      </Button>
                    )}
                  </div>
                </Col>
                
                <Col lg={4} xl={3} xxl={2} className="text-center d-none d-lg-block">
                  <div className="user-avatar p-4 mx-auto">
                    <span style={{ fontSize: '6rem' }}>🍭</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Stats Grid */}
        <Row className="g-4 mb-5 wide-screen-grid stats-grid">
          {statsConfig.map((stat, index) => {
            const statValue = stats[stat.key];
            const displayValue = stat.key === 'revenue' ? formatPrice(statValue) : statValue;
            
            return (
              <Col key={index} className="col-xxl">
                <Card className="rounded-card glass-effect h-100 stats-card">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start justify-content-between mb-4">
                      <div className="stats-icon-container" style={{ backgroundColor: stat.bg }}>
                        <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                      </div>
                      <Badge className="stats-badge" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                        {generateMockChange(statValue, stat.key)}
                      </Badge>
                    </div>
                    
                    <h3 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: '800', color: stat.color }}>
                      {displayValue}
                    </h3>
                    
                    <p className="mb-0" style={{ fontSize: '1rem', color: COLORS.darkText, fontWeight: '600' }}>
                      {stat.title}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Featured Sweets */}
          <Col xxl={9} lg={8}>
            <Card className="rounded-card glass-effect mb-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="mb-1" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
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
                    className="px-4 py-2 rounded-pill-btn"
                    style={{ borderColor: COLORS.emeraldGreen, color: COLORS.emeraldGreen, fontWeight: '700' }}
                  >
                    View All ({sweets.length})
                  </Button>
                </div>
                
                <Row xs={1} md={2} xl={3} xxl={4} className="g-4">
                  {featuredSweets.map((sweet) => (
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
                <Card className="rounded-card glass-effect h-100">
                  <Card.Body className="p-4">
                    <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
                      <FaHistory className="me-2" color={COLORS.emeraldGreen} />
                      Recent Activity
                    </h3>
                    
                    <div className="d-flex flex-column gap-3 custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {userPurchases.map((purchase) => (
                        <div key={purchase.id} className="activity-item">
                          <div className="d-flex align-items-center">
                            <div className="activity-icon me-3">
                              <span style={{ fontSize: '1.5rem' }}>{purchase.image}</span>
                            </div>
                            
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="mb-0" style={{ fontWeight: '700' }}>{purchase.name}</h6>
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
                                    className="status-badge"
                                    style={{
                                      backgroundColor: purchase.status === 'Delivered' ? '#28a74520' : `${COLORS.primaryAccent}20`,
                                      color: purchase.status === 'Delivered' ? '#28a745' : COLORS.primaryAccent
                                    }}
                                  >
                                    {purchase.status}
                                  </Badge>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>{purchase.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xxl={4}>
                <Card className="rounded-card glass-effect h-100">
                  <Card.Body className="p-4">
                    <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
                      📊 Inventory Health
                    </h3>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Stock Level</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.emeraldGreen }}>
                          {Math.round((stats.inStock / stats.totalSweets) * 100)}%
                        </span>
                      </div>
                      <ProgressBar now={(stats.inStock / stats.totalSweets) * 100} className="custom-progress" />
                    </div>
                    
                    <div className="d-flex justify-content-between mb-3">
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.emeraldGreen }}>{stats.inStock}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>In Stock</div>
                      </div>
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.coral }}>{stats.outOfStock}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Out of Stock</div>
                      </div>
                      <div className="text-center">
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.primaryAccent }}>{stats.lowStock}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Low Stock</div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline-primary"
                      className="w-100 py-2 rounded-pill-btn"
                      style={{ borderColor: COLORS.emeraldGreen, color: COLORS.emeraldGreen, fontWeight: '700' }}
                      href="/inventory"
                    >
                      View Full Inventory
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Sidebar */}
          <Col xxl={3} lg={4}>
            {/* Quick Stats */}
            <Card className="rounded-card glass-effect mb-4">
              <Card.Body className="p-4">
                <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
                  <FaChartLine className="me-2" color={COLORS.emeraldGreen} />
                  Quick Stats
                </h3>
                
                {quickStatsConfig.map((item, index) => {
                  const value = item.key ? stats[item.key] : item.value;
                  const displayValue = item.format ? item.format(value) : value;
                  const progress = item.key ? quickStatsProgress[item.key] : item.value;
                  
                  return (
                    <div key={index} className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.label}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: item.color }}>
                          {displayValue}
                        </span>
                      </div>
                      <ProgressBar now={progress} className="small-progress" />
                    </div>
                  );
                })}
                
                <Button 
                  variant="primary"
                  className="w-100 py-3 rounded-pill-btn mt-3 gradient-success"
                  style={{ border: 'none', fontWeight: '700' }}
                  href="/analytics"
                >
                  View Detailed Analytics
                </Button>
              </Card.Body>
            </Card>

            {/* Admin Tools or User Stats */}
            {isAdmin() ? (
              <Card className="rounded-card glass-effect">
                <Card.Body className="p-4">
                  <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
                    ⚡ Quick Actions
                  </h3>
                  
                  <div className="d-grid gap-2">
                    {adminTools.map((tool, index) => (
                      <Button 
                        key={index}
                        variant={tool.variant}
                        className="py-3 rounded-3"
                        href={tool.href}
                        onClick={tool.action === 'refresh' ? () => fetchSweets() : undefined}
                        style={{
                          background: tool.gradient,
                          borderColor: tool.borderColor,
                          color: tool.variant.includes('outline') ? tool.borderColor : 'white',
                          fontWeight: '700',
                          border: tool.borderColor ? `1px solid ${tool.borderColor}` : 'none'
                        }}
                      >
                        {tool.icon === 'FaPlus' && <FaPlus className="me-2" />}
                        {tool.icon === 'FaStore' && <FaStore className="me-2" />}
                        {tool.icon === '🔄' && '🔄 '}
                        {tool.label}
                      </Button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="rounded-card glass-effect">
                <Card.Body className="p-4 text-center">
                  <div className="reward-avatar p-4 mx-auto mb-4">
                    <FaUsers size={40} color="white" />
                  </div>
                  
                  <h4 className="mb-3" style={{ fontSize: '1.5rem', fontWeight: '800', color: COLORS.darkText }}>
                    Sweet Rewards
                  </h4>
                  
                  <p style={{ color: '#666', marginBottom: '2rem' }}>
                    You're <strong>{rewardsProgress.remaining}</strong> purchases away from your next reward!
                  </p>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>Progress</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.emeraldGreen }}>
                        {stats.totalPurchases}/12
                      </span>
                    </div>
                    <ProgressBar now={rewardsProgress.progress} className="custom-progress" />
                  </div>
                  
                  <Button 
                    variant="primary"
                    className="w-100 py-3 rounded-pill-btn gradient-success"
                    style={{ border: 'none', fontWeight: '700' }}
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
      <Modal show={purchaseModalShow} onHide={() => setPurchaseModalShow(false)} centered size="lg" className="border-0">
        <Modal.Body className="rounded-modal modal-glass overflow-hidden p-0">
          {selectedSweet && (
            <Row className="g-0">
              <Col md={6} className="p-0">
                <div 
                  className="modal-image"
                  style={{ 
                    backgroundImage: `url(${getImageUrl(selectedSweet.imageUrl)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="modal-gradient-overlay position-absolute top-0 start-0 w-100 h-100" />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4">
                    <Badge className="category-badge px-3 py-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: COLORS.emeraldGreen }}>
                      🏷️ {selectedSweet.category}
                    </Badge>
                  </div>
                </div>
              </Col>
              
              <Col md={6} className="p-5">
                <button onClick={() => setPurchaseModalShow(false)} className="btn-close position-absolute top-3 end-3" style={{ zIndex: 1 }} />
                
                <div className="mb-4">
                  <h3 className="mb-3" style={{ fontSize: '2rem', fontWeight: '800', color: COLORS.darkText }}>
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
                      <div className="px-3 py-2 rounded-3" style={{ backgroundColor: `${COLORS.emeraldGreen}20`, color: COLORS.emeraldGreen, fontWeight: '700' }}>
                        {selectedSweet.quantity} units
                      </div>
                    </div>
                  </div>
                </div>
                
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: '700', fontSize: '1.1rem' }}>Select Quantity</Form.Label>
                  <InputGroup className="mb-3 quantity-input-group">
                    <Button variant="outline-secondary" onClick={() => handleQuantityChange(purchaseQuantity - 1)} className="px-4 quantity-control">-</Button>
                    <Form.Control
                      type="number"
                      value={purchaseQuantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max={selectedSweet.quantity}
                      className="text-center"
                    />
                    <Button variant="outline-secondary" onClick={() => handleQuantityChange(purchaseQuantity + 1)} className="px-4 quantity-control">+</Button>
                  </InputGroup>
                </Form.Group>
                
                <div className="border-top pt-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Amount</div>
                      <h2 className="text-success mb-0" style={{ fontWeight: '900' }}>
                        <FaRupeeSign size={20} className="mb-2" />
                        {calculatePurchaseTotal(selectedSweet.price, purchaseQuantity)}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success"
                      className="py-3 rounded-3 gradient-success"
                      onClick={handleConfirmPurchase}
                      style={{ border: 'none', fontWeight: '700', fontSize: '1.1rem' }}
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