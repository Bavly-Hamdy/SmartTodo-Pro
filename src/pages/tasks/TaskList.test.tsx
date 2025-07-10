import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import TaskList from './TaskList';
import { useTasks } from '../../hooks/useTasks';

// Mock the hooks
jest.mock('../../hooks/useTasks');
jest.mock('../../hooks/useNotifications');

const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;

// Mock components
jest.mock('../../components/tasks/AddTaskModal', () => {
  return function MockAddTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
      <div data-testid="add-task-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onClose()}>Add Task</button>
      </div>
    );
  };
});

jest.mock('../../components/ui/DataVisualization', () => ({
  StatCard: ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
    <div data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title}: {value}
      {icon && <span data-testid="icon">{icon}</span>}
    </div>
  ),
}));

jest.mock('../../components/ui/AnimatedContainer', () => ({
  FadeIn: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="fade-in" className={className}>{children}</div>
  ),
  SlideUp: ({ children, className, delay }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <div data-testid="slide-up" className={className} data-delay={delay}>{children}</div>
  ),
}));

jest.mock('../../components/ui/LoadingStates', () => ({
  CardSkeleton: () => <div data-testid="card-skeleton">Loading...</div>,
  ListSkeleton: () => <div data-testid="list-skeleton">Loading...</div>,
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

const mockTasks = [
  {
    id: '1',
    title: 'High Priority Task',
    description: 'This is a high priority task',
    status: 'pending' as 'pending',
    priority: 'high' as 'high',
    dueDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    tags: ['urgent', 'work'],
    category: 'work',
    userId: 'user-1',
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Medium Priority Task',
    description: 'This is a medium priority task',
    status: 'completed' as 'completed',
    priority: 'medium' as 'medium',
    dueDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-02'),
    tags: ['personal'],
    category: 'personal',
    userId: 'user-1',
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Low Priority Task',
    description: 'This is a low priority task',
    status: 'pending' as 'pending',
    priority: 'low' as 'low',
    dueDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-03'),
    tags: ['personal', 'home'],
    category: 'personal',
    userId: 'user-1',
    updatedAt: new Date('2024-01-03'),
  },
];

const renderTaskList = (overrides = {}) => {
  const defaultProps = {
    tasks: mockTasks,
    isLoading: false,
    error: null,
    addTask: jest.fn(),
    editTask: jest.fn(),
    removeTask: jest.fn(),
    toggleTaskCompletion: jest.fn(),
    ...overrides,
  };

  mockUseTasks.mockReturnValue(defaultProps);

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationContext.Provider value={mockNotificationContext}>
          <TaskList />
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderTaskList();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('displays task statistics', () => {
      renderTaskList();
      expect(screen.getByTestId('stat-card-total-tasks')).toHaveTextContent('Total Tasks: 3');
      expect(screen.getByTestId('stat-card-completed')).toHaveTextContent('Completed: 1');
      expect(screen.getByTestId('stat-card-pending')).toHaveTextContent('Pending: 2');
    });

    it('shows all tasks by default', () => {
      renderTaskList();
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument();
    });

    it('displays task details correctly', () => {
      renderTaskList();
      expect(screen.getByText('This is a high priority task')).toBeInTheDocument();
      expect(screen.getByText('This is a medium priority task')).toBeInTheDocument();
      expect(screen.getByText('This is a low priority task')).toBeInTheDocument();
    });

    it('shows priority badges', () => {
      renderTaskList();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('shows status badges', () => {
      renderTaskList();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeletons when tasks are loading', () => {
      renderTaskList({ isLoading: true });
      expect(screen.getAllByTestId('card-skeleton')).toHaveLength(3);
      expect(screen.getAllByTestId('list-skeleton')).toHaveLength(1);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no tasks exist', () => {
      renderTaskList({ tasks: [] });
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
      expect(screen.getByText('Create your first task')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters tasks by status', () => {
      renderTaskList();
      const statusFilter = screen.getByLabelText(/status/i);
      fireEvent.change(statusFilter, { target: { value: 'completed' } });
      
      expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
      expect(screen.queryByText('High Priority Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
    });

    it('filters tasks by priority', () => {
      renderTaskList();
      const priorityFilter = screen.getByLabelText(/priority/i);
      fireEvent.change(priorityFilter, { target: { value: 'high' } });
      
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
    });

    it('filters tasks by search term', () => {
      renderTaskList();
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      fireEvent.change(searchInput, { target: { value: 'high' } });
      
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
    });

    it('combines multiple filters', () => {
      renderTaskList();
      const statusFilter = screen.getByLabelText(/status/i);
      const priorityFilter = screen.getByLabelText(/priority/i);
      
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
      fireEvent.change(priorityFilter, { target: { value: 'high' } });
      
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.queryByText('Medium Priority Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts tasks by due date', () => {
      renderTaskList();
      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'dueDate' } });
      
      const tasks = screen.getAllByTestId(/task-item/);
      expect(tasks[0]).toHaveTextContent('High Priority Task'); // Jan 15
      expect(tasks[1]).toHaveTextContent('Medium Priority Task'); // Jan 20
      expect(tasks[2]).toHaveTextContent('Low Priority Task'); // Jan 25
    });

    it('sorts tasks by priority', () => {
      renderTaskList();
      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'priority' } });
      
      const tasks = screen.getAllByTestId(/task-item/);
      expect(tasks[0]).toHaveTextContent('High Priority Task');
      expect(tasks[1]).toHaveTextContent('Medium Priority Task');
      expect(tasks[2]).toHaveTextContent('Low Priority Task');
    });

    it('sorts tasks by creation date', () => {
      renderTaskList();
      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'createdAt' } });
      
      const tasks = screen.getAllByTestId(/task-item/);
      expect(tasks[0]).toHaveTextContent('High Priority Task'); // Jan 1
      expect(tasks[1]).toHaveTextContent('Medium Priority Task'); // Jan 2
      expect(tasks[2]).toHaveTextContent('Low Priority Task'); // Jan 3
    });
  });

  describe('Task Interactions', () => {
    it('opens add task modal when create button is clicked', () => {
      renderTaskList();
      const createButton = screen.getByText('Add Task');
      fireEvent.click(createButton);
      expect(screen.getByTestId('add-task-modal')).toBeInTheDocument();
    });

    it('closes add task modal when close button is clicked', async () => {
      renderTaskList();
      const createButton = screen.getByText('Add Task');
      fireEvent.click(createButton);
      
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('add-task-modal')).not.toBeInTheDocument();
      });
    });

    it('toggles task completion when checkbox is clicked', () => {
      const mockToggleTaskCompletion = jest.fn();
      renderTaskList({ toggleTaskCompletion: mockToggleTaskCompletion });
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      expect(mockToggleTaskCompletion).toHaveBeenCalledWith('1');
    });

    it('shows edit button for each task', () => {
      renderTaskList();
      const editButtons = screen.getAllByText('Edit');
      expect(editButtons).toHaveLength(3);
    });

    it('shows delete button for each task', () => {
      renderTaskList();
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Task Management', () => {
    it('calls removeTask when delete button is clicked', () => {
      const mockRemoveTask = jest.fn();
      renderTaskList({ removeTask: mockRemoveTask });
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      expect(mockRemoveTask).toHaveBeenCalledWith('1');
    });

    it('calls editTask when edit button is clicked', () => {
      const mockEditTask = jest.fn();
      renderTaskList({ editTask: mockEditTask });
      
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(mockEditTask).toHaveBeenCalledWith(mockTasks[0]);
    });
  });

  describe('Animation Components', () => {
    it('renders FadeIn animation for header', () => {
      renderTaskList();
      expect(screen.getByTestId('fade-in')).toBeInTheDocument();
    });

    it('renders SlideUp animation for task items with delays', () => {
      renderTaskList();
      const slideUpElements = screen.getAllByTestId('slide-up');
      expect(slideUpElements.length).toBeGreaterThan(0);
      
      // Check that delays are applied
      expect(slideUpElements[0]).toHaveAttribute('data-delay', '0.1');
      expect(slideUpElements[1]).toHaveAttribute('data-delay', '0.2');
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes filtered and sorted tasks', () => {
      renderTaskList();
      const initialTasks = screen.getAllByTestId(/task-item/);
      
      // Re-render with same props
      renderTaskList();
      const reRenderTasks = screen.getAllByTestId(/task-item/);
      
      // Should be the same instances due to memoization
      expect(reRenderTasks[0]).toBe(initialTasks[0]);
    });

    it('uses memoized event handlers', () => {
      renderTaskList();
      const createButton = screen.getByText('Add Task');
      
      // Click should work without causing unnecessary re-renders
      fireEvent.click(createButton);
      expect(screen.getByTestId('add-task-modal')).toBeInTheDocument();
    });

    it('debounces search input', async () => {
      renderTaskList();
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should not immediately filter
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      
      // Wait for debounce
      await waitFor(() => {
        expect(screen.queryByText('High Priority Task')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Responsive Design', () => {
    it('renders with correct grid layouts', () => {
      renderTaskList();
      const statCards = screen.getAllByTestId(/stat-card-/);
      expect(statCards).toHaveLength(3);
      
      // Check that cards are in a grid layout
      const gridContainer = statCards[0].closest('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('adapts to different screen sizes', () => {
      renderTaskList();
      const container = screen.getByTestId('task-list-container');
      expect(container).toHaveClass('container', 'mx-auto', 'px-4');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      renderTaskList();
      const createButton = screen.getByText('Add Task');
      createButton.focus();
      expect(createButton).toHaveFocus();
    });

    it('uses semantic HTML elements', () => {
      renderTaskList();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('search')).toBeInTheDocument();
    });

    it('has proper ARIA labels', () => {
      renderTaskList();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when tasks fail to load', () => {
      renderTaskList({ 
        error: 'Failed to load tasks',
        tasks: [],
        isLoading: false 
      });
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });

    it('shows retry button when there is an error', () => {
      renderTaskList({ 
        error: 'Failed to load tasks',
        tasks: [],
        isLoading: false 
      });
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
}); 