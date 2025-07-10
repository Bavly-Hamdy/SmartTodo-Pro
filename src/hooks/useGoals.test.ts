import { renderHook, act, waitFor } from '@testing-library/react';
import { useGoals } from './useGoals';
import { goalsService } from '../services/goalsService';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

// Mock the services and contexts
jest.mock('../services/goalsService');
jest.mock('../contexts/AuthContext');

const mockGoalsService = goalsService as jest.Mocked<typeof goalsService>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useGoals', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    displayName: 'Test User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'password',
  } as unknown as User;

  const mockGoals = [
    {
      id: '1',
      title: 'Test Goal 1',
      description: 'Test Description 1',
      category: 'personal' as const,
      status: 'active' as const,
      priority: 'high' as const,
      targetDate: new Date('2024-12-31'),
      progress: 50,
      milestones: [],
      userId: 'test-user-id',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Test Goal 2',
      description: 'Test Description 2',
      category: 'work' as const,
      status: 'completed' as const,
      priority: 'medium' as const,
      targetDate: new Date('2024-06-30'),
      progress: 100,
      milestones: [],
      userId: 'test-user-id',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
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
  });

  describe('initialization', () => {
    it('should initialize with empty goals and loading state', () => {
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      expect(result.current.goals).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should subscribe to user goals when user is authenticated', () => {
      const mockUnsubscribe = jest.fn();
      mockGoalsService.subscribeToUserGoals.mockReturnValue(mockUnsubscribe);

      renderHook(() => useGoals());

      expect(mockGoalsService.subscribeToUserGoals).toHaveBeenCalledWith(
        'test-user-id',
        expect.any(Function)
      );
    });

    it('should not subscribe when user is not authenticated', () => {
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

      const { result } = renderHook(() => useGoals());

      expect(mockGoalsService.subscribeToUserGoals).not.toHaveBeenCalled();
      expect(result.current.goals).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('real-time updates', () => {
    it('should update goals when subscription callback is called', () => {
      let subscriptionCallback: (goals: any[]) => void;
      mockGoalsService.subscribeToUserGoals.mockImplementation((userId, callback) => {
        subscriptionCallback = callback;
        return jest.fn();
      });

      const { result } = renderHook(() => useGoals());

      act(() => {
        subscriptionCallback(mockGoals);
      });

      expect(result.current.goals).toEqual(mockGoals);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createGoal', () => {
    it('should create a goal successfully', async () => {
      mockGoalsService.createGoal.mockResolvedValue('new-goal-id');
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      const goalData = {
        title: 'New Goal',
        description: 'New Description',
        category: 'personal' as const,
        priority: 'high' as const,
        targetDate: new Date('2024-12-31'),
      };

      await act(async () => {
        const goalId = await result.current.createGoal(goalData);
        expect(goalId).toBe('new-goal-id');
      });

      expect(mockGoalsService.createGoal).toHaveBeenCalledWith('test-user-id', goalData);
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

      const { result } = renderHook(() => useGoals());

      const goalData = {
        title: 'New Goal',
        description: 'New Description',
        category: 'personal' as const,
        priority: 'high' as const,
        targetDate: new Date('2024-12-31'),
      };

      await expect(result.current.createGoal(goalData)).rejects.toThrow('User not authenticated');
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockGoalsService.createGoal.mockRejectedValue(error);
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      const goalData = {
        title: 'New Goal',
        description: 'New Description',
        category: 'personal' as const,
        priority: 'high' as const,
        targetDate: new Date('2024-12-31'),
      };

      await act(async () => {
        await expect(result.current.createGoal(goalData)).rejects.toThrow('Creation failed');
      });

      expect(result.current.error).toBe('Failed to create goal');
    });
  });

  describe('updateGoal', () => {
    it('should update a goal successfully', async () => {
      mockGoalsService.updateGoal.mockResolvedValue();
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      const updateData = {
        title: 'Updated Goal',
        progress: 75,
      };

      await act(async () => {
        await result.current.updateGoal('goal-id', updateData);
      });

      expect(mockGoalsService.updateGoal).toHaveBeenCalledWith('goal-id', updateData);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockGoalsService.updateGoal.mockRejectedValue(error);
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      const updateData = {
        title: 'Updated Goal',
      };

      await act(async () => {
        await expect(result.current.updateGoal('goal-id', updateData)).rejects.toThrow('Update failed');
      });

      expect(result.current.error).toBe('Failed to update goal');
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal successfully', async () => {
      mockGoalsService.deleteGoal.mockResolvedValue();
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        await result.current.deleteGoal('goal-id');
      });

      expect(mockGoalsService.deleteGoal).toHaveBeenCalledWith('goal-id');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockGoalsService.deleteGoal.mockRejectedValue(error);
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        await expect(result.current.deleteGoal('goal-id')).rejects.toThrow('Delete failed');
      });

      expect(result.current.error).toBe('Failed to delete goal');
    });
  });

  describe('searchGoals', () => {
    it('should search goals successfully', async () => {
      mockGoalsService.searchGoals.mockResolvedValue(mockGoals);
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        const searchResults = await result.current.searchGoals('test');
        expect(searchResults).toEqual(mockGoals);
      });

      expect(mockGoalsService.searchGoals).toHaveBeenCalledWith('test-user-id', 'test');
    });

    it('should return empty array when user is not authenticated', async () => {
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

      const { result } = renderHook(() => useGoals());

      await act(async () => {
        const searchResults = await result.current.searchGoals('test');
        expect(searchResults).toEqual([]);
      });
    });
  });

  describe('clearError', () => {
    it('should clear the error state', () => {
      mockGoalsService.subscribeToUserGoals.mockReturnValue(jest.fn());

      const { result } = renderHook(() => useGoals());

      // Set an error first
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from goals when component unmounts', () => {
      const mockUnsubscribe = jest.fn();
      mockGoalsService.subscribeToUserGoals.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useGoals());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
}); 