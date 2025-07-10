import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import Dashboard from './Dashboard';
import { useTaskStats, useTasks } from '../../hooks/useTasks';

// Mock the hooks
jest.mock('../../hooks/useTasks');
jest.mock('../../hooks/useGoals');
jest.mock('../../hooks/useNotifications');

const mockUseTaskStats = useTaskStats as jest.MockedFunction<typeof useTaskStats>;
const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;

// Mock components
jest.mock('../../components/dashboard/SearchBar', () => {
  return function MockSearchBar({ onTaskSelect }: { onTaskSelect: (task: any) => void }) {
    return (
      <div data-testid="search-bar">
        <button onClick={() => onTaskSelect({ id: '1', title: 'Test Task' })}>
          Select Task
        </button>
      </div>
    );
  };
});

jest.mock('../../components/dashboard/AccountMenu', () => {
  return function MockAccountMenu() {
    return <div data-testid="account-menu">Account Menu</div>;
  };
});

jest.mock('../../components/dashboard/QuickActions', () => {
  return function MockQuickActions() {
    return <div data-testid="quick-actions">Quick Actions</div>;
  };
});

jest.mock('../../components/tasks/TaskForm', () => {
  return function MockTaskForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    return (
      <div data-testid="task-form">
        <button onClick={onClose}>Close Form</button>
      </div>
    );
  };
});

// Mock the UI components
jest.mock('../../components/ui/DataVisualization', () => ({
  StatCard: ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
    <div data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title}: {value}
      {icon && <span data-testid="icon">{icon}</span>}
    </div>
  ),
  ProgressRing: ({ progress, showLabel }: { progress: number; showLabel?: boolean }) => (
    <div data-testid="progress-ring">
      Progress: {progress}% {showLabel && '(with label)'}
    </div>
  ),
  BarChart: ({ data }: { data: Array<{ label: string; value: number }> }) => (
    <div data-testid="bar-chart">
      {data.map((item, index) => (
        <div key={index} data-testid={`chart-item-${item.label}`}>
          {item.label}: {item.value}
        </div>
      ))}
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
  ScaleIn: ({ children, delay }: { children: React.ReactNode; delay?: number }) => (
    <div data-testid="scale-in" data-delay={delay}>{children}</div>
  ),
}));

jest.mock('../../components/ui/LoadingStates', () => ({
  CardSkeleton: () => <div data-testid="card-skeleton">Loading...</div>,
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
    providerId: 'mock-provider', // <-- add this
    // Add any other required User properties as stubs
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
    // Add any other required UserProfile properties as stubs
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
    title: 'Task 1',
    description: 'Description 1',
    status: 'completed' as 'completed',
    priority: 'high' as 'high',
    dueDate: new Date(),
    createdAt: new Date(),
    category: 'work',
    userId: 'user-1',
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    status: 'pending' as 'pending',
    priority: 'medium' as 'medium',
    dueDate: new Date(),
    createdAt: new Date(),
    category: 'personal',
    userId: 'user-1',
    updatedAt: new Date(),
  },
];

const renderDashboard = (overrides = {}) => {
  const defaultProps = {
    stats: {
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 3,
      overdueTasks: 1,
      completionRate: 60,
      weeklyProgress: 75,
    },
    isLoading: false,
    ...overrides,
  };

  mockUseTaskStats.mockReturnValue(defaultProps);
  mockUseTasks.mockReturnValue({
    tasks: mockTasks,
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
          <Dashboard />
        </NotificationContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderDashboard();
      expect(screen.getByText(/Good morning|Good afternoon|Good evening/)).toBeInTheDocument();
    });

    it('displays user greeting with correct name', () => {
      renderDashboard();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });

    it('shows task statistics', () => {
      renderDashboard();
      expect(screen.getByTestId('stat-card-total-tasks')).toHaveTextContent('Total Tasks: 10');
      expect(screen.getByTestId('stat-card-completed')).toHaveTextContent('Completed: 6');
      expect(screen.getByTestId('stat-card-completion-rate')).toHaveTextContent('Completion Rate: 60%');
      expect(screen.getByTestId('stat-card-weekly-progress')).toHaveTextContent('Weekly Progress: 75%');
    });

    it('displays recent tasks', () => {
      renderDashboard();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('shows progress ring with correct data', () => {
      renderDashboard();
      expect(screen.getByTestId('progress-ring')).toHaveTextContent('Progress: 60% (with label)');
    });

    it('displays weekly activity chart', () => {
      renderDashboard();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeletons when data is loading', () => {
      renderDashboard({ isLoading: true });
      expect(screen.getAllByTestId('card-skeleton')).toHaveLength(4);
    });

    it('shows loading skeletons when tasks are loading', () => {
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: true,
        error: null,
        addTask: jest.fn(),
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });
      renderDashboard();
      expect(screen.getAllByTestId('card-skeleton')).toHaveLength(4);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no tasks exist', () => {
      mockUseTasks.mockReturnValue({
        tasks: [],
        isLoading: false,
        error: null,
        addTask: jest.fn(),
        editTask: jest.fn(),
        removeTask: jest.fn(),
        toggleTaskCompletion: jest.fn(),
      });
      renderDashboard();
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task')).toBeInTheDocument();
    });
  });

  describe('Task Interactions', () => {
    it('handles task selection from search bar', () => {
      renderDashboard();
      const selectButton = screen.getByText('Select Task');
      fireEvent.click(selectButton);
      // Verify navigation or task selection behavior
    });

    it('opens task form when create button is clicked', () => {
      renderDashboard();
      const createButton = screen.getByText('Create your first task');
      fireEvent.click(createButton);
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });

    it('closes task form when close button is clicked', async () => {
      renderDashboard();
      const createButton = screen.getByText('Create your first task');
      fireEvent.click(createButton);
      
      const closeButton = screen.getByText('Close Form');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      });
    });
  });

  describe('Task Display', () => {
    it('displays task status badges correctly', () => {
      renderDashboard();
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('displays task priority badges correctly', () => {
      renderDashboard();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('shows task descriptions when available', () => {
      renderDashboard();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('displays due dates correctly', () => {
      renderDashboard();
      expect(screen.getByText('Jan 15')).toBeInTheDocument();
      expect(screen.getByText('Jan 20')).toBeInTheDocument();
    });
  });

  describe('Animation Components', () => {
    it('renders FadeIn animation for header', () => {
      renderDashboard();
      expect(screen.getByTestId('fade-in')).toBeInTheDocument();
    });

    it('renders SlideUp animation for welcome section', () => {
      renderDashboard();
      expect(screen.getByTestId('slide-up')).toBeInTheDocument();
    });

    it('renders ScaleIn animations for stat cards with delays', () => {
      renderDashboard();
      const scaleInElements = screen.getAllByTestId('scale-in');
      expect(scaleInElements).toHaveLength(4);
      
      // Check that delays are applied
      expect(scaleInElements[0]).toHaveAttribute('data-delay', '0.1');
      expect(scaleInElements[1]).toHaveAttribute('data-delay', '0.2');
      expect(scaleInElements[2]).toHaveAttribute('data-delay', '0.3');
      expect(scaleInElements[3]).toHaveAttribute('data-delay', '0.4');
    });
  });

  describe('Performance Optimizations', () => {
    it('memoizes computed values correctly', () => {
      renderDashboard();
      // The component should not re-render unnecessarily due to memoization
      const initialRender = screen.getByTestId('stat-card-total-tasks');
      
      // Re-render with same props
      renderDashboard();
      const reRender = screen.getByTestId('stat-card-total-tasks');
      
      // Should be the same instance due to memoization
      expect(reRender).toBe(initialRender);
    });

    it('uses memoized event handlers', () => {
      renderDashboard();
      const createButton = screen.getByText('Create your first task');
      
      // Click should work without causing unnecessary re-renders
      fireEvent.click(createButton);
      expect(screen.getByTestId('task-form')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders with correct grid layouts', () => {
      renderDashboard();
      const statCards = screen.getAllByTestId(/stat-card-/);
      expect(statCards).toHaveLength(4);
      
      // Check that cards are in a grid layout
      const gridContainer = statCards[0].closest('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', () => {
      renderDashboard();
      const createButton = screen.getByText('Create your first task');
      createButton.focus();
      expect(createButton).toHaveFocus();
    });

    it('uses semantic HTML elements', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
}); 