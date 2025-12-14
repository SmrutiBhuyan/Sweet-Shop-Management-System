import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaTrash, FaEdit, FaBox, FaRupeeSign } from 'react-icons/fa';
import { COLORS, getQuantityStatus } from './adminUtils';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';
import './AdminPanel.css';

const AdminSweetCard = ({ sweet, onDelete, onRestock }) => {
  const [isHovered, setIsHovered] = useState(false);
  const quantityStatus = getQuantityStatus(sweet.quantity);

  return (
    <Card
      className="border-0 h-100 rounded-card glass-effect"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 15px 35px rgba(0, 128, 128, 0.15)' 
          : '0 5px 15px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="card-image-container position-relative">
        <img
          src={getImageUrl(sweet.imageUrl)}
          alt={sweet.name}
          className="card-image"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          onError={(e) => handleImageError(e, sweet.imageUrl)}
        />
        
        <div className="position-absolute top-2 start-2">
          <Badge bg={quantityStatus.variant} className="status-badge">
            {quantityStatus.text}
          </Badge>
        </div>
        
        <div className="position-absolute top-2 end-2">
          <Badge bg="info" className="category-badge">
            {sweet.category}
          </Badge>
        </div>
      </div>

      <Card.Body className="p-3 d-flex flex-column">
        <Card.Title className="mb-2" style={{ fontSize: '1.1rem', fontWeight: '700', color: COLORS.darkText, lineHeight: '1.3' }}>
          {sweet.name}
        </Card.Title>
        
        <Card.Text className="flex-grow-1 mb-3" style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
          {sweet.description?.substring(0, 80)}...
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="price-display">
              <FaRupeeSign size={14} className="mb-1" />
              {sweet.price.toFixed(2)}
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
              style={{ borderColor: COLORS.emeraldGreen, color: COLORS.emeraldGreen, fontWeight: '600', borderRadius: '8px' }}
            >
              <FaEdit size={12} className="me-1" />
              Edit
            </Button>
            
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onRestock(sweet)}
              style={{ borderColor: '#28a745', color: '#28a745', fontWeight: '600', borderRadius: '8px' }}
            >
              <FaBox size={12} className="me-1" />
              Restock
            </Button>
            
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(sweet)}
              style={{ borderColor: COLORS.coral, color: COLORS.coral, fontWeight: '600', borderRadius: '8px' }}
            >
              <FaTrash size={12} className="me-1" />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdminSweetCard;