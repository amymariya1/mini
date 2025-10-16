// Test script to check behavior with non-existent email
import { forgotPassword } from './src/controllers/auth.controller.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock request and response objects for non-existent email
const mockReqNonExistent = {
  body: {
    email: 'nonexistent@example.com'
  }
};

const mockResNonExistent = {
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

async function testNonExistentEmail() {
  try {
    console.log('Testing password reset with non-existent email...');
    
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
    
    // Test the forgot password functionality with non-existent email
    console.log('\nTesting forgot password functionality with non-existent email...');
    await forgotPassword(mockReqNonExistent, mockResNonExistent);
    
    console.log('\n✅ Non-existent email test completed successfully!');
    
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error during non-existent email test:', error);
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  }
}

testNonExistentEmail();