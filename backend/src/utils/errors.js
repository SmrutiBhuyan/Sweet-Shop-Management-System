/**
 * Custom error classes for better error handling
 */

/**
 * Base AppError class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Mark as operational error (not programming error)
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
  constructor(errors = []) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}

/**
 * Error response formatter
 */
const errorResponse = (error, req, res) => {
  // Log error for debugging
  console.error('🔴 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user?.id || 'No user'
  });
  
  // Default error response
  const response = {
    success: false,
    error: error.message || 'Internal Server Error'
  };
  
  // Add validation errors if available
  if (error.errors && Array.isArray(error.errors)) {
    response.details = error.errors;
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  res.status(error.statusCode || 500).json(response);
};

/**
 * Async error handler wrapper (avoid try-catch in controllers)
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError,
  errorResponse,
  catchAsync
};