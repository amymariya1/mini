import nodemailer from 'nodemailer';

// Create a transporter using SMTP creds, or Ethereal (dev), or fallback to console
async function createTransporter() {
  // Check if specific email credentials are provided (from user request)
  const specificEmail = "amymariya4@gmail.com";
  const specificPassword = "qjjt imbt tise apxc";
  
  if (specificEmail && specificPassword) {
    // Use the specific Gmail credentials provided by the user
    console.log('Mailer: Using Gmail SMTP with credentials for', specificEmail);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: specificEmail,
        pass: specificPassword
      }
    });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  // 1) Real SMTP if configured
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    console.log('Mailer: Using configured SMTP settings');
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // 2) Ethereal test account for development (gives preview URL)
  try {
    console.log('Mailer: Attempting to create Ethereal test account');
    const account = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    });
    console.log('Mailer: using Ethereal test account. Preview URLs will be printed.');
    return transporter;
  } catch (err) {
    // 3) Final fallback: log to console
    console.warn('Mailer: Ethereal unavailable, falling back to console. Reason:', err?.message || err);
    return {
      sendMail: async ({ to, subject, html, text }) => {
        console.log('\n=== Mailer Fallback (no SMTP configured) ===');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Text:', text || '');
        console.log('HTML:', html || '');
        console.log('=== End Mail ===\n');
        return { accepted: [to] };
      }
    };
  }
}

const transporterPromise = createTransporter();

export async function sendResetEmail(to, resetUrl) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com'; // Use the specified email

  const subject = `${appName} password reset`;
  const text = `You requested a password reset. Click the link to set a new password: ${resetUrl}\nIf you didn't request this, you can ignore this email.`;
  const html = `<p>You requested a password reset.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you didn't request this, you can ignore this email.</p>`;

  console.log(`Mailer: Attempting to send reset email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Email sent successfully to ${to}. Message ID: ${info.messageId}`);

    // If using Ethereal, print the preview URL to the console
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send email to ${to}. Error:`, error.message);
    throw error;
  }
}

// New function to send order confirmation emails
export async function sendOrderConfirmationEmail(to, orderDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com'; // Use the specified email

  const subject = `${appName} - Order Confirmation #${orderDetails.orderId}`;
  
  // Create a detailed order summary
  let orderItemsHtml = '';
  let orderItemsText = '';
  
  for (const item of orderDetails.items) {
    orderItemsHtml += `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price}</td>
        <td>${item.total}</td>
      </tr>`;
      
    orderItemsText += `${item.name} - Qty: ${item.quantity} - Price: ${item.price} - Total: ${item.total}\n`;
  }
  
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
    
    <h3>Order Details</h3>
    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
    <p><strong>Order Date:</strong> ${orderDetails.orderDate}</p>
    <p><strong>Estimated Delivery:</strong> ${orderDetails.deliveryDate}</p>
    
    <h3>Items Purchased</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Item</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Quantity</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Price</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml}
      </tbody>
    </table>
    
    <h3>Order Summary</h3>
    <p><strong>Subtotal:</strong> ${orderDetails.subtotal}</p>
    <p><strong>Shipping:</strong> ${orderDetails.shipping}</p>
    <p><strong>Tax:</strong> ${orderDetails.tax}</p>
    <p><strong>Total Paid:</strong> ${orderDetails.total}</p>
    
    <h3>Delivery Address</h3>
    <p>${orderDetails.deliveryAddress.fullName}</p>
    <p>${orderDetails.deliveryAddress.addressLine1}${orderDetails.deliveryAddress.addressLine2 ? `, ${orderDetails.deliveryAddress.addressLine2}` : ''}</p>
    <p>${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state} ${orderDetails.deliveryAddress.postalCode}</p>
    <p>Phone: ${orderDetails.deliveryAddress.phone}</p>
    
    <p>If you have any questions about your order, please contact our support team.</p>
    <p>Thank you for shopping with ${appName}!</p>
  `;

  const text = `
Thank you for your order! Your order has been confirmed and is being processed.

Order Details:
Order ID: ${orderDetails.orderId}
Order Date: ${orderDetails.orderDate}
Estimated Delivery: ${orderDetails.deliveryDate}

Items Purchased:
${orderItemsText}

Order Summary:
Subtotal: ${orderDetails.subtotal}
Shipping: ${orderDetails.shipping}
Tax: ${orderDetails.tax}
Total Paid: ${orderDetails.total}

Delivery Address:
${orderDetails.deliveryAddress.fullName}
${orderDetails.deliveryAddress.addressLine1}${orderDetails.deliveryAddress.addressLine2 ? `, ${orderDetails.deliveryAddress.addressLine2}` : ''}
${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state} ${orderDetails.deliveryAddress.postalCode}
Phone: ${orderDetails.deliveryAddress.phone}

If you have any questions about your order, please contact our support team.
Thank you for shopping with ${appName}!
  `;

  console.log(`Mailer: Attempting to send order confirmation email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Order confirmation email sent successfully to ${to}. Message ID: ${info.messageId}`);

    // If using Ethereal, print the preview URL to the console
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send order confirmation email to ${to}. Error:`, error.message);
    throw error;
  }
}

// New function to send booking confirmation emails
export async function sendBookingConfirmationEmail(to, bookingDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com'; // Use the specified email

  const subject = `${appName} - Therapy Session Booking Confirmation`;

  const html = `
    <h2>Therapy Session Booking Confirmation</h2>
    <p>Thank you for booking a session with ${appName}! Your appointment has been confirmed.</p>
    
    <h3>Appointment Details</h3>
    <p><strong>Therapist:</strong> ${bookingDetails.therapistName}</p>
    <p><strong>Date:</strong> ${bookingDetails.date}</p>
    <p><strong>Time:</strong> ${bookingDetails.time}</p>
    <p><strong>Duration:</strong> ${bookingDetails.duration}</p>
    
    <h3>Your Information</h3>
    <p><strong>Name:</strong> ${bookingDetails.patientName}</p>
    <p><strong>Age:</strong> ${bookingDetails.patientAge}</p>
    <p><strong>Phone:</strong> ${bookingDetails.patientPhone}</p>
    <p><strong>Email:</strong> ${bookingDetails.patientEmail}</p>
    
    <h3>Reason for Session</h3>
    <p>${bookingDetails.issue}</p>
    
    <p>Please arrive 10 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
    <p>We look forward to helping you on your mental wellness journey.</p>
    <p>Best regards,<br/>The ${appName} Team</p>
  `;

  const text = `
Thank you for booking a session with ${appName}! Your appointment has been confirmed.

Appointment Details:
Therapist: ${bookingDetails.therapistName}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Duration: ${bookingDetails.duration}

Your Information:
Name: ${bookingDetails.patientName}
Age: ${bookingDetails.patientAge}
Phone: ${bookingDetails.patientPhone}
Email: ${bookingDetails.patientEmail}

Reason for Session:
${bookingDetails.issue}

Please arrive 10 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

We look forward to helping you on your mental wellness journey.
Best regards,
The ${appName} Team
  `;

  console.log(`Mailer: Attempting to send booking confirmation email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Booking confirmation email sent successfully to ${to}. Message ID: ${info.messageId}`);

    // If using Ethereal, print the preview URL to the console
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send booking confirmation email to ${to}. Error:`, error.message);
    throw error;
  }
}