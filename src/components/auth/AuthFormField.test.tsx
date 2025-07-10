import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthFormField } from './AuthFormField';

describe('AuthFormField', () => {
  const defaultProps = {
    id: 'test-field',
    name: 'test',
    type: 'text' as const,
    label: 'Test Field',
    value: '',
    onChange: jest.fn(),
  };

  it('should render with label', () => {
    render(<AuthFormField {...defaultProps} />);
    
    expect(screen.getByText('Test Field')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
  });

  it('should render with required indicator', () => {
    render(<AuthFormField {...defaultProps} required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should render with error message', () => {
    render(<AuthFormField {...defaultProps} error="This field is required" />);
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should render with help text', () => {
    render(<AuthFormField {...defaultProps} helpText="This is help text" />);
    
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    const onChange = jest.fn();
    render(<AuthFormField {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByLabelText('Test Field');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          value: 'test value',
        }),
      })
    );
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AuthFormField {...defaultProps} disabled />);
    
    const input = screen.getByLabelText('Test Field');
    expect(input).toBeDisabled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <AuthFormField
        {...defaultProps}
        error="Error message"
        required
      />
    );
    
    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveAttribute('required');
  });

  it('should apply error styling when error is present', () => {
    render(<AuthFormField {...defaultProps} error="Error message" />);
    
    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveClass('border-red-300');
  });

  it('should render with placeholder', () => {
    render(<AuthFormField {...defaultProps} placeholder="Enter text here" />);
    
    const input = screen.getByPlaceholderText('Enter text here');
    expect(input).toBeInTheDocument();
  });

  it('should render with autoComplete attribute', () => {
    render(<AuthFormField {...defaultProps} autoComplete="email" />);
    
    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('should render different input types', () => {
    const { rerender } = render(<AuthFormField {...defaultProps} type="email" />);
    expect(screen.getByLabelText('Test Field')).toHaveAttribute('type', 'email');

    rerender(<AuthFormField {...defaultProps} type="password" />);
    expect(screen.getByLabelText('Test Field')).toHaveAttribute('type', 'password');

    rerender(<AuthFormField {...defaultProps} type="number" />);
    expect(screen.getByLabelText('Test Field')).toHaveAttribute('type', 'number');
  });

  it('should handle onBlur and onFocus events', () => {
    const onBlur = jest.fn();
    const onFocus = jest.fn();
    
    render(<AuthFormField {...defaultProps} onBlur={onBlur} onFocus={onFocus} />);
    
    const input = screen.getByLabelText('Test Field');
    
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
    
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });
}); 