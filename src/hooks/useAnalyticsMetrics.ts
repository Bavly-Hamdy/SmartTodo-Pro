import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  subscribeToAnalyticsMetrics, 
  getAnalyticsMetricsForPeriod,
  AnalyticsMetrics,
  getPeriodRanges
} from '../services/analyticsMetricsService';

export interface UseAnalyticsMetricsOptions {
  periodLength?: number; // Number of days for the period (default: 7)
  autoRefresh?: boolean; // Whether to auto-refresh data (default: true)
  refreshInterval?: number; // Refresh interval in milliseconds (default: 30000)
}

export const useAnalyticsMetrics = (options: UseAnalyticsMetricsOptions = {}) => {
  const {
    periodLength = 7,
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  const { currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
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

  // Subscribe to real-time analytics metrics
  useEffect(() => {
    if (!currentUser?.uid) {
      setMetrics(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setMetrics(prev => ({ ...prev, isLoading: true, error: null }));

    const unsubscribe: Unsubscribe = subscribeToAnalyticsMetrics(
      currentUser.uid,
      periodLength,
      (newMetrics) => {
        setMetrics(newMetrics);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, periodLength]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !currentUser?.uid) return;

    const interval = setInterval(() => {
      if (currentUser?.uid) {
        getAnalyticsMetricsForPeriod(currentUser.uid, periodLength)
          .then(setMetrics)
          .catch((error) => {
            console.error('Error refreshing analytics metrics:', error);
            sendNotification('Failed to refresh analytics data', 'error');
          });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [currentUser?.uid, periodLength, autoRefresh, refreshInterval, sendNotification]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));
      const newMetrics = await getAnalyticsMetricsForPeriod(currentUser.uid, periodLength);
      setMetrics(newMetrics);
      sendNotification('Analytics data refreshed', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh analytics data';
      setMetrics(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      sendNotification(errorMessage, 'error');
    }
  }, [currentUser?.uid, periodLength, sendNotification]);

  // Get period information
  const periodInfo = getPeriodRanges(periodLength);

  // Helper functions for UI
  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-600 dark:text-green-400';
    if (delta < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return '↗';
    if (delta < 0) return '↘';
    return '→';
  };

  const formatDelta = (delta: number) => {
    if (delta > 0) return `+${delta}%`;
    if (delta < 0) return `${delta}%`;
    return '0%';
  };

  return {
    // Metrics data
    metrics,
    
    // Period information
    periodInfo,
    periodLength,
    
    // Helper functions
    getDeltaColor,
    getDeltaIcon,
    formatDelta,
    
    // Actions
    refresh,
    
    // Loading and error states
    isLoading: metrics.isLoading,
    error: metrics.error,
    
    // Computed values for easy access
    currentMetrics: {
      totalTasks: metrics.totalTasks,
      completedTasks: metrics.completedTasks,
      completionRate: metrics.completionRate,
      overdueTasks: metrics.overdueTasks
    },
    previousMetrics: {
      totalTasks: metrics.previousTotalTasks,
      completedTasks: metrics.previousCompletedTasks,
      completionRate: metrics.previousCompletionRate,
      overdueTasks: metrics.previousOverdueTasks
    },
    deltas: metrics.deltas
  };
}; 