// adminUtils.js

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

// Mock User Data
export const mockUsers = [
  { 
    id: 1, 
    username: 'admin', 
    email: 'admin@example.com', 
    role: 'admin', 
    joined: '2024-01-01', 
    status: 'active', 
    avatar: '👑' 
  },
  { 
    id: 2, 
    username: 'john_doe', 
    email: 'john@example.com', 
    role: 'customer', 
    joined: '2024-01-05', 
    status: 'active', 
    avatar: '👨' 
  },
  { 
    id: 3, 
    username: 'jane_smith', 
    email: 'jane@example.com', 
    role: 'customer', 
    joined: '2024-01-10', 
    status: 'active', 
    avatar: '👩' 
  },
  { 
    id: 4, 
    username: 'sweet_lover', 
    email: 'lover@example.com', 
    role: 'customer', 
    joined: '2024-01-12', 
    status: 'inactive', 
    avatar: '🍭' 
  },
  { 
    id: 5, 
    username: 'choco_fan', 
    email: 'choco@example.com', 
    role: 'customer', 
    joined: '2024-01-15', 
    status: 'active', 
    avatar: '🍫' 
  },
];

// Stats Configuration
export const statsConfig = [
  { 
    title: 'Total Products', 
    icon: '🍬',
    color: COLORS.emeraldGreen,
    bg: `${COLORS.emeraldGreen}15`
  },
  { 
    title: 'Inventory Value', 
    icon: '💰',
    color: COLORS.primaryAccent,
    bg: `${COLORS.primaryAccent}15`
  },
  { 
    title: 'Low Stock Alert', 
    icon: '⚠️',
    color: COLORS.coral,
    bg: `${COLORS.coral}15`
  },
  { 
    title: 'Total Users', 
    icon: '👥',
    color: COLORS.lavender,
    bg: `${COLORS.lavender}15`
  },
  { 
    title: 'Categories', 
    icon: '🏷️',
    color: COLORS.tealLight,
    bg: `${COLORS.tealLight}15`
  }
];

// Calculate Statistics
export const calculateStats = (sweets, users) => {
  if (!sweets || sweets.length === 0) {
    return {
      totalSweets: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      totalUsers: users?.length || 0,
      totalCategories: 0,
    };
  }

  const totalSweets = sweets.length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
  const lowStock = sweets.filter(s => s.quantity > 0 && s.quantity <= 10).length;
  const outOfStock = sweets.filter(s => s.quantity === 0).length;
  const categories = [...new Set(sweets.map(sweet => sweet.category))];
  
  return {
    totalSweets,
    totalValue: parseFloat(totalValue.toFixed(2)),
    lowStock,
    outOfStock,
    totalUsers: users?.length || 0,
    totalCategories: categories.length,
  };
};

// Filter Sweets
export const filterSweets = (sweets, searchTerm, selectedCategory) => {
  if (!sweets) return [];
  
  return sweets.filter(sweet => {
    const matchesSearch = searchTerm === '' || 
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      sweet.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
};

// Get Categories from Sweets
export const getCategories = (sweets) => {
  if (!sweets || sweets.length === 0) return ['all'];
  return ['all', ...new Set(sweets.map(sweet => sweet.category))];
};

// Get Category Distribution
export const getCategoryDistribution = (sweets) => {
  if (!sweets || sweets.length === 0) return [];
  
  const distribution = sweets.reduce((acc, sweet) => {
    acc[sweet.category] = (acc[sweet.category] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(distribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);
};

// Get Stock Status Counts
export const getStockStatus = (sweets) => {
  if (!sweets || sweets.length === 0) {
    return {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };
  }
  
  return {
    inStock: sweets.filter(s => s.quantity > 10).length,
    lowStock: sweets.filter(s => s.quantity > 0 && s.quantity <= 10).length,
    outOfStock: sweets.filter(s => s.quantity === 0).length,
  };
};

// Generate Mock Change Value
export const generateMockChange = (baseValue, type) => {
  const changes = {
    totalSweets: '+8',
    totalValue: `+₹${Math.floor(baseValue * 0.1)}`,
    lowStock: `+${Math.floor(baseValue / 10)}`,
    totalUsers: '+3',
    totalCategories: '+1',
  };
  
  return changes[type] || '+0';
};

// Format Price
export const formatPrice = (price) => {
  return `₹${parseFloat(price).toFixed(2)}`;
};

// Sweet Quantity Status
export const getQuantityStatus = (quantity) => {
  if (quantity === 0) return { text: 'Out of Stock', variant: 'danger' };
  if (quantity <= 10) return { text: `${quantity} units`, variant: 'warning' };
  return { text: `${quantity} units`, variant: 'success' };
};