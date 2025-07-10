import React from 'react';
import { motion } from 'framer-motion';

interface AnalyticsSkeletonProps {
  cardCount?: number;
  className?: string;
}

export const AnalyticsSkeleton: React.FC<AnalyticsSkeletonProps> = ({ 
  cardCount = 4, 
  className = '' 
}) => {
  const cards = Array.from({ length: cardCount }, (_, index) => index);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
        </motion.div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 1 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>

      {/* Additional Content Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsSkeleton; 