import { renderHook, act } from '@testing-library/react';
import { useAnalytics, useAnalyticsFilters, useAnalyticsCharts, useAnalyticsInsights } from './useAnalytics';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Mock the contexts
jest.mock('../contexts/AuthContext');
jest.mock('../contexts/NotificationContext');

// Mock the analytics service
jest.mock('../services/analyticsService', () => ({
  subscribeToAnalytics: jest.fn(),
  getAnalyticsForPeriod: jest.fn()
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

describe('useAnalytics', () => {
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
    phoneNumber: null,
    photoURL: null,
    providerId: '',
    reload: jest.fn(),
    delete: jest.fn(),
    toJSON: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
  } as any;

  const mockSendNotification = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: mockUser,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOutUser: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      isEmailVerified: true,
      isMFAEnabled: false,
      userProfile: null,
      loading: false
    });
    mockUseNotification.mockReturnValue({
      notificationPermission: 'default',
      fcmToken: null,
      requestPermission: jest.fn(),
      sendNotification: mockSendNotification,
      scheduleNotification: jest.fn(),
      clearNotifications: jest.fn(),
      notifications: [],
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.analyticsData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle user not authenticated', () => {
    mockUseAuth.mockReturnValue({
      currentUser: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOutUser: jest.fn(),
      resetPassword: jest.fn(),
      updateUserProfile: jest.fn(),
      resendEmailVerification: jest.fn(),
      isEmailVerified: false,
      isMFAEnabled: false,
      userProfile: null,
      loading: false
    });

    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.analyticsData).toBeNull();
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(() => useAnalytics());
    
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useAnalyticsFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    
    expect(result.current.filters).toEqual({ timeRange: '30d' });
  });

  it('should update filters correctly', () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    
    act(() => {
      result.current.updateFilters({ timeRange: '7d' });
    });
    
    expect(result.current.filters).toEqual({ timeRange: '7d' });
  });

  it('should reset filters to default', () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    
    act(() => {
      result.current.updateFilters({ timeRange: '7d' });
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters).toEqual({ timeRange: '30d' });
  });
});

describe('useAnalyticsCharts', () => {
  const mockAnalyticsData = {
    totalTasks: 24,
    completedTasks: 18,
    pendingTasks: 4,
    overdueTasks: 2,
    completionRate: 75,
    dailyCompletions: [
      { date: '2024-01-01', completed: 3, created: 4, productivityScore: 75 },
      { date: '2024-01-02', completed: 5, created: 6, productivityScore: 83 }
    ],
    weeklyData: [
      { week: '2024-01-01', tasksCompleted: 15, tasksCreated: 20, productivityScore: 75, averageDailyTasks: 2.8 }
    ],
    categoryBreakdown: [
      { category: 'Work', count: 12, percentage: 50, color: '#3B82F6', completedCount: 9, completionRate: 75 }
    ],
    productivityScore: 85,
    streakDays: 7,
    averageTasksPerDay: 3.4,
    forecast: {
      nextWeekTasks: 20,
      nextWeekCompletionRate: 80,
      recommendations: ['Focus on high-priority tasks'],
      trendDirection: 'up' as const
    },
    monthlyData: []
  };

  it('should return null when analytics data is null', () => {
    const { result } = renderHook(() => useAnalyticsCharts(null));
    
    expect(result.current).toBeNull();
  });

  it('should transform analytics data into chart data', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    expect(result.current).toBeDefined();
    expect(result.current?.dailyCompletionsChart).toBeDefined();
    expect(result.current?.weeklyComparisonChart).toBeDefined();
    expect(result.current?.categoryBreakdownChart).toBeDefined();
    expect(result.current?.progressChart).toBeDefined();
    expect(result.current?.forecastChart).toBeDefined();
  });

  it('should format daily completions chart data correctly', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    const chartData = result.current?.dailyCompletionsChart;
    expect(chartData?.data).toHaveLength(2);
    expect(chartData?.keys).toEqual(['completed', 'created']);
    expect(chartData?.colors).toEqual(['#10B981', '#3B82F6']);
  });

  it('should format weekly comparison chart data correctly', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    const chartData = result.current?.weeklyComparisonChart;
    expect(chartData?.data).toHaveLength(1);
    expect(chartData?.keys).toEqual(['completed', 'created']);
    expect(chartData?.colors).toEqual(['#10B981', '#3B82F6']);
  });

  it('should format category breakdown chart data correctly', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    const chartData = result.current?.categoryBreakdownChart;
    expect(chartData?.data).toHaveLength(1);
    expect(chartData?.data[0]).toEqual({
      name: 'Work',
      value: 12,
      color: '#3B82F6',
      completionRate: 75
    });
  });

  it('should format progress chart data correctly', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    const chartData = result.current?.progressChart;
    expect(chartData?.data).toHaveLength(3);
    expect(chartData?.data[0]).toEqual({
      name: 'Completed',
      value: 18,
      color: '#10B981'
    });
  });

  it('should format forecast chart data correctly', () => {
    const { result } = renderHook(() => useAnalyticsCharts(mockAnalyticsData));
    
    const chartData = result.current?.forecastChart;
    expect(chartData?.data).toHaveLength(2);
    expect(chartData?.colors).toEqual(['#3B82F6', '#8B5CF6']);
  });
});

describe('useAnalyticsInsights', () => {
  const mockAnalyticsData = {
    totalTasks: 24,
    completedTasks: 18,
    pendingTasks: 4,
    overdueTasks: 2,
    completionRate: 75,
    dailyCompletions: [],
    weeklyData: [],
    categoryBreakdown: [],
    productivityScore: 85,
    streakDays: 7,
    averageTasksPerDay: 3.4,
    forecast: {
      nextWeekTasks: 20,
      nextWeekCompletionRate: 80,
      recommendations: ['Focus on high-priority tasks'],
      trendDirection: 'up' as const
    },
    monthlyData: []
  };

  it('should return empty array when analytics data is null', () => {
    const { result } = renderHook(() => useAnalyticsInsights(null));
    
    expect(result.current).toEqual([]);
  });

  it('should generate insights based on completion rate', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockAnalyticsData));
    
    const insights = result.current;
    expect(insights.length).toBeGreaterThan(0);
    
    const completionRateInsight = insights.find(insight => 
      insight.title.includes('Completion Rate') || insight.title.includes('Progress')
    );
    expect(completionRateInsight).toBeDefined();
  });

  it('should generate streak insights', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockAnalyticsData));
    
    const insights = result.current;
    const streakInsight = insights.find(insight => 
      insight.title.includes('Streak') || insight.title.includes('Momentum')
    );
    expect(streakInsight).toBeDefined();
  });

  it('should generate overdue task insights', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockAnalyticsData));
    
    const insights = result.current;
    const overdueInsight = insights.find(insight => 
      insight.title.includes('Overdue')
    );
    expect(overdueInsight).toBeDefined();
  });

  it('should generate productivity score insights', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockAnalyticsData));
    
    const insights = result.current;
    const productivityInsight = insights.find(insight => 
      insight.title.includes('Productivity')
    );
    expect(productivityInsight).toBeDefined();
  });

  it('should generate trend insights', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockAnalyticsData));
    
    const insights = result.current;
    const trendInsight = insights.find(insight => 
      insight.title.includes('Trend')
    );
    expect(trendInsight).toBeDefined();
  });

  it('should handle high completion rate insights', () => {
    const highCompletionData = {
      ...mockAnalyticsData,
      completionRate: 90
    };
    
    const { result } = renderHook(() => useAnalyticsInsights(highCompletionData));
    
    const insights = result.current;
    const highCompletionInsight = insights.find(insight => 
      insight.title.includes('Excellent') || insight.title.includes('Great')
    );
    expect(highCompletionInsight).toBeDefined();
  });

  it('should handle low completion rate insights', () => {
    const lowCompletionData = {
      ...mockAnalyticsData,
      completionRate: 40
    };
    
    const { result } = renderHook(() => useAnalyticsInsights(lowCompletionData));
    
    const insights = result.current;
    const lowCompletionInsight = insights.find(insight => 
      insight.title.includes('Improvement') || insight.title.includes('Room')
    );
    expect(lowCompletionInsight).toBeDefined();
  });

  it('should handle declining trend insights', () => {
    const decliningData = {
      ...mockAnalyticsData,
      forecast: {
        ...mockAnalyticsData.forecast,
        trendDirection: 'down' as const
      }
    };
    
    const { result } = renderHook(() => useAnalyticsInsights(decliningData));
    
    const insights = result.current;
    const decliningInsight = insights.find(insight => 
      insight.title.includes('Declining') || insight.title.includes('Review')
    );
    expect(decliningInsight).toBeDefined();
  });
}); 