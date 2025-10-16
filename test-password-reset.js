// Test script for password reset functionality
import { sendResetEmail } from './server/src/utils/mailer.js';

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    await sendResetEmail('test@example.com', 'http://localhost:3000/reset-password?token=abc123');
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();