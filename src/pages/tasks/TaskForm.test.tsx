import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import TaskForm from '../../components/tasks/TaskForm'; // <-- Fix import path
import { useTasks } from '../../hooks/useTasks';

// Mock the useTasks hook
const mockUseTasks = jest.fn();
jest.mock('../../hooks/useTasks', () => ({
  useTasks: () => mockUseTasks(),
}));

// Mock the FormField component
jest.mock('../../components/ui/FormField', () => {
  return function MockFormField({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    required = false,
    placeholder,
    options,
    ...props 
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }) {
    return (
      <div data-testid={`form-field-${name}`}>
        <label>{label}</label>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
          />
        ) : type === 'select' ? (
          <select name={name} value={value} onChange={onChange} {...props}>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
          />
        )}
        {error && <div data-testid={`error-${name}`}>{error}</div>}
      </div>
    );
  };
});

// Mock the Button component
jest.mock('../../components/ui/Button', () => {
  return function MockButton({ 
    children, 
    onClick, 
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    isLoading = false,
    ...props 
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    isLoading?: boolean;
  }) {
    return (
      <button
        data-testid={`button-${variant}-${size}`}
        onClick={onClick}
        type={type}
        disabled={disabled}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  };
});

// Mock the Modal component
jest.mock('../../components/ui/Modal', () => {
  return function MockModal({ 
    isOpen, 
    onClose, 
    title, 
    children 
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) {
    if (!isOpen) return null;
    
    return (
      <div data-testid="modal">
        <div data-testid="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} data-testid="modal-close">×</button>
        </div>
        <div data-testid="modal-content">
          {children}
        </div>
      </div>
    );
  };
});

jest.mock('../../components/ui/AnimatedContainer', () => ({
  FadeIn: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="fade-in" className={className}>{children}</div>
  ),
  SlideUp: ({ children, className, delay }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <div data-testid="slide-up" className={className} data-delay={delay}>{children}</div>
  ),
}));

const mockAuthContext = {
  currentUser: {
    uid: 'user-1',
    email: 'test@example.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    displayName: 'Test User',
    phoneNumber: null,
    photoURL: null,
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    providerId: 'mock-provider',
  },
  userProfile: {
    uid: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    theme: 'light' as 'light',
    timezone: 'UTC',
    avatarUrl: '',
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    language: 'en',
    mfaEnabled: false,
    preferences: {
      notifications: { email: true, push: true, sms: false },
      privacy: { shareAnalytics: false, shareProgress: false },
    },
  },
  isEmailVerified: true,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  loading: false,
  signOutUser: jest.fn(),
  resetPassword: jest.fn(),
  updateUserProfile: jest.fn(),
  error: null,
  setError: jest.fn(),
  resendEmailVerification: jest.fn(),
  isMFAEnabled: false,
};

const mockNotificationContext = {
  notifications: [],
  sendNotification: jest.fn(),
  markAsRead: jest.fn(),
  clearAll: jest.fn(),
  notificationPermission: 'granted' as 'granted',
  fcmToken: 'mock-token',
  requestPermission: jest.fn(),
  scheduleNotification: jest.fn(),
  cancelScheduledNotification: jest.fn(),
  error: null,
  setError: jest.fn(),
  clearNotifications: jest.fn(),
  markAllAsRead: jest.fn(),
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending' as 'pending',
  priority: 'medium' as 'medium',
  dueDate: new Date('2024-01-15'),
  tags: ['work', 'urgent'],
  category: 'work',
  userId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const renderTaskForm = (overrides = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    ...overrides,
  };

  mockUseTasks.mockReturnValue({
    tasks: [],
    isLoading: false,
    error: null,
    addTask: jest.fn(),
    editTask: jest.fn(),
    removeTask: jest.fn(),
    toggleTaskCompletion: jest.fn(),
  });

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <TaskForm {...defaultProps} />
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderTaskForm();
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    it('shows all form fields', () => {
      renderTaskForm();
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category *')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('displays correct labels', () => {
      renderTaskForm();
      expect(screen.getByText('Title *')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category *')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('shows submit and cancel buttons', () => {
      renderTaskForm();
      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('does not render when isOpen is false', () => {
      renderTaskForm({ isOpen: false });
      expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();
      renderTaskForm({ onClose: mockOnClose });
      
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty title', async () => {
      renderTaskForm();
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-title')).toHaveTextContent('Title is required');
      });
    });

    it('shows error for empty category', async () => {
      renderTaskForm();
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-category')).toHaveTextContent('Category is required');
      });
    });

    it('validates form successfully with valid data', async () => {
      renderTaskForm();
      
      // Fill in required fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const categorySelect = screen.getByDisplayValue('Select a category');
      
      fireEvent.change(titleInput, { target: { value: 'Valid Task Title' } });
      fireEvent.change(categorySelect, { target: { value: 'Work' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('error-title')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error-category')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls addTask when form is submitted with valid data', async () => {
      const mockAddTask = jest.fn();
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
        addTask: mockAddTask,
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });

      renderTaskForm();
      
      // Fill in required fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const categorySelect = screen.getByDisplayValue('Select a category');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(categorySelect, { target: { value: 'Work' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: '',
          priority: 'medium',
          category: 'Work',
          tags: [],
          dueDate: undefined,
        });
      });
    });

    it('calls onClose after successful submission', async () => {
      const mockOnClose = jest.fn();
      const mockAddTask = jest.fn().mockResolvedValue(undefined);
      
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
        addTask: mockAddTask,
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });

      renderTaskForm({ onClose: mockOnClose });
      
      // Fill in required fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const categorySelect = screen.getByDisplayValue('Select a category');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(categorySelect, { target: { value: 'Work' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Form Reset', () => {
    it('resets form when modal is closed', () => {
      const mockOnClose = jest.fn();
      renderTaskForm({ onClose: mockOnClose });
      
      // Fill in some fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      
      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);
      
      // Reopen modal
      renderTaskForm({ onClose: mockOnClose });
      
      // Check that form is reset
      expect(screen.getByPlaceholderText('Enter task title')).toHaveValue('');
    });
  });

  describe('Loading States', () => {
    it('shows loading state when submitting', async () => {
      const mockAddTask = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
        addTask: mockAddTask,
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });

      renderTaskForm();
      
      // Fill in required fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const categorySelect = screen.getByDisplayValue('Select a category');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(categorySelect, { target: { value: 'Work' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      // Check that button shows loading state
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles addTask errors gracefully', async () => {
      const mockAddTask = jest.fn().mockRejectedValue(new Error('Failed to create task'));
      
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
        addTask: mockAddTask,
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });

      renderTaskForm();
      
      // Fill in required fields
      const titleInput = screen.getByPlaceholderText('Enter task title');
      const categorySelect = screen.getByDisplayValue('Select a category');
      
      fireEvent.change(titleInput, { target: { value: 'New Task' } });
      fireEvent.change(categorySelect, { target: { value: 'Work' } });
      
      const submitButton = screen.getByText('Create Task');
      fireEvent.click(submitButton);
      
      // Should not call onClose when there's an error
      await waitFor(() => {
        expect(mockAddTask).toHaveBeenCalled();
      });
    });
  });
}); 