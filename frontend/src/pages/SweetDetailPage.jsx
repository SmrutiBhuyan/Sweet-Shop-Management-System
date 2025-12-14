import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  InputGroup,
  Form,
} from 'react-bootstrap';
import { useSweet } from '../contexts/SweetContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const SweetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSweetById, purchaseSweet } = useSweet();
  const { user } = useAuth();
  
  const [sweet, setSweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseModalShow, setPurchaseModalShow] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [relatedSweets, setRelatedSweets] = useState([]);

  useEffect(() => {
    fetchSweetDetails();
  }, [id]);

  const fetchSweetDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getSweetById(id);
      setSweet(result.data.sweet);
      
      // In a real app, you would fetch related sweets from API
      // For now, we'll create mock related sweets
      const mockRelated = [
        {
          _id: '1',
          name: 'Kaju Katli',
          category: 'Traditional',
          price: 450.00,
          quantity: 15,
          imageUrl: 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=300&fit=crop',
        },
        {
          _id: '2',
          name: 'Barfi',
          category: 'Traditional',
          price: 35.00,
          quantity: 25,
          imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w-400&h=300&fit=crop',
        },
        {
          _id: '3',
          name: 'Rasmalai',
          category: 'Traditional',
          price: 40.00,
          quantity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
        },
      ];
      setRelatedSweets(mockRelated);
    } catch (err) {
      setError(err.message || 'Failed to load sweet details');
      toast.error('Failed to load sweet details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!user) {
      toast.error('Please login to make a purchase');
      navigate('/login');
      return;
    }
    
    setPurchaseQuantity(1);
    setPurchaseModalShow(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      await purchaseSweet(id, purchaseQuantity);
      toast.success(`Successfully purchased ${purchaseQuantity} ${sweet.name}(s)!`);
      setPurchaseModalShow(false);
      fetchSweetDetails(); // Refresh sweet details
    } catch (err) {
      toast.error(err.message || 'Purchase failed');
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading sweet details...</span>
        </Spinner>
        <p className="mt-3">Loading delicious details...</p>
      </Container>
    );
  }

  if (error || !sweet) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Sweet</Alert.Heading>
          <p>{error || 'Sweet not found'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Back Button */}
      <Button
        variant="outline-secondary"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        ← Back
      </Button>

      {/* Main Sweet Details */}
      <Row className="mb-5">
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Img
              variant="top"
              src={sweet.imageUrl}
              alt={sweet.name}
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="text-primary">{sweet.name}</h1>
                  <Badge bg="info" className="fs-6">
                    {sweet.category}
                  </Badge>
                </div>
                <div className="text-end">
                  <h2 className="text-success">₹{sweet.price.toFixed(2)}</h2>
                  <Badge bg={sweet.quantity > 0 ? 'success' : 'danger'} className="fs-6">
                    {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </div>
              
              <Card.Text className="mb-4">
                {sweet.description || 'No description available for this sweet.'}
              </Card.Text>
              
              <div className="mb-4">
                <h5>Product Details</h5>
                <div className="d-flex justify-content-between border-bottom py-2">
                  <span>Category:</span>
                  <span>{sweet.category}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-2">
                  <span>Price:</span>
                  <span className="text-success fw-bold">₹{sweet.price.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-2">
                  <span>Stock Status:</span>
                  <span>
                    {sweet.quantity > 0 ? (
                      <Badge bg="success">Available</Badge>
                    ) : (
                      <Badge bg="danger">Out of Stock</Badge>
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span>Added by:</span>
                  <span>{sweet.createdBy?.username || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="d-grid gap-3">
                <Button
                  variant={sweet.quantity > 0 ? 'success' : 'secondary'}
                  size="lg"
                  disabled={sweet.quantity === 0}
                  onClick={handlePurchaseClick}
                >
                  {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <small className="text-muted">
                  🚚 Free shipping on orders over ₹500
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Products */}
      <Row className="mb-5">
        <Col>
          <h3 className="mb-4">You might also like</h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {relatedSweets.map((relatedSweet) => (
              <Col key={relatedSweet._id}>
                <Card className="h-100 shadow-sm hover-shadow">
                  <Card.Img
                    variant="top"
                    src={relatedSweet.imageUrl}
                    alt={relatedSweet.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{relatedSweet.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {relatedSweet.category}
                    </Card.Subtitle>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 text-success mb-0">
                        ₹{relatedSweet.price.toFixed(2)}
                      </span>
                      <Badge bg={relatedSweet.quantity > 0 ? 'success' : 'danger'}>
                        {relatedSweet.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline-primary"
                      className="w-100 mt-3"
                      onClick={() => navigate(`/sweets/${relatedSweet._id}`)}
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Purchase Modal */}
      <Modal
        show={purchaseModalShow}
        onHide={() => setPurchaseModalShow(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase {sweet.name}</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="text-center mb-4">
            <img
              src={sweet.imageUrl}
              alt={sweet.name}
              style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
          
          <Form.Group className="mb-4">
            <Form.Label>Quantity:</Form.Label>
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
                  const value = Math.max(1, Math.min(sweet.quantity, parseInt(e.target.value) || 1));
                  setPurchaseQuantity(value);
                }}
                min="1"
                max={sweet.quantity}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setPurchaseQuantity(Math.min(sweet.quantity, purchaseQuantity + 1))}
              >
                +
              </Button>
            </InputGroup>
            <Form.Text className="text-muted">
              Maximum: {sweet.quantity} units
            </Form.Text>
          </Form.Group>
          
          <div className="text-center">
            <h4 className="text-success">
              Total: ₹{(sweet.price * purchaseQuantity).toFixed(2)}
            </h4>
            <p className="text-muted">
              Price per unit: ₹{sweet.price.toFixed(2)}
            </p>
          </div>
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

export default SweetDetailPage;