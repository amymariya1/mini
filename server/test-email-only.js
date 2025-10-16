// Test script to verify email sending functionality directly
import { sendResetEmail } from './src/utils/mailer.js';

async function testEmailSending() {
  try {
    console.log('=== Testing Email Sending Functionality ===');
    
    const testEmail = 'test@example.com';
    const testUrl = 'http://localhost:3000/reset-password?token=abc123';
    
    console.log(`Sending test email to: ${testEmail}`);
    console.log(`Reset URL: ${testUrl}`);
    
    const result = await sendResetEmail(testEmail, testUrl);
    
    console.log('Email sent successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testEmailSending();