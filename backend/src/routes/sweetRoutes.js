const express = require('express');
const router = express.Router();
const sweetController = require('../controllers/sweetController');
const { protectRoute, isAdmin } = require('../middleware/auth');
const { 
  validateSweet, 
  handleValidationErrors 
} = require('../middleware/validation');
const upload = require('../middleware/upload');

// Protected routes (require authentication)
router.use(protectRoute); // All routes below this require authentication

// Protected routes (available to all authenticated users)
router.get('/', sweetController.getAllSweets);
router.get('/search', sweetController.searchSweets);
router.get('/:id', sweetController.getSweetById);
router.post('/:id/purchase', sweetController.purchaseSweet);

// Admin-only routes
router.use(isAdmin); // All routes below this require admin role

router.post('/', 
  upload.single('image'), // Handle single image file upload
  validateSweet, 
  handleValidationErrors, 
  sweetController.createSweet
);

router.put('/:id', 
  upload.single('image'), // Handle single image file upload
  validateSweet, 
  handleValidationErrors, 
  sweetController.updateSweet
);

router.delete('/:id', sweetController.deleteSweet);
router.post('/:id/restock', sweetController.restockSweet);

module.exports = router;