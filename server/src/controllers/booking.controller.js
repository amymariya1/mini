import { sendBookingConfirmationEmail } from "../utils/mailer.js";

// Send booking confirmation email
export async function sendBookingConfirmation(req, res) {
  try {
    const { email, bookingDetails } = req.body;

    // Validate input
    if (!email || !bookingDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and booking details are required" 
      });
    }

    // Send the booking confirmation email
    await sendBookingConfirmationEmail(email, bookingDetails);

    res.status(200).json({ 
      success: true, 
      message: "Booking confirmation email sent successfully" 
    });
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send booking confirmation email" 
    });
  }
}