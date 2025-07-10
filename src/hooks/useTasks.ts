import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  subscribeToTasks, 
  searchTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskStats,
  getOverdueTasks,
  getTodayTasks,
  Task,
  TaskStats,
  CreateTaskData
} from '../services/tasksService';

export const useTasks = () => {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to all tasks
  useEffect(() => {
    if (!currentUser?.uid) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe: Unsubscribe = subscribeToTasks(
      currentUser.uid,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoading(false);
      },
      { orderBy: 'createdAt' }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Create a new task
  const addTask = useCallback(async (taskData: CreateTaskData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      const taskId = await createTask(currentUser.uid, taskData);
      sendNotification('Task created successfully!', 'success');
      return taskId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      setError(errorMessage);
      sendNotification(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, sendNotification]);

  // Update a task
  const editTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      await updateTask(currentUser.uid, taskId, updates);
      sendNotification('Task updated successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setError(errorMessage);
      sendNotification(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, sendNotification]);

  // Delete a task
  const removeTask = useCallback(async (taskId: string) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      await deleteTask(currentUser.uid, taskId);
      sendNotification('Task deleted successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      setError(errorMessage);
      sendNotification(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, sendNotification]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await editTask(taskId, { status: newStatus as 'pending' | 'completed' });
  }, [editTask]);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    editTask,
    removeTask,
    toggleTaskCompletion,
  };
};

export const useTaskSearch = (searchTerm: string) => {
  const { currentUser } = useAuth();
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const unsubscribe: Unsubscribe = searchTasks(currentUser.uid, searchTerm, (results) => {
      setSearchResults(results);
      setIsSearching(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, searchTerm]);

  return {
    searchResults,
    isSearching,
  };
};

export const useTaskStats = () => {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    weeklyProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setStats({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        weeklyProgress: 0,
      });
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const taskStats = await getTaskStats(currentUser.uid);
        setStats(taskStats);
      } catch (error) {
        console.error('Error fetching task stats:', error);
        sendNotification('Failed to load task statistics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentUser?.uid, sendNotification]);

  return {
    stats,
    isLoading,
  };
};

export const useOverdueTasks = () => {
  const { currentUser } = useAuth();
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setOverdueTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe: Unsubscribe = getOverdueTasks(currentUser.uid, (tasks) => {
      setOverdueTasks(tasks);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  return {
    overdueTasks,
    isLoading,
  };
};

export const useTodayTasks = () => {
  const { currentUser } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setTodayTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe: Unsubscribe = getTodayTasks(currentUser.uid, (tasks) => {
      setTodayTasks(tasks);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  return {
    todayTasks,
    isLoading,
  };
};

// Default export for webpack compatibility
export default {
  useTasks,
  useTaskSearch,
  useTaskStats,
  useOverdueTasks,
  useTodayTasks,
}; 