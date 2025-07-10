/**
 * Validation utility functions for consistent form validation across the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Confirm password validation
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

/**
 * Display name validation
 */
export const validateDisplayName = (displayName: string): ValidationResult => {
  if (!displayName?.trim()) {
    return { isValid: false, error: 'Display name is required' };
  }
  
  if (displayName.trim().length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' };
  }
  
  if (displayName.trim().length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

/**
 * Task title validation
 */
export const validateTaskTitle = (title: string): ValidationResult => {
  if (!title?.trim()) {
    return { isValid: false, error: 'Task title is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Task title must be at least 3 characters' };
  }
  
  if (title.trim().length > 200) {
    return { isValid: false, error: 'Task title must be less than 200 characters' };
  }
  
  return { isValid: true };
};

/**
 * Task description validation
 */
export const validateTaskDescription = (description: string): ValidationResult => {
  if (description && description.length > 1000) {
    return { isValid: false, error: 'Description must be less than 1000 characters' };
  }
  
  return { isValid: true };
};

/**
 * Goal title validation
 */
export const validateGoalTitle = (title: string): ValidationResult => {
  if (!title?.trim()) {
    return { isValid: false, error: 'Goal title is required' };
  }
  
  if (title.trim().length < 5) {
    return { isValid: false, error: 'Goal title must be at least 5 characters' };
  }
  
  if (title.trim().length > 100) {
    return { isValid: false, error: 'Goal title must be less than 100 characters' };
  }
  
  return { isValid: true };
};

/**
 * URL validation
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Phone number validation
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value?.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Minimum length validation
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  if (value && value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  return { isValid: true };
};

/**
 * Maximum length validation
 */
export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { isValid: true };
}; 