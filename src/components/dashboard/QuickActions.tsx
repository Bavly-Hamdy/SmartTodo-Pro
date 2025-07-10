import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOverdueTasks, useTodayTasks } from '../../hooks/useTasks';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { overdueTasks, isLoading: isLoadingOverdue } = useOverdueTasks();
  const { todayTasks, isLoading: isLoadingToday } = useTodayTasks();

  const actions = [
    {
      title: 'Add New Task',
      description: 'Create a new task',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => navigate('/tasks/new'),
    },
    {
      title: 'Today\'s Agenda',
      description: `${todayTasks.length} tasks due today`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/tasks?filter=today'),
      loading: isLoadingToday,
    },
    {
      title: 'Overdue Tasks',
      description: `${overdueTasks.length} tasks overdue`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-red-600 hover:bg-red-700',
      action: () => navigate('/tasks?filter=overdue'),
      loading: isLoadingOverdue,
    },
    {
      title: 'View All Tasks',
      description: 'See all your tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => navigate('/tasks'),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={action.action}
            disabled={action.loading}
            className={`w-full flex items-center justify-center px-4 py-3 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
          >
            <div className="flex items-center space-x-3">
              {action.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                action.icon
              )}
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 