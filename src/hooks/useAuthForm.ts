import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validateConfirmPassword, validateDisplayName, ValidationResult } from '../utils/validationUtils';

export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  rememberMe: boolean;
}

export interface UseAuthFormReturn {
  formData: FormData;
  errors: Record<string, string>;
  isLoading: boolean;
  isSuccess: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  validateForm: () => boolean;
  clearErrors: () => void;
  setFormData: (data: Partial<FormData>) => void;
}

export const useAuthForm = (
  mode: 'login' | 'signup' | 'forgot-password',
  onSuccess?: () => void
): UseAuthFormReturn => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || '';
    }

    // Password validation (for login and signup)
    if (mode !== 'forgot-password') {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error || '';
      }
    }

    // Confirm password validation (for signup only)
    if (mode === 'signup') {
      const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        newErrors.confirmPassword = confirmPasswordValidation.error || '';
      }
    }

    // Display name validation (for signup only)
    if (mode === 'signup') {
      const displayNameValidation = validateDisplayName(formData.displayName || '');
      if (!displayNameValidation.isValid) {
        newErrors.displayName = displayNameValidation.error || '';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      switch (mode) {
        case 'login':
          await signIn(formData.email, formData.password, formData.rememberMe);
          break;
        case 'signup':
          await signUp(formData.email, formData.password, formData.displayName || '');
          break;
        case 'forgot-password':
          await resetPassword(formData.email);
          break;
      }
      
      setIsSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      // Handle specific error codes
      if (error.message.includes('email')) {
        setErrors({ email: error.message });
      } else if (error.message.includes('password')) {
        setErrors({ password: error.message });
      } else if (error.message.includes('display name')) {
        setErrors({ displayName: error.message });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, mode, validateForm, signIn, signUp, resetPassword, onSuccess]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    handleInputChange,
    handleSubmit,
    validateForm,
    clearErrors,
    setFormData: updateFormData,
  };
}; 