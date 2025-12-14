// dashboardUtils.js

// Color Palette
export const COLORS = {
  emeraldGreen: '#008080',
  sandYellow: '#F4D090',
  darkText: '#343a40',
  lightText: '#ffffff',
  primaryAccent: '#FFC107',
  lightGray: '#f8f9fa',
  mediumGray: '#e9ecef',
  coral: '#FF6B8B',
  lavender: '#A29BFE',
  darkEmerald: '#006666',
  tealLight: '#20B2AA',
  gold: '#FFD700'
};

// Glass Morphism Style
export const glassStyle = {
  background: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 128, 128, 0.1)',
};

// Stats Configuration
export const statsConfig = [
  { 
    title: 'Total Sweets', 
    icon: '🍬',
    color: COLORS.emeraldGreen,
    bg: `${COLORS.emeraldGreen}15`,
    key: 'totalSweets'
  },
  { 
    title: 'In Stock', 
    icon: '✅',
    color: '#28a745',
    bg: '#28a74515',
    key: 'inStock'
  },
  { 
    title: 'Out of Stock', 
    icon: '⏸️',
    color: COLORS.coral,
    bg: `${COLORS.coral}15`,
    key: 'outOfStock'
  },
  { 
    title: 'Revenue', 
    icon: '💰',
    color: COLORS.primaryAccent,
    bg: `${COLORS.primaryAccent}15`,
    key: 'revenue'
  },
  { 
    title: 'Customers', 
    icon: '👥',
    color: COLORS.lavender,
    bg: `${COLORS.lavender}15`,
    key: 'customers'
  }
];

// Quick Stats Configuration
export const quickStatsConfig = [
  { 
    label: 'Inventory Value', 
    color: COLORS.emeraldGreen, 
    key: 'totalValue',
    format: (value) => `₹${value}`
  },
  { 
    label: 'Out of Stock', 
    color: COLORS.coral, 
    key: 'outOfStock' 
  },
  { 
    label: 'Customer Satisfaction', 
    color: COLORS.primaryAccent, 
    value: '4.8/5' 
  },
  { 
    label: 'Order Completion', 
    color: '#28a745', 
    value: '98%' 
  }
];

// Calculate Dashboard Statistics
export const calculateStats = (sweets, purchases = []) => {
  if (!sweets || sweets.length === 0) {
    return {
      totalSweets: 0,
      inStock: 0,
      outOfStock: 0,
      totalValue: 0,
      totalPurchases: 0,
      revenue: 2450,
      customers: 124,
    };
  }

  const totalSweets = sweets.length;
  const inStock = sweets.filter(s => s.quantity > 0).length;
  const outOfStock = sweets.filter(s => s.quantity === 0).length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.quantity, 0);
  
  // Calculate low stock items (less than 10 but greater than 0)
  const lowStock = sweets.filter(s => s.quantity < 10 && s.quantity > 0).length;
  
  // Calculate average price
  const averagePrice = totalSweets > 0 
    ? sweets.reduce((sum, sweet) => sum + sweet.price, 0) / totalSweets 
    : 0;

  // Calculate revenue from purchases
  const revenue = purchases.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  
  // Calculate unique customers (for admin - would need user data)
  // For now, calculate from unique sweets purchased
  const uniqueCustomers = purchases.length > 0 ? purchases.length : 0;

  return {
    totalSweets,
    inStock,
    outOfStock,
    totalValue: parseFloat(totalValue.toFixed(2)),
    totalPurchases,
    lowStock,
    averagePrice: parseFloat(averagePrice.toFixed(2)),
    revenue: parseFloat(revenue.toFixed(2)),
    customers: uniqueCustomers,
  };
};

// Generate Mock Change Percentage
export const generateMockChange = (value, type) => {
  const changes = {
    totalSweets: '+12%',
    inStock: '+5%',
    outOfStock: '+2%',
    revenue: '+18%',
    customers: '+8%'
  };
  
  return changes[type] || '+0%';
};

// Format Price Display
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

// Get Stock Status Badge
export const getStockBadge = (quantity) => {
  if (quantity === 0) {
    return {
      text: 'Sold Out',
      bgColor: 'rgba(220, 53, 69, 0.9)',
      color: '#ffffff'
    };
  }
  if (quantity < 10) {
    return {
      text: `Low: ${quantity}`,
      bgColor: 'rgba(255, 193, 7, 0.9)',
      color: COLORS.darkText
    };
  }
  return {
    text: `Stock: ${quantity}`,
    bgColor: 'rgba(40, 167, 69, 0.9)',
    color: '#ffffff'
  };
};

// Get Sweet Popularity Status
export const getPopularityStatus = (quantity) => {
  if (quantity > 50) return { text: 'Popular', emoji: '🔥' };
  if (quantity < 10) return { text: 'Limited', emoji: '⚡' };
  return { text: 'Available', emoji: '✅' };
};

// Calculate Rewards Progress
export const calculateRewardsProgress = (totalPurchases) => {
  const target = 12;
  const progress = Math.min(100, (totalPurchases / target) * 100);
  const remaining = Math.max(0, target - totalPurchases);
  
  return {
    progress,
    remaining,
    nextRewardAt: remaining,
    isEligible: totalPurchases >= target
  };
};

// Filter Featured Sweets
export const getFeaturedSweets = (sweets, count = 8) => {
  if (!sweets || sweets.length === 0) return [];
  
  // Sort by popularity (quantity sold) or rating
  return [...sweets]
    .sort((a, b) => {
      // Sort by quantity first, then by price
      if (a.quantity !== b.quantity) return b.quantity - a.quantity;
      return b.price - a.price;
    })
    .slice(0, count);
};

// Validate Purchase Quantity
export const validatePurchaseQuantity = (quantity, available, max = 99) => {
  if (isNaN(quantity) || quantity < 1) return 1;
  if (quantity > available) return available;
  if (quantity > max) return max;
  return quantity;
};

// Calculate Purchase Total
export const calculatePurchaseTotal = (price, quantity) => {
  return parseFloat((price * quantity).toFixed(2));
};

// Get User Greeting
export const getUserGreeting = (username, isAdmin) => {
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 18) greeting = 'Good Afternoon';
  else greeting = 'Good Evening';
  
  return `${greeting}, ${username}!`;
};

// Get Admin Tools
export const getAdminTools = () => [
  { 
    label: 'Add New Sweet', 
    icon: 'FaPlus', 
    href: '/add-sweet', 
    variant: 'success',
    gradient: `linear-gradient(135deg, ${COLORS.emeraldGreen}, #28a745)`
  },
  { 
    label: 'Manage Store', 
    icon: 'FaStore', 
    href: '/admin', 
    variant: 'outline-primary',
    borderColor: COLORS.emeraldGreen
  },
  { 
    label: 'Refresh Data', 
    icon: '🔄', 
    action: 'refresh',
    variant: 'outline-warning',
    borderColor: COLORS.primaryAccent
  }
];

// Get Quick Stats Progress Values
export const getQuickStatsProgress = (stats) => {
  if (!stats || stats.totalSweets === 0) {
    return {
      inventoryValue: 0,
      outOfStock: 0,
      customerSatisfaction: 0,
      orderCompletion: 0
    };
  }

  return {
    inventoryValue: Math.min(100, (stats.totalValue / 10000) * 100), // Assuming 10k is max
    outOfStock: (stats.outOfStock / stats.totalSweets) * 100,
    customerSatisfaction: 96, // Mock data
    orderCompletion: 98 // Mock data
  };
};