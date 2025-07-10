import { useMemo } from 'react';
import { AnalyticsData } from '../services/analyticsService';

interface Insight {
  type: 'positive' | 'neutral' | 'warning';
  title: string;
  message: string;
  icon: string;
}

export const useAnalyticsInsights = (analyticsData: AnalyticsData | null): Insight[] => {
  return useMemo(() => {
    if (!analyticsData) return [];
    const insightsList: Insight[] = [];

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
}; 