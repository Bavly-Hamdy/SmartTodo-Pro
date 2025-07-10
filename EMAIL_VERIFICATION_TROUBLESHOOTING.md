# Email Verification Troubleshooting Guide

## Current Issue: Email Verification Not Being Sent

The `sendEmailVerification()` function is being called but emails are not being received.

## Debugging Steps

### 1. Check Browser Console Logs

Look for these logs during signup:
```
Starting signup process for: user@example.com
Creating user with email and password...
User created successfully: [user-id]
Updating display name...
Display name updated successfully
Sending email verification...
Email verification sent successfully
```

If you see an error after "Sending email verification...", check the error details.

### 2. Check Network Tab

1. Open browser DevTools → Network tab
2. Try signing up a new user
3. Look for a request to: `identitytoolkit.googleapis.com/v1/accounts:sendOobCode`
4. Check the response status and body

### 3. Firebase Console Configuration

#### A. Enable Email Verification Template

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smarttodo-pro`
3. Go to **Authentication** → **Templates**
4. Click on **"Email verification"**
5. Make sure it's **enabled**
6. Check the **Action URL** domain matches your `authDomain`

#### B. Verify Action URL Domain

1. In the Email verification template settings
2. Check that the **Action URL** domain matches: `smarttodo-pro.firebaseapp.com`
3. The URL should be: `https://smarttodo-pro.firebaseapp.com/__/auth/action?apiKey=...`

#### C. Check Authorized Domains

1. Go to **Authentication** → **Settings**
2. Check **"Authorized domains"**
3. Make sure these are included:
   - `localhost` (for development)
   - `smarttodo-pro.firebaseapp.com`
   - Your production domain (if any)

### 4. Common Issues and Solutions

#### Issue: "auth/too-many-requests"
**Solution**: Wait a few minutes before trying again. Firebase has rate limits.

#### Issue: "auth/network-request-failed"
**Solution**: Check your internet connection and try again.

#### Issue: "auth/invalid-user"
**Solution**: The user account might be corrupted. Try signing up with a different email.

#### Issue: "auth/user-not-found"
**Solution**: The user account was deleted or doesn't exist. Try signing up again.

#### Issue: No error but no email received
**Solutions**:
1. Check spam/junk folder
2. Verify the email address is correct
3. Check if your email provider is blocking Firebase emails
4. Try with a different email provider (Gmail, Outlook, etc.)

### 5. Testing Steps

#### A. Test with Different Email Providers

Try signing up with:
- Gmail account
- Outlook/Hotmail account
- Yahoo account
- Custom domain email

#### B. Check Email Provider Settings

Some email providers block automated emails:
1. Check spam/junk folder
2. Add `noreply@smarttodo-pro.firebaseapp.com` to contacts
3. Check email provider's security settings

#### C. Test Network Requests

1. Open DevTools → Network tab
2. Filter by "sendOobCode"
3. Try signing up and check the request:
   - Status should be 200
   - Response should contain success message
   - Check for any error messages in response

### 6. Firebase Configuration Verification

#### A. Check Project Settings

1. Go to **Project Settings** → **General**
2. Verify **Project ID**: `smarttodo-pro`
3. Verify **Web API Key**: `AIzaSyCicxNeBgNsm81a-JD_PrRCfzQaR86KW38`

#### B. Check Authentication Settings

1. Go to **Authentication** → **Settings**
2. Verify **Authorized domains** include:
   - `localhost`
   - `smarttodo-pro.firebaseapp.com`

#### C. Check Email Templates

1. Go to **Authentication** → **Templates**
2. Click **"Email verification"**
3. Verify settings:
   - **Subject**: "Verify your email address"
   - **Action URL**: Should contain your auth domain
   - **From name**: "SmartTodo Pro"
   - **From email**: "noreply@smarttodo-pro.firebaseapp.com"

### 7. Alternative Solutions

#### A. Use Custom Email Template

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click **"Email verification"**
3. Customize the template with your branding
4. Test the template

#### B. Check Billing Status

1. Go to **Project Settings** → **Usage and billing**
2. Ensure your project has billing enabled
3. Check if you've exceeded any quotas

#### C. Enable Debug Logging

Add this to your code to get more detailed logs:
```javascript
// In your signup function
console.log('Firebase Auth current user:', auth.currentUser);
console.log('User email verified:', auth.currentUser?.emailVerified);
```

### 8. Production Considerations

#### A. Domain Verification

For production, verify your domain:
1. Go to **Authentication** → **Settings**
2. Add your production domain to authorized domains
3. Verify domain ownership if required

#### B. Email Provider Whitelisting

Contact your email provider to whitelist Firebase emails:
- `noreply@smarttodo-pro.firebaseapp.com`
- `noreply@[your-project-id].firebaseapp.com`

### 9. Testing Checklist

- [ ] User account created successfully
- [ ] `sendEmailVerification()` called without errors
- [ ] Network request to `sendOobCode` returns 200
- [ ] Email received in inbox (not spam)
- [ ] Email contains correct verification link
- [ ] Verification link works and verifies email
- [ ] User can sign in after verification

### 10. Next Steps

1. **Test the signup flow** with the enhanced error logging
2. **Check the browser console** for detailed logs
3. **Verify Firebase Console** settings
4. **Test with different email providers**
5. **Check spam folders** for verification emails

If the issue persists, the detailed error logs will help identify the specific problem. 