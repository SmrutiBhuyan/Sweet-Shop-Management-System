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
  Spinner,
  Alert,
  Modal,
  InputGroup,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useSweet } from '../contexts/SweetContext';
import { toast } from 'react-toastify';
import { sweetAPI } from '../services/api';

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
  });

  // Fetch sweets and calculate stats
  useEffect(() => {
    fetchSweets();
    
    // Simulate fetching user purchase history
    // In a real app, this would come from an API
    const mockPurchases = [
      { id: 1, name: 'Gulab Jamun', quantity: 2, price: 25.00, date: '2024-01-15' },
      { id: 2, name: 'Rasgulla', quantity: 1, price: 30.00, date: '2024-01-14' },
      { id: 3, name: 'Jalebi', quantity: 3, price: 20.00, date: '2024-01-12' },
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
      
      setStats({
        totalSweets,
        inStock,
        outOfStock,
        totalValue: parseFloat(totalValue.toFixed(2)),
      });
    }
  }, [sweets]);

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
        date: new Date().toISOString().split('T')[0],
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
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </Spinner>
        <p className="mt-3">Loading your sweet dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container>
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 bg-primary text-white shadow">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <h1 className="display-6 mb-3">
                    Welcome back, {user?.username}! 🎉
                  </h1>
                  <p className="lead mb-0">
                    {isAdmin() 
                      ? 'Manage your sweet shop inventory and view sales analytics.'
                      : 'Browse our sweet collection and track your purchases.'
                    }
                  </p>
                </Col>
                <Col md={4} className="text-end">
                  <div className="display-1">🍭</div>
                </Col>
              </Row>
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
              <Card.Text>Total Sweets</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-success display-4">
                {stats.inStock}
              </Card.Title>
              <Card.Text>In Stock</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-danger display-4">
                {stats.outOfStock}
              </Card.Title>
              <Card.Text>Out of Stock</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="text-center shadow-sm h-100">
            <Card.Body>
              <Card.Title className="text-warning display-4">
                ${stats.totalValue}
              </Card.Title>
              <Card.Text>Total Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions for Admin */}
      {isAdmin() && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Quick Actions</Card.Title>
                <div className="d-flex flex-wrap gap-2">
                  <Button variant="success" href="/add-sweet">
                    ➕ Add New Sweet
                  </Button>
                  <Button variant="info" href="/admin">
                    ⚙️ Admin Panel
                  </Button>
                  <Button variant="warning" onClick={() => fetchSweets()}>
                    🔄 Refresh Inventory
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sweets Table */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Available Sweets</Card.Title>
                <Badge bg="primary" pill>
                  {sweets.length} items
                </Badge>
              </div>
              
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sweets.slice(0, 5).map((sweet) => (
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
                                {sweet.description?.substring(0, 30)}...
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
                          <Badge bg={sweet.quantity > 0 ? 'success' : 'danger'}>
                            {sweet.quantity} units
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handlePurchaseClick(sweet)}
                              disabled={sweet.quantity === 0}
                            >
                              Buy
                            </Button>
                            
                            {isAdmin() && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  href={`/edit-sweet/${sweet._id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleRestock(sweet._id, sweet.name)}
                                >
                                  Restock
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {sweets.length > 5 && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" href="/">
                    View All Sweets ({sweets.length})
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Purchase History */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Your Recent Purchases</Card.Title>
              
              {userPurchases.length > 0 ? (
                <Table hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{purchase.date}</td>
                        <td>{purchase.name}</td>
                        <td>{purchase.quantity}</td>
                        <td>₹{purchase.price.toFixed(2)}</td>
                        <td>
                          <strong>
                            ₹{(purchase.price * purchase.quantity).toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  You haven't made any purchases yet. Start shopping now!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Purchase Modal */}
      <Modal
        show={purchaseModalShow}
        onHide={() => setPurchaseModalShow(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase {selectedSweet?.name}</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {selectedSweet && (
            <>
              <div className="text-center mb-4">
                <img
                  src={selectedSweet.imageUrl}
                  alt={selectedSweet.name}
                  style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              
              <div className="mb-3">
                <p>
                  <strong>Category:</strong> {selectedSweet.category}
                </p>
                <p>
                  <strong>Price per unit:</strong> ₹{selectedSweet.price.toFixed(2)}
                </p>
                <p>
                  <strong>Available stock:</strong> {selectedSweet.quantity} units
                </p>
              </div>
              
              <Form.Group>
                <Form.Label>Quantity to purchase:</Form.Label>
                <InputGroup>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
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
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setPurchaseQuantity(Math.min(selectedSweet.quantity, purchaseQuantity + 1))}
                  >
                    +
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Maximum: {selectedSweet.quantity} units
                </Form.Text>
              </Form.Group>
              
              <div className="mt-4 text-center">
                <h4 className="text-success">
                  Total: ₹{(selectedSweet.price * purchaseQuantity).toFixed(2)}
                </h4>
              </div>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPurchaseModalShow(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmPurchase}>
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DashboardPage;