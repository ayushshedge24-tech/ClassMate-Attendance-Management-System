const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_db';

  try {
    // Set strictQuery
    mongoose.set('strictQuery', false);

    // Attempt primary connection with 3-second timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection to ${uri} failed: ${primaryErr.message}`);
    console.log(`[Database] Attempting MongoMemoryServer in-memory fallback...`);

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
