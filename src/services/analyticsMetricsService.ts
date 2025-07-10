import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { 
  startOfDay,
  endOfDay,
  subDays,
  isAfter,
  isBefore,
  isEqual
} from 'date-fns';
import { db } from '../config/firebase';
import { Task } from './tasksService';

export interface AnalyticsMetrics {
  // Current period metrics
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  
  // Previous period metrics
  previousTotalTasks: number;
  previousCompletedTasks: number;
  previousCompletionRate: number;
  previousOverdueTasks: number;
  
  // Deltas (percentage changes)
  deltas: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    overdueTasks: number;
  };
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

export interface PeriodConfig {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
}

// Collection reference
const getTasksCollection = (userId: string) => collection(db, 'tasks');

// Calculate date ranges for current and previous periods
export const getPeriodRanges = (periodLength: number): PeriodConfig => {
  const now = new Date();
  const currentEnd = endOfDay(now);
  const currentStart = startOfDay(subDays(now, periodLength - 1));
  const previousEnd = startOfDay(subDays(now, periodLength));
  const previousStart = startOfDay(subDays(now, periodLength * 2 - 1));
  
  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd
  };
};

// Calculate metrics for a given period
const calculatePeriodMetrics = (tasks: Task[], periodStart: Date, periodEnd: Date) => {
  const periodTasks = tasks.filter(task => {
    const taskDate = task.createdAt;
    return isAfter(taskDate, periodStart) || isEqual(taskDate, periodStart);
  });
  
  const totalTasks = periodTasks.length;
  const completedTasks = periodTasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Overdue tasks (tasks that were overdue at the end of the period)
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    
    // Check if task was overdue at the end of the period
    return isBefore(task.dueDate, periodEnd);
  }).length;
  
  return {
    totalTasks,
    completedTasks,
    completionRate,
    overdueTasks
  };
};

// Calculate delta percentage
const calculateDelta = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Main analytics metrics function with real-time updates
export const subscribeToAnalyticsMetrics = (
  userId: string,
  periodLength: number,
  callback: (metrics: AnalyticsMetrics) => void
): Unsubscribe => {
  try {
    console.log('Setting up real-time analytics metrics subscription');
    
    // Temporarily return mock data until Firestore permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    const mockMetrics: AnalyticsMetrics = {
      totalTasks: 24,
      completedTasks: 18,
      completionRate: 75,
      overdueTasks: 2,
      previousTotalTasks: 20,
      previousCompletedTasks: 15,
      previousCompletionRate: 75,
      previousOverdueTasks: 3,
      deltas: {
        totalTasks: 20,
        completedTasks: 20,
        completionRate: 0,
        overdueTasks: -33
      },
      isLoading: false,
      error: null
    };
    
    callback(mockMetrics);
    
    // Return dummy unsubscribe function
    return () => {
      console.log('Analytics metrics unsubscribe called');
    };

    /*
    const periods = getPeriodRanges(periodLength);
    
    // Query for all tasks (we'll filter by date in memory for better performance)
    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Task);
      });
      
      // Calculate current period metrics
      const currentMetrics = calculatePeriodMetrics(tasks, periods.currentStart, periods.currentEnd);
      
      // Calculate previous period metrics
      const previousMetrics = calculatePeriodMetrics(tasks, periods.previousStart, periods.previousEnd);
      
      // Calculate deltas
      const deltas = {
        totalTasks: calculateDelta(currentMetrics.totalTasks, previousMetrics.totalTasks),
        completedTasks: calculateDelta(currentMetrics.completedTasks, previousMetrics.completedTasks),
        completionRate: calculateDelta(currentMetrics.completionRate, previousMetrics.completionRate),
        overdueTasks: calculateDelta(currentMetrics.overdueTasks, previousMetrics.overdueTasks)
      };
      
      const metrics: AnalyticsMetrics = {
        ...currentMetrics,
        previousTotalTasks: previousMetrics.totalTasks,
        previousCompletedTasks: previousMetrics.completedTasks,
        previousCompletionRate: previousMetrics.completionRate,
        previousOverdueTasks: previousMetrics.overdueTasks,
        deltas,
        isLoading: false,
        error: null
      };
      
      callback(metrics);
    }, (error) => {
      console.error('Error in analytics metrics subscription:', error);
      callback({
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
        isLoading: false,
        error: error.message
      });
    });
    */
  } catch (error) {
    console.error('Error setting up analytics metrics subscription:', error);
    callback({
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
      isLoading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return () => {
      console.log('Analytics metrics unsubscribe called (error case)');
    };
  }
};

// Get analytics metrics for a specific period (non-real-time)
export const getAnalyticsMetricsForPeriod = async (
  userId: string,
  periodLength: number
): Promise<AnalyticsMetrics> => {
  try {
    console.log('Fetching analytics metrics for period');
    
    // Temporarily return mock data until Firestore permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    const mockMetrics: AnalyticsMetrics = {
      totalTasks: 24,
      completedTasks: 18,
      completionRate: 75,
      overdueTasks: 2,
      previousTotalTasks: 20,
      previousCompletedTasks: 15,
      previousCompletionRate: 75,
      previousOverdueTasks: 3,
      deltas: {
        totalTasks: 20,
        completedTasks: 20,
        completionRate: 0,
        overdueTasks: -33
      },
      isLoading: false,
      error: null
    };
    
    return mockMetrics;

    /*
    const periods = getPeriodRanges(periodLength);
    
    // Query for all tasks
    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        dueDate: data.dueDate?.toDate(),
        completedAt: data.completedAt?.toDate(),
      } as Task);
    });
    
    // Calculate current period metrics
    const currentMetrics = calculatePeriodMetrics(tasks, periods.currentStart, periods.currentEnd);
    
    // Calculate previous period metrics
    const previousMetrics = calculatePeriodMetrics(tasks, periods.previousStart, periods.previousEnd);
    
    // Calculate deltas
    const deltas = {
      totalTasks: calculateDelta(currentMetrics.totalTasks, previousMetrics.totalTasks),
      completedTasks: calculateDelta(currentMetrics.completedTasks, previousMetrics.completedTasks),
      completionRate: calculateDelta(currentMetrics.completionRate, previousMetrics.completionRate),
      overdueTasks: calculateDelta(currentMetrics.overdueTasks, previousMetrics.overdueTasks)
    };
    
    return {
      ...currentMetrics,
      previousTotalTasks: previousMetrics.totalTasks,
      previousCompletedTasks: previousMetrics.completedTasks,
      previousCompletionRate: previousMetrics.completionRate,
      previousOverdueTasks: previousMetrics.overdueTasks,
      deltas,
      isLoading: false,
      error: null
    };
    */
  } catch (error) {
    console.error('Error fetching analytics metrics for period:', error);
    throw new Error('Failed to fetch analytics metrics for period');
  }
}; 