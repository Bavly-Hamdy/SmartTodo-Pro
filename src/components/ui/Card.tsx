import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  className = '',
  onClick,
  hover = false,
  loading = false,
  header,
  footer,
  actions,
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'shadow-sm border border-gray-200 dark:border-gray-700',
    elevated: 'shadow-lg border border-gray-200 dark:border-gray-700',
    outlined: 'border-2 border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`;
  
  const cardContent = (
    <>
      {header && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          {header}
        </div>
      )}
      
      <div className={header || footer ? 'px-6 py-4' : ''}>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          {footer}
        </div>
      )}
      
      {actions && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-2">
          {actions}
        </div>
      )}
    </>
  );
  
  const cardElement = (
    <motion.div
      className={classes}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      {cardContent}
    </motion.div>
  );
  
  return cardElement;
}; 