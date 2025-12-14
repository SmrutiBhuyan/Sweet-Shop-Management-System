const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protectRoute } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  handleValidationErrors 
} = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/register', 
  validateUserRegistration, 
  handleValidationErrors, 
  authController.registerUser
);

router.post('/login', authController.loginUser);

// Protected route (requires authentication)
router.get('/me', protectRoute, authController.getCurrentUser);

module.exports = router;