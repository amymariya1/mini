import nodemailer from 'nodemailer';

// Create a transporter using SMTP creds, or Ethereal (dev), or fallback to console
async function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  // 1) Real SMTP if configured
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // 2) Ethereal test account for development (gives preview URL)
  try {
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
  const from = process.env.MAIL_FROM || 'no-reply@mindmirror.local';

  const subject = `${appName} password reset`;
  const text = `You requested a password reset. Click the link to set a new password: ${resetUrl}\nIf you didn't request this, you can ignore this email.`;
  const html = `<p>You requested a password reset.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you didn't request this, you can ignore this email.</p>`;

  const transporter = await transporterPromise;
  const info = await transporter.sendMail({ from, to, subject, text, html });

  // If using Ethereal, print the preview URL to the console
  const previewUrl = nodemailer.getTestMessageUrl?.(info);
  if (previewUrl) {
    console.log('Ethereal preview URL:', previewUrl);
  }
}