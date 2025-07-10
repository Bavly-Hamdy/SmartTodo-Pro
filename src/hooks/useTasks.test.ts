import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks, useTaskStats, useTaskSearch, useOverdueTasks, useTodayTasks } from './useTasks';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import * as tasksService from '../services/tasksService';

// Mock the contexts
jest.mock('../contexts/AuthContext');
jest.mock('../contexts/NotificationContext');
jest.mock('../services/tasksService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

describe('useTasks', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2024-01-01T00:00:00.000Z',
      lastSignInTime: '2024-01-01T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    displayName: 'Test User',
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
  };
  const mockSendNotification = jest.fn();

  beforeEach(() => {
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

    mockUseNotification.mockReturnValue({
      sendNotification: mockSendNotification,
      notifications: [],
      clearNotifications: jest.fn(),
      notificationPermission: 'granted',
      fcmToken: null,
      requestPermission: jest.fn(),
      scheduleNotification: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    jest.clearAllMocks();
  });

  describe('useTasks', () => {
    it('should subscribe to tasks and return task data', async () => {
      const mockTasks = [
        { id: '1', title: 'Test Task', status: 'pending' as const },
        { id: '2', title: 'Completed Task', status: 'completed' as const },
      ];

      const mockUnsubscribe = jest.fn();
      (tasksService.subscribeToTasks as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useTasks());

      // Simulate the callback being called with tasks
      const subscribeCallback = (tasksService.subscribeToTasks as jest.Mock).mock.calls[0][1];
      act(() => {
        subscribeCallback(mockTasks);
      });

      await waitFor(() => {
        expect(result.current.tasks).toEqual(mockTasks);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle task creation', async () => {
      const mockTaskData = { 
        title: 'New Task', 
        category: 'Work',
        priority: 'medium' as const
      };
      const mockTaskId = 'new-task-id';

      (tasksService.createTask as jest.Mock).mockResolvedValue(mockTaskId);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        const taskId = await result.current.addTask(mockTaskData);
        expect(taskId).toBe(mockTaskId);
      });

      expect(tasksService.createTask).toHaveBeenCalledWith(mockUser.uid, mockTaskData);
      expect(mockSendNotification).toHaveBeenCalledWith('Task created successfully!', 'success');
    });

    it('should handle task updates', async () => {
      const mockUpdates = { status: 'completed' as const };
      const mockTaskId = 'task-id';

      (tasksService.updateTask as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.editTask(mockTaskId, mockUpdates);
      });

      expect(tasksService.updateTask).toHaveBeenCalledWith(mockUser.uid, mockTaskId, mockUpdates);
      expect(mockSendNotification).toHaveBeenCalledWith('Task updated successfully!', 'success');
    });

    it('should handle task deletion', async () => {
      const mockTaskId = 'task-id';

      (tasksService.deleteTask as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        await result.current.removeTask(mockTaskId);
      });

      expect(tasksService.deleteTask).toHaveBeenCalledWith(mockUser.uid, mockTaskId);
      expect(mockSendNotification).toHaveBeenCalledWith('Task deleted successfully!', 'success');
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Firebase error');
      (tasksService.createTask as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useTasks());

      await act(async () => {
        try {
          await result.current.addTask({ 
            title: 'Test', 
            category: 'Work',
            priority: 'medium' as const
          });
        } catch (error) {
          expect(error).toBe(mockError);
        }
      });

      expect(mockSendNotification).toHaveBeenCalledWith('Failed to create task', 'error');
    });
  });

  describe('useTaskStats', () => {
    it('should fetch and return task statistics', async () => {
      const mockStats = {
        totalTasks: 10,
        completedTasks: 6,
        pendingTasks: 4,
        overdueTasks: 1,
        completionRate: 60,
        weeklyProgress: 75,
      };

      (tasksService.getTaskStats as jest.Mock).mockResolvedValue(mockStats);

      const { result } = renderHook(() => useTaskStats());

      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
        expect(result.current.isLoading).toBe(false);
      });

      expect(tasksService.getTaskStats).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should handle stats loading error', async () => {
      const mockError = new Error('Stats error');
      (tasksService.getTaskStats as jest.Mock).mockRejectedValue(mockError);

      renderHook(() => useTaskStats());

      await waitFor(() => {
        expect(mockSendNotification).toHaveBeenCalledWith('Failed to load task statistics', 'error');
      });
    });
  });

  describe('useTaskSearch', () => {
    it('should search tasks with debounced input', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Search Result', status: 'pending' as const },
      ];

      const mockUnsubscribe = jest.fn();
      (tasksService.searchTasks as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useTaskSearch('test search'));

      // Wait for debounce
      await waitFor(() => {
        expect(tasksService.searchTasks).toHaveBeenCalledWith(mockUser.uid, 'test search', expect.any(Function));
      });

      // Simulate search results
      const searchCallback = (tasksService.searchTasks as jest.Mock).mock.calls[0][2];
      act(() => {
        searchCallback(mockSearchResults);
      });

      await waitFor(() => {
        expect(result.current.searchResults).toEqual(mockSearchResults);
        expect(result.current.isSearching).toBe(false);
      });
    });

    it('should not search when search term is empty', () => {
      renderHook(() => useTaskSearch(''));

      expect(tasksService.searchTasks).not.toHaveBeenCalled();
    });
  });

  describe('useOverdueTasks', () => {
    it('should subscribe to overdue tasks', async () => {
      const mockOverdueTasks = [
        { id: '1', title: 'Overdue Task', status: 'pending' as const },
      ];

      const mockUnsubscribe = jest.fn();
      (tasksService.getOverdueTasks as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useOverdueTasks());

      // Simulate overdue tasks callback
      const overdueCallback = (tasksService.getOverdueTasks as jest.Mock).mock.calls[0][1];
      act(() => {
        overdueCallback(mockOverdueTasks);
      });

      await waitFor(() => {
        expect(result.current.overdueTasks).toEqual(mockOverdueTasks);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('useTodayTasks', () => {
    it('should subscribe to today\'s tasks', async () => {
      const mockTodayTasks = [
        { id: '1', title: 'Today Task', status: 'pending' as const },
      ];

      const mockUnsubscribe = jest.fn();
      (tasksService.getTodayTasks as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { result } = renderHook(() => useTodayTasks());

      // Simulate today's tasks callback
      const todayCallback = (tasksService.getTodayTasks as jest.Mock).mock.calls[0][1];
      act(() => {
        todayCallback(mockTodayTasks);
      });

      await waitFor(() => {
        expect(result.current.todayTasks).toEqual(mockTodayTasks);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
}); 