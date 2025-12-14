// This file sets up the connection to MongoDB database
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectToDatabase = async () => {
  try {
    // Get the database connection string from environment variables
    const connectionString = process.env.MONGODB_URI 
    
    // Connect to MongoDB
    await mongoose.connect(connectionString);
    
    console.log('✅ Successfully connected to MongoDB database');
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    // Handle when MongoDB disconnects
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1); // Exit the app if can't connect to database
  }
};

module.exports = connectToDatabase;