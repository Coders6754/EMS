const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, return existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    // Don't exit in serverless environment - throw error instead
    throw err;
  }
};

module.exports = connectDB;
