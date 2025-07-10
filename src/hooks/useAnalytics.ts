import { useState, useEffect, useCallback, useMemo } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  subscribeToAnalytics, 
  getAnalyticsForPeriod,
  AnalyticsData, 
  AnalyticsFilters,
  getAnalyticsData
} from '../services/analyticsService';

export const useAnalytics = (filters: AnalyticsFilters = { timeRange: '30d' }) => {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to analytics data
  useEffect(() => {
    if (!currentUser?.uid) {
      setAnalyticsData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe: Unsubscribe = subscribeToAnalytics(
      currentUser.uid,
      filters,
      (data) => {
        setAnalyticsData(data);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, filters]);

  // Get analytics for a specific period
  const getAnalyticsForPeriod = useCallback(async (startDate: Date, endDate: Date): Promise<AnalyticsData> => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      // Use the getAnalyticsData function with filters instead of getAnalyticsForPeriod
      return new Promise((resolve, reject) => {
        getAnalyticsData(currentUser.uid, { timeRange: '30d' }, (data) => {
          setAnalyticsData(data);
          resolve(data);
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      sendNotification(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, sendNotification]);

  // Memoized computed values
  const computedData = useMemo(() => {
    if (!analyticsData) return null;

    return {
      // KPI calculations
      totalTasks: analyticsData.totalTasks,
      completedTasks: analyticsData.completedTasks,
      pendingTasks: analyticsData.pendingTasks,
      overdueTasks: analyticsData.overdueTasks,
      completionRate: analyticsData.completionRate,
      
      // Productivity metrics
      productivityScore: analyticsData.productivityScore,
      streakDays: analyticsData.streakDays,
      averageTasksPerDay: analyticsData.averageTasksPerDay,
      
      // Chart data
      dailyCompletions: analyticsData.dailyCompletions,
      weeklyData: analyticsData.weeklyData,
      categoryBreakdown: analyticsData.categoryBreakdown,
      monthlyData: analyticsData.monthlyData, // <-- add this line
      
      // Forecast
      forecast: analyticsData.forecast,
      
      // Additional computed metrics
      efficiencyRatio: analyticsData.totalTasks > 0 
        ? Math.round((analyticsData.completedTasks / analyticsData.totalTasks) * 100) 
        : 0,
      
      overdueRate: analyticsData.totalTasks > 0 
        ? Math.round((analyticsData.overdueTasks / analyticsData.totalTasks) * 100) 
        : 0,
      
      trendAnalysis: {
        isImproving: analyticsData.forecast.trendDirection === 'up',
        isDeclining: analyticsData.forecast.trendDirection === 'down',
        isStable: analyticsData.forecast.trendDirection === 'stable'
      }
    };
  }, [analyticsData]);

  return {
    analyticsData: computedData,
    isLoading,
    error,
    getAnalyticsForPeriod,
    refetch: () => {
      if (currentUser?.uid) {
        setIsLoading(true);
        setError(null);
      }
    }
  };
};

export const useAnalyticsFilters = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '30d'
  });

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ timeRange: '30d' });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters
  };
};

export const useAnalyticsCharts = (analyticsData: AnalyticsData | null) => {
  const chartData = useMemo(() => {
    if (!analyticsData) return null;

    return {
      // Line chart data for daily completions
      dailyCompletionsChart: {
        data: analyticsData.dailyCompletions.map(day => ({
          date: day.date,
          completed: day.completed,
          created: day.created,
          productivity: day.productivityScore
        })),
        keys: ['completed', 'created'],
        colors: ['#10B981', '#3B82F6']
      },

      // Bar chart data for weekly comparison
      weeklyComparisonChart: {
        data: analyticsData.weeklyData.map(week => ({
          week: week.week,
          completed: week.tasksCompleted,
          created: week.tasksCreated,
          productivity: week.productivityScore
        })),
        keys: ['completed', 'created'],
        colors: ['#10B981', '#3B82F6']
      },

      // Pie chart data for category breakdown
      categoryBreakdownChart: {
        data: analyticsData.categoryBreakdown.map(category => ({
          name: category.category,
          value: category.count,
          color: category.color,
          completionRate: category.completionRate
        }))
      },

      // Progress chart data
      progressChart: {
        data: [
          { name: 'Completed', value: analyticsData.completedTasks, color: '#10B981' },
          { name: 'Pending', value: analyticsData.pendingTasks, color: '#F59E0B' },
          { name: 'Overdue', value: analyticsData.overdueTasks, color: '#EF4444' }
        ]
      },

      // Forecast chart data
      forecastChart: {
        data: [
          { name: 'Current Week', value: analyticsData.completedTasks },
          { name: 'Next Week (Forecast)', value: analyticsData.forecast.nextWeekTasks }
        ],
        colors: ['#3B82F6', '#8B5CF6']
      }
    };
  }, [analyticsData]);

  return chartData;
};

export const useAnalyticsInsights = (analyticsData: AnalyticsData | null) => {
  const insights = useMemo(() => {
    if (!analyticsData) return [];

    const insightsList = [];

    // Completion rate insights
    if (analyticsData.completionRate >= 80) {
      insightsList.push({
        type: 'positive',
        title: 'Excellent Completion Rate',
        message: `You're completing ${analyticsData.completionRate}% of your tasks. Keep up the great work!`,
        icon: '🎯'
      });
    } else if (analyticsData.completionRate >= 60) {
      insightsList.push({
        type: 'neutral',
        title: 'Good Progress',
        message: `You're completing ${analyticsData.completionRate}% of your tasks. Consider focusing on high-priority items first.`,
        icon: '📈'
      });
    } else {
      insightsList.push({
        type: 'warning',
        title: 'Room for Improvement',
        message: `You're completing ${analyticsData.completionRate}% of your tasks. Try breaking down larger tasks into smaller ones.`,
        icon: '💡'
      });
    }

    // Streak insights
    if (analyticsData.streakDays >= 7) {
      insightsList.push({
        type: 'positive',
        title: 'Amazing Streak!',
        message: `You've been productive for ${analyticsData.streakDays} consecutive days. Don't break the chain!`,
        icon: '🔥'
      });
    } else if (analyticsData.streakDays >= 3) {
      insightsList.push({
        type: 'neutral',
        title: 'Building Momentum',
        message: `You're on a ${analyticsData.streakDays}-day streak. Keep it going!`,
        icon: '⚡'
      });
    }

    // Overdue tasks insights
    if (analyticsData.overdueTasks > 0) {
      insightsList.push({
        type: 'warning',
        title: 'Overdue Tasks',
        message: `You have ${analyticsData.overdueTasks} overdue tasks. Consider rescheduling or delegating them.`,
        icon: '⏰'
      });
    }

    // Productivity score insights
    if (analyticsData.productivityScore >= 85) {
      insightsList.push({
        type: 'positive',
        title: 'High Productivity',
        message: `Your productivity score is ${analyticsData.productivityScore}. You're performing exceptionally well!`,
        icon: '🚀'
      });
    }

    // Forecast insights
    if (analyticsData.forecast.trendDirection === 'up') {
      insightsList.push({
        type: 'positive',
        title: 'Improving Trend',
        message: 'Your productivity is trending upward. Great job!',
        icon: '📊'
      });
    } else if (analyticsData.forecast.trendDirection === 'down') {
      insightsList.push({
        type: 'warning',
        title: 'Declining Trend',
        message: 'Your productivity is declining. Consider reviewing your workflow.',
        icon: '📉'
      });
    }

    return insightsList;
  }, [analyticsData]);

  return insights;
}; 