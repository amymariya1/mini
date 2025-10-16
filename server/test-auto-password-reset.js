// Test script to verify the automatic password reset functionality
import { forgotPasswordAuto } from './src/controllers/auth.controller.js';
import { sendResetEmail } from './src/utils/mailer.js';
import { findByEmail } from './src/utils/userStore.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects for automatic reset
const mockReqAuto = {
  body: {
    email: 'test@example.com'
  }
};

const mockResAuto = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    console.log(`Response Status: ${this.statusCode || 200}`);
    console.log('Response Data:', data);
    return this;
  }
};

async function testAutoPasswordReset() {
  try {
    console.log('Testing automatic password reset functionality...');
    
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
    await forgotPasswordAuto(mockReqAuto, mockResAuto);
    
    console.log('\n✅ Automatic password reset test completed successfully!');
    
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error during automatic password reset test:', error);
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  }
}

testAutoPasswordReset();