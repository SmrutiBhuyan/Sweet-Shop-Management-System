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
import { useSweet } from '../../contexts/SweetContext';
import { sweetAPI } from '../../services/api';
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
import AdminSweetCard from './AdminSweetCard';
import { 
  COLORS, 
  mockUsers, 
  statsConfig, 
  calculateStats, 
  filterSweets, 
  getCategories, 
  getCategoryDistribution,
  getStockStatus,
  generateMockChange,
  formatPrice,
  getQuantityStatus 
} from './adminUtils';
import './adminPanel.css';

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
  const [stats, setStats] = useState(calculateStats([], []));

  // Fetch data
  useEffect(() => {
    fetchSweets();
    setUsers(mockUsers);
  }, [fetchSweets]);

  // Update stats
  useEffect(() => {
    setStats(calculateStats(sweets, users));
  }, [sweets, users]);

  // Filtered sweets
  const filteredSweets = filterSweets(sweets, searchTerm, selectedCategory);
  
  // Categories
  const categories = getCategories(sweets);
  
  // Category distribution
  const categoryDistribution = getCategoryDistribution(sweets);
  
  // Stock status
  const stockStatus = getStockStatus(sweets);

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

  // Loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="text-center">
          <Spinner 
            animation="border" 
            role="status" 
            className="loading-spinner"
          />
          <p className="mt-3" style={{ color: COLORS.darkText, fontSize: '1.2rem' }}>
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="loading-screen">
        <Alert 
          variant="danger" 
          className="glass-effect rounded-modal"
          style={{ maxWidth: '500px' }}
        >
          <Alert.Heading>Error Loading Admin Panel</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="gradient-light" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        {/* Header */}
        <Row className="mb-5">
          <Col>
            <div className="admin-header p-5 rounded-4 shadow-lg position-relative overflow-hidden">
              <Row className="align-items-center position-relative">
                <Col md={8}>
                  <div className="mb-3">
                    <Badge className="status-badge mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
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
                      className="px-4 py-2 rounded-pill-btn"
                      style={{ fontWeight: '700' }}
                      href="/add-sweet"
                    >
                      <FaPlus className="me-2" />
                      Add New Sweet
                    </Button>
                    
                    <Button 
                      variant="outline-light"
                      className="px-4 py-2 rounded-pill-btn"
                      style={{ fontWeight: '700' }}
                      onClick={() => fetchSweets()}
                    >
                      🔄 Refresh Data
                    </Button>
                  </div>
                </Col>
                
                <Col md={4} className="text-center d-none d-md-block">
                  <div className="admin-avatar rounded-circle p-4 mx-auto">
                    <span style={{ fontSize: '4rem' }}>👑</span>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          {statsConfig.map((stat, index) => {
            const statValue = index === 0 ? stats.totalSweets :
                            index === 1 ? formatPrice(stats.totalValue) :
                            index === 2 ? stats.lowStock :
                            index === 3 ? stats.totalUsers :
                            stats.totalCategories;
            
            return (
              <Col xl={true} lg={6} md={6} key={index} className="col-xxl">
                <Card className="border-0 h-100 stats-card rounded-card glass-effect">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="stats-icon-container" style={{ backgroundColor: stat.bg }}>
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
                        {generateMockChange(statValue, Object.keys(stats)[index])}
                      </Badge>
                    </div>
                    
                    <h3 className="mb-1 price-display" style={{ color: stat.color }}>
                      {statValue}
                    </h3>
                    
                    <p className="mb-0" style={{ fontSize: '0.9rem', color: COLORS.darkText, fontWeight: '600' }}>
                      {stat.title}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Main Content with Tabs */}
        <Card className="border-0 mb-4 rounded-modal glass-effect">
          <Card.Body className="p-0">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="admin-tabs p-3 border-bottom"
              fill
            >
              {/* Sweets Management Tab */}
              <Tab eventKey="sweets" title={<span><FaShoppingBag className="me-2" />Sweets Management</span>}>
                <div className="p-3">
                  <Row className="g-3 mb-4">
                    <Col md={8}>
                      <div className="input-group search-input-group">
                        <span className="input-group-text border-0">
                          <FaSearch color={COLORS.emeraldGreen} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-0"
                          placeholder="Search sweets by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </Col>
                    
                    <Col md={4}>
                      <div className="input-group search-input-group">
                        <span className="input-group-text border-0">
                          <FaFilter color={COLORS.emeraldGreen} />
                        </span>
                        <select
                          className="form-select border-0"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="all">All Categories</option>
                          {categories.filter(cat => cat !== 'all').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {filteredSweets.map((sweet) => (
                      <Col key={sweet._id}>
                        <AdminSweetCard 
                          sweet={sweet}
                          onDelete={handleDeleteClick}
                          onRestock={handleRestockClick}
                        />
                      </Col>
                    ))}
                  </Row>
                  
                  {filteredSweets.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">
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
              
              {/* User Management Tab */}
              <Tab eventKey="users" title={<span><FaUsers className="me-2" />User Management</span>}>
                <div className="p-3">
                  <Row className="g-4">
                    {users.map((user) => (
                      <Col md={6} lg={4} key={user.id}>
                        <Card className="border-0 h-100 rounded-card glass-effect">
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className="user-avatar">
                                  <span style={{ fontSize: '1.5rem' }}>{user.avatar}</span>
                                </div>
                                <div>
                                  <h6 className="mb-0" style={{ fontWeight: '700' }}>
                                    {user.username}
                                    {user.role === 'admin' && (
                                      <Badge bg="warning" className="ms-2" style={{ fontSize: '0.7rem' }}>
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
                                <Dropdown.Toggle variant="light" size="sm" className="border-0 p-1">
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
                                  <Dropdown.Item className="text-danger">Delete User</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                            
                            <div className="mb-3">
                              <Badge bg={user.status === 'active' ? 'success' : 'secondary'} className="me-2" style={{ fontSize: '0.75rem' }}>
                                {user.status === 'active' ? <><FaCheckCircle className="me-1" /> Active</> : 'Inactive'}
                              </Badge>
                              <Badge bg={user.role === 'admin' ? 'warning' : 'info'} style={{ fontSize: '0.75rem' }}>
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
                                <Button variant="outline-primary" size="sm" className="flex-grow-1" style={{ borderColor: COLORS.emeraldGreen, color: COLORS.emeraldGreen, fontSize: '0.85rem' }}>
                                  View Orders
                                </Button>
                                <Button variant="outline-secondary" size="sm" className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
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
              
              {/* Analytics Tab */}
              <Tab eventKey="analytics" title={<span><FaChartPie className="me-2" />Analytics</span>}>
                <div className="p-3">
                  <Row className="g-4">
                    <Col lg={6}>
                      <Card className="border-0 h-100 rounded-card glass-effect">
                        <Card.Body>
                          <h5 className="mb-4" style={{ fontWeight: '700' }}>📊 Stock Status Analysis</h5>
                          
                          {['inStock', 'lowStock', 'outOfStock'].map((status, idx) => {
                            const statusConfig = {
                              inStock: { label: 'In Stock', value: stockStatus.inStock, color: '#28a745', variant: 'success' },
                              lowStock: { label: 'Low Stock', value: stats.lowStock, color: COLORS.primaryAccent, variant: 'warning' },
                              outOfStock: { label: 'Out of Stock', value: stats.outOfStock, color: COLORS.coral, variant: 'danger' }
                            };
                            
                            const config = statusConfig[status];
                            const percentage = stats.totalSweets > 0 ? (config.value / stats.totalSweets) * 100 : 0;
                            
                            return (
                              <div className="mb-4" key={status}>
                                <div className="d-flex justify-content-between mb-2">
                                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{config.label}</span>
                                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: config.color }}>
                                    {config.value}
                                  </span>
                                </div>
                                <ProgressBar 
                                  now={percentage} 
                                  variant={config.variant}
                                  className="custom-progress"
                                />
                              </div>
                            );
                          })}
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col lg={6}>
                      <Card className="border-0 h-100 rounded-card glass-effect">
                        <Card.Body>
                          <h5 className="mb-4" style={{ fontWeight: '700' }}>🏷️ Category Distribution</h5>
                          
                          <div className="d-flex flex-column gap-3">
                            {categoryDistribution.map(([category, count]) => (
                              <div key={category} className="d-flex align-items-center gap-3">
                                <div style={{ minWidth: '120px' }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{category}</span>
                                </div>
                                <div className="flex-grow-1">
                                  <ProgressBar 
                                    now={(count / stats.totalSweets) * 100} 
                                    className="custom-progress"
                                    style={{ backgroundColor: COLORS.lightGray }}
                                  />
                                </div>
                                <div>
                                  <Badge bg="primary" style={{ fontSize: '0.75rem', minWidth: '40px' }}>
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
        <Card className="quick-actions-panel border-0">
          <Card.Body className="p-4">
            <h5 className="mb-3" style={{ fontWeight: '700', color: COLORS.emeraldGreen }}>
              ⚡ Quick Actions
            </h5>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="success" className="px-4 py-2 rounded-pill-btn" href="/add-sweet" style={{ fontWeight: '700' }}>
                <FaPlus className="me-2" /> Add New Sweet
              </Button>
              
              <Button variant="outline-primary" className="px-4 py-2 rounded-pill-btn" href="/dashboard" style={{ fontWeight: '700' }}>
                <FaDatabase className="me-2" /> View Dashboard
              </Button>
              
              <Button variant="outline-warning" className="px-4 py-2 rounded-pill-btn" onClick={() => fetchSweets()} style={{ fontWeight: '700' }}>
                🔄 Refresh All Data
              </Button>
              
              <Button variant="outline-secondary" className="px-4 py-2 rounded-pill-btn" style={{ fontWeight: '700' }}>
                Export Data
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Delete Modal */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)} centered className="border-0">
        <Modal.Body className="p-0 rounded-modal modal-glass overflow-hidden">
          {selectedItem && (
            <div className="p-5 text-center">
              <div className="gradient-danger rounded-circle p-4 mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
                <FaExclamationTriangle size={40} color="white" />
              </div>
              
              <h3 className="mb-3" style={{ fontWeight: '800', color: COLORS.darkText }}>Confirm Deletion</h3>
              
              <p className="lead mb-4" style={{ color: COLORS.darkText }}>
                Are you sure you want to delete <strong>{selectedItem.name}</strong>?
              </p>
              
              <p className="text-danger mb-4" style={{ fontSize: '0.9rem' }}>
                ⚠️ This action cannot be undone. All data for this sweet will be permanently removed.
              </p>
              
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="outline-secondary" className="px-4 py-2 rounded-pill-btn" style={{ fontWeight: '700' }} onClick={() => setDeleteModalShow(false)}>
                  Cancel
                </Button>
                <Button variant="danger" className="px-4 py-2 rounded-pill-btn gradient-danger border-0" style={{ fontWeight: '700' }} onClick={handleConfirmDelete}>
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Restock Modal */}
      <Modal show={restockModalShow} onHide={() => setRestockModalShow(false)} centered className="border-0">
        <Modal.Body className="p-0 rounded-modal modal-glass overflow-hidden">
          {selectedItem && (
            <div className="p-5">
              <div className="text-center mb-4">
                <div className="gradient-success rounded-circle p-3 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                  <FaBox size={30} color="white" />
                </div>
                
                <h3 className="mb-2" style={{ fontWeight: '800', color: COLORS.darkText }}>Restock {selectedItem.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Add new stock to this sweet item</p>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '600', fontSize: '1rem' }}>Quantity to Add</Form.Label>
                <div className="input-group">
                  <Button variant="outline-secondary" onClick={() => setRestockQuantity(Math.max(1, restockQuantity - 1))} className="px-3">-</Button>
                  <Form.Control type="number" value={restockQuantity} onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" max="1000" className="text-center border-0" style={{ fontSize: '1.1rem', fontWeight: '700' }} />
                  <Button variant="outline-secondary" onClick={() => setRestockQuantity(Math.min(1000, restockQuantity + 1))} className="px-3">+</Button>
                </div>
                <Form.Text className="text-muted mt-2" style={{ display: 'block' }}>
                  Current stock: <strong>{selectedItem.quantity}</strong> units
                </Form.Text>
              </Form.Group>
              
              <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: `${COLORS.emeraldGreen}10` }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>New Total Stock</div>
                    <h3 className="mb-0" style={{ color: COLORS.emeraldGreen, fontWeight: '800' }}>{selectedItem.quantity + restockQuantity} units</h3>
                  </div>
                  <div style={{ fontSize: '3rem' }}>📦</div>
                </div>
              </div>
              
              <div className="d-flex gap-3">
                <Button variant="outline-secondary" className="flex-grow-1 py-2 rounded-pill-btn" style={{ fontWeight: '700' }} onClick={() => setRestockModalShow(false)}>
                  Cancel
                </Button>
                <Button variant="success" className="flex-grow-1 py-2 rounded-pill-btn gradient-success border-0" style={{ fontWeight: '700' }} onClick={handleConfirmRestock}>
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