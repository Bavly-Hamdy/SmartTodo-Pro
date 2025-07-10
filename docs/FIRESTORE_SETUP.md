# Firestore Setup Guide

## Current Status

All Firestore operations have been temporarily disabled to prevent permission errors. This guide will help you set up proper Firestore permissions and re-enable the functionality.

## Issues Fixed

1. **NotificationContext undefined field error** - Fixed by ensuring data is never undefined
2. **Firestore permissions errors** - Temporarily disabled all Firestore operations
3. **Message port errors** - Related to Firebase messaging service worker

## Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (we'll secure it later)
6. Select a location for your database
7. Click **Done**

## Step 2: Deploy Firestore Security Rules

Create a file called `firestore.rules` in your project root (if it doesn't exist):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks - users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Notifications - users can only access their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Scheduled notifications
    match /scheduled-notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## Step 3: Re-enable Firestore Operations

Once you've set up Firestore and deployed the rules, you can re-enable the operations by:

1. **In `src/services/tasksService.ts`:**
   - Uncomment all the Firestore operations (remove the `/*` and `*/` blocks)
   - Remove the temporary console.log statements and dummy functions

2. **In `src/contexts/NotificationContext.tsx`:**
   - Uncomment the Firestore operations in `sendNotification` and `scheduleNotification`

## Step 4: Test the Setup

1. Start your development server: `npm start`
2. Sign up or log in to your app
3. Try creating a task - it should now save to Firestore
4. Check the Firebase Console to see if data is being created

## Step 5: Verify Permissions

If you still get permission errors:

1. **Check Authentication:** Make sure users are properly authenticated
2. **Check Rules:** Verify the Firestore rules are deployed correctly
3. **Check User ID:** Ensure the `userId` field matches the authenticated user's UID

## Troubleshooting

### "Missing or insufficient permissions" Error

This usually means:
- Firestore rules are too restrictive
- User is not authenticated
- User ID doesn't match the document's userId field

### "Function setDoc() called with invalid data" Error

This means you're trying to save undefined values to Firestore. The fix is already in place in NotificationContext.

### Message Port Errors

These are related to Firebase Cloud Messaging and don't affect core functionality. They can be ignored for now.

## Security Best Practices

Once everything is working:

1. **Review Firestore Rules:** Make sure they're secure for production
2. **Add Data Validation:** Validate data before saving to Firestore
3. **Add Error Handling:** Handle Firestore errors gracefully
4. **Monitor Usage:** Set up Firebase usage alerts

## Next Steps

After re-enabling Firestore:

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Test real-time subscriptions
3. Test search functionality
4. Test task statistics
5. Test notifications

## Files to Update

When re-enabling Firestore, you'll need to update these files:

- `src/services/tasksService.ts` - All CRUD and subscription functions
- `src/contexts/NotificationContext.tsx` - Notification saving functions
- `src/hooks/useTasks.ts` - Already properly typed, no changes needed

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key
```

## Testing Checklist

- [ ] User can create tasks
- [ ] User can update tasks
- [ ] User can delete tasks
- [ ] Real-time updates work
- [ ] Search functionality works
- [ ] Task statistics load correctly
- [ ] Notifications save to Firestore
- [ ] No permission errors in console
- [ ] No undefined field errors 