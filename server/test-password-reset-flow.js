// Test script to simulate the entire password reset flow
import { forgotPassword } from './src/controllers/auth.controller.js';
import { sendResetEmail } from './src/utils/mailer.js';
import { createUser, findByEmail } from './src/utils/userStore.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects
const mockReq = {
  body: {
    email: 'test@example.com'
  }
};

const mockRes = {
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

async function testPasswordResetFlow() {
  try {
    console.log('Starting password reset flow test...');
    
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
    
    // Check if test user already exists
    console.log('\n1. Checking if test user exists...');
    let testUser = await findByEmail('test@example.com');
    
    if (!testUser) {
      // Create a test user if it doesn't exist
      console.log('Creating test user...');
      testUser = await createUser({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed_password_here',
        age: 25
      });
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('✅ Test user already exists:', testUser.email);
    }
    
    // Verify user was found
    const foundUser = await findByEmail('test@example.com');
    console.log('✅ User found in database:', foundUser.email);
    
    // Test the forgot password functionality
    console.log('\n2. Testing forgot password functionality...');
    await forgotPassword(mockReq, mockRes);
    
    console.log('\n✅ Password reset flow test completed successfully!');
    
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error during password reset flow test:', error);
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  }
}

testPasswordResetFlow();