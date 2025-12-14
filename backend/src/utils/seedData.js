const Sweet = require('../models/Sweet');

/**
 * Seed the database with sample sweet data
 * This is useful for development and testing
 */
const seedSweets = async () => {
  try {
    console.log('🌱 Seeding database with sample sweets...');
    
    const sampleSweets = [
      {
        name: 'Chocolate Truffle Delight',
        description: 'Rich dark chocolate truffle with a soft ganache center, dusted with cocoa powder. Perfect for chocolate lovers.',
        category: 'Chocolates',
        price: 35.50,
        quantityInStock: 150,
        imageUrl: 'https://placehold.co/400x300/4A0404/FFFFFF?text=Chocolate+Truffle'
      },
      {
        name: 'Strawberry Cheesecake Slice',
        description: 'Creamy cheesecake on a buttery biscuit base, topped with fresh strawberry compote and mint leaves.',
        category: 'Cakes',
        price: 120.00,
        quantityInStock: 25,
        imageUrl: 'https://placehold.co/400x300/FFC0CB/000000?text=Strawberry+Cheesecake'
      },
      {
        name: 'Classic Chocolate Chip Cookies',
        description: 'Freshly baked cookies with melty chocolate chips, crispy edges and chewy centers. Baked daily.',
        category: 'Cookies',
        price: 15.00,
        quantityInStock: 200,
        imageUrl: 'https://placehold.co/400x300/8B4513/FFFFFF?text=Chocolate+Chip+Cookie'
      },
      {
        name: 'Rainbow Candy Lollipop',
        description: 'Colorful swirled lollipop with fruity flavors. A favorite among kids and adults alike.',
        category: 'Candies',
        price: 10.00,
        quantityInStock: 300,
        imageUrl: 'https://placehold.co/400x300/FF69B4/FFFFFF?text=Rainbow+Lollipop'
      },
      {
        name: 'Butter Croissant',
        description: 'Flaky, buttery French croissant with golden brown layers. Perfect with coffee or tea.',
        category: 'Pastries',
        price: 25.00,
        quantityInStock: 80,
        imageUrl: 'https://placehold.co/400x300/FFD700/000000?text=Butter+Croissant'
      },
      {
        name: 'Vanilla Bean Ice Cream',
        description: 'Premium ice cream made with real vanilla beans. Rich, creamy, and oh-so-delicious.',
        category: 'Ice Cream',
        price: 60.00,
        quantityInStock: 50,
        imageUrl: 'https://placehold.co/400x300/F5F5DC/000000?text=Vanilla+Ice+Cream'
      },
      {
        name: 'Red Velvet Cupcake',
        description: 'Moist red velvet cupcake with cream cheese frosting and festive sprinkles on top.',
        category: 'Cakes',
        price: 45.00,
        quantityInStock: 60,
        imageUrl: 'https://placehold.co/400x300/DC143C/FFFFFF?text=Red+Velvet+Cupcake'
      },
      {
        name: 'Assorted Fudge Box',
        description: 'Handcrafted fudge in three flavors: chocolate walnut, vanilla pecan, and salted caramel.',
        category: 'Desserts',
        price: 200.00,
        quantityInStock: 30,
        imageUrl: 'https://placehold.co/400x300/8B7355/FFFFFF?text=Assorted+Fudge'
      },
      {
        name: 'Macaron Assortment',
        description: 'Colorful French macarons in assorted flavors: pistachio, raspberry, lavender, and chocolate.',
        category: 'Pastries',
        price: 180.00,
        quantityInStock: 40,
        imageUrl: 'https://placehold.co/400x300/FFB6C1/000000?text=Macaron+Assortment'
      },
      {
        name: 'Gourmet Chocolate Bar',
        description: 'Single-origin dark chocolate bar with sea salt and almond pieces. 70% cocoa content.',
        category: 'Chocolates',
        price: 85.00,
        quantityInStock: 75,
        imageUrl: 'https://placehold.co/400x300/654321/FFFFFF?text=Gourmet+Chocolate'
      }
    ];

    // Clear existing sweets
    await Sweet.deleteMany({});
    console.log('✅ Cleared existing sweets');
    
    // Insert new sweets
    const createdSweets = await Sweet.insertMany(sampleSweets);
    console.log(`✅ Seeded ${createdSweets.length} sweets into database`);
    
    return createdSweets;
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

/**
 * Seed script runner
 * Run this directly: node src/utils/seedData.js
 */
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('../config/database');
  
  (async () => {
    try {
      await connectDB();
      await seedSweets();
      console.log('🎉 Database seeding completed successfully!');
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedSweets };