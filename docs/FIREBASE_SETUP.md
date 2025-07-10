# Firebase Setup Guide

This guide will help you set up Firebase properly to resolve the "Missing or insufficient permissions" errors.

## **Step 1: Enable Firestore Database**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`smarttodo-pro`)
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in test mode** (we'll secure it later)
6. Select a location (choose the closest to your users)
7. Click **Done**

## **Step 2: Deploy Security Rules**

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the existing rules with the content from `firestore.rules`
3. Click **Publish**

**Alternative: Deploy via Firebase CLI**
```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## **Step 3: Create Required Indexes**

Firestore requires composite indexes for queries with multiple filters. Create these indexes:

### **Goals Collection Indexes**
1. Go to **Firestore Database** → **Indexes**
2. Click **Create Index**
3. Add these indexes:

**Index 1:**
- Collection ID: `goals`
- Fields: 
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 2:**
- Collection ID: `goals`
- Fields:
  - `userId` (Ascending)
  - `category` (Ascending)

**Index 3:**
- Collection ID: `goals`
- Fields:
  - `userId` (Ascending)
  - `status` (Ascending)

**Index 4:**
- Collection ID: `goals`
- Fields:
  - `userId` (Ascending)
  - `targetDate` (Ascending)

### **AI Suggestions Indexes**
**Index 5:**
- Collection ID: `goals/{goalId}/suggestions`
- Fields:
  - `generatedAt` (Descending)

## **Step 4: Test the Setup**

After deploying rules and creating indexes, test the Goals feature:

1. **Create a Goal**: Try creating a new goal
2. **View Goals**: Check if goals load properly
3. **Edit Goals**: Test editing functionality
4. **AI Suggestions**: Test AI suggestions generation

## **Step 5: Troubleshooting**

### **If you still get permission errors:**

1. **Check Authentication**:
   - Ensure users are properly signed in
   - Verify `currentUser.uid` exists

2. **Check Firestore Rules**:
   - Go to **Firestore Database** → **Rules**
   - Verify rules are published
   - Check for syntax errors

3. **Check Indexes**:
   - Go to **Firestore Database** → **Indexes**
   - Ensure all required indexes are built (status: "Enabled")

4. **Check Console Logs**:
   - Open browser DevTools
   - Check for specific error messages
   - Look for network request failures

### **Common Issues:**

**"Missing or insufficient permissions"**
- Verify Firestore is enabled
- Check security rules are deployed
- Ensure user is authenticated

**"The query requires an index"**
- Create the missing index in Firebase Console
- Wait for index to build (can take a few minutes)

**"Client is offline"**
- Check internet connection
- Verify Firebase config is correct
- Check if Firestore service is available

## **Step 6: Production Security**

For production, consider these additional security measures:

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Data Validation**: Validate data on the server side
3. **Audit Logging**: Log important operations
4. **Backup Strategy**: Set up regular backups

## **Step 7: Monitoring**

Set up monitoring to track issues:

1. **Firebase Console** → **Analytics** → **Events**
2. **Firebase Console** → **Crashlytics** (for mobile apps)
3. **Firebase Console** → **Performance** → **Monitoring**

## **Verification Checklist**

- [ ] Firestore Database is enabled
- [ ] Security rules are deployed
- [ ] Required indexes are created and built
- [ ] Users can create goals
- [ ] Users can view their goals
- [ ] Users can edit their goals
- [ ] Users can delete their goals
- [ ] AI suggestions work
- [ ] Real-time updates work
- [ ] No permission errors in console

## **Support**

If you continue to have issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
3. Check [Firebase Status](https://status.firebase.google.com/)
4. Contact Firebase Support if needed

---

**Last Updated**: December 2024
**Version**: 1.0.0 