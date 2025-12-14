const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const { validateEnvironment } = require('./config/environment');

// Load environment variables
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const sweetRoutes = require('./routes/sweet.routes');

// Initialize Express app
const app = express();

// ======================
// ENVIRONMENT VALIDATION
// ======================
validateEnvironment();

// ======================
// SECURITY MIDDLEWARE
// ======================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));



// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// ======================
// REQUEST PARSING MIDDLEWARE
// ======================

// Parse JSON request bodies
app.use(express.json({
  limit: '10mb', // Prevent large payloads
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON payload');
    }
  }
}));

// Parse URL-encoded request bodies
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// ======================
// LOGGING MIDDLEWARE
// ======================

// Morgan for HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Colored output for development
} else {
  app.use(morgan('combined')); // Standard Apache combined log for production
}

// Custom request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// ======================
// ROUTES
// ======================

// Health check endpoint - always available
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Sweet Shop API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'sweet-shop-backend',
    version: '1.0.0'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'Sweet Shop Management API',
    version: '1.0.0',
    description: 'RESTful API for managing sweet shop inventory, orders, and users',
    documentation: 'See README.md for detailed API documentation',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (protected)',
        logout: 'GET /api/auth/logout (protected)'
      },
      sweets: {
        getAll: 'GET /api/sweets',
        getOne: 'GET /api/sweets/:id',
        create: 'POST /api/sweets (admin only)',
        update: 'PUT /api/sweets/:id (admin only)',
        delete: 'DELETE /api/sweets/:id (admin only)',
        search: 'GET /api/sweets/search',
        purchase: 'POST /api/sweets/:id/purchase (protected)',
        restock: 'POST /api/sweets/:id/restock (admin only)'
      }
    },
    status_codes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes); // We'll create this later

// ======================
// ERROR HANDLING MIDDLEWARE
// ======================


// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    suggestion: 'Check the API documentation at /api'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  // Handle JSON parsing errors
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload'
    });
  }
  
  // Handle rate limit errors
  if (error.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ======================
// SERVER STARTUP
// ======================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening for requests
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Sweet Shop API Server Started!
================================
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📚 API Docs: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
🐱 Database: Connected
⏰ Time: ${new Date().toLocaleString()}
      `);
    });
    
    // Handle server shutdown gracefully
    const shutdown = async () => {
      console.log('\n🛑 Received shutdown signal, closing server gracefully...');
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        // Close database connection
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
        console.log('👋 Server shutdown complete');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };
    
    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not when imported for tests)
if (require.main === module) {
  startServer();
}

// Export app for testing
module.exports = app;