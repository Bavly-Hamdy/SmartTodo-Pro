import { renderHook, act } from '@testing-library/react';
import { useAuthForm } from './useAuthForm';
import { useAuth } from '../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useAuthForm', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockResetPassword = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      resetPassword: mockResetPassword,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login mode', () => {
    it('should initialize with empty form data', () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      expect(result.current.formData).toEqual({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        rememberMe: false,
      });
    });

    it('should validate email correctly', () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      act(() => {
        result.current.setFormData({ email: 'invalid-email' });
      });
      
      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors.email).toBe('Please enter a valid email address');
    });

    it('should validate password correctly', () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      act(() => {
        result.current.setFormData({ password: 'weak' });
      });
      
      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors.password).toBe('Password must be at least 8 characters');
    });

    it('should handle successful login', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useAuthForm('login', onSuccess));
      
      act(() => {
        result.current.setFormData({
          email: 'test@example.com',
          password: 'StrongPass123',
        });
      });
      
      mockSignIn.mockResolvedValue(undefined);
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
      });
      
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'StrongPass123', false);
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      act(() => {
        result.current.setFormData({
          email: 'test@example.com',
          password: 'StrongPass123',
        });
      });
      
      mockSignIn.mockRejectedValue(new Error('No account found with this email address'));
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
      });
      
      expect(result.current.errors.general).toBe('No account found with this email address');
    });
  });

  describe('Signup mode', () => {
    it('should validate display name correctly', () => {
      const { result } = renderHook(() => useAuthForm('signup'));
      
      act(() => {
        result.current.setFormData({ displayName: 'a' });
      });
      
      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors.displayName).toBe('Display name must be at least 2 characters');
    });

    it('should validate password confirmation', () => {
      const { result } = renderHook(() => useAuthForm('signup'));
      
      act(() => {
        result.current.setFormData({
          password: 'StrongPass123',
          confirmPassword: 'DifferentPass123',
        });
      });
      
      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
    });

    it('should handle successful signup', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useAuthForm('signup', onSuccess));
      
      act(() => {
        result.current.setFormData({
          email: 'test@example.com',
          password: 'StrongPass123',
          confirmPassword: 'StrongPass123',
          displayName: 'Test User',
        });
      });
      
      mockSignUp.mockResolvedValue(undefined);
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
      });
      
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'StrongPass123', 'Test User');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('Forgot password mode', () => {
    it('should validate email for password reset', () => {
      const { result } = renderHook(() => useAuthForm('forgot-password'));
      
      act(() => {
        result.current.setFormData({ email: 'invalid-email' });
      });
      
      act(() => {
        const isValid = result.current.validateForm();
        expect(isValid).toBe(false);
      });
      
      expect(result.current.errors.email).toBe('Please enter a valid email address');
    });

    it('should handle successful password reset', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useAuthForm('forgot-password', onSuccess));
      
      act(() => {
        result.current.setFormData({ email: 'test@example.com' });
      });
      
      mockResetPassword.mockResolvedValue(undefined);
      
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as any);
      });
      
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe('Form interactions', () => {
    it('should clear errors when input changes', () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      // Set an error first
      act(() => {
        result.current.setFormData({ email: 'invalid' });
        result.current.validateForm();
      });
      
      expect(result.current.errors.email).toBeTruthy();
      
      // Change input to clear error
      act(() => {
        result.current.handleInputChange({
          target: { name: 'email', value: 'valid@example.com', type: 'email' }
        } as any);
      });
      
      expect(result.current.errors.email).toBeFalsy();
    });

    it('should handle checkbox changes', () => {
      const { result } = renderHook(() => useAuthForm('login'));
      
      act(() => {
        result.current.handleInputChange({
          target: { name: 'rememberMe', checked: true, type: 'checkbox' }
        } as any);
      });
      
      expect(result.current.formData.rememberMe).toBe(true);
    });
  });
}); 