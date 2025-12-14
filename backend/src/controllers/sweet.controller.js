const Sweet = require('../models/Sweet');
const { 
  NotFoundError, 
  BadRequestError,
  ForbiddenError
} = require('../utils/errors');
const { catchAsync } = require('../utils/errors');

/**
 * @desc    Get all sweets
 * @route   GET /api/sweets
 * @access  Public
 */
const getAllSweets = catchAsync(async (req, res) => {
  const sweets = await Sweet.find();
  
  res.status(200).json({
    success: true,
    count: sweets.length,
    data: sweets
  });
});

/**
 * @desc    Get single sweet by ID
 * @route   GET /api/sweets/:id
 * @access  Public
 */
const getSweetById = catchAsync(async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);
  
  if (!sweet) {
    throw new NotFoundError('Sweet');
  }
  
  res.status(200).json({
    success: true,
    data: sweet
  });
});

/**
 * @desc    Create new sweet
 * @route   POST /api/sweets
 * @access  Private/Admin
 */
const createSweet = catchAsync(async (req, res) => {
  const sweet = await Sweet.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Sweet created successfully',
    data: sweet
  });
});

/**
 * @desc    Update sweet
 * @route   PUT /api/sweets/:id
 * @access  Private/Admin
 */
const updateSweet = catchAsync(async (req, res) => {
  let sweet = await Sweet.findById(req.params.id);
  
  if (!sweet) {
    throw new NotFoundError('Sweet');
  }
  
  sweet = await Sweet.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    message: 'Sweet updated successfully',
    data: sweet
  });
});

/**
 * @desc    Delete sweet
 * @route   DELETE /api/sweets/:id
 * @access  Private/Admin
 */
const deleteSweet = catchAsync(async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);
  
  if (!sweet) {
    throw new NotFoundError('Sweet');
  }
  
  await sweet.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Sweet deleted successfully'
  });
});

/**
 * @desc    Search sweets
 * @route   GET /api/sweets/search
 * @access  Public
 */
const searchSweets = catchAsync(async (req, res) => {
  const { name, category, minPrice, maxPrice, inStock } = req.query;
  
  // Build query
  let query = {};
  
  // Search by name (case-insensitive)
  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  
  // Filter by stock availability
  if (inStock === 'true') {
    query.quantityInStock = { $gt: 0 };
  } else if (inStock === 'false') {
    query.quantityInStock = 0;
  }
  
  const sweets = await Sweet.find(query);
  
  res.status(200).json({
    success: true,
    count: sweets.length,
    data: sweets
  });
});

/**
 * @desc    Purchase sweet
 * @route   POST /api/sweets/:id/purchase
 * @access  Private
 */
const purchaseSweet = catchAsync(async (req, res) => {
  const { quantity = 1 } = req.body;
  const sweet = await Sweet.findById(req.params.id);
  
  if (!sweet) {
    throw new NotFoundError('Sweet');
  }
  
  // Check if sweet is in stock
  if (sweet.quantityInStock < quantity) {
    throw new BadRequestError(`Not enough stock. Only ${sweet.quantityInStock} items available`);
  }
  
  // Update stock
  sweet.quantityInStock -= quantity;
  await sweet.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully purchased ${quantity} ${sweet.name}(s)`,
    data: {
      sweet,
      quantityPurchased: quantity,
      remainingStock: sweet.quantityInStock
    }
  });
});

/**
 * @desc    Restock sweet
 * @route   POST /api/sweets/:id/restock
 * @access  Private/Admin
 */
const restockSweet = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  let sweet = await Sweet.findById(req.params.id);
  
  if (!sweet) {
    throw new NotFoundError('Sweet');
  }
  
  // Update stock
  sweet.quantityInStock += quantity;
  sweet = await sweet.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully restocked ${quantity} ${sweet.name}(s)`,
    data: {
      sweet,
      quantityAdded: quantity,
      newStock: sweet.quantityInStock
    }
  });
});

module.exports = {
  getAllSweets,
  getSweetById,
  createSweet,
  updateSweet,
  deleteSweet,
  searchSweets,
  purchaseSweet,
  restockSweet
};