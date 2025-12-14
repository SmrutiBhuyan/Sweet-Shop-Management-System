const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protectRoute } = require('../middleware/auth');

// All purchase routes require authentication
router.use(protectRoute);

// Get user's purchase history
router.get('/', purchaseController.getUserPurchases);

// Get user's purchase statistics
router.get('/stats', purchaseController.getUserPurchaseStats);

module.exports = router;

