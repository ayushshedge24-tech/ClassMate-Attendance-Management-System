const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_db';

  try {
    // Set strictQuery
    mongoose.set('strictQuery', false);

    // Attempt primary connection with 10-second timeout (optimized for cloud databases like Atlas)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection to ${uri} failed: ${primaryErr.message}`);

    // Production Safety Guard: Never silently fall back to volatile RAM in production
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_IN_MEMORY_DB !== 'true') {
      console.error(`[Database FATAL] Primary MongoDB connection failed in PRODUCTION mode.`);
      console.error(`[Database FATAL] Refusing volatile MongoMemoryServer fallback to prevent silent data loss.`);
      console.error(`[Database FATAL] Please verify your production MONGODB_URI connection string.`);
      process.exit(1);
    }

    console.log(`[Database] Attempting MongoMemoryServer in-memory fallback for local development/testing...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to Embedded In-Memory MongoDB at: ${memoryUri}`);
      console.log(`[Database] Note: All data will be kept in memory for this session.`);
      return conn;
    } catch (memErr) {
      console.error(`[Database] In-memory fallback failed: ${memErr.message}`);
      console.error(`[Database] Please ensure MongoDB is running or provide a valid MONGODB_URI in server/.env`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
