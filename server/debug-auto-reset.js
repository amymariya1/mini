// Debug script to test the automatic password reset flow
import { forgotPasswordAuto } from './src/controllers/auth.controller.js';
import { findByEmail } from './src/utils/userStore.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects for debugging
const mockReq = {
  body: {
    email: 'test@example.com'
  }
};

let responseSent = false;

const mockRes = {
  statusCode: null,
  data: null,
  status: function(code) {
    this.statusCode = code;
    console.log(`Setting response status to: ${code}`);
    return this;
  },
  json: function(data) {
    this.data = data;
    responseSent = true;
    console.log(`Sending JSON response:`, data);
    return this;
  }
};

async function debugAutoReset() {
  try {
    console.log('=== Debugging Automatic Password Reset ===');
    
    // Connect to MongoDB if available
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
      } catch (error) {
        console.log('⚠️ MongoDB connection failed, using in-memory storage');
      }
    } else {
      console.log('⚠️ MONGO_URI not found, using in-memory storage');
    }
    
    // Check if test user exists
    console.log('\n1. Checking if test user exists...');
    const testUser = await findByEmail('test@example.com');
    
    if (!testUser) {
      console.log('❌ Test user does not exist. Please create a test user first.');
      return;
    }
    
    console.log('✅ Test user found:', testUser.email);
    
    // Test the automatic forgot password functionality
    console.log('\n2. Testing automatic forgot password functionality...');
    await forgotPasswordAuto(mockReq, mockRes);
    
    console.log('\n3. Response details:');
    console.log('   Status Code:', mockRes.statusCode);
    console.log('   Response Data:', mockRes.data);
    console.log('   Response Sent:', responseSent);
    
    console.log('\n✅ Debug test completed!');
    
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error during debug test:', error);
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  }
}

debugAutoReset();