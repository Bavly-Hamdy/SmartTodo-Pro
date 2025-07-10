import React from 'react';
import { Button, ButtonProps } from '../ui/Button';

export interface AuthButtonProps extends Omit<ButtonProps, 'children'> {
  children: React.ReactNode;
  isLoading?: boolean; // Alias for loading to match existing usage
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading = false,
  loading = false,
  ...props
}) => {
  return (
    <Button
      {...props}
      loading={isLoading || loading}
    >
      {children}
    </Button>
  );
}; 