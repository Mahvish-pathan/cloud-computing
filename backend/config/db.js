const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;

    if (!connUri) {
      console.warn('⚠️  MONGODB_URI is not defined in environment variables. Database features will be unavailable.');
      return;
    }

    // Ensure database name is studentDB if not explicitly set in the URI path
    const conn = await mongoose.connect(connUri, {
      dbName: 'studentDB',
      serverSelectionTimeoutMS: 8000, // Timeout after 8s instead of hanging indefinitely
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not exit process in development or health check mode so the server can report health status
  }
};

/**
 * Helper to check MongoDB connection status
 */
const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = { connectDB, getDBStatus };
