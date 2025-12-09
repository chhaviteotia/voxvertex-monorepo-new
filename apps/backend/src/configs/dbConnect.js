import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return;
    }

    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI not set. Database connection skipped.');
      isConnected = false;
      return;
    }

    // Validate connection string format
    if (mongoUri.includes('mongodb+srv://') && !mongoUri.includes('@')) {
      console.error('❌ Invalid MongoDB connection string format.');
      console.error('Expected format: mongodb+srv://username:password@cluster.mongodb.net/database');
      throw new Error('Invalid MongoDB connection string format');
    }

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };

    console.log('🔄 Attempting to connect to MongoDB...');
    const maskedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('Connection string:', maskedUri);
    
    await mongoose.connect(mongoUri, options);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port || 'N/A (Atlas)');
  } catch (error) {
    isConnected = false;
    console.error('\n❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages with specific fix steps
    if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS Resolution Issue:');
      console.error('   - The hostname in your connection string cannot be resolved');
      console.error('   - Check your internet connection');
      console.error('   - Verify the MongoDB server address is correct');
      console.error('   - For MongoDB Atlas, the format should be:');
      console.error('     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database');
    } else if (error.message.includes('authentication failed') || error.code === 8000) {
      console.error('\n💡 Authentication Issue:');
      console.error('   - Check your MongoDB username and password in .env file');
      console.error('   - Verify credentials in MongoDB Atlas dashboard');
      console.error('   - For MongoDB Atlas, make sure your IP is whitelisted');
      console.error('   - Go to: Atlas → Security → Network Access → Add IP Address');
      console.error('   - Quick fix: Add 0.0.0.0/0 to allow all IPs (development only)');
    } else if (error.message.includes('buffering timed out') || error.message.includes('Could not connect')) {
      console.error('\n💡 Connection Timeout / Network Access Issue:');
      console.error('   - MongoDB Atlas is blocking your IP address');
      console.error('   - SOLUTION: Whitelist your IP in MongoDB Atlas');
      console.error('');
      console.error('   📋 Steps to fix:');
      console.error('   1. Go to: https://cloud.mongodb.com/');
      console.error('   2. Select your project → Security → Network Access');
      console.error('   3. Click "Add IP Address"');
      console.error('   4. Click "Add Current IP Address" (or manually add your IP)');
      console.error('   5. For development: You can temporarily use 0.0.0.0/0 (allows all IPs)');
      console.error('   6. Wait 1-2 minutes for changes to propagate');
      console.error('   7. Restart your backend server');
      console.error('');
      console.error('   🔍 To find your current IP:');
      console.error('   - Visit: https://whatismyipaddress.com/');
      console.error('   - Or check the error message above for your IP');
    } else {
      console.error('\n💡 General Connection Issue:');
      console.error('   - Check your MONGODB_URI in .env file');
      console.error('   - Verify the connection string format');
      console.error('   - Ensure MongoDB service is running (for local)');
      console.error('   - For MongoDB Atlas: Check network access settings');
    }
    
    // Don't exit in development - allow server to continue
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Continuing without database connection (development mode)');
      console.warn('⚠️ Some features may not work without database connection');
    }
  }
};

// Helper function to check if database is connected
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1 || isConnected;
};

// Helper function to wait for connection
export const waitForConnection = async (maxWait = 10000) => {
  const startTime = Date.now();
  while (!isDBConnected() && (Date.now() - startTime) < maxWait) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return isDBConnected();
};

export default connectDB;

