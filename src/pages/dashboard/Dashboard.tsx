import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTaskStats, useTasks } from '../../hooks/useTasks';
import { Task } from '../../services/tasksService';
import SearchBar from '../../components/dashboard/SearchBar';
import AccountMenu from '../../components/dashboard/AccountMenu';
import QuickActions from '../../components/dashboard/QuickActions';
import TaskForm from '../../components/tasks/TaskForm';
import { format, isToday, isTomorrow } from 'date-fns';
import { StatCard, ProgressRing, BarChart } from '../../components/ui/DataVisualization';
import { FadeIn, SlideUp, ScaleIn } from '../../components/ui/AnimatedContainer';
import { CardSkeleton } from '../../components/ui/LoadingStates';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useTaskStats();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  // Memoized greeting function
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Memoized color functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const formatDueDate = useCallback((date?: Date) => {
    if (!date) return null;
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  }, []);

  // Memoized event handlers
  const handleTaskSelect = useCallback((task: Task) => {
    navigate(`/tasks/${task.id}`);
  }, [navigate]);

  const handleViewAllTasks = useCallback(() => {
    navigate('/tasks');
  }, [navigate]);

  const handleTaskFormClose = useCallback(() => {
    setIsTaskFormOpen(false);
  }, []);

  // Memoized computed values
  const recentTasks = useMemo(() => tasks.slice(0, 4), [tasks]);

  const taskStatusData = useMemo(() => [
    { label: 'Completed', value: stats.completedTasks, color: '#10b981' },
    { label: 'In Progress', value: stats.totalTasks - stats.completedTasks - stats.pendingTasks, color: '#3b82f6' },
    { label: 'Pending', value: stats.pendingTasks, color: '#f59e0b' },
  ], [stats.completedTasks, stats.totalTasks, stats.pendingTasks]);

  const weeklyData = useMemo(() => [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 6 },
    { label: 'Thu', value: 15 },
    { label: 'Fri', value: 10 },
    { label: 'Sat', value: 4 },
    { label: 'Sun', value: 7 },
  ], []);

  // Memoized loading state
  const isLoading = useMemo(() => statsLoading || tasksLoading, [statsLoading, tasksLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Account Menu */}
      <FadeIn className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar onTaskSelect={handleTaskSelect} />
        </div>
        <AccountMenu />
      </FadeIn>

      {/* Welcome Section */}
      <SlideUp className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {userProfile?.displayName || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          You have {stats.pendingTasks} tasks pending and {stats.overdueTasks} overdue.
          Let's make today productive!
        </p>
      </SlideUp>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScaleIn delay={0.1}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            color="primary"
          />
        </ScaleIn>

        <ScaleIn delay={0.2}>
          <StatCard
            title="Completed"
            value={stats.completedTasks}
            change={stats.completionRate}
            changeType="increase"
            icon={
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            color="success"
          />
        </ScaleIn>

        <ScaleIn delay={0.3}>
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="info"
          />
        </ScaleIn>

        <ScaleIn delay={0.4}>
          <StatCard
            title="Weekly Progress"
            value={`${stats.weeklyProgress}%`}
            icon={
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="warning"
          />
        </ScaleIn>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <SlideUp delay={0.2} className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Tasks</h2>
              <button 
                onClick={handleViewAllTasks}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus-ring"
              >
                View all
              </button>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-ring"
                >
                  Create your first task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={(e) => {
                          e.stopPropagation();
                          // Handle task completion toggle
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus-ring"
                      />
                      <div>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SlideUp>

        {/* Quick Actions and Progress */}
        <div className="space-y-6">
          <SlideUp delay={0.3}>
            <QuickActions />
          </SlideUp>

          <SlideUp delay={0.4}>
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Task Progress</h3>
              <div className="flex justify-center mb-4">
                <ProgressRing
                  progress={stats.completionRate}
                  size={120}
                  showLabel
                  color="primary"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.completedTasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.totalTasks - stats.completedTasks}</span>
                </div>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.5}>
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
              <BarChart data={weeklyData} height={150} />
            </div>
          </SlideUp>
        </div>
      </div>

      {/* Task Form Modal */}
      {isTaskFormOpen && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={handleTaskFormClose}
        />
      )}
    </div>
  );
};

export default React.memo(Dashboard); 