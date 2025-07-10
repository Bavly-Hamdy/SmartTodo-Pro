import { renderHook, act } from '@testing-library/react';
import { useCalendar } from './useCalendar';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks, createTask, updateTask, deleteTask } from '../services/tasksService';

// Mock dependencies
jest.mock('../contexts/AuthContext');
jest.mock('../services/tasksService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSubscribeToTasks = subscribeToTasks as jest.MockedFunction<typeof subscribeToTasks>;
const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;
const mockUpdateTask = updateTask as jest.MockedFunction<typeof updateTask>;
const mockDeleteTask = deleteTask as jest.MockedFunction<typeof deleteTask>;

describe('useCalendar', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  };

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'pending' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-01-15'),
      category: 'work',
      userId: 'test-user-id',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'task-2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'completed' as const,
      priority: 'medium' as const,
      dueDate: new Date('2024-01-20'),
      category: 'personal',
      userId: 'test-user-id',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      userProfile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOutUser: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      isEmailVerified: true,
      isMFAEnabled: false,
    });

    mockSubscribeToTasks.mockReturnValue(() => {});
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.view.type).toBe('month');
    expect(result.current.view.currentDate).toBeInstanceOf(Date);
  });

  it('should subscribe to tasks when user is authenticated', () => {
    renderHook(() => useCalendar());

    expect(mockSubscribeToTasks).toHaveBeenCalledWith(
      'test-user-id',
      expect.any(Function),
      { orderBy: 'dueDate' }
    );
  });

  it('should convert tasks to calendar events', () => {
    let callback: (tasks: any[]) => void;
    mockSubscribeToTasks.mockImplementation((userId, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useCalendar());

    act(() => {
      callback!(mockTasks);
    });

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0]).toEqual({
      id: 'task-1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      dueDate: new Date('2024-01-15'),
      priority: 'high',
      status: 'pending',
      category: 'work',
      userId: 'test-user-id',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  });

  it('should filter out tasks without due dates', () => {
    const tasksWithoutDueDate = [
      { ...mockTasks[0], dueDate: undefined },
      mockTasks[1],
    ];

    let callback: (tasks: any[]) => void;
    mockSubscribeToTasks.mockImplementation((userId, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useCalendar());

    act(() => {
      callback!(tasksWithoutDueDate);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe('task-2');
  });

  it('should handle no user authentication', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      userProfile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOutUser: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      isEmailVerified: false,
      isMFAEnabled: false,
    });

    const { result } = renderHook(() => useCalendar());

    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockSubscribeToTasks).not.toHaveBeenCalled();
  });

  it('should create a new event', async () => {
    mockCreateTask.mockResolvedValue('new-task-id');

    const { result } = renderHook(() => useCalendar());

    const eventData = {
      title: 'New Event',
      description: 'New Description',
      dueDate: new Date('2024-01-25'),
      priority: 'medium' as const,
      category: 'work',
      status: 'pending' as const,
    };

    await act(async () => {
      await result.current.addEvent(eventData);
    });

    expect(mockCreateTask).toHaveBeenCalledWith('test-user-id', {
      title: 'New Event',
      description: 'New Description',
      priority: 'medium',
      dueDate: new Date('2024-01-25'),
      category: 'work',
    });
  });

  it('should update an existing event', async () => {
    mockUpdateTask.mockResolvedValue();

    const { result } = renderHook(() => useCalendar());

    const updates = {
      title: 'Updated Event',
      priority: 'high' as const,
    };

    await act(async () => {
      await result.current.updateEvent('task-1', updates);
    });

    expect(mockUpdateTask).toHaveBeenCalledWith('test-user-id', 'task-1', updates);
  });

  it('should delete an event', async () => {
    mockDeleteTask.mockResolvedValue();

    const { result } = renderHook(() => useCalendar());

    await act(async () => {
      await result.current.deleteEvent('task-1');
    });

    expect(mockDeleteTask).toHaveBeenCalledWith('test-user-id', 'task-1');
  });

  it('should update event date for drag and drop', async () => {
    mockUpdateTask.mockResolvedValue();

    const { result } = renderHook(() => useCalendar());

    const newDate = new Date('2024-01-30');

    await act(async () => {
      await result.current.updateEventDate('task-1', newDate);
    });

    expect(mockUpdateTask).toHaveBeenCalledWith('test-user-id', 'task-1', { dueDate: newDate });
  });

  it('should get events for a specific date', () => {
    let callback: (tasks: any[]) => void;
    mockSubscribeToTasks.mockImplementation((userId, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useCalendar());

    act(() => {
      callback!(mockTasks);
    });

    const targetDate = new Date('2024-01-15');
    const eventsForDate = result.current.getEventsForDate(targetDate);

    expect(eventsForDate).toHaveLength(1);
    expect(eventsForDate[0].id).toBe('task-1');
  });

  it('should get events for a date range', () => {
    let callback: (tasks: any[]) => void;
    mockSubscribeToTasks.mockImplementation((userId, cb) => {
      callback = cb;
      return () => {};
    });

    const { result } = renderHook(() => useCalendar());

    act(() => {
      callback!(mockTasks);
    });

    const startDate = new Date('2024-01-10');
    const endDate = new Date('2024-01-25');
    const eventsInRange = result.current.getEventsForDateRange(startDate, endDate);

    expect(eventsInRange).toHaveLength(2);
  });

  it('should navigate calendar view', () => {
    const { result } = renderHook(() => useCalendar());

    const initialDate = result.current.view.currentDate;

    act(() => {
      result.current.navigateView('next');
    });

    expect(result.current.view.currentDate.getTime()).toBeGreaterThan(initialDate.getTime());
  });

  it('should change view type', () => {
    const { result } = renderHook(() => useCalendar());

    act(() => {
      result.current.changeView('week');
    });

    expect(result.current.view.type).toBe('week');
  });

  it('should go to today', () => {
    const { result } = renderHook(() => useCalendar());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    act(() => {
      result.current.goToToday();
    });

    const currentDate = result.current.view.currentDate;
    currentDate.setHours(0, 0, 0, 0);

    expect(currentDate.getTime()).toBe(today.getTime());
  });

  it('should handle errors when creating event', async () => {
    mockCreateTask.mockRejectedValue(new Error('Failed to create task'));

    const { result } = renderHook(() => useCalendar());

    const eventData = {
      title: 'New Event',
      description: 'New Description',
      dueDate: new Date('2024-01-25'),
      priority: 'medium' as const,
      category: 'work',
      status: 'pending' as const,
    };

    await expect(async () => {
      await act(async () => {
        await result.current.addEvent(eventData);
      });
    }).rejects.toThrow('Failed to create event');
  });

  it('should handle errors when updating event', async () => {
    mockUpdateTask.mockRejectedValue(new Error('Failed to update task'));

    const { result } = renderHook(() => useCalendar());

    const updates = {
      title: 'Updated Event',
    };

    await expect(async () => {
      await act(async () => {
        await result.current.updateEvent('task-1', updates);
      });
    }).rejects.toThrow('Failed to update event');
  });

  it('should handle errors when deleting event', async () => {
    mockDeleteTask.mockRejectedValue(new Error('Failed to delete task'));

    const { result } = renderHook(() => useCalendar());

    await expect(async () => {
      await act(async () => {
        await result.current.deleteEvent('task-1');
      });
    }).rejects.toThrow('Failed to delete event');
  });

  it('should throw error when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      userProfile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOutUser: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      isEmailVerified: false,
      isMFAEnabled: false,
    });

    const { result } = renderHook(() => useCalendar());

    const eventData = {
      title: 'New Event',
      description: 'New Description',
      dueDate: new Date('2024-01-25'),
      priority: 'medium' as const,
      category: 'work',
      status: 'pending' as const,
    };

    await expect(async () => {
      await act(async () => {
        await result.current.addEvent(eventData);
      });
    }).rejects.toThrow('User not authenticated');
  });
}); 