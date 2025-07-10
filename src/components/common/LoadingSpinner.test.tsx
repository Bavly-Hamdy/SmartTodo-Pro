import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'border-blue-600');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('border-gray-600');
  });

  it('renders with custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('custom-class');
  });

  it('applies correct size classes for different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('generic')).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole('generic')).toHaveClass('w-6', 'h-6');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('generic')).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('generic')).toHaveClass('w-12', 'h-12');
  });

  it('applies correct color classes for different colors', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole('generic')).toHaveClass('border-blue-600');

    rerender(<LoadingSpinner color="secondary" />);
    expect(screen.getByRole('generic')).toHaveClass('border-gray-600');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('generic')).toHaveClass('border-white');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
}); 