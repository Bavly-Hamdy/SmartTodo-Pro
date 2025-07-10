# Firebase Authentication Troubleshooting

## Current Issue: 400 Bad Request on Signup

The error `POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=... 400 (Bad Request)` indicates that Firebase Authentication is not properly configured.

## Quick Fixes

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smarttodo-pro`
3. In the left sidebar, click **"Authentication"**
4. Click **"Get started"** (if not already done)
5. Go to the **"Sign-in method"** tab
6. Click on **"Email/Password"**
7. Enable **"Email/Password"** provider
8. Click **"Save"**

### 2. Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `smarttodo-pro`
3. Go to **"APIs & Services"** > **"Credentials"**
4. Find your API key: `AIzaSyCicxNeBgNsm81a-JD_PrRCfzQaR86KW38`
5. Check if there are any restrictions that might block the requests
6. Make sure **"Firebase Authentication API"** is enabled

### 3. Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `smarttodo-pro`
3. Go to **"APIs & Services"** > **"Library"**
4. Search for and enable these APIs:
   - **Firebase Authentication API**
   - **Identity and Access Management (IAM) API**
   - **Cloud Firestore API** (if using Firestore)

### 4. Check Domain Restrictions

1. In Firebase Console, go to **"Authentication"** > **"Settings"**
2. Check the **"Authorized domains"** section
3. Make sure `localhost` is included for development
4. Add your production domain if needed

## Debugging Steps

### 1. Check Browser Console

Look for these logs when the app starts:
```
Firebase Config Test:
- Project ID: smarttodo-pro
- Auth Domain: smarttodo-pro.firebaseapp.com
- API Key exists: true
- Auth initialized: true
- App initialized: true
- Current user: None
- Firebase Auth working: ✅
```

### 2. Test Signup Process

When you try to sign up, look for these logs:
```
Starting signup process for: user@example.com
Creating user with email and password...
```

If you see the error details, it will help identify the specific issue.

### 3. Common Error Codes

- **`auth/operation-not-allowed`**: Email/password not enabled
- **`auth/invalid-api-key`**: API key issues
- **`auth/unauthorized-domain`**: Domain not authorized
- **`auth/network-request-failed`**: Network issues

## Testing

1. **Restart your development server**: `npm start`
2. **Check the console** for Firebase config test results
3. **Try signing up** with a new email address
4. **Check the network tab** for the actual request details

## If Still Not Working

1. **Verify project ID**: Make sure you're using the correct Firebase project
2. **Check billing**: Ensure your Firebase project has billing enabled
3. **Try a different browser**: Clear cache and try incognito mode
4. **Check network**: Ensure no firewall is blocking the requests

## Next Steps

Once Email/Password authentication is enabled:
1. Test signup again
2. Check that verification emails are sent
3. Test login functionality
4. Re-enable Firestore operations if needed 