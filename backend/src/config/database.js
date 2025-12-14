const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * This function establishes connection to MongoDB using Mongoose
 */
const connectDB = async () => {
  try {
    // Use test database for testing environment
    const dbUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_URI_TEST 
      : process.env.MONGODB_URI;

    console.log(`🔄 Connecting to MongoDB: ${dbUri.replace(/:.*@/, ':****@')}`);
    
    // For Mongoose v7.5.0+, no need for useNewUrlParser and useUnifiedTopology
    const connection = await mongoose.connect(dbUri);

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error(`❌ MongoDB connection error: ${error}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    
    // Only exit process if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    
    // In test environment, re-throw the error
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 * Useful for testing
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error(`❌ Error disconnecting from MongoDB: ${error.message}`);
  }
};

/**
 * Clear all data from database
 * Useful for testing
 */
const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.error(`❌ Error clearing database: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB, clearDB };