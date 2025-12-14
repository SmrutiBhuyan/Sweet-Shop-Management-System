import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaBox, FaRupeeSign, FaStar, FaHeart, FaCrown } from 'react-icons/fa';
import { COLORS, getStockBadge, getPopularityStatus } from './dashboardUtils';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './DashboardPage.css';

const SweetDashboardCard = ({ sweet, onPurchase, onRestock, isAdmin }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const stockBadge = getStockBadge(sweet.quantity);
  const popularityStatus = getPopularityStatus(sweet.quantity);
  const isPremium = sweet.price > 40;

  return (
    <div 
      className="sweet-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="sweet-card glass-effect">
        {/* Image Container */}
        <div className="card-image-container position-relative">
          <img
            src={getImageUrl(sweet.imageUrl)}
            alt={sweet.name}
            className="card-image"
            style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
            onError={(e) => handleImageError(e, sweet.imageUrl)}
          />
          
          <div className="image-gradient-overlay position-absolute w-100 h-100 top-0 start-0" />
          
          {/* Top Badges */}
          <div className="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between">
            <Badge className="top-badge" style={{ backgroundColor: stockBadge.bgColor, color: stockBadge.color }}>
              {stockBadge.text}
            </Badge>
            
            {isPremium && (
              <Badge className="top-badge d-flex align-items-center" style={{ backgroundColor: 'rgba(255, 107, 139, 0.9)' }}>
                <FaCrown size={10} className="me-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Like Button */}
          <button
            className="like-button position-absolute top-3 end-3"
            onClick={() => setIsLiked(!isLiked)}
            aria-label={isLiked ? 'Unlike sweet' : 'Like sweet'}
          >
            <FaHeart size={14} color={isLiked ? COLORS.coral : '#666'} />
          </button>
        </div>

        <Card.Body className="p-4 d-flex flex-column">
          <div className="mb-3">
            <Badge className="category-badge mb-2">
              {sweet.category}
            </Badge>
            
            <Card.Title className="mb-2" style={{ fontSize: '1.3rem', fontWeight: '800', color: COLORS.darkText, lineHeight: '1.3' }}>
              {sweet.name}
            </Card.Title>
            
            <div className="d-flex align-items-center mb-2">
              <FaStar size={14} color={COLORS.gold} className="me-1" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: COLORS.darkText }}>4.8</span>
              <span className="mx-2" style={{ color: COLORS.mediumGray }}>•</span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {popularityStatus.emoji} {popularityStatus.text}
              </span>
            </div>
          </div>
          
          <Card.Text className="flex-grow-1" style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
            {sweet.description?.substring(0, 100)}...
          </Card.Text>
          
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="price-display">
                  <FaRupeeSign size={16} className="mb-2" />
                  {sweet.price.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>per piece</div>
              </div>
              
              <div className="text-end">
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{sweet.createdBy?.username || 'Sweet Shop'}</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Added 2 days ago</div>
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
                  aria-label={`Restock ${sweet.name}`}
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

export default SweetDashboardCard;