const User = require('../models/User');
const { generateToken } = require('../utils/auth.utils');
const { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError,
  ValidationError,
  ConflictError
} = require('../utils/errors');
const { catchAsync } = require('../utils/errors');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer'
  });

  // Generate token
  const token = generateToken(user);

  // Send response
  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user);

  // Send response
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
const updateDetails = catchAsync(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Check if email is being updated and if it already exists
  if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
    const emailExists = await User.findOne({ email: fieldsToUpdate.email });
    if (emailExists) {
      throw new ConflictError('Email already in use');
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
const updatePassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isPasswordMatch = await user.comparePassword(req.body.currentPassword);

  if (!isPasswordMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    token,
    message: 'Password updated successfully'
  });
});

/**
 * @desc    Logout user
 * @route   GET /api/auth/logout
 * @access  Private
 */
const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
};