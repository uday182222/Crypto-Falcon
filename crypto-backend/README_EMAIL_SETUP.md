# Email Setup Guide for MotionFalcon

## Setting Up Gmail SMTP for Password Reset Emails

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 3: Configure Environment Variables
Add these to your Render backend environment variables:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-16-character-app-password
```

### Step 4: Test the Setup
1. Deploy the changes
2. Try the forgot password feature
3. Check your email for the reset token

## Alternative: Use Console Logs (Current Setup)
If you don't want to set up email right now, the reset tokens are printed to the console logs. Check your Render logs to see the token.

## Troubleshooting
- Make sure 2FA is enabled on Gmail
- Use the app password, not your regular Gmail password
- Check that all environment variables are set correctly
- Verify the email address exists in your database 