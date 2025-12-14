const express = require('express');
const router = express.Router();
const {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  searchSweets,
  purchaseSweet,
  restockSweet
} = require('../controllers/sweet.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  validate, 
  validateObjectId, 
  validateQueryParams 
} = require('../middleware/validation.middleware');

// Public routes
router.get('/', getAllSweets);
router.get('/search', validateQueryParams, searchSweets);
router.get('/:id', validateObjectId, getSweetById);

// Protected routes (require authentication)
router.post('/:id/purchase', 
  protect, 
  validateObjectId, 
  validate('purchaseSweet'), 
  purchaseSweet
);

// Admin only routes
router.post('/', 
  protect, 
  authorize('admin'), 
  validate('createSweet'), 
  createSweet
);

router.put('/:id', 
  protect, 
  authorize('admin'), 
  validateObjectId, 
  validate('updateSweet'), 
  updateSweet
);

router.delete('/:id', 
  protect, 
  authorize('admin'), 
  validateObjectId, 
  deleteSweet
);

router.post('/:id/restock', 
  protect, 
  authorize('admin'), 
  validateObjectId, 
  validate('restockSweet'), 
  restockSweet
);

module.exports = router;