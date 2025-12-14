const User = require('../models/User');

/**
 * Seed the database with sample users
 */
const seedUsers = async () => {
  try {
    console.log('🌱 Seeding database with sample users...');
    
    const sampleUsers = [
      {
        name: 'Admin User',
        email: 'admin@sweetshop.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        name: 'Customer One',
        email: 'customer1@sweetshop.com',
        password: 'Customer123!',
        role: 'customer'
      },
      {
        name: 'Customer Two',
        email: 'customer2@sweetshop.com',
        password: 'Customer123!',
        role: 'customer'
      }
    ];

    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');
    
    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    
    console.log(`✅ Seeded ${createdUsers.length} users into database`);
    
    // Log credentials for testing
    console.log('\n📋 Test User Credentials:');
    console.log('========================');
    createdUsers.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${sampleUsers.find(u => u.email === user.email).password}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('../config/database');
  
  (async () => {
    try {
      await connectDB();
      await seedUsers();
      console.log('🎉 User seeding completed successfully!');
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('❌ User seeding failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { seedUsers };