# Comprehensive Troubleshooting Guide

## Issues to Fix

1. **Email verification emails not being sent**
2. **"message port closed" console errors**
3. **Network request failures**

## 1. Email Verification Diagnosis

### Step 1: Check Browser Console Logs

When you sign up, look for these logs:
```
Starting signup process for: user@example.com
Creating user with email and password...
User created successfully: [user-id]
User email verified status: false
Updating display name...
Display name updated successfully
Sending email verification...
Current user before verification: { uid: "...", email: "...", emailVerified: false, displayName: "..." }
Email verification sent successfully: [result]
Verification email details: { user: "...", uid: "...", timestamp: "...", authDomain: "..." }
Check Network tab for request to: identitytoolkit.googleapis.com/v1/accounts:sendOobCode
=== SIGNUP COMPLETE ===
```

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "sendOobCode"
3. Try signing up
4. Look for request to: `identitytoolkit.googleapis.com/v1/accounts:sendOobCode`
5. Check response status (should be 200)
6. Check response body for any error messages

### Step 3: Firebase Console Configuration

#### A. Enable Email Verification Template

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `smarttodo-pro`
3. Go to **Authentication** → **Templates**
4. Click **"Email verification"**
5. Ensure it's **enabled**
6. Check **Action URL** domain: `smarttodo-pro.firebaseapp.com`

#### B. Verify Authorized Domains

1. Go to **Authentication** → **Settings**
2. Check **"Authorized domains"**
3. Ensure these are included:
   - `localhost`
   - `smarttodo-pro.firebaseapp.com`

#### C. Check Email Provider Settings

Some email providers block Firebase emails:
1. Check spam/junk folder
2. Add `noreply@smarttodo-pro.firebaseapp.com` to contacts
3. Try with different email providers (Gmail, Outlook, Yahoo)

### Step 4: Test with Debug Tools

1. Sign up with a new account
2. Go to the verify email page
3. Click "Show Debug Tools"
4. Use the "Test Email Verification" button
5. Check console for detailed logs

## 2. Message Port Errors Fix

### Root Cause
The "message port closed" errors are caused by:
1. Firebase Cloud Messaging service worker issues
2. Missing or misconfigured service worker files
3. Chrome extension interference

### Solutions Applied

#### A. Created Proper Firebase Messaging Service Worker

File: `public/firebase-messaging-sw.js`
- Properly configured for Firebase Cloud Messaging
- Handles background messages
- Manages notification clicks

#### B. Enhanced NotificationContext

- Added proper error handling for service worker availability
- Added checks for messaging support
- Graceful fallbacks when FCM is not available

#### C. Fixed Service Worker Registration

- Enhanced error handling in `public/index.html`
- Prevents 404 errors for missing service workers

### Testing Message Port Fix

1. **Clear browser cache and cookies**
2. **Restart the development server**
3. **Open DevTools → Console**
4. **Check for any remaining "message port closed" errors**

## 3. Network Request Verification

### Step 1: Check Network Requests

1. Open DevTools → Network tab
2. Filter by "identitytoolkit"
3. Try signing up
4. Look for these requests:
   - `accounts:signUp` (for user creation)
   - `accounts:sendOobCode` (for email verification)

### Step 2: Verify Response Status

- **200 OK**: Request successful
- **400 Bad Request**: Configuration issue
- **403 Forbidden**: API key or domain restrictions
- **429 Too Many Requests**: Rate limiting

### Step 3: Check Response Body

Look for error messages in the response:
```json
{
  "error": {
    "code": 400,
    "message": "INVALID_EMAIL",
    "errors": [...]
  }
}
```

## 4. Firebase Project Configuration

### A. Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `smarttodo-pro`
3. Go to **APIs & Services** → **Library**
4. Enable these APIs:
   - **Firebase Authentication API**
   - **Identity and Access Management (IAM) API**
   - **Cloud Firestore API** (if using Firestore)

### B. Check API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyCicxNeBgNsm81a-JD_PrRCfzQaR86KW38`
3. Check for any restrictions that might block requests
4. Ensure **Firebase Authentication API** is enabled

### C. Verify Project Settings

1. Go to **Project Settings** → **General**
2. Verify:
   - **Project ID**: `smarttodo-pro`
   - **Web API Key**: `AIzaSyCicxNeBgNsm81a-JD_PrRCfzQaR86KW38`

## 5. Testing Checklist

### Email Verification Test

- [ ] User account created successfully
- [ ] `sendEmailVerification()` called without errors
- [ ] Network request to `sendOobCode` returns 200
- [ ] Email received in inbox (not spam)
- [ ] Email contains correct verification link
- [ ] Verification link works and verifies email
- [ ] User can sign in after verification

### Console Error Test

- [ ] No "message port closed" errors
- [ ] No "unsupported MIME type" errors
- [ ] No manifest syntax errors
- [ ] No service worker registration errors

### Network Request Test

- [ ] All requests to `identitytoolkit.googleapis.com` return 200
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] Proper request headers and payload

## 6. Production Deployment

### A. Domain Configuration

1. Add your production domain to authorized domains
2. Update Action URL in email templates
3. Verify domain ownership if required

### B. Email Provider Whitelisting

Contact your email provider to whitelist:
- `noreply@smarttodo-pro.firebaseapp.com`
- `noreply@[your-project-id].firebaseapp.com`

### C. SSL/HTTPS Requirements

Ensure your production domain uses HTTPS, as Firebase requires secure connections.

## 7. Debug Tools Available

### A. Email Verification Test Component

Located at: `src/components/auth/EmailVerificationTest.tsx`
- Tests email verification functionality
- Provides detailed logging
- Helps diagnose network issues

### B. Enhanced Console Logging

All authentication operations now include detailed logging:
- User creation process
- Email verification attempts
- Network request details
- Error codes and messages

### C. Network Monitoring

- Filter by "sendOobCode" to track email verification requests
- Filter by "identitytoolkit" to see all Firebase Auth requests
- Check response status and body for error details

## 8. Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/operation-not-allowed` | Email/password not enabled | Enable in Firebase Console |
| `auth/invalid-api-key` | API key issues | Check API key restrictions |
| `auth/unauthorized-domain` | Domain not authorized | Add domain to authorized list |
| `auth/too-many-requests` | Rate limiting | Wait and try again |
| `auth/network-request-failed` | Network issues | Check internet connection |

## 9. Next Steps

1. **Test the signup flow** with enhanced logging
2. **Check browser console** for detailed logs
3. **Verify Firebase Console** settings
4. **Test with different email providers**
5. **Check spam folders** for verification emails
6. **Monitor network requests** for any failures

If issues persist, the detailed error logs will help identify the specific problem. 