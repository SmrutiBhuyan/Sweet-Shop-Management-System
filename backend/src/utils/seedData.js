const Sweet = require('../models/Sweet');
const User = require('../models/User');
const connectToDatabase = require('../config/database');

/**
 * Seed the database with sample sweet data
 * This creates an admin user first, then uses that admin to create sweets
 */
const seedSweets = async () => {
  try {
    console.log('🌱 Seeding database with sample sweets...');
    
    // First, ensure we have an admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('👤 Creating admin user for seeding...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@sweetshop.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }
    
    // Sample sweets data with Indian sweet names and prices in rupees
    const sampleSweets = [
      {
        name: 'Gulab Jamun',
        description: 'Soft, spongy milk dumplings soaked in sweet rose-flavored sugar syrup. A classic Indian dessert loved by all.',
        category: 'Traditional',
        price: 25.00,
        quantity: 150,
        imageUrl: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Gulab+Jamun',
        createdBy: adminUser._id
      },
      {
        name: 'Rasgulla',
        description: 'Soft and spongy cottage cheese balls soaked in light sugar syrup. A refreshing Bengali sweet.',
        category: 'Traditional',
        price: 30.00,
        quantity: 120,
        imageUrl: 'https://via.placeholder.com/400x300/FFC0CB/000000?text=Rasgulla',
        createdBy: adminUser._id
      },
      {
        name: 'Kaju Katli',
        description: 'Diamond-shaped cashew fudge with a rich, melt-in-mouth texture. A premium Indian sweet.',
        category: 'Traditional',
        price: 450.00,
        quantity: 80,
        imageUrl: 'https://via.placeholder.com/400x300/FFD700/000000?text=Kaju+Katli',
        createdBy: adminUser._id
      },
      {
        name: 'Jalebi',
        description: 'Crispy, spiral-shaped sweet made from fermented batter, deep-fried and soaked in sugar syrup.',
        category: 'Traditional',
        price: 20.00,
        quantity: 200,
        imageUrl: 'https://via.placeholder.com/400x300/FF6347/FFFFFF?text=Jalebi',
        createdBy: adminUser._id
      },
      {
        name: 'Barfi',
        description: 'Rich, dense milk-based sweet available in various flavors like plain, pistachio, and almond.',
        category: 'Traditional',
        price: 35.00,
        quantity: 100,
        imageUrl: 'https://via.placeholder.com/400x300/F5F5DC/000000?text=Barfi',
        createdBy: adminUser._id
      },
      {
        name: 'Ladoo',
        description: 'Round, sweet balls made from gram flour, semolina, or coconut, often served during festivals.',
        category: 'Traditional',
        price: 15.00,
        quantity: 250,
        imageUrl: 'https://via.placeholder.com/400x300/DAA520/000000?text=Ladoo',
        createdBy: adminUser._id
      },
      {
        name: 'Rasmalai',
        description: 'Soft flattened balls of chhena soaked in thickened, sweetened milk flavored with cardamom.',
        category: 'Traditional',
        price: 40.00,
        quantity: 60,
        imageUrl: 'https://via.placeholder.com/400x300/FFB6C1/000000?text=Rasmalai',
        createdBy: adminUser._id
      },
      {
        name: 'Halwa',
        description: 'Dense, sweet confection made from semolina, carrots, or lentils, cooked with ghee and sugar.',
        category: 'Traditional',
        price: 30.00,
        quantity: 90,
        imageUrl: 'https://via.placeholder.com/400x300/FFD700/000000?text=Halwa',
        createdBy: adminUser._id
      },
      {
        name: 'Peda',
        description: 'Soft, fudge-like sweet made from khoya (milk solids) and sugar, often flavored with cardamom.',
        category: 'Traditional',
        price: 50.00,
        quantity: 70,
        imageUrl: 'https://via.placeholder.com/400x300/FFC0CB/000000?text=Peda',
        createdBy: adminUser._id
      },
      {
        name: 'Soan Papdi',
        description: 'Flaky, layered sweet made from gram flour, sugar, ghee, and cardamom. Light and crispy texture.',
        category: 'Traditional',
        price: 180.00,
        quantity: 50,
        imageUrl: 'https://via.placeholder.com/400x300/F5F5DC/000000?text=Soan+Papdi',
        createdBy: adminUser._id
      },
      {
        name: 'Besan Ladoo',
        description: 'Sweet balls made from roasted gram flour, ghee, and sugar, flavored with cardamom and nuts.',
        category: 'Traditional',
        price: 20.00,
        quantity: 180,
        imageUrl: 'https://via.placeholder.com/400x300/DAA520/000000?text=Besan+Ladoo',
        createdBy: adminUser._id
      },
      {
        name: 'Kheer',
        description: 'Creamy rice pudding made with milk, rice, sugar, and flavored with cardamom, saffron, and nuts.',
        category: 'Traditional',
        price: 35.00,
        quantity: 40,
        imageUrl: 'https://via.placeholder.com/400x300/FFE4B5/000000?text=Kheer',
        createdBy: adminUser._id
      }
    ];

    // Clear existing sweets (optional - comment out if you want to keep existing data)
    const deletedCount = await Sweet.deleteMany({});
    console.log(`✅ Cleared ${deletedCount.deletedCount} existing sweets`);
    
    // Insert new sweets
    const createdSweets = await Sweet.insertMany(sampleSweets);
    console.log(`✅ Seeded ${createdSweets.length} sweets into database`);
    
    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`Total Sweets: ${createdSweets.length}`);
    console.log(`Total Stock: ${createdSweets.reduce((sum, s) => sum + s.quantity, 0)} units`);
    console.log(`Total Value: ₹${createdSweets.reduce((sum, s) => sum + (s.price * s.quantity), 0).toFixed(2)}`);
    
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
  
  (async () => {
    try {
      // Connect to database
      await connectToDatabase();
      
      // Seed sweets
      await seedSweets();
      
      console.log('\n🎉 Database seeding completed successfully!');
      console.log('\n💡 You can now:');
      console.log('   1. Login as admin: admin@sweetshop.com / admin123');
      console.log('   2. View sweets on the homepage');
      console.log('   3. Add more sweets from the admin panel');
      
      // Close connection
      process.exit(0);
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedSweets };
