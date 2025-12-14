import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  Modal,
  Spinner,
  Alert,
  Tab,
  Tabs,
} from 'react-bootstrap';
import { useSweet } from '../contexts/SweetContext';
import { sweetAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const { sweets, loading, error, fetchSweets } = useSweet();
  
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('sweets');
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [restockModalShow, setRestockModalShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [stats, setStats] = useState({
    totalSweets: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  // Fetch sweets and mock users
  useEffect(() => {
    fetchSweets();
    
    // Mock user data - in real app, this would come from API
    const mockUsers = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', joined: '2024-01-01' },
      { id: 2, username: 'john_doe', email: 'john@example.com', role: 'customer', joined: '2024-01-05' },
      { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'customer', joined: '2024-01-10' },
      { id: 4, username: 'sweet_lover', email: 'lover@example.com', role: 'customer', joined: '2024-01-12' },
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
      
      setStats({
        totalSweets,
        totalValue: parseFloat(totalValue.toFixed(2)),
        lowStock,
        outOfStock,
      });
    }
  }, [sweets]);

  // Handle delete sweet
  const handleDeleteClick = (sweet) => {
    setSelectedItem(sweet);
    setDeleteModalShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await sweetAPI.deleteSweet(selectedItem._id);
      toast.success(`${selectedItem.name} deleted successfully!`);
      setDeleteModalShow(false);
      fetchSweets(); // Refresh list
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
      toast.success(`${selectedItem.name} restocked with ${restockQuantity} units!`);
      setRestockModalShow(false);
      fetchSweets(); // Refresh list
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  // Handle user role change
  const handleUserRoleChange = async (userId, newRole) => {
    // In a real app, this would call an API
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    toast.success(`User role updated to ${newRole}`);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading admin panel...</span>
        </Spinner>
        <p className="mt-3">Loading admin panel...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>Error Loading Admin Panel</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 bg-dark text-white shadow">
            <Card.Body className="p-4">
              <h1 className="display-6 mb-3">👑 Admin Dashboard</h1>
              <p className="lead mb-0">
                Manage your sweet shop, users, and inventory from one place.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-primary display-4">
                {stats.totalSweets}
              </Card.Title>
              <Card.Text>Total Products</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-warning display-4">
                ₹{stats.totalValue}
              </Card.Title>
              <Card.Text>Inventory Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-danger display-4">
                {stats.lowStock}
              </Card.Title>
              <Card.Text>Low Stock Items</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-info display-4">
                {users.length}
              </Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="sweets" title="Sweets Management">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">All Sweets</h5>
                <Button variant="success" href="/add-sweet" size="sm">
                  ➕ Add New Sweet
                </Button>
              </div>
              
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sweets.map((sweet) => (
                      <tr key={sweet._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={sweet.imageUrl}
                              alt={sweet.name}
                              style={{ width: '40px', height: '40px', borderRadius: '4px', marginRight: '10px' }}
                            />
                            <div>
                              <strong>{sweet.name}</strong>
                              <div className="small text-muted">
                                {sweet.description?.substring(0, 40)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{sweet.category}</Badge>
                        </td>
                        <td>
                          <strong className="text-success">
                            ₹{sweet.price.toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          {sweet.quantity}
                        </td>
                        <td>
                          {sweet.quantity === 0 ? (
                            <Badge bg="danger">Out of Stock</Badge>
                          ) : sweet.quantity <= 10 ? (
                            <Badge bg="warning">Low Stock</Badge>
                          ) : (
                            <Badge bg="success">In Stock</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              href={`/edit-sweet/${sweet._id}`}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleRestockClick(sweet)}
                            >
                              Restock
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteClick(sweet)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
            
            <Tab eventKey="users" title="User Management">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">All Users</h5>
                <Badge bg="info">{users.length} users</Badge>
              </div>
              
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.username}</strong>
                          {user.role === 'admin' && (
                            <Badge bg="warning" className="ms-2">Admin</Badge>
                          )}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            style={{ width: '120px' }}
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </Form.Select>
                        </td>
                        <td>{user.joined}</td>
                        <td>
                          <Button size="sm" variant="outline-info">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
            
            <Tab eventKey="analytics" title="Analytics">
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title>Stock Status</Card.Title>
                      <div className="d-flex justify-content-around text-center">
                        <div>
                          <div className="display-6 text-success">
                            {sweets.filter(s => s.quantity > 10).length}
                          </div>
                          <div className="small">Good Stock</div>
                        </div>
                        <div>
                          <div className="display-6 text-warning">
                            {sweets.filter(s => s.quantity > 0 && s.quantity <= 10).length}
                          </div>
                          <div className="small">Low Stock</div>
                        </div>
                        <div>
                          <div className="display-6 text-danger">
                            {sweets.filter(s => s.quantity === 0).length}
                          </div>
                          <div className="small">Out of Stock</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Top Categories</Card.Title>
                      <div className="d-flex flex-column gap-2">
                        {Object.entries(
                          sweets.reduce((acc, sweet) => {
                            acc[sweet.category] = (acc[sweet.category] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([category, count]) => (
                          <div key={category} className="d-flex justify-content-between">
                            <span>{category}</span>
                            <Badge bg="primary">{count} items</Badge>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Delete Modal */}
      <Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="text-center">
              <p className="lead">
                Are you sure you want to delete <strong>{selectedItem.name}</strong>?
              </p>
              <p className="text-danger">
                This action cannot be undone. All data for this sweet will be permanently removed.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalShow(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Restock Modal */}
      <Modal show={restockModalShow} onHide={() => setRestockModalShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Restock {selectedItem?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Form.Group>
                <Form.Label>Quantity to add:</Form.Label>
                <Form.Control
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="1000"
                />
                <Form.Text className="text-muted">
                  Current stock: {selectedItem.quantity} units
                </Form.Text>
              </Form.Group>
              
              <div className="mt-3 text-center">
                <h5>
                  New total: {selectedItem.quantity + restockQuantity} units
                </h5>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRestockModalShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmRestock}>
            Confirm Restock
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;