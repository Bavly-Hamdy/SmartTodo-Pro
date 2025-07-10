#!/usr/bin/env node

/**
 * Firebase Setup Script for SmartTodo Pro
 * 
 * This script helps you set up Firebase properly to resolve permission issues.
 * Run this script after following the Firebase Console setup steps.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 SmartTodo Pro - Firebase Setup Helper');
console.log('==========================================\n');

// Check if firebase.json exists
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');
if (!fs.existsSync(firebaseConfigPath)) {
  console.log('❌ firebase.json not found. Creating basic configuration...');
  
  const firebaseConfig = {
    "firestore": {
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"
    },
    "hosting": {
      "public": "build",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  };
  
  fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));
  console.log('✅ Created firebase.json');
}

// Check if firestore.indexes.json exists
const indexesPath = path.join(__dirname, '..', 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.log('❌ firestore.indexes.json not found. Creating indexes configuration...');
  
  const indexesConfig = {
    "indexes": [
      {
        "collectionGroup": "goals",
        "queryScope": "COLLECTION",
        "fields": [
          {
            "fieldPath": "userId",
            "order": "ASCENDING"
          },
          {
            "fieldPath": "createdAt",
            "order": "DESCENDING"
          }
        ]
      },
      {
        "collectionGroup": "goals",
        "queryScope": "COLLECTION",
        "fields": [
          {
            "fieldPath": "userId",
            "order": "ASCENDING"
          },
          {
            "fieldPath": "category",
            "order": "ASCENDING"
          }
        ]
      },
      {
        "collectionGroup": "goals",
        "queryScope": "COLLECTION",
        "fields": [
          {
            "fieldPath": "userId",
            "order": "ASCENDING"
          },
          {
            "fieldPath": "status",
            "order": "ASCENDING"
          }
        ]
      },
      {
        "collectionGroup": "goals",
        "queryScope": "COLLECTION",
        "fields": [
          {
            "fieldPath": "userId",
            "order": "ASCENDING"
          },
          {
            "fieldPath": "targetDate",
            "order": "ASCENDING"
          }
        ]
      }
    ],
    "fieldOverrides": []
  };
  
  fs.writeFileSync(indexesPath, JSON.stringify(indexesConfig, null, 2));
  console.log('✅ Created firestore.indexes.json');
}

console.log('\n📋 Setup Checklist:');
console.log('==================');
console.log('1. ✅ Firebase project created');
console.log('2. ✅ Firestore Database enabled');
console.log('3. ✅ Authentication enabled');
console.log('4. ✅ Security rules configured');
console.log('5. ✅ Indexes created');
console.log('6. ✅ Firebase config updated');

console.log('\n🔧 Next Steps:');
console.log('==============');
console.log('1. Deploy Firestore rules:');
console.log('   firebase deploy --only firestore:rules');
console.log('');
console.log('2. Deploy indexes:');
console.log('   firebase deploy --only firestore:indexes');
console.log('');
console.log('3. Test the app:');
console.log('   npm start');
console.log('');
console.log('4. Check for errors in browser console');
console.log('');

console.log('📚 Documentation:');
console.log('=================');
console.log('- Firebase Setup Guide: docs/FIREBASE_SETUP.md');
console.log('- Authentication Guide: docs/AUTHENTICATION.md');
console.log('');

console.log('🎯 If you still get permission errors:');
console.log('=====================================');
console.log('1. Check Firebase Console → Firestore Database → Rules');
console.log('2. Verify rules are published');
console.log('3. Check Firebase Console → Firestore Database → Indexes');
console.log('4. Ensure all indexes are built (status: "Enabled")');
console.log('5. Check browser console for specific error messages');
console.log('');

console.log('✅ Setup script completed!'); 