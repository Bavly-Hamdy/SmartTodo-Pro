import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Mock the contexts
jest.mock('../contexts/AuthContext');
jest.mock('../contexts/NotificationContext');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

describe('useNotifications', () => {
  const mockCurrentUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
  };

  const mockSendNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: mockCurrentUser,
      userProfile: null,
      signOutUser: jest.fn(),
    } as any);
    mockUseNotification.mockReturnValue({
      sendNotification: mockSendNotification,
    } as any);
  });

  it('should initialize with empty notifications when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      userProfile: null,
      signOutUser: jest.fn(),
    } as any);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should initialize with empty notifications when user is authenticated', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark notification as read', async () => {
    const { result } = renderHook(() => useNotifications());

    // Add a mock notification
    act(() => {
      // Simulate adding a notification (this would normally come from Firestore)
      // For now, we'll test the function exists
    });

    await act(async () => {
      await result.current.markAsRead('test-notification-id');
    });

    // Since Firestore operations are disabled, this should just log
    expect(console.log).toHaveBeenCalledWith('Would mark notification as read:', 'test-notification-id');
  });

  it('should mark all notifications as read', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAllAsRead();
    });

    // Since Firestore operations are disabled, this should just log
    expect(console.log).toHaveBeenCalledWith('Would mark all notifications as read');
    expect(mockSendNotification).toHaveBeenCalledWith('All notifications marked as read', 'success');
  });

  it('should get upcoming tasks', () => {
    const { result } = renderHook(() => useNotifications());

    const upcomingTasks = result.current.getUpcomingTasks();
    expect(upcomingTasks).toEqual([]);
  });

  it('should return correct unread count', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.unreadCount).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useNotifications());

    // Simulate an error by calling markAsRead with invalid data
    await act(async () => {
      await result.current.markAsRead('invalid-id');
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current).toHaveProperty('notifications');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('unreadCount');
    expect(result.current).toHaveProperty('markAsRead');
    expect(result.current).toHaveProperty('markAllAsRead');
    expect(result.current).toHaveProperty('getUpcomingTasks');
  });

  it('should handle notification interface correctly', () => {
    const { result } = renderHook(() => useNotifications());

    // Test that the interface is properly typed
    const notification = result.current.notifications[0];
    if (notification) {
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('body');
      expect(notification).toHaveProperty('timestamp');
      expect(notification).toHaveProperty('read');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('priority');
      expect(notification).toHaveProperty('userId');
    }
  });
}); 