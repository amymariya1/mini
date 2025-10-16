# Email Troubleshooting Guide

## Common Issues and Solutions

### 1. Emails Not Received
If users are reporting that they're not receiving password reset emails:

1. **Check Spam/Junk Folder**: Emails may be filtered as spam. Ask users to check their spam/junk folders.

2. **Verify Email Address**: Ensure the user is entering the correct email address associated with their account.

3. **Check Server Logs**: Look for error messages in the server console when password reset requests are made.

4. **Test Email Configuration**: Run the test script to verify email functionality:
   ```bash
   cd server
   node test-email.js
   ```

### 2. Gmail Configuration Issues
For Gmail accounts, ensure that:

1. **App Password is Used**: A 16-character app password is required, not the regular Gmail password.
   - Go to Google Account settings
   - Navigate to Security
   - Enable 2-Factor Authentication
   - Generate an App Password
   - Use this app password in the configuration

2. **Less Secure Apps**: If not using app passwords, "Less secure app access" must be enabled (not recommended).

### 3. Debugging Steps

1. **Enable Detailed Logging**: The system now includes detailed logging for email operations.

2. **Check Network Connectivity**: Ensure the server can connect to Gmail's SMTP servers.

3. **Verify Environment Variables**: Check that all required environment variables are set correctly.

### 4. Testing the Password Reset Flow

To test the complete password reset flow:

1. Register a new user account
2. Go to the Forgot Password page
3. Enter the email address used during registration
4. Check your email inbox (and spam folder)
5. Click the reset link
6. Set a new password
7. Try logging in with the new password

### 5. Common Error Messages

- **"Invalid login credentials"**: Check Gmail credentials in the mailer configuration
- **"Connection timeout"**: Check network connectivity to Gmail's servers
- **"Authentication failed"**: Verify the app password is correct

### 6. Environment Variables

Ensure these environment variables are set in your `.env` file:

```
# Email Configuration
MAIL_FROM=amymariya4@gmail.com
```

The Gmail credentials are hardcoded in the mailer utility for this specific implementation.

### 7. System Behavior

The password reset system now only sends emails to registered users. If a user enters an email that is not registered in the system, they will still see a success message to prevent email enumeration attacks, but no email will actually be sent.

### 8. Contact for Issues

If emails continue to not be delivered:
1. Check server logs for specific error messages
2. Verify the recipient email address is correct
3. Test with different email providers (Gmail, Outlook, etc.)
4. Contact system administrator for further assistance