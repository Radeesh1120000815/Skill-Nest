import mongoose from 'mongoose';

/**
 * MongoDB connection logic using ES Modules
 * Path: backend/src/config/db.js
 */
const connectDB_Server = async () => {
  try {
    // process.env.MONGO_URI eka .env file eken gannawa
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    
    // Exit process on failure - Container orchestration (Docker/K8s) walata wadagath
    process.exit(1);
  }
};

export default connectDB_Server;