import Razorpay from "razorpay";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RH9Kx0Ibt9neI6',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'CjIJyaqKbJzhUNR9J0zu4KjI',
});

// Create a new Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Create order options
    // Amount is already in paise from the client, no need to multiply by 100
    const options = {
      amount: amount, // Already in paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    // Create order using Razorpay instance
    const order = await razorpay.orders.create(options);

    // Return success response
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};