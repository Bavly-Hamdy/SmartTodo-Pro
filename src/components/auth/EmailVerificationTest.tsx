import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationTest: React.FC = () => {
  const { currentUser, resendEmailVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testEmailVerification = async () => {
    if (!currentUser) {
      setMessage('No user logged in');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('=== EMAIL VERIFICATION TEST ===');
      console.log('Current user:', {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        displayName: currentUser.displayName
      });

      await resendEmailVerification();
      
      setMessage('Verification email sent successfully! Check your inbox and spam folder.');
      console.log('Email verification test completed successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setMessage(`Error: ${errorMessage}`);
      console.error('Email verification test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNetworkRequests = () => {
    console.log('=== NETWORK REQUEST CHECK ===');
    console.log('1. Open DevTools → Network tab');
    console.log('2. Filter by "sendOobCode"');
    console.log('3. Click "Test Email Verification"');
    console.log('4. Look for request to: identitytoolkit.googleapis.com/v1/accounts:sendOobCode');
    console.log('5. Check response status (should be 200)');
    console.log('6. Check response body for any error messages');
  };

  const checkFirebaseConsole = () => {
    console.log('=== FIREBASE CONSOLE CHECK ===');
    console.log('1. Go to Firebase Console → Authentication → Templates');
    console.log('2. Click "Email verification"');
    console.log('3. Ensure it\'s enabled');
    console.log('4. Check Action URL domain matches: smarttodo-pro.firebaseapp.com');
    console.log('5. Go to Authentication → Settings → Authorized domains');
    console.log('6. Ensure localhost and your domain are listed');
  };

  if (!currentUser) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Email Verification Test</h3>
        <p className="text-yellow-700">Please log in to test email verification.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">Email Verification Test</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-blue-700 mb-2">
            <strong>User:</strong> {currentUser.email}
          </p>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}
          </p>
        </div>

        <button
          onClick={testEmailVerification}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Test Email Verification'}
        </button>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={checkNetworkRequests}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Check Network Requests
          </button>
          
          <button
            onClick={checkFirebaseConsole}
            className="text-sm text-blue-600 hover:text-blue-800 underline block"
          >
            Check Firebase Console Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationTest; 