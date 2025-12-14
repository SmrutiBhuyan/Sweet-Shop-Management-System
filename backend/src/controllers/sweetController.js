const Sweet = require('../models/Sweet');

// Controller to create a new sweet
const createSweet = async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Handle image upload - if file is uploaded, use it; otherwise use default
    let imageUrl = 'https://via.placeholder.com/300x200?text=Sweet+Image';
    if (req.file) {
      // Construct the URL for the uploaded image
      const baseUrl = req.protocol + '://' + req.get('host');
      imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    // Create new sweet with the logged-in user as creator
    const newSweet = await Sweet.create({
      name,
      description: description || '',
      category,
      price,
      quantity: quantity || 0,
      imageUrl,
      createdBy: req.user._id // From auth middleware
    });
    
    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: {
        sweet: newSweet
      }
    });
    
  } catch (error) {
    console.error('Create sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating sweet'
    });
  }
};

// Controller to get all sweets with pagination and filtering
const getAllSweets = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    // Filter by category if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by price range if provided
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Filter by in-stock only if requested
    if (req.query.inStock === 'true') {
      filter.quantity = { $gt: 0 };
    }
    
    // Execute query with filters and pagination
    const sweets = await Sweet.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username email'); // Include creator info
    
    // Get total count for pagination info
    const total = await Sweet.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        sweets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('Get sweets error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sweets'
    });
  }
};

// Controller to search sweets by name or category
const searchSweets = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search in name and category fields
    const sweets = await Sweet.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive search
        { category: { $regex: query, $options: 'i' } }
      ]
    }).populate('createdBy', 'username email');
    
    res.status(200).json({
      success: true,
      data: {
        sweets,
        searchQuery: query,
        count: sweets.length
      }
    });
    
  } catch (error) {
    console.error('Search sweets error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while searching sweets'
    });
  }
};

// Controller to get a single sweet by ID
const getSweetById = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id)
      .populate('createdBy', 'username email');
    
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { sweet }
    });
    
  } catch (error) {
    console.error('Get sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sweet'
    });
  }
};

// Controller to update a sweet
const updateSweet = async (req, res) => {
  try {
    const { name, description, category, price, quantity } = req.body;
    
    // Build update object
    const updateData = {
      name,
      description,
      category,
      price,
      quantity
    };
    
    // Handle image upload - if new file is uploaded, use it
    if (req.file) {
      const baseUrl = req.protocol + '://' + req.get('host');
      updateData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    // If no file uploaded, keep existing imageUrl (don't update it)
    
    // Find sweet and update
    const updatedSweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true // Run validation on update
      }
    ).populate('createdBy', 'username email');
    
    if (!updatedSweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Sweet updated successfully',
      data: { sweet: updatedSweet }
    });
    
  } catch (error) {
    console.error('Update sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating sweet'
    });
  }
};

// Controller to delete a sweet
const deleteSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Sweet deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting sweet'
    });
  }
};

// Controller to purchase a sweet (decrease quantity)
const purchaseSweet = async (req, res) => {
  try {
    const { quantityToPurchase } = req.body;
    
    if (!quantityToPurchase || quantityToPurchase <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid purchase quantity is required'
      });
    }
    
    // Find the sweet
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    // Check if enough quantity is available
    if (sweet.quantity < quantityToPurchase) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${sweet.quantity}`
      });
    }
    
    // Decrease the quantity
    sweet.quantity -= quantityToPurchase;
    await sweet.save();
    
    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: {
        sweet,
        purchasedQuantity: quantityToPurchase,
        remainingQuantity: sweet.quantity
      }
    });
    
  } catch (error) {
    console.error('Purchase sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during purchase'
    });
  }
};

// Controller to restock a sweet (increase quantity)
const restockSweet = async (req, res) => {
  try {
    const { quantityToAdd } = req.body;
    
    if (!quantityToAdd || quantityToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid restock quantity is required'
      });
    }
    
    // Find and update the sweet
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }
    
    // Increase the quantity
    sweet.quantity += quantityToAdd;
    await sweet.save();
    
    res.status(200).json({
      success: true,
      message: 'Restock successful',
      data: {
        sweet,
        addedQuantity: quantityToAdd,
        newQuantity: sweet.quantity
      }
    });
    
  } catch (error) {
    console.error('Restock sweet error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during restock'
    });
  }
};

module.exports = {
  createSweet,
  getAllSweets,
  searchSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
};