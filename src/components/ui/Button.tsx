import React from 'react';
import { motion } from 'framer-motion';
import { getPriorityColor, getStatusColor, getNotificationColor } from '../../utils/colorUtils';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  priority?: 'low' | 'medium' | 'high';
  status?: string;
  notificationType?: 'success' | 'error' | 'warning' | 'info';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  priority,
  status,
  notificationType,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white shadow-sm',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200',
    ghost: 'hover:bg-gray-100 focus:ring-gray-500 text-gray-700 dark:hover:bg-gray-700 dark:text-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-sm',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white shadow-sm',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white shadow-sm',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white shadow-sm',
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const isActuallyLoading = loading;
  
  // Handle priority/status/notification type colors
  let colorClass = variantClasses[variant];
  if (priority) {
    colorClass = getPriorityColor(priority);
  } else if (status) {
    colorClass = getStatusColor(status);
  } else if (notificationType) {
    colorClass = getNotificationColor(notificationType);
  }
  
  const classes = `${baseClasses} ${colorClass} ${sizeClasses[size]} ${widthClass} ${className}`;
  
  const buttonContent = (
    <>
      {isActuallyLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && iconPosition === 'left' && !isActuallyLoading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !isActuallyLoading && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );
  
  return (
    <motion.button
      type={type}
      disabled={disabled || isActuallyLoading}
      onClick={onClick}
      className={classes}
      whileHover={{ scale: disabled || isActuallyLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isActuallyLoading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {buttonContent}
    </motion.button>
  );
}; 