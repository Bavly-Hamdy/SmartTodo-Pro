import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, testFirebaseConfig } from '../config/firebase';
import EncryptionService from '../services/encryption';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  isEmailVerified: boolean;
  isMFAEnabled: boolean;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  language: string;
  encryptionKey?: string;
  mfaEnabled: boolean;
  mfaPhoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      shareAnalytics: boolean;
      shareProgress: boolean;
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Test Firebase configuration on startup
    testFirebaseConfig();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Reload user to get latest email verification status
          await reload(user);
          
          // Check email verification status
          setIsEmailVerified(user.emailVerified);
          
          // Temporarily disable Firestore operations to prevent offline errors
          // TODO: Re-enable once Firestore is properly configured
          /*
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            setIsMFAEnabled(profile.mfaEnabled || false);
            
            // Set encryption key if available
            if (profile.encryptionKey) {
              EncryptionService.setEncryptionKey(profile.encryptionKey);
            }
          } else {
            // Create new user profile
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || '',
              email: user.email || '',
              theme: 'auto',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
              mfaEnabled: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              preferences: {
                notifications: {
                  email: true,
                  push: true,
                  sms: false,
                },
                privacy: {
                  shareAnalytics: false,
                  shareProgress: false,
                },
              },
            };
            
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserProfile(newProfile);
          }
          */
          
          // Create a basic user profile from Firebase Auth data
          const basicProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            theme: 'auto',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            mfaEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              notifications: {
                email: true,
                push: true,
                sms: false,
              },
              privacy: {
                shareAnalytics: false,
                shareProgress: false,
              },
            },
          };
          
          setUserProfile(basicProfile);
          console.log('User authenticated successfully:', user.email);
          
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Don't fail authentication if Firestore is not available
          if (user) {
            const basicProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || '',
              email: user.email || '',
              theme: 'auto',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
              mfaEnabled: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              preferences: {
                notifications: {
                  email: true,
                  push: true,
                  sms: false,
                },
                privacy: {
                  shareAnalytics: false,
                  shareProgress: false,
                },
              },
            };
            setUserProfile(basicProfile);
          }
        }
      } else {
        setUserProfile(null);
        setIsMFAEnabled(false);
        setIsEmailVerified(false);
        // Clear encryption key when user signs out
        EncryptionService.setEncryptionKey('');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Set persistence based on remember me
      if (!rememberMe) {
        // Clear any existing persistence
        await signOut(auth);
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!result.user.emailVerified) {
        throw new Error('EMAIL_NOT_VERIFIED');
      }
      
      return result;
    } catch (error: any) {
      // Enhanced error handling
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address');
        case 'auth/wrong-password':
          throw new Error('Incorrect password');
        case 'auth/too-many-requests':
          throw new Error('Too many failed attempts. Please try again later');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection');
        default:
          if (error.message === 'EMAIL_NOT_VERIFIED') {
            throw new Error('Please verify your email address before signing in');
          }
          throw new Error('Failed to sign in. Please try again');
      }
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('Starting signup process for:', email);
      
      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
      
      console.log('Creating user with email and password...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', result.user.uid);
      console.log('User email verified status:', result.user.emailVerified);
      
      // Update display name
      console.log('Updating display name...');
      await updateProfile(result.user, { displayName });
      console.log('Display name updated successfully');
      
      // Send email verification with comprehensive debugging
      console.log('Sending email verification...');
      console.log('Current user before verification:', {
        uid: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
        displayName: result.user.displayName
      });
      
      try {
        const verificationResult = await sendEmailVerification(result.user);
        console.log('Email verification sent successfully:', verificationResult);
        
        // Log additional verification details
        console.log('Verification email details:', {
          user: result.user.email,
          uid: result.user.uid,
          timestamp: new Date().toISOString(),
          authDomain: auth.config.authDomain
        });
        
        // Check if we can detect the network request
        console.log('Check Network tab for request to: identitytoolkit.googleapis.com/v1/accounts:sendOobCode');
        
      } catch (verificationError: any) {
        console.error('Email verification error details:', {
          code: verificationError.code,
          message: verificationError.message,
          email: email,
          userUid: result.user.uid,
          authDomain: auth.config.authDomain,
          timestamp: new Date().toISOString()
        });
        
        // Handle specific verification errors
        switch (verificationError.code) {
          case 'auth/too-many-requests':
            throw new Error('Too many verification email attempts. Please try again later.');
          case 'auth/network-request-failed':
            throw new Error('Network error while sending verification email. Please check your connection.');
          case 'auth/invalid-user':
            throw new Error('User account is invalid. Please try signing up again.');
          case 'auth/user-not-found':
            throw new Error('User account not found. Please try signing up again.');
          case 'auth/operation-not-allowed':
            throw new Error('Email verification is not enabled. Please contact support.');
          default:
            throw new Error(`Failed to send verification email: ${verificationError.message}`);
        }
      }
      
      // Generate encryption key for the user
      const encryptionKey = EncryptionService.generateKey();
      
      // Temporarily disable Firestore operations
      // TODO: Re-enable once Firestore is properly configured
      /*
      // Create user profile
      const userProfile: UserProfile = {
        uid: result.user.uid,
        displayName,
        email,
        theme: 'auto',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        encryptionKey,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            shareAnalytics: false,
            shareProgress: false,
          },
        },
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      */
      
      // Set encryption key
      EncryptionService.setEncryptionKey(encryptionKey);
      
      console.log('User account created successfully:', email);
      console.log('=== SIGNUP COMPLETE ===');
      console.log('Next steps:');
      console.log('1. Check your email for verification link');
      console.log('2. Check spam/junk folder if not found');
      console.log('3. Verify the email within 1 hour');
      
      return result;
    } catch (error: any) {
      console.error('Sign up error details:', {
        code: error.code,
        message: error.message,
        email: email,
        displayName: displayName,
        passwordLength: password.length,
        timestamp: new Date().toISOString()
      });
      
      // Enhanced error handling
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please choose a stronger password');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled. Please contact support');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection');
        case 'auth/invalid-password':
          throw new Error('Invalid password format');
        case 'auth/missing-password':
          throw new Error('Password is required');
        case 'auth/missing-email':
          throw new Error('Email is required');
        default:
          console.error('Sign up error:', error);
          throw new Error(`Failed to create account: ${error.message}`);
      }
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state
      setCurrentUser(null);
      setUserProfile(null);
      setIsMFAEnabled(false);
      setIsEmailVerified(false);
      EncryptionService.setEncryptionKey('');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      // Enhanced error handling
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('No account found with this email address');
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/too-many-requests':
          throw new Error('Too many attempts. Please try again later');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection');
        default:
          throw new Error('Failed to send reset email. Please try again');
      }
    }
  };

  const resendEmailVerification = async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    try {
      console.log('Resending email verification to:', currentUser.email);
      await sendEmailVerification(currentUser);
      console.log('Email verification resent successfully');
    } catch (error: any) {
      console.error('Resend email verification error details:', {
        code: error.code,
        message: error.message,
        email: currentUser.email
      });
      
      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error('Too many attempts. Please try again later');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection');
        case 'auth/invalid-user':
          throw new Error('User account is invalid. Please try signing in again');
        case 'auth/user-not-found':
          throw new Error('User account not found. Please try signing in again');
        default:
          throw new Error(`Failed to send verification email: ${error.message}`);
      }
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: new Date(),
      };
      
      // Temporarily disable Firestore operations
      // TODO: Re-enable once Firestore is properly configured
      // await updateDoc(doc(db, 'users', currentUser.uid), data);
      
      setUserProfile(updatedProfile as UserProfile);
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Don't fail the operation if Firestore is not available
      const updatedProfile = {
        ...userProfile,
        ...data,
        updatedAt: new Date(),
      };
      setUserProfile(updatedProfile as UserProfile);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    signOutUser,
    resetPassword,
    updateUserProfile,
    resendEmailVerification,
    isEmailVerified,
    isMFAEnabled,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 