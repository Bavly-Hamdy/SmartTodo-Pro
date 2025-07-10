import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { AuthButton } from '../../components/auth/AuthButton';
import EmailVerificationTest from '../../components/auth/EmailVerificationTest';

const VerifyEmail: React.FC = () => {
  const { currentUser, isEmailVerified, resendEmailVerification } = useAuth();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  // Redirect if already verified or not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth/login');
      return;
    }

    if (isEmailVerified) {
      navigate('/');
    }
  }, [currentUser, isEmailVerified, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await resendEmailVerification();
      toast.success('Verification email sent!');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-6"
          >
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification link to{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {currentUser.email}
            </span>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Click the link in the email to verify your account. The link will expire in 1 hour.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AuthButton
              type="button"
              onClick={handleRefresh}
              fullWidth
              size="lg"
            >
              I've verified my email
            </AuthButton>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Didn't receive the email?
              </p>
              
              <AuthButton
                type="button"
                onClick={handleResendEmail}
                isLoading={isResending}
                disabled={isResending || countdown > 0}
                variant="outline"
                fullWidth
                size="md"
              >
                {countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : 'Resend verification email'
                }
              </AuthButton>
            </div>
          </div>

          {/* Debug Section */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Tools
            </button>
            
            {showDebug && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <EmailVerificationTest />
              </motion.div>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
            >
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail; 