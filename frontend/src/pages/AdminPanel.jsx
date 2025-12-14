import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Modal,
  Spinner,
  Alert,
  Tab,
  Tabs,
  ProgressBar,
  Dropdown,
} from 'react-bootstrap';
import { useSweet } from '../contexts/SweetContext';
import { sweetAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  FaTrash, 
  FaEdit, 
  FaBox, 
  FaUsers, 
  FaChartPie, 
  FaFilter, 
  FaSearch, 
  FaCrown,
  FaShoppingBag,
  FaRupeeSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEllipsisV,
  FaPlus,
  FaDatabase
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

// Admin Sweet Card Component
const AdminSweetCard = ({ sweet, onDelete, onRestock, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="border-0 h-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...glassStyle,
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 15px 35px rgba(0, 128, 128, 0.15)' 
          : '0 5px 15px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Sweet Image */}
      <div 
        className="position-relative"
        style={{ 
          height: '160px', 
          overflow: 'hidden',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}
      >
        <img
          src={sweet.imageUrl}
          alt={sweet.name}
          className="w-100 h-100"
          style={{
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        
        {/* Stock Status Badge */}
        <div className="position-absolute top-2 start-2">
          <Badge 
            bg={sweet.quantity === 0 ? 'danger' : sweet.quantity <= 10 ? 'warning' : 'success'}
            className="px-3 py-2"
            style={{ 
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '8px'
            }}
          >
            {sweet.quantity === 0 ? 'Out of Stock' : `${sweet.quantity} units`}
          </Badge>
        </div>
        
        {/* Category Badge */}
        <div className="position-absolute top-2 end-2">
          <Badge 
            bg="info"
            className="px-3 py-2"
            style={{ 
              fontSize: '0.75rem',
              fontWeight: '700',
              borderRadius: '8px'
            }}
          >
            {sweet.category}
          </Badge>
        </div>
      </div>

      <Card.Body className="p-3 d-flex flex-column">
        <Card.Title 
          className="mb-2"
          style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700',
            color: COLORS.darkText,
            lineHeight: '1.3'
          }}
        >
          {sweet.name}
        </Card.Title>
        
        <Card.Text 
          className="flex-grow-1 mb-3"
          style={{ 
            fontSize: '0.85rem', 
            color: '#666',
            lineHeight: '1.5'
          }}
        >
          {sweet.description?.substring(0, 80)}...
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800',
                color: COLORS.emeraldGreen,
                lineHeight: '1'
              }}>
                <FaRupeeSign size={14} className="mb-1" />
                {sweet.price.toFixed(2)}
              </div>
            </div>
            <div className="text-end">
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                Added by {sweet.createdBy?.username || 'Admin'}
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="flex-grow-1"
              href={`/edit-sweet/${sweet._id}`}
              style={{
                borderColor: COLORS.emeraldGreen,
                color: COLORS.emeraldGreen,
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              <FaEdit size={12} className="me-1" />
              Edit
            </Button>
            
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onRestock(sweet)}
              style={{
                borderColor: '#28a745',
                color: '#28a745',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              <FaBox size={12} className="me-1" />
              Restock
            </Button>
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(sweet)}
              style={{
                borderColor: COLORS.coral,
                color: COLORS.coral,
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              <FaTrash size={12} className="me-1" />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const AdminPanel = () => {
  const { sweets, loading, error, fetchSweets } = useSweet();
  
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('sweets');
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [restockModalShow, setRestockModalShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    totalSweets: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    totalUsers: 0,
    totalCategories: 0,
  });

  // Fetch sweets and mock users
  useEffect(() => {
    fetchSweets();
    
    // Mock user data
    const mockUsers = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', joined: '2024-01-01', status: 'active', avatar: '👑' },
      { id: 2, username: 'john_doe', email: 'john@example.com', role: 'customer', joined: '2024-01-05', status: 'active', avatar: '👨' },
      { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'customer', joined: '2024-01-10', status: 'active', avatar: '👩' },
      { id: 4, username: 'sweet_lover', email: 'lover@example.com', role: 'customer', joined: '2024-01-12', status: 'inactive', avatar: '🍭' },
      { id: 5, username: 'choco_fan', email: 'choco@example.com', role: 'customer', joined: '2024-01-15', status: 'active', avatar: '🍫' },
    ];
    setUsers(mockUsers);
  }, [fetchSweets]);

  // Calculate stats
  useEffect(() => {
    if (sweets.length > 0) {
      const totalSweets = sweets.length;
      const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
      const lowStock = sweets.filter(s => s.quantity > 0 && s.quantity <= 10).length;
      const outOfStock = sweets.filter(s => s.quantity === 0).length;
      const categories = [...new Set(sweets.map(sweet => sweet.category))];
      
      setStats({
        totalSweets,
        totalValue: parseFloat(totalValue.toFixed(2)),
        lowStock,
        outOfStock,
        totalUsers: users.length,
        totalCategories: categories.length,
      });
    }
  }, [sweets, users.length]);

  // Filter sweets based on search and category
  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = searchTerm === '' || 
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      sweet.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(sweets.map(sweet => sweet.category))];

  // Handle delete sweet
  const handleDeleteClick = (sweet) => {
    setSelectedItem(sweet);
    setDeleteModalShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await sweetAPI.deleteSweet(selectedItem._id);
      toast.success(`${selectedItem.name} deleted successfully! 🗑️`);
      setDeleteModalShow(false);
      fetchSweets();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  // Handle restock
  const handleRestockClick = (sweet) => {
    setSelectedItem(sweet);
    setRestockQuantity(10);
    setRestockModalShow(true);
  };

  const handleConfirmRestock = async () => {
    if (!selectedItem) return;
    
    try {
      await sweetAPI.restockSweet(selectedItem._id, restockQuantity);
      toast.success(`${selectedItem.name} restocked with ${restockQuantity} units! 📦`);
      setRestockModalShow(false);
      fetchSweets();
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  // Handle user role change
  const handleUserRoleChange = async (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    toast.success(`User role updated to ${newRole}`);
  };

  // Handle user status change
  const handleUserStatusChange = async (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`User status updated to ${newStatus}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div className="text-center">
          <Spinner 
            animation="border" 
            role="status" 
            style={{ 
              color: COLORS.emeraldGreen, 
              width: '3rem', 
              height: '3rem',
              borderWidth: '3px'
            }}
          />
          <p className="mt-3" style={{ color: COLORS.darkText, fontSize: '1.2rem' }}>
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Alert 
          variant="danger" 
          style={{ 
            ...glassStyle,
            maxWidth: '500px',
            borderRadius: '20px',
            border: 'none'
          }}
        >
          <Alert.Heading>Error Loading Admin Panel</Alert.Heading>
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
      <Container>
        <style>
          {`
            @media (min-width: 1400px) {
              .container, .container-lg, .container-md, .container-sm, .container-xl, .container-xxl {
                max-width: 1500px;
              }
            }
            
            .admin-tabs .nav-link {
              font-weight: 600;
              border: none;
              color: ${COLORS.darkText};
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              margin: 0 0.25rem;
            }
            
            .admin-tabs .nav-link.active {
              background: ${COLORS.emeraldGreen};
              color: ${COLORS.lightText};
            }
            
            .admin-tabs .nav-link:hover:not(.active) {
              background: ${COLORS.lightGray};
            }
            
            .stats-card {
              transition: transform 0.3s ease;
            }
            
            .stats-card:hover {
              transform: translateY(-5px);
            }
          `}
        </style>

        {/* Header */}
        <Row className="mb-5">
          <Col>
            <div 
              className="p-5 rounded-4 shadow-lg position-relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.emeraldGreen} 0%, ${COLORS.darkEmerald} 100%)`,
                color: COLORS.lightText
              }}
            >
              <Row className="align-items-center position-relative">
                <Col md={8}>
                  <div className="mb-3">
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
                      🏆 ADMINISTRATOR DASHBOARD
                    </Badge>
                    
                    <h1 className="display-5 fw-bold mb-3">
                      Sweet Shop Control Center
                      <span className="d-block" style={{ fontSize: '2rem', opacity: 0.9 }}>
                        Manage Your Sweet Empire
                      </span>
                    </h1>
                    
                    <p className="lead mb-0" style={{ opacity: 0.9 }}>
                      Full control over inventory, users, and analytics
                    </p>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <Button 
                      variant="light"
                      className="px-4 py-2 rounded-pill"
                      style={{ fontWeight: '700' }}
                      href="/add-sweet"
                    >
                      <FaPlus className="me-2" />
                      Add New Sweet
                    </Button>
                    
                    <Button 
                      variant="outline-light"
                      className="px-4 py-2 rounded-pill"
                      style={{ fontWeight: '700' }}
                      onClick={() => fetchSweets()}
                    >
                      🔄 Refresh Data
                    </Button>
                  </div>
                </Col>
                
                <Col md={4} className="text-center d-none d-md-block">
                  <div 
                    className="rounded-circle p-4 mx-auto"
                    style={{
                      width: '150px',
                      height: '150px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(4px)',
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '4rem' }}>👑</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          {[
            { 
              title: 'Total Products', 
              value: stats.totalSweets, 
              icon: '🍬',
              color: COLORS.emeraldGreen,
              change: '+8',
              bg: `${COLORS.emeraldGreen}15`
            },
            { 
              title: 'Inventory Value', 
              value: `₹${stats.totalValue}`, 
              icon: '💰',
              color: COLORS.primaryAccent,
              change: '+₹124',
              bg: `${COLORS.primaryAccent}15`
            },
            { 
              title: 'Low Stock Alert', 
              value: stats.lowStock, 
              icon: '⚠️',
              color: COLORS.coral,
              change: `+${Math.floor(stats.lowStock / 10)}`,
              bg: `${COLORS.coral}15`
            },
            { 
              title: 'Total Users', 
              value: stats.totalUsers, 
              icon: '👥',
              color: COLORS.lavender,
              change: '+3',
              bg: `${COLORS.lavender}15`
            },
            { 
              title: 'Categories', 
              value: stats.totalCategories, 
              icon: '🏷️',
              color: COLORS.tealLight,
              change: '+1',
              bg: `${COLORS.tealLight}15`
            }
          ].map((stat, index) => (
            <Col xl={true} lg={6} md={6} key={index} className="col-xxl">
              <Card 
                className="border-0 h-100 stats-card"
                style={{
                  ...glassStyle,
                  borderRadius: '16px',
                  minHeight: '150px'
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div 
                      className="rounded-3 p-2"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                    </div>
                    <Badge 
                      className="px-2 py-1"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        borderRadius: '8px'
                      }}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <h3 
                    className="mb-1"
                    style={{ 
                      fontSize: '2rem', 
                      fontWeight: '800',
                      color: stat.color
                    }}
                  >
                    {stat.value}
                  </h3>
                  
                  <p 
                    className="mb-0"
                    style={{ 
                      fontSize: '0.9rem', 
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

        {/* Main Content with Tabs */}
        <Card 
          className="border-0 mb-4"
          style={{
            ...glassStyle,
            borderRadius: '20px'
          }}
        >
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="admin-tabs p-3 border-bottom"
              fill
            >
              <Tab 
                eventKey="sweets" 
                title={
                  <span>
                    <FaShoppingBag className="me-2" />
                    Sweets Management
                  </span>
                }
              >
                <div className="p-3">
                  {/* Filters and Search */}
                  <Row className="g-3 mb-4">
                    <Col md={8}>
                      <div className="input-group">
                        <span 
                          className="input-group-text border-0"
                          style={{ backgroundColor: COLORS.lightGray }}
                        >
                          <FaSearch color={COLORS.emeraldGreen} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-0"
                          placeholder="Search sweets by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ backgroundColor: COLORS.lightGray }}
                        />
                      </div>
                    </Col>
                    
                    <Col md={4}>
                      <div className="input-group">
                        <span 
                          className="input-group-text border-0"
                          style={{ backgroundColor: COLORS.lightGray }}
                        >
                          <FaFilter color={COLORS.emeraldGreen} />
                        </span>
                        <select
                          className="form-select border-0"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          style={{ backgroundColor: COLORS.lightGray }}
                        >
                          <option value="all">All Categories</option>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Col>
                  </Row>
                  
                  {/* Sweets Grid */}
                  <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {filteredSweets.map((sweet) => (
                      <Col key={sweet._id}>
                        <AdminSweetCard 
                          sweet={sweet}
                          onDelete={handleDeleteClick}
                          onRestock={handleRestockClick}
                          onEdit={() => window.location.href = `/edit-sweet/${sweet._id}`}
                        />
                      </Col>
                    ))}
                  </Row>
                  
                  {filteredSweets.length === 0 && (
                    <div className="text-center py-5">
                      <div 
                        className="rounded-circle p-4 mx-auto mb-3"
                        style={{
                          width: '100px',
                          height: '100px',
                          backgroundColor: `${COLORS.lightGray}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ fontSize: '2.5rem' }}>🍰</span>
                      </div>
                      <h5 style={{ color: COLORS.darkText, fontWeight: '600' }}>
                        No Sweets Found
                      </h5>
                      <p style={{ color: '#666' }}>
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'Try adjusting your search filters'
                          : 'Add some sweets to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </Tab>
              
              <Tab 
                eventKey="users" 
                title={
                  <span>
                    <FaUsers className="me-2" />
                    User Management
                  </span>
                }
              >
                <div className="p-3">
                  <Row className="g-4">
                    {users.map((user) => (
                      <Col md={6} lg={4} key={user.id}>
                        <Card 
                          className="border-0 h-100"
                          style={{
                            ...glassStyle,
                            borderRadius: '16px'
                          }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div 
                                  className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                                  style={{
                                    backgroundColor: `${COLORS.emeraldGreen}20`,
                                    width: '60px',
                                    height: '60px'
                                  }}
                                >
                                  <span style={{ fontSize: '1.5rem' }}>{user.avatar}</span>
                                </div>
                                <div>
                                  <h6 className="mb-0" style={{ fontWeight: '700' }}>
                                    {user.username}
                                    {user.role === 'admin' && (
                                      <Badge 
                                        bg="warning" 
                                        className="ms-2"
                                        style={{ fontSize: '0.7rem' }}
                                      >
                                        <FaCrown size={10} /> Admin
                                      </Badge>
                                    )}
                                  </h6>
                                  <p className="mb-0" style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              
                              <Dropdown>
                                <Dropdown.Toggle 
                                  variant="light" 
                                  size="sm"
                                  className="border-0 p-1"
                                >
                                  <FaEllipsisV />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleUserRoleChange(user.id, user.role === 'admin' ? 'customer' : 'admin')}>
                                    {user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}>
                                    {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item className="text-danger">
                                    Delete User
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                            
                            <div className="mb-3">
                              <Badge 
                                bg={user.status === 'active' ? 'success' : 'secondary'}
                                className="me-2"
                                style={{ fontSize: '0.75rem' }}
                              >
                                {user.status === 'active' ? (
                                  <><FaCheckCircle className="me-1" /> Active</>
                                ) : 'Inactive'}
                              </Badge>
                              <Badge 
                                bg={user.role === 'admin' ? 'warning' : 'info'}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {user.role}
                              </Badge>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              <div className="d-flex justify-content-between mb-1">
                                <span>Joined:</span>
                                <span style={{ fontWeight: '600' }}>{user.joined}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-top">
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="flex-grow-1"
                                  style={{
                                    borderColor: COLORS.emeraldGreen,
                                    color: COLORS.emeraldGreen,
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  View Orders
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="flex-grow-1"
                                  style={{ fontSize: '0.85rem' }}
                                >
                                  Send Email
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Tab>
              
              <Tab 
                eventKey="analytics" 
                title={
                  <span>
                    <FaChartPie className="me-2" />
                    Analytics
                  </span>
                }
              >
                <div className="p-3">
                  <Row className="g-4">
                    <Col lg={6}>
                      <Card 
                        className="border-0 h-100"
                        style={{
                          ...glassStyle,
                          borderRadius: '16px'
                        }}
                      >
                        <Card.Body>
                          <h5 className="mb-4" style={{ fontWeight: '700' }}>
                            📊 Stock Status Analysis
                          </h5>
                          
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>In Stock</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#28a745' }}>
                                {sweets.filter(s => s.quantity > 10).length}
                              </span>
                            </div>
                            <ProgressBar 
                              now={(sweets.filter(s => s.quantity > 10).length / stats.totalSweets) * 100} 
                              variant="success"
                              style={{ height: '8px', borderRadius: '4px' }}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Low Stock</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.primaryAccent }}>
                                {stats.lowStock}
                              </span>
                            </div>
                            <ProgressBar 
                              now={(stats.lowStock / stats.totalSweets) * 100} 
                              variant="warning"
                              style={{ height: '8px', borderRadius: '4px' }}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Out of Stock</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: COLORS.coral }}>
                                {stats.outOfStock}
                              </span>
                            </div>
                            <ProgressBar 
                              now={(stats.outOfStock / stats.totalSweets) * 100} 
                              variant="danger"
                              style={{ height: '8px', borderRadius: '4px' }}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card 
                        className="border-0 h-100"
                        style={{
                          ...glassStyle,
                          borderRadius: '16px'
                        }}
                      >
                        <Card.Body>
                          <h5 className="mb-4" style={{ fontWeight: '700' }}>
                            🏷️ Category Distribution
                          </h5>
                          
                          <div className="d-flex flex-column gap-3">
                            {Object.entries(
                              sweets.reduce((acc, sweet) => {
                                acc[sweet.category] = (acc[sweet.category] || 0) + 1;
                                return acc;
                              }, {})
                            )
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 8)
                            .map(([category, count]) => (
                              <div key={category} className="d-flex align-items-center gap-3">
                                <div style={{ minWidth: '120px' }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                    {category}
                                  </span>
                                </div>
                                <div className="flex-grow-1">
                                  <ProgressBar 
                                    now={(count / stats.totalSweets) * 100} 
                                    style={{ 
                                      height: '8px', 
                                      borderRadius: '4px',
                                      backgroundColor: COLORS.lightGray
                                    }}
                                  />
                                </div>
                                <div>
                                  <Badge 
                                    bg="primary"
                                    style={{ 
                                      fontSize: '0.75rem',
                                      minWidth: '40px'
                                    }}
                                  >
                                    {count}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Quick Actions Footer */}
        <Card 
          className="border-0"
          style={{
            ...glassStyle,
            borderRadius: '20px',
            backgroundColor: `${COLORS.emeraldGreen}08`,
            border: `1px solid ${COLORS.emeraldGreen}20`
          }}
        >
          <Card.Body className="p-4">
            <h5 className="mb-3" style={{ fontWeight: '700', color: COLORS.emeraldGreen }}>
              ⚡ Quick Actions
            </h5>
            <div className="d-flex flex-wrap gap-2">
              <Button 
                variant="success"
                className="px-4 py-2 rounded-pill"
                href="/add-sweet"
                style={{ fontWeight: '700' }}
              >
                <FaPlus className="me-2" />
                Add New Sweet
              </Button>
              
              <Button 
                variant="outline-primary"
                className="px-4 py-2 rounded-pill"
                href="/dashboard"
                style={{ fontWeight: '700' }}
              >
                <FaDatabase className="me-2" />
                View Dashboard
              </Button>
              
              <Button 
                variant="outline-warning"
                className="px-4 py-2 rounded-pill"
                onClick={() => fetchSweets()}
                style={{ fontWeight: '700' }}
              >
                🔄 Refresh All Data
              </Button>
              
              <Button 
                variant="outline-secondary"
                className="px-4 py-2 rounded-pill"
                style={{ fontWeight: '700' }}
              >
                Export Data
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Delete Modal */}
      <Modal
        show={deleteModalShow}
        onHide={() => setDeleteModalShow(false)}
        centered
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
          {selectedItem && (
            <div className="p-5 text-center">
              <div 
                className="rounded-circle p-4 mx-auto mb-4"
                style={{
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(135deg, ${COLORS.coral}, #ff8fa3)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaExclamationTriangle size={40} color="white" />
              </div>
              
              <h3 className="mb-3" style={{ fontWeight: '800', color: COLORS.darkText }}>
                Confirm Deletion
              </h3>
              
              <p className="lead mb-4" style={{ color: COLORS.darkText }}>
                Are you sure you want to delete <strong>{selectedItem.name}</strong>?
              </p>
              
              <p className="text-danger mb-4" style={{ fontSize: '0.9rem' }}>
                ⚠️ This action cannot be undone. All data for this sweet will be permanently removed.
              </p>
              
              <div className="d-flex gap-3 justify-content-center">
                <Button 
                  variant="outline-secondary"
                  className="px-4 py-2 rounded-pill"
                  style={{ fontWeight: '700' }}
                  onClick={() => setDeleteModalShow(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger"
                  className="px-4 py-2 rounded-pill"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.coral}, #ff8fa3)`,
                    border: 'none',
                    fontWeight: '700'
                  }}
                  onClick={handleConfirmDelete}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Restock Modal */}
      <Modal
        show={restockModalShow}
        onHide={() => setRestockModalShow(false)}
        centered
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
          {selectedItem && (
            <div className="p-5">
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle p-3 mx-auto mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.tealLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FaBox size={30} color="white" />
                </div>
                
                <h3 className="mb-2" style={{ fontWeight: '800', color: COLORS.darkText }}>
                  Restock {selectedItem.name}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Add new stock to this sweet item
                </p>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', fontSize: '1rem' }}>
                  Quantity to Add
                </Form.Label>
                <div className="input-group">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setRestockQuantity(Math.max(1, restockQuantity - 1))}
                    className="px-3"
                  >
                    -
                  </Button>
                  <Form.Control
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="1000"
                    className="text-center border-0"
                    style={{ fontSize: '1.1rem', fontWeight: '700' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setRestockQuantity(Math.min(1000, restockQuantity + 1))}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
                <Form.Text className="text-muted mt-2" style={{ display: 'block' }}>
                  Current stock: <strong>{selectedItem.quantity}</strong> units
                </Form.Text>
              </Form.Group>
              
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: `${COLORS.emeraldGreen}10` }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>New Total Stock</div>
                    <h3 className="mb-0" style={{ color: COLORS.emeraldGreen, fontWeight: '800' }}>
                      {selectedItem.quantity + restockQuantity} units
                    </h3>
                  </div>
                  <div style={{ fontSize: '3rem' }}>📦</div>
                </div>
              </div>
              
              <div className="d-flex gap-3">
                <Button 
                  variant="outline-secondary"
                  className="flex-grow-1 py-2 rounded-pill"
                  style={{ fontWeight: '700' }}
                  onClick={() => setRestockModalShow(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="success"
                  className="flex-grow-1 py-2 rounded-pill"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.emeraldGreen}, ${COLORS.darkEmerald})`,
                    border: 'none',
                    fontWeight: '700'
                  }}
                  onClick={handleConfirmRestock}
                >
                  Confirm Restock
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminPanel;