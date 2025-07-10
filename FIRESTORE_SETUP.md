# Firestore Setup Guide

## Current Issue
Your app is getting "client is offline" and 400 Bad Request errors when trying to access Firestore. This is because Firestore needs to be properly enabled and configured in your Firebase project.

## Steps to Fix

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smarttodo-pro`
3. In the left sidebar, click **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (we'll secure it later)
6. Select a location (choose the closest to your users)
7. Click **"Done"**

### 2. Deploy Firestore Rules

After Firestore is enabled, deploy the security rules:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

### 3. Test Firestore Connection

Once Firestore is enabled, you can test the connection by:

1. Restart your development server: `npm start`
2. Try signing up a new user
3. Check the browser console for successful Firestore operations

### 4. Re-enable Firestore Operations

After confirming Firestore works, uncomment the Firestore operations in `src/contexts/AuthContext.tsx`:

1. Remove the `/*` and `*/` comments around the Firestore operations
2. Remove the temporary basic profile creation code

### 5. Security Rules (Optional)

The current rules in `firestore.rules` are secure, but you can make them more restrictive if needed.

## Troubleshooting

### If you still get errors:

1. **Check Firebase Console**: Make sure Firestore is enabled and shows as "Active"
2. **Check Network Tab**: Look for requests to `firestore.googleapis.com`
3. **Check Console**: Look for any CORS or authentication errors
4. **Verify Project ID**: Make sure your Firebase config matches your project

### Common Issues:

- **"Permission denied"**: Firestore rules are too restrictive
- **"Client is offline"**: Firestore not enabled or network issues
- **"400 Bad Request"**: Invalid project configuration

## Next Steps

1. Enable Firestore in Firebase Console
2. Deploy the security rules
3. Test the authentication flows
4. Re-enable Firestore operations in the code

The authentication should work immediately after enabling Firestore, even with the temporary disabled Firestore operations in the code. 