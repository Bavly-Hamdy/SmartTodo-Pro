import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCicxNeBgNsm81a-JD_PrRCfzQaR86KW38",
  authDomain: "smarttodo-pro.firebaseapp.com",
  projectId: "smarttodo-pro",
  storageBucket: "smarttodo-pro.firebasestorage.app",
  messagingSenderId: "988499371476",
  appId: "1:988499371476:web:f64b295158c5adf4686241",
  measurementId: "G-8RDYSJK7J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

// Test Firebase configuration
export const testFirebaseConfig = () => {
  console.log('Firebase Config Test:');
  console.log('- Project ID:', firebaseConfig.projectId);
  console.log('- Auth Domain:', firebaseConfig.authDomain);
  console.log('- API Key exists:', !!firebaseConfig.apiKey);
  console.log('- Auth initialized:', !!auth);
  console.log('- App initialized:', !!app);
  
  // Test if we can access Firebase Auth
  try {
    const currentUser = auth.currentUser;
    console.log('- Current user:', currentUser ? currentUser.email : 'None');
    console.log('- Firebase Auth working: ✅');
  } catch (error) {
    console.error('- Firebase Auth error:', error);
  }
};

export default app; 