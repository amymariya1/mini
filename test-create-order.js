// Test script to create an order
const createTestOrder = async () => {
  try {
    // First order
    const orderData1 = {
      orderId: "ORD-TEST-001",
      userId: "user123",
      userEmail: "test@example.com",
      items: [
        {
          productId: "prod1",
          name: "Wellness Book",
          price: 29.99,
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
      subtotal: 59.98,
      tax: 10.80,
      total: 70.78,
      status: "confirmed"
    };

    const response1 = await fetch('http://localhost:5002/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData1)
    });

    const result1 = await response1.json();
    console.log('Order 1 creation result:', result1);
    
    // Second order with different products
    const orderData2 = {
      orderId: "ORD-TEST-002",
      userId: "user456",
      userEmail: "test2@example.com",
      items: [
        {
          productId: "prod2",
          name: "Meditation Cushion",
          price: 49.99,
          quantity: 1
        },
        {
          productId: "prod3",
          name: "Aromatherapy Kit",
          price: 39.99,
          quantity: 3
        }
      ],
      shippingAddress: {
        fullName: "Jane Smith",
        addressLine1: "456 Oak Ave",
        city: "Sample Town",
        state: "ST",
        postalCode: "67890",
        phone: "555-5678"
      },
      paymentMethod: "PayPal",
      subtotal: 169.96,
      tax: 30.59,
      total: 200.55,
      status: "processing"
    };

    const response2 = await fetch('http://localhost:5002/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData2)
    });

    const result2 = await response2.json();
    console.log('Order 2 creation result:', result2);
    
    // Third order with some same products
    const orderData3 = {
      orderId: "ORD-TEST-003",
      userId: "user789",
      userEmail: "test3@example.com",
      items: [
        {
          productId: "prod1",
          name: "Wellness Book",
          price: 29.99,
          quantity: 1
        },
        {
          productId: "prod2",
          name: "Meditation Cushion",
          price: 49.99,
          quantity: 2
        }
      ],
      shippingAddress: {
        fullName: "Bob Johnson",
        addressLine1: "789 Pine St",
        city: "Demo City",
        state: "DC",
        postalCode: "11223",
        phone: "555-9012"
      },
      paymentMethod: "Credit Card",
      subtotal: 129.97,
      tax: 23.40,
      total: 153.37,
      status: "shipped"
    };

    const response3 = await fetch('http://localhost:5002/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData3)
    });

    const result3 = await response3.json();
    console.log('Order 3 creation result:', result3);
  } catch (error) {
    console.error('Error creating test orders:', error);
  }
};

createTestOrder();