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

// Function to send booking confirmation emails
export async function sendBookingConfirmationEmail(to, bookingDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com'; // Use the specified email

  const subject = `${appName} - Therapy Session Booking Confirmation`;

  // Format date if it's a string
  const appointmentDate = bookingDetails.date ? 
    (typeof bookingDetails.date === 'string' ? new Date(bookingDetails.date).toLocaleDateString() : bookingDetails.date) : 
    'Not specified';
  
  // Use timeSlot if time is not available
  const appointmentTime = bookingDetails.time || bookingDetails.timeSlot || 'Not specified';
  
  // Build patient information section if available
  let patientInfoHtml = '';
  let patientInfoText = '';
  
  if (bookingDetails.patientName || bookingDetails.patientEmail) {
    patientInfoHtml = `
      <h3>Your Information</h3>
      <p><strong>Name:</strong> ${bookingDetails.patientName || 'Not provided'}</p>
      ${bookingDetails.patientAge ? `<p><strong>Age:</strong> ${bookingDetails.patientAge}</p>` : ''}
      ${bookingDetails.patientPhone ? `<p><strong>Phone:</strong> ${bookingDetails.patientPhone}</p>` : ''}
      <p><strong>Email:</strong> ${bookingDetails.patientEmail || to}</p>
    `;
    
    patientInfoText = `
Your Information:
Name: ${bookingDetails.patientName || 'Not provided'}
${bookingDetails.patientAge ? `Age: ${bookingDetails.patientAge}\n` : ''}${bookingDetails.patientPhone ? `Phone: ${bookingDetails.patientPhone}\n` : ''}Email: ${bookingDetails.patientEmail || to}
    `;
  }
  
  // Build issue/reason section if available
  const issueHtml = bookingDetails.issue ? 
    `<h3>Reason for Session</h3><p>${bookingDetails.issue}</p>` : '';
  
  const issueText = bookingDetails.issue ? 
    `\nReason for Session:\n${bookingDetails.issue}\n` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .section { margin-bottom: 25px; }
        .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
        .detail-row { margin: 8px 0; }
        .detail-label { font-weight: bold; color: #555; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight-box { background: #f0f4ff; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🧠 Appointment Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your therapy session has been successfully booked</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${bookingDetails.patientName},</p>
          <p>Thank you for booking a session with ${appName}! Your appointment has been confirmed and we're looking forward to supporting you on your mental wellness journey.</p>
          
          <div class="highlight-box">
            <div class="section-title">📅 Appointment Details</div>
            <div class="detail-row"><span class="detail-label">Therapist:</span> ${bookingDetails.therapistName}</div>
            <div class="detail-row"><span class="detail-label">Date:</span> ${bookingDetails.date}</div>
            <div class="detail-row"><span class="detail-label">Time:</span> ${bookingDetails.time}</div>
            <div class="detail-row"><span class="detail-label">Duration:</span> ${bookingDetails.duration}</div>
          </div>
          
          <div class="section">
            <div class="section-title">👤 Your Information</div>
            <div class="detail-row"><span class="detail-label">Name:</span> ${bookingDetails.patientName}</div>
            ${bookingDetails.patientAge ? `<div class="detail-row"><span class="detail-label">Age:</span> ${bookingDetails.patientAge}</div>` : ''}
            <div class="detail-row"><span class="detail-label">Phone:</span> ${bookingDetails.patientPhone}</div>
            <div class="detail-row"><span class="detail-label">Email:</span> ${bookingDetails.patientEmail}</div>
          </div>
          
          ${bookingDetails.issue ? `
          <div class="section">
            <div class="section-title">📝 Reason for Session</div>
            <p style="margin: 10px 0;">${bookingDetails.issue}</p>
          </div>
          ` : ''}
          
          <div class="section" style="background: #fff8e1; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <strong>⏰ Important Reminders:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please arrive 10 minutes early for your appointment</li>
              <li>To reschedule or cancel, contact us at least 24 hours in advance</li>
              <li>Bring any relevant medical documents or notes</li>
            </ul>
          </div>
          
          <p style="margin-top: 25px;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p style="margin-top: 20px;">We look forward to helping you achieve your mental wellness goals.</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Best regards,</strong></p>
          <p style="margin: 0;">The ${appName} Team</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
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

// New function to send leave notification emails
export async function sendLeaveNotificationEmail(to, leaveDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com'; // Use the specified email

  const subject = `${appName} - Therapist Leave Notification`;
  
  // Create a detailed leave notification
  let affectedAppointmentsHtml = '';
  let affectedAppointmentsText = '';
  
  for (const appt of leaveDetails.affectedAppointments) {
    affectedAppointmentsHtml += `
      <tr>
        <td>${new Date(appt.date).toLocaleDateString()}</td>
        <td>${appt.timeSlot}</td>
      </tr>`;
      
    affectedAppointmentsText += `Date: ${new Date(appt.date).toLocaleDateString()} - Time: ${appt.timeSlot}\n`;
  }
  
  const html = `
    <h2>Therapist Leave Notification</h2>
    <p>We're writing to inform you that your therapist, ${leaveDetails.therapistName}, has scheduled leave from ${new Date(leaveDetails.startDate).toLocaleDateString()} to ${new Date(leaveDetails.endDate).toLocaleDateString()}.</p>
    
    ${leaveDetails.reason ? `<p><strong>Reason:</strong> ${leaveDetails.reason}</p>` : ''}
    
    <h3>Affected Appointments</h3>
    <p>The following appointments have been cancelled due to this leave:</p>
    
    ${leaveDetails.affectedAppointments.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Date</th>
          <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Time</th>
        </tr>
      </thead>
      <tbody>
        ${affectedAppointmentsHtml}
      </tbody>
    </table>
    <p style="margin-top: 20px;">
      <a href="http://localhost:3000/therapists" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reschedule Appointment</a>
    </p>
    <p>Please reschedule these appointments at your earliest convenience.</p>
    ` : '<p>No appointments were affected by this leave.</p>'}
    
    <p>If you have any questions or need assistance rescheduling, please contact our support team.</p>
    <p>Thank you for your understanding.</p>
  `;

  const text = `
Therapist Leave Notification

We're writing to inform you that your therapist, ${leaveDetails.therapistName}, has scheduled leave from ${new Date(leaveDetails.startDate).toLocaleDateString()} to ${new Date(leaveDetails.endDate).toLocaleDateString()}.

${leaveDetails.reason ? `Reason: ${leaveDetails.reason}\n` : ''}

Affected Appointments:
The following appointments have been cancelled due to this leave:

${leaveDetails.affectedAppointments.length > 0 ? `
${affectedAppointmentsText}
Please reschedule these appointments at your earliest convenience by visiting http://localhost:3000/therapists
` : 'No appointments were affected by this leave.'}

If you have any questions or need assistance rescheduling, please contact our support team.
Thank you for your understanding.
  `;

  console.log(`Mailer: Attempting to send leave notification email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Leave notification email sent successfully to ${to}. Message ID: ${info.messageId}`);

    // If using Ethereal, print the preview URL to the console
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send leave notification email to ${to}. Error:`, error.message);
    throw error;
  }
}

// Function to send welcome email when user registers
export async function sendWelcomeEmail(to, userDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com';

  const subject = `Welcome to ${appName}! 🎉`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .section { margin-bottom: 25px; }
        .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
        .feature-box { background: #f8f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .feature-title { color: #667eea; font-weight: bold; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🧠 Welcome to ${appName}!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Your journey to mental wellness starts here</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userDetails.name},</p>
          <p>Thank you for joining ${appName}! We're thrilled to have you as part of our community dedicated to mental health and wellness.</p>
          
          ${userDetails.userType === 'therapist' ? `
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px;">
            <strong>⏳ Account Under Review</strong>
            <p style="margin: 10px 0 0 0;">Your therapist account is currently pending admin approval. We'll review your credentials and notify you once your account is activated. This typically takes 24-48 hours.</p>
          </div>
          ` : ''}
          
          <div class="section">
            <h3 style="color: #667eea; margin-bottom: 15px;">What You Can Do Now:</h3>
            
            ${userDetails.userType === 'therapist' ? `
            <div class="feature-box">
              <div class="feature-title">📋 Complete Your Profile</div>
              <p style="margin: 5px 0 0 0;">Add your bio, specialization, and experience to help patients find you.</p>
            </div>
            <div class="feature-box">
              <div class="feature-title">📅 Set Your Availability</div>
              <p style="margin: 5px 0 0 0;">Configure your schedule once your account is approved.</p>
            </div>
            <div class="feature-box">
              <div class="feature-title">💬 Prepare for Sessions</div>
              <p style="margin: 5px 0 0 0;">Familiarize yourself with our secure chat and video features.</p>
            </div>
            ` : `
            <div class="feature-box">
              <div class="feature-title">🔍 Find a Therapist</div>
              <p style="margin: 5px 0 0 0;">Browse our network of licensed mental health professionals.</p>
            </div>
            <div class="feature-box">
              <div class="feature-title">📅 Book Sessions</div>
              <p style="margin: 5px 0 0 0;">Schedule appointments at times that work for you.</p>
            </div>
            <div class="feature-box">
              <div class="feature-title">💬 Secure Chat</div>
              <p style="margin: 5px 0 0 0;">Connect with your therapist through our private messaging system.</p>
            </div>
            <div class="feature-box">
              <div class="feature-title">📚 Access Resources</div>
              <p style="margin: 5px 0 0 0;">Explore articles, tips, and tools for mental wellness.</p>
            </div>
            `}
          </div>
          
          ${userDetails.userType !== 'therapist' ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/therapists" class="button">Find Your Therapist</a>
          </div>
          ` : ''}
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>💚 Your Privacy Matters</strong>
            <p style="margin: 10px 0 0 0;">All conversations are confidential and encrypted. Your mental health journey is safe with us.</p>
          </div>
          
          <p style="margin-top: 25px;">If you have any questions or need assistance, our support team is here to help.</p>
          <p>Welcome aboard, and here's to your mental wellness journey!</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Best regards,</strong></p>
          <p style="margin: 0;">The ${appName} Team</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">Need help? Contact us at support@mindmirror.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to ${appName}!

Dear ${userDetails.name},

Thank you for joining ${appName}! We're thrilled to have you as part of our community dedicated to mental health and wellness.

${userDetails.userType === 'therapist' ? 
`Your therapist account is currently pending admin approval. We'll review your credentials and notify you once your account is activated. This typically takes 24-48 hours.` : 
`You can now browse our network of licensed therapists, book sessions, and access our secure chat features.`}

${userDetails.userType === 'therapist' ? 
`What You Can Do Now:
- Complete Your Profile: Add your bio, specialization, and experience
- Set Your Availability: Configure your schedule once approved
- Prepare for Sessions: Familiarize yourself with our platform` :
`What You Can Do Now:
- Find a Therapist: Browse our network of licensed professionals
- Book Sessions: Schedule appointments at your convenience
- Secure Chat: Connect with your therapist privately
- Access Resources: Explore mental wellness articles and tools`}

Your Privacy Matters: All conversations are confidential and encrypted.

If you have any questions, our support team is here to help.

Welcome aboard!

Best regards,
The ${appName} Team
  `;

  console.log(`Mailer: Attempting to send welcome email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Welcome email sent successfully to ${to}. Message ID: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send welcome email to ${to}. Error:`, error.message);
    throw error;
  }
}

// Function to send therapist approval email
export async function sendTherapistApprovalEmail(to, therapistDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com';

  const subject = `🎉 Your ${appName} Therapist Account Has Been Approved!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .section { margin-bottom: 25px; }
        .button { display: inline-block; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
        .success-box { background: #d1fae5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
        .next-steps { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">✅ Account Approved!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">You're ready to start helping patients</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear Dr. ${therapistDetails.name},</p>
          
          <div class="success-box">
            <h3 style="margin: 0 0 10px 0; color: #059669;">🎊 Congratulations!</h3>
            <p style="margin: 0;">Your therapist account has been approved by our admin team. You can now start accepting patients and providing mental health services through ${appName}.</p>
          </div>
          
          <div class="section">
            <h3 style="color: #10b981; margin-bottom: 15px;">Next Steps to Get Started:</h3>
            
            <div class="next-steps">
              <strong>1. 📝 Complete Your Profile</strong>
              <p style="margin: 5px 0 0 0;">Add a professional bio, your specializations, and years of experience to help patients find you.</p>
            </div>
            
            <div class="next-steps">
              <strong>2. 📅 Set Your Availability</strong>
              <p style="margin: 5px 0 0 0;">Configure your weekly schedule and available time slots for appointments.</p>
            </div>
            
            <div class="next-steps">
              <strong>3. 💬 Familiarize with Chat System</strong>
              <p style="margin: 5px 0 0 0;">Learn how to communicate securely with your patients through our encrypted messaging.</p>
            </div>
            
            <div class="next-steps">
              <strong>4. 📋 Review Patient Appointments</strong>
              <p style="margin: 5px 0 0 0;">Check your dashboard regularly for new appointment requests and messages.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">Login to Your Dashboard</a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 5px;">
            <strong>📌 Important Reminders:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Maintain patient confidentiality at all times</li>
              <li>Respond to patient messages within 24 hours</li>
              <li>Update your availability regularly</li>
              <li>Follow professional ethics and guidelines</li>
            </ul>
          </div>
          
          <p style="margin-top: 25px;">We're excited to have you on our platform helping people on their mental wellness journey.</p>
          <p>If you have any questions or need support, please don't hesitate to reach out to our team.</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Best regards,</strong></p>
          <p style="margin: 0;">The ${appName} Admin Team</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">Questions? Contact us at admin@mindmirror.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Account Approved!

Dear Dr. ${therapistDetails.name},

Congratulations! Your therapist account has been approved by our admin team. You can now start accepting patients and providing mental health services through ${appName}.

Next Steps to Get Started:

1. Complete Your Profile
   Add a professional bio, your specializations, and years of experience.

2. Set Your Availability
   Configure your weekly schedule and available time slots for appointments.

3. Familiarize with Chat System
   Learn how to communicate securely with your patients.

4. Review Patient Appointments
   Check your dashboard regularly for new appointment requests.

Important Reminders:
- Maintain patient confidentiality at all times
- Respond to patient messages within 24 hours
- Update your availability regularly
- Follow professional ethics and guidelines

Login to your dashboard: ${process.env.APP_URL || 'http://localhost:3000'}/login

We're excited to have you on our platform!

Best regards,
The ${appName} Admin Team
  `;

  console.log(`Mailer: Attempting to send therapist approval email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Therapist approval email sent successfully to ${to}. Message ID: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send therapist approval email to ${to}. Error:`, error.message);
    throw error;
  }
}

// Function to send therapist rejection email
export async function sendTherapistRejectionEmail(to, rejectionDetails) {
  const appName = process.env.APP_NAME || 'MindMirror';
  const from = process.env.MAIL_FROM || 'amymariya4@gmail.com';

  const subject = `${appName} Therapist Application Update`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .section { margin-bottom: 25px; }
        .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
        .info-box { background: #fee2e2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">Application Status Update</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95;">Regarding your therapist application</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${rejectionDetails.name},</p>
          
          <p>Thank you for your interest in joining ${appName} as a therapist. After careful review of your application, we regret to inform you that we are unable to approve your account at this time.</p>
          
          ${rejectionDetails.reason ? `
          <div class="info-box">
            <strong>Reason for Decision:</strong>
            <p style="margin: 10px 0 0 0;">${rejectionDetails.reason}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <h3 style="color: #667eea; margin-bottom: 15px;">What You Can Do:</h3>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <strong>📧 Contact Us</strong>
              <p style="margin: 5px 0 0 0;">If you believe this decision was made in error or would like more information, please contact our admin team.</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <strong>🔄 Reapply</strong>
              <p style="margin: 5px 0 0 0;">You may reapply in the future once you've addressed the concerns mentioned above.</p>
            </div>
          </div>
          
          <p style="margin-top: 25px;">We appreciate your understanding and wish you the best in your professional endeavors.</p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Best regards,</strong></p>
          <p style="margin: 0;">The ${appName} Admin Team</p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">Questions? Contact us at admin@mindmirror.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Application Status Update

Dear ${rejectionDetails.name},

Thank you for your interest in joining ${appName} as a therapist. After careful review of your application, we regret to inform you that we are unable to approve your account at this time.

${rejectionDetails.reason ? `Reason for Decision:\n${rejectionDetails.reason}\n\n` : ''}

What You Can Do:
- Contact Us: If you believe this decision was made in error, please contact our admin team.
- Reapply: You may reapply in the future once you've addressed the concerns.

We appreciate your understanding and wish you the best in your professional endeavors.

Best regards,
The ${appName} Admin Team
  `;

  console.log(`Mailer: Attempting to send therapist rejection email to ${to}`);
  
  try {
    const transporter = await transporterPromise;
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log(`Mailer: Therapist rejection email sent successfully to ${to}. Message ID: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    console.error(`Mailer: Failed to send therapist rejection email to ${to}. Error:`, error.message);
    throw error;
  }
}