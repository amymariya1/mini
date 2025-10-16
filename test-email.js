// Test script to verify email functionality
import nodemailer from 'nodemailer';

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    // Use the same configuration as in mailer.js
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "amymariya4@gmail.com",
        pass: "qjjt imbt tise apxc"
      }
    });

    // Verify the connection
    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Send a test email
    const info = await transporter.sendMail({
      from: '"MindMirror" <amymariya4@gmail.com>',
      to: "test@example.com",
      subject: "Test Email from MindMirror",
      text: "This is a test email to verify the email configuration.",
      html: "<p>This is a <b>test email</b> to verify the email configuration.</p>"
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error.message);
    console.error('Error details:', error);
  }
}

testEmail();