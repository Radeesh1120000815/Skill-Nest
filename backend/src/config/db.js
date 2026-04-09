import mongoose from 'mongoose';
//import dns from 'dns';//do not accept this change unless you don't face any dns issue

/**
 * MongoDB connection logic using ES Modules
 * Path: backend/src/config/db.js
 */

// do not accept this change unless you don't face any dns issue, apply DNS override if provided in local .env, fixing dns issue
/*if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS.split(',').map((server) => server.trim())
  );
}
*/
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

// Helper: ensure there is an active DB connection (used in controllers)
export const ensureDbConnection = async () => {
  if (mongoose.connection.readyState === 1) return; // already connected
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Cannot ensure DB connection.');
  }
  console.log('ensureDbConnection: connecting. Current readyState =', mongoose.connection.readyState);
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('ensureDbConnection: connected. New readyState =', mongoose.connection.readyState);
};

export default connectDB_Server;