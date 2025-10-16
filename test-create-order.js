// Test script to create an order
const createTestOrder = async () => {
  try {
    const orderData = {
      orderId: "ORD-TEST-001",
      userId: "user123",
      userEmail: "test@example.com",
      items: [
        {
          productId: "prod1",
          name: "Test Product",
          price: 99.99,
          quantity: 2
        }
      ],
      shippingAddress: {
        fullName: "John Doe",
        addressLine1: "123 Main St",
        city: "Test City",
        state: "TS",
        postalCode: "12345",
        phone: "555-1234"
      },
      paymentMethod: "Credit Card",
      subtotal: 199.98,
      tax: 36.00,
      total: 235.98,
      status: "confirmed"
    };

    const response = await fetch('http://localhost:5002/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    console.log('Order creation result:', result);
  } catch (error) {
    console.error('Error creating test order:', error);
  }
};

createTestOrder();