const Purchase = require('../models/Purchase');

// Controller to get user's purchase history
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get user's purchases with populated sweet details
    const purchases = await Purchase.find({ user: userId })
      .populate('sweet', 'name category price imageUrl')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Purchase.countDocuments({ user: userId });
    
    res.status(200).json({
      success: true,
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('Get user purchases error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchase history'
    });
  }
};

// Controller to get purchase statistics for user
const getUserPurchaseStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all user purchases
    const purchases = await Purchase.find({ 
      user: userId,
      status: 'completed'
    });
    
    // Calculate statistics
    const totalPurchases = purchases.length;
    const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    
    res.status(200).json({
      success: true,
      data: {
        totalPurchases,
        totalItems,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averageOrderValue: totalPurchases > 0 
          ? parseFloat((totalSpent / totalPurchases).toFixed(2)) 
          : 0
      }
    });
    
  } catch (error) {
    console.error('Get user purchase stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchase statistics'
    });
  }
};

module.exports = {
  getUserPurchases,
  getUserPurchaseStats
};

