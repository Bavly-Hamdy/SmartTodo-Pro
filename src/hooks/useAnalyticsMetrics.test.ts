import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalyticsMetrics } from './useAnalyticsMetrics';
import { subscribeToAnalyticsMetrics, getAnalyticsMetricsForPeriod } from '../services/analyticsMetricsService';

// Mock the services
jest.mock('../services/analyticsMetricsService');
jest.mock('../contexts/AuthContext');
jest.mock('../contexts/NotificationContext');

const mockSubscribeToAnalyticsMetrics = subscribeToAnalyticsMetrics as jest.MockedFunction<typeof subscribeToAnalyticsMetrics>;
const mockGetAnalyticsMetricsForPeriod = getAnalyticsMetricsForPeriod as jest.MockedFunction<typeof getAnalyticsMetricsForPeriod>;

// Mock the contexts
const mockUseAuth = require('../contexts/AuthContext').useAuth;
const mockUseNotification = require('../contexts/NotificationContext').useNotification;

describe('useAnalyticsMetrics', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com'
  };

  const mockSendNotification = jest.fn();
  const mockUnsubscribe = jest.fn();

  const mockMetrics = {
    totalTasks: 24,
    completedTasks: 18,
    completionRate: 75,
    overdueTasks: 2,
    previousTotalTasks: 20,
    previousCompletedTasks: 15,
    previousCompletionRate: 75,
    previousOverdueTasks: 3,
    deltas: {
      totalTasks: 20,
      completedTasks: 20,
      completionRate: 0,
      overdueTasks: -33
    },
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup auth mock
    mockUseAuth.mockReturnValue({
      currentUser: mockUser
    });

    // Setup notification mock
    mockUseNotification.mockReturnValue({
      sendNotification: mockSendNotification
    });

    // Setup service mocks
    mockSubscribeToAnalyticsMetrics.mockReturnValue(mockUnsubscribe);
    mockGetAnalyticsMetricsForPeriod.mockResolvedValue(mockMetrics);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.metrics).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      overdueTasks: 0,
      previousTotalTasks: 0,
      previousCompletedTasks: 0,
      previousCompletionRate: 0,
      previousOverdueTasks: 0,
      deltas: {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        overdueTasks: 0
      },
      isLoading: true,
      error: null
    });
  });

  it('should subscribe to analytics metrics on mount', () => {
    renderHook(() => useAnalyticsMetrics());

    expect(mockSubscribeToAnalyticsMetrics).toHaveBeenCalledWith(
      mockUser.uid,
      7, // default period length
      expect.any(Function)
    );
  });

  it('should call the callback with metrics data', async () => {
    let callback: (metrics: any) => void;
    mockSubscribeToAnalyticsMetrics.mockImplementation((userId, periodLength, cb) => {
      callback = cb;
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useAnalyticsMetrics());

    // Simulate the callback being called
    act(() => {
      callback!(mockMetrics);
    });

    await waitFor(() => {
      expect(result.current.metrics).toEqual(mockMetrics);
    });
  });

  it('should handle custom period length', () => {
    renderHook(() => useAnalyticsMetrics({ periodLength: 30 }));

    expect(mockSubscribeToAnalyticsMetrics).toHaveBeenCalledWith(
      mockUser.uid,
      30,
      expect.any(Function)
    );
  });

  it('should provide helper functions for UI', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.getDeltaColor).toBeDefined();
    expect(result.current.getDeltaIcon).toBeDefined();
    expect(result.current.formatDelta).toBeDefined();
    expect(result.current.refresh).toBeDefined();
  });

  it('should format delta correctly', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.formatDelta(10)).toBe('+10%');
    expect(result.current.formatDelta(-5)).toBe('-5%');
    expect(result.current.formatDelta(0)).toBe('0%');
  });

  it('should get correct delta colors', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.getDeltaColor(10)).toBe('text-green-600 dark:text-green-400');
    expect(result.current.getDeltaColor(-5)).toBe('text-red-600 dark:text-red-400');
    expect(result.current.getDeltaColor(0)).toBe('text-gray-600 dark:text-gray-400');
  });

  it('should get correct delta icons', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.getDeltaIcon(10)).toBe('↗');
    expect(result.current.getDeltaIcon(-5)).toBe('↘');
    expect(result.current.getDeltaIcon(0)).toBe('→');
  });

  it('should handle refresh function', async () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAnalyticsMetricsForPeriod).toHaveBeenCalledWith(
      mockUser.uid,
      7
    );
    expect(mockSendNotification).toHaveBeenCalledWith(
      'Analytics data refreshed',
      'success'
    );
  });

  it('should handle refresh errors', async () => {
    const error = new Error('Failed to fetch');
    mockGetAnalyticsMetricsForPeriod.mockRejectedValue(error);

    const { result } = renderHook(() => useAnalyticsMetrics());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockSendNotification).toHaveBeenCalledWith(
      'Failed to fetch',
      'error'
    );
  });

  it('should not subscribe when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null
    });

    renderHook(() => useAnalyticsMetrics());

    expect(mockSubscribeToAnalyticsMetrics).not.toHaveBeenCalled();
  });

  it('should provide computed values for easy access', () => {
    const { result } = renderHook(() => useAnalyticsMetrics());

    expect(result.current.currentMetrics).toBeDefined();
    expect(result.current.previousMetrics).toBeDefined();
    expect(result.current.deltas).toBeDefined();
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useAnalyticsMetrics());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    mockSubscribeToAnalyticsMetrics.mockImplementation((userId, periodLength, callback) => {
      // Simulate error callback
      setTimeout(() => {
        callback({
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
          overdueTasks: 0,
          previousTotalTasks: 0,
          previousCompletedTasks: 0,
          previousCompletionRate: 0,
          previousOverdueTasks: 0,
          deltas: {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 0,
            overdueTasks: 0
          },
          isLoading: false,
          error: error.message
        });
      }, 0);
      return mockUnsubscribe;
    });

    const { result } = renderHook(() => useAnalyticsMetrics());

    await waitFor(() => {
      expect(result.current.error).toBe('Service error');
    });
  });
}); 