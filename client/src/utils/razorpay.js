// Razorpay utility functions
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Razorpay SDK failed to load');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (amount, customerName, customerEmail, customerPhone, onPaymentSuccess, onPaymentFailure) => {
  console.log('Initializing Razorpay payment for amount (in paise):', amount);
  
  // Log environment variables for debugging
  console.log('REACT_APP_RAZORPAY_KEY_ID:', process.env.REACT_APP_RAZORPAY_KEY_ID);
  console.log('Window Razorpay object available:', typeof window.Razorpay !== 'undefined');
  
  const res = await loadRazorpayScript();
  
  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  console.log('Window Razorpay object available after loading:', typeof window.Razorpay !== 'undefined');

  // Create order on the server
  let orderData;
  try {
    console.log('Creating order on server...');
    // Use the correct API base URL
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
    console.log('Using API base URL:', baseURL);
    const response = await fetch(`${baseURL}/payment/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Already in paise
        currency: 'INR',
      }),
    });

    console.log('Order creation response status:', response.status);
    orderData = await response.json();
    console.log('Order creation response:', orderData);
    
    if (!orderData.success || !orderData.orderId) {
      alert('Failed to create order. Please try again.');
      return;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Failed to create order. Please try again.');
    return;
  }

  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RH9Kx0Ibt9neI6';
  console.log('Using Razorpay key:', razorpayKey);

  const options = {
    key: razorpayKey, // Your Razorpay Key ID
    amount: amount,
    currency: 'INR',
    name: 'MindMirror Wellness Store',
    description: 'Wellness Products',
    order_id: orderData.orderId,
    handler: function (response) {
      console.log('Payment successful:', response);
      onPaymentSuccess(response);
    },
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notes: {
      address: 'MindMirror Wellness Store',
    },
    theme: {
      color: '#667eea',
    },
  };

  console.log('Opening Razorpay checkout with options:', options);
  
  const paymentObject = new window.Razorpay(options);
  paymentObject.on('payment.failed', function (response) {
    console.error('Payment failed:', response);
    onPaymentFailure(response);
  });
  
  try {
    paymentObject.open();
    console.log('Razorpay checkout opened successfully');
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    alert('Failed to open payment gateway. Please try again.');
  }
};