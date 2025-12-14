const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const { validateEnvironment } = require('./config/environment');

// Load environment variables from .env file
require('dotenv').config();

// Initialize Express application
const app = express();

// Validate environment variables
validateEnvironment();

// Middleware Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
})

// Health check endpoint - always available
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Sweet Shop API is running smoothly',
    timestamp: new Date().toISOString(),
    service: 'sweet-shop-backend'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Sweet Shop Management API',
    version: '1.0.0',
    description: 'API for managing sweet shop inventory and orders',
    endpoints: {
      health: 'GET /health',
      sweets: 'GET /api/sweets',
      'sweet-details': 'GET /api/sweets/:id',
      'create-sweet': 'POST /api/sweets',
      'update-sweet': 'PUT /api/sweets/:id',
      'delete-sweet': 'DELETE /api/sweets/:id',
      'purchase-sweet': 'POST /api/sweets/:id/purchase',
      'restock-sweet': 'POST /api/sweets/:id/restock'
    }
  });
});

// 404 Handler for undefined routes
app.use((req, res, next)=> {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    suggestion: 'Check the API documentation at /api'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});


// Server startup function
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening for requests
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });

     } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not when imported for tests)
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = app;