// Test script to verify order confirmation email functionality
import { sendOrderConfirmationEmail } from './src/utils/mailer.js';

async function testOrderEmail() {
  try {
    console.log('Testing order confirmation email functionality...');
    
    const testEmail = 'test@example.com';
    const orderDetails = {
      orderId: 'ORD-1234',
      orderDate: '2023-10-15',
      deliveryDate: '2023-10-18',
      items: [
        {
          name: 'Test Product',
          quantity: 2,
          price: '₹500.00',
          total: '₹1000.00'
        }
      ],
      subtotal: '₹1000.00',
      shipping: 'FREE',
      tax: '₹180.00',
      total: '₹1180.00',
      deliveryAddress: {
        fullName: 'John Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        phone: '123-456-7890'
      }
    };
    
    console.log(`Sending order confirmation email to: ${testEmail}`);
    console.log('Order details:', JSON.stringify(orderDetails, null, 2));
    
    const result = await sendOrderConfirmationEmail(testEmail, orderDetails);
    
    console.log('Order confirmation email sent successfully!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testOrderEmail();