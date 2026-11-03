const mongoose = require('mongoose');

const connectDB = async () => {
  const host = process.env.MONGODB_HOST || 'db01.dbhost.dev';
  const port = process.env.MONGODB_PORT || 5050;
  const database = process.env.MONGODB_DATABASE || 'db_458492c92';
  const username = process.env.MONGODB_USERNAME || 'user_458492c92';
  const password = process.env.MONGODB_PASSWORD || 'p458492c92';
  const authSource = process.env.MONGODB_AUTH_SOURCE || database;

  const encodedUser = encodeURIComponent(username);
  const encodedPass = encodeURIComponent(password);

  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('your_mongodb_password')) {
    uri = `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${database}?authSource=${authSource}`;
  }

  // Obfuscate password for safe logging
  const safeUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to MongoDB at: ${safeUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Failed: ${err.message}`);
    // If authSource failed with db name, try admin auth source as fallback test
    if (authSource !== 'admin') {
      try {
        console.log('Attempting fallback with authSource=admin...');
        const adminUri = `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${database}?authSource=admin`;
        const conn = await mongoose.connect(adminUri, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected successfully with authSource=admin: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`Fallback failed: ${fallbackErr.message}`);
        throw err;
      }
    }
    throw err;
  }
};

module.exports = connectDB;

