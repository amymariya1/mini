import { sendOrderConfirmationEmail } from "../utils/mailer.js";

// Send order confirmation email
export async function sendOrderConfirmation(req, res) {
  try {
    const { email, orderDetails } = req.body;

    // Validate input
    if (!email || !orderDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and order details are required" 
      });
    }

    // Send the order confirmation email
    await sendOrderConfirmationEmail(email, orderDetails);

    res.status(200).json({ 
      success: true, 
      message: "Order confirmation email sent successfully" 
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send order confirmation email" 
    });
  }
}