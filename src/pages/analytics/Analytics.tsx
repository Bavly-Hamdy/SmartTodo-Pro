import React from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsMetrics } from '../../hooks/useAnalyticsMetrics';
import { useAnalytics, useAnalyticsFilters, useAnalyticsCharts, useAnalyticsInsights } from '../../hooks/useAnalytics';
import { 
  DailyCompletionChart, 
  WeeklyComparisonChart, 
  CategoryBreakdownChart, 
  ProgressChart, 
  ForecastChart,
  KPICard,
  InsightCard
} from '../../components/analytics/AnalyticsCharts';
import { AnalyticsSkeleton } from '../../components/analytics/AnalyticsSkeleton';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Analytics: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useAnalyticsFilters();
  
  // Use the new real-time analytics metrics
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
    getDeltaColor,
    getDeltaIcon,
    formatDelta,
    refresh,
    periodLength
  } = useAnalyticsMetrics({
    periodLength: filters.timeRange === '7d' ? 7 : 
                  filters.timeRange === '30d' ? 30 : 
                  filters.timeRange === '90d' ? 90 : 365,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Legacy analytics for charts (will be updated later)
  const { analyticsData, isLoading: chartsLoading, error: chartsError } = useAnalytics(filters);
  const chartData = useAnalyticsCharts(analyticsData);
  const insights = useAnalyticsInsights(analyticsData);

  const handleTimeRangeChange = (timeRange: '7d' | '30d' | '90d' | '1y') => {
    updateFilters({ timeRange });
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Show skeleton while loading
  if (metricsLoading) {
    return <AnalyticsSkeleton />;
  }

  // Show error state
  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{metricsError}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your productivity and performance insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <select
            value={filters.timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value as any)}
            className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Reset
          </button>
          <button
            onClick={refresh}
            disabled={metricsLoading}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {metricsLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Key Metrics with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KPICard
            title="Total Tasks"
            value={metrics.totalTasks}
            change={metrics.deltas.totalTasks}
            changeLabel="from last period"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            color="#3B82F6"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <KPICard
            title="Completed Tasks"
            value={metrics.completedTasks}
            change={metrics.deltas.completedTasks}
            changeLabel="from last period"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="#10B981"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <KPICard
            title="Completion Rate"
            value={`${metrics.completionRate}%`}
            change={metrics.deltas.completionRate}
            changeLabel="from last period"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="#8B5CF6"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <KPICard
            title="Overdue Tasks"
            value={metrics.overdueTasks}
            change={metrics.deltas.overdueTasks}
            changeLabel="from last period"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="#EF4444"
          />
        </motion.div>
      </div>

      {/* Period Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Period Comparison
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Current: Last {periodLength} days | Previous: {periodLength} days before
            </p>
          </div>
          <div className="text-right text-xs text-blue-700 dark:text-blue-300">
            <div>Real-time updates enabled</div>
            <div>Auto-refresh every 30s</div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section (using legacy data for now) */}
      {!chartsLoading && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartData?.dailyCompletionsChart && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <DailyCompletionChart
                data={chartData.dailyCompletionsChart.data}
                title="Daily Task Activity"
                height={300}
              />
            </motion.div>
          )}

          {chartData?.weeklyComparisonChart && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <WeeklyComparisonChart
                data={chartData.weeklyComparisonChart.data}
                title="Weekly Comparison"
                height={300}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      {chartData?.categoryBreakdownChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <CategoryBreakdownChart
            data={chartData.categoryBreakdownChart.data}
            title="Task Categories"
            height={300}
          />
        </motion.div>
      )}

      {/* Progress and Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData?.progressChart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <ProgressChart
              data={chartData.progressChart.data}
              title="Task Progress Overview"
              height={200}
            />
          </motion.div>
        )}

        {chartData?.forecastChart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <ForecastChart
              data={chartData.forecastChart.data}
              colors={chartData.forecastChart.colors}
              title="Next Week Forecast"
              height={200}
            />
          </motion.div>
        )}
      </div>

      {/* Productivity Score Card */}
      {analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Productivity Score
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Based on your task completion patterns
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getProductivityColor(analyticsData.productivityScore)}`}>
                {analyticsData.productivityScore}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">out of 100</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  analyticsData.productivityScore >= 80 ? 'bg-green-500' :
                  analyticsData.productivityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${analyticsData.productivityScore}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              type={insight.type as 'positive' | 'neutral' | 'warning'}
              title={insight.title}
              message={insight.message}
              icon={insight.icon}
            />
          ))}
        </motion.div>
      )}

      {/* Recommendations */}
      {analyticsData?.forecast?.recommendations && analyticsData.forecast.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
        >
          <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analyticsData.forecast.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-purple-800 dark:text-purple-200">
                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics; 