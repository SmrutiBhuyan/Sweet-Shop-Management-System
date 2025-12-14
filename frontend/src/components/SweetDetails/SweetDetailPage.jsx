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
import { useSweet } from '../../contexts/SweetContext';
import { useAuth } from '../../contexts/AuthContext';
import { sweetAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './SweetDetailPage.css';

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
      const sweetData = result.data.sweet;
      setSweet(sweetData);
      
      // Fetch related sweets from the same category, excluding current sweet
      try {
        const relatedResponse = await sweetAPI.getAllSweets({ 
          category: sweetData.category,
          limit: 10 
        });
        
        // Filter out current sweet and get top 3
        const related = relatedResponse.data.sweets
          .filter(s => s._id !== id)
          .slice(0, 3);
        setRelatedSweets(related);
      } catch (err) {
        console.error('Failed to fetch related sweets:', err);
        // Fallback to empty array if related sweets fetch fails
        setRelatedSweets([]);
      }
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

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(sweet.quantity, parseInt(e.target.value) || 1));
    setPurchaseQuantity(value);
  };

  const decreaseQuantity = () => {
    setPurchaseQuantity(prev => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setPurchaseQuantity(prev => Math.min(sweet.quantity, prev + 1));
  };

  const renderLoading = () => (
    <Container className="sweet-detail-loading text-center mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading sweet details...</span>
      </Spinner>
      <p className="mt-3">Loading delicious details...</p>
    </Container>
  );

  const renderError = () => (
    <Container className="sweet-detail-error mt-5">
      <Alert variant="danger">
        <Alert.Heading>Error Loading Sweet</Alert.Heading>
        <p>{error || 'Sweet not found'}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Alert>
    </Container>
  );

  if (loading) return renderLoading();
  if (error || !sweet) return renderError();

  return (
    <Container className="sweet-detail-container mt-4">
      {/* Back Button */}
      <Button
        variant="outline-secondary"
        onClick={() => navigate(-1)}
        className="back-button mb-4"
      >
        ← Back
      </Button>

      {/* Main Sweet Details */}
      <Row className="main-details-section mb-5">
        <Col lg={6} className="mb-4">
          <Card className="product-image-card shadow-sm">
            <Card.Img
              variant="top"
              src={getImageUrl(sweet.imageUrl)}
              alt={sweet.name}
              className="product-image"
              onError={(e) => handleImageError(e, sweet.imageUrl)}
            />
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="product-info-card shadow-sm h-100">
            <Card.Body>
              <div className="product-header mb-3">
                <div>
                  <h1 className="product-title text-primary">{sweet.name}</h1>
                  <Badge bg="info" className="category-badge fs-6">
                    {sweet.category}
                  </Badge>
                </div>
                <div className="price-stock-section">
                  <h2 className="product-price text-success">₹{sweet.price.toFixed(2)}</h2>
                  <Badge bg={sweet.quantity > 0 ? 'success' : 'danger'} className="stock-badge fs-6">
                    {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </div>
              
              <Card.Text className="product-description mb-4">
                {sweet.description || 'No description available for this sweet.'}
              </Card.Text>
              
              <div className="product-details mb-4">
                <h5>Product Details</h5>
                <div className="detail-item">
                  <span>Category:</span>
                  <span>{sweet.category}</span>
                </div>
                <div className="detail-item">
                  <span>Price:</span>
                  <span className="price-value text-success fw-bold">₹{sweet.price.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span>Stock Status:</span>
                  <span>
                    {sweet.quantity > 0 ? (
                      <Badge bg="success">Available</Badge>
                    ) : (
                      <Badge bg="danger">Out of Stock</Badge>
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Added by:</span>
                  <span>{sweet.createdBy?.username || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <Button
                  variant={sweet.quantity > 0 ? 'success' : 'secondary'}
                  size="lg"
                  disabled={sweet.quantity === 0}
                  onClick={handlePurchaseClick}
                  className="purchase-button"
                >
                  {sweet.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate('/')}
                  className="continue-shopping-button"
                >
                  Continue Shopping
                </Button>
              </div>
              
              <div className="shipping-info mt-4 text-center">
                <small className="text-muted">
                  🚚 Free shipping on orders over ₹500
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Products */}
      <Row className="related-products-section mb-5">
        <Col>
          <h3 className="related-products-title mb-4">You might also like</h3>
          <Row xs={1} md={2} lg={3} className="g-4">
            {relatedSweets.map((relatedSweet) => (
              <Col key={relatedSweet._id}>
                <Card className="related-product-card h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={getImageUrl(relatedSweet.imageUrl)}
                    onError={(e) => handleImageError(e, relatedSweet.imageUrl)}
                    alt={relatedSweet.name}
                    className="related-product-image"
                  />
                  <Card.Body>
                    <Card.Title className="related-product-name">{relatedSweet.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {relatedSweet.category}
                    </Card.Subtitle>
                    <div className="related-product-info">
                      <span className="related-product-price text-success">
                        ₹{relatedSweet.price.toFixed(2)}
                      </span>
                      <Badge bg={relatedSweet.quantity > 0 ? 'success' : 'danger'}>
                        {relatedSweet.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline-primary"
                      className="view-details-button w-100 mt-3"
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
        className="purchase-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase {sweet.name}</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="modal-image-container text-center mb-4">
            <img
              src={getImageUrl(sweet.imageUrl)}
              alt={sweet.name}
              onError={(e) => handleImageError(e, sweet.imageUrl)}
              className="modal-product-image"
            />
          </div>
          
          <Form.Group className="quantity-selector mb-4">
            <Form.Label>Quantity:</Form.Label>
            <InputGroup>
              <Button
                variant="outline-secondary"
                onClick={decreaseQuantity}
                className="quantity-btn"
              >
                -
              </Button>
              <Form.Control
                type="number"
                value={purchaseQuantity}
                onChange={handleQuantityChange}
                min="1"
                max={sweet.quantity}
                className="quantity-input"
              />
              <Button
                variant="outline-secondary"
                onClick={increaseQuantity}
                className="quantity-btn"
              >
                +
              </Button>
            </InputGroup>
            <Form.Text className="quantity-hint text-muted">
              Maximum: {sweet.quantity} units
            </Form.Text>
          </Form.Group>
          
          <div className="total-price text-center">
            <h4 className="total-amount text-success">
              Total: ₹{(sweet.price * purchaseQuantity).toFixed(2)}
            </h4>
            <p className="unit-price text-muted">
              Price per unit: ₹{sweet.price.toFixed(2)}
            </p>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setPurchaseModalShow(false)}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirmPurchase}
            className="confirm-purchase-button"
          >
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SweetDetailPage;