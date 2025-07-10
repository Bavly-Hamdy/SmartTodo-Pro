import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { 
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from 'date-fns';
import { db } from '../config/firebase';
import { Task } from './tasksService';

export interface AnalyticsData {
  // KPI Counters
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  
  // Time-based data
  dailyCompletions: DailyCompletion[];
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
  
  // Category breakdown
  categoryBreakdown: CategoryData[];
  
  // Productivity metrics
  productivityScore: number;
  streakDays: number;
  averageTasksPerDay: number;
  
  // Forecast data
  forecast: ForecastData;
}

export interface DailyCompletion {
  date: string;
  completed: number;
  created: number;
  productivityScore: number;
}

export interface WeeklyData {
  week: string;
  tasksCompleted: number;
  tasksCreated: number;
  productivityScore: number;
  averageDailyTasks: number;
}

export interface MonthlyData {
  month: string;
  tasksCompleted: number;
  tasksCreated: number;
  productivityScore: number;
  totalHours: number;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  color: string;
  completedCount: number;
  completionRate: number;
}

export interface ForecastData {
  nextWeekTasks: number;
  nextWeekCompletionRate: number;
  recommendations: string[];
  trendDirection: 'up' | 'down' | 'stable';
}

export interface AnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  category?: string;
  status?: 'pending' | 'in-progress' | 'completed';
}

// Collection reference
const getTasksCollection = (userId: string) => collection(db, 'tasks');

// Get date range based on filter
const getDateRange = (timeRange: string) => {
  const now = new Date();
  
  switch (timeRange) {
    case '7d':
      return {
        start: startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
        end: endOfDay(now)
      };
    case '30d':
      return {
        start: startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        end: endOfDay(now)
      };
    case '90d':
      return {
        start: startOfDay(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)),
        end: endOfDay(now)
      };
    case '1y':
      return {
        start: startOfDay(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)),
        end: endOfDay(now)
      };
    default:
      return {
        start: startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
        end: endOfDay(now)
      };
  }
};

// Calculate productivity score
const calculateProductivityScore = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Calculate streak days
const calculateStreakDays = (tasks: Task[]): number => {
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const completionDates = completedTasks
    .map(task => task.completedAt)
    .filter(date => date)
    .map(date => startOfDay(date!).toISOString().split('T')[0])
    .sort()
    .reverse();

  if (completionDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  let currentDate = startOfDay(today);

  for (let i = 0; i < 365; i++) {
    const dateString = currentDate.toISOString().split('T')[0];
    if (completionDates.includes(dateString)) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
};

// Generate category colors
const getCategoryColor = (category: string): string => {
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  
  const index = category.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get daily completion data
const getDailyCompletions = (tasks: Task[], timeRange: string): DailyCompletion[] => {
  const { start, end } = getDateRange(timeRange);
  const days: DailyCompletion[] = [];
  
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayTasks = tasks.filter(task => {
      const taskDate = task.createdAt.toISOString().split('T')[0];
      return taskDate === dateString;
    });
    
    const completed = dayTasks.filter(task => task.status === 'completed').length;
    const created = dayTasks.length;
    const productivityScore = calculateProductivityScore(completed, created);
    
    days.push({
      date: dateString,
      completed,
      created,
      productivityScore
    });
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return days;
};

// Get weekly data
const getWeeklyData = (tasks: Task[], timeRange: string): WeeklyData[] => {
  const { start, end } = getDateRange(timeRange);
  const weeks: WeeklyData[] = [];
  
  let currentWeek = startOfWeek(start);
  
  while (currentWeek <= end) {
    const weekEnd = endOfWeek(currentWeek);
    const weekTasks = tasks.filter(task => {
      const taskDate = task.createdAt;
      return taskDate >= currentWeek && taskDate <= weekEnd;
    });
    
    const completed = weekTasks.filter(task => task.status === 'completed').length;
    const created = weekTasks.length;
    const productivityScore = calculateProductivityScore(completed, created);
    const averageDailyTasks = created / 7;
    
    weeks.push({
      week: currentWeek.toISOString().split('T')[0],
      tasksCompleted: completed,
      tasksCreated: created,
      productivityScore,
      averageDailyTasks: Math.round(averageDailyTasks * 10) / 10
    });
    
    currentWeek = new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  return weeks;
};

// Get category breakdown
const getCategoryBreakdown = (tasks: Task[]): CategoryData[] => {
  const categoryMap = new Map<string, { total: number; completed: number }>();
  
  tasks.forEach(task => {
    const category = task.category || 'Uncategorized';
    const current = categoryMap.get(category) || { total: 0, completed: 0 };
    
    current.total++;
    if (task.status === 'completed') {
      current.completed++;
    }
    
    categoryMap.set(category, current);
  });
  
  const totalTasks = tasks.length;
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.total,
    percentage: totalTasks > 0 ? Math.round((data.total / totalTasks) * 100) : 0,
    color: getCategoryColor(category),
    completedCount: data.completed,
    completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
  })).sort((a, b) => b.count - a.count);
};

// Generate forecast data
const generateForecast = (tasks: Task[]): ForecastData => {
  const recentTasks = tasks.filter(task => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return task.createdAt >= thirtyDaysAgo;
  });
  
  const averageTasksPerWeek = recentTasks.length / 4;
  const averageCompletionRate = recentTasks.length > 0 
    ? (recentTasks.filter(t => t.status === 'completed').length / recentTasks.length) * 100
    : 0;
  
  const nextWeekTasks = Math.round(averageTasksPerWeek);
  const nextWeekCompletionRate = Math.round(averageCompletionRate);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageCompletionRate < 70) {
    recommendations.push('Focus on completing high-priority tasks first');
  }
  
  if (averageTasksPerWeek > 20) {
    recommendations.push('Consider reducing your task load to improve quality');
  }
  
  if (averageTasksPerWeek < 5) {
    recommendations.push('You can take on more tasks to increase productivity');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep maintaining your current productivity level');
  }
  
  // Determine trend direction
  const olderTasks = tasks.filter(task => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return task.createdAt >= sixtyDaysAgo && task.createdAt < thirtyDaysAgo;
  });
  
  const olderCompletionRate = olderTasks.length > 0 
    ? (olderTasks.filter(t => t.status === 'completed').length / olderTasks.length) * 100
    : 0;
  
  let trendDirection: 'up' | 'down' | 'stable' = 'stable';
  if (averageCompletionRate > olderCompletionRate + 5) {
    trendDirection = 'up';
  } else if (averageCompletionRate < olderCompletionRate - 5) {
    trendDirection = 'down';
  }
  
  return {
    nextWeekTasks,
    nextWeekCompletionRate,
    recommendations,
    trendDirection
  };
};

// Main analytics function
export const getAnalyticsData = (
  userId: string,
  filters: AnalyticsFilters,
  callback: (data: AnalyticsData) => void
) => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore analytics operations temporarily disabled - returning mock data');
    
    // Return mock data for now
    const mockData: AnalyticsData = {
      totalTasks: 24,
      completedTasks: 18,
      pendingTasks: 4,
      overdueTasks: 2,
      completionRate: 75,
      dailyCompletions: [],
      weeklyData: [],
      monthlyData: [],
      categoryBreakdown: [],
      productivityScore: 85,
      streakDays: 7,
      averageTasksPerDay: 3.4,
      forecast: {
        nextWeekTasks: 20,
        nextWeekCompletionRate: 80,
        recommendations: ['Focus on completing high-priority tasks first'],
        trendDirection: 'up'
      }
    };
    
    callback(mockData);
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Analytics unsubscribe called');
    };

    /*
    const { start, end } = getDateRange(filters.timeRange);
    
    let q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end),
      orderBy('createdAt', 'desc')
    );

    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

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

      // Calculate analytics data
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const overdueTasks = tasks.filter(task => {
        return task.dueDate && task.dueDate < new Date() && task.status !== 'completed';
      }).length;
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const productivityScore = Math.round((completedTasks / Math.max(totalTasks, 1)) * 100);
      const streakDays = calculateStreakDays(tasks);
      const averageTasksPerDay = totalTasks / Math.max(getDateRange(filters.timeRange).days, 1);

      const dailyCompletions = getDailyCompletions(tasks, filters.timeRange);
      const weeklyData = getWeeklyData(tasks, filters.timeRange);
      const categoryBreakdown = getCategoryBreakdown(tasks);
      const forecast = generateForecast(tasks);

      const analyticsData: AnalyticsData = {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        dailyCompletions,
        weeklyData,
        monthlyData: [], // TODO: Implement monthly data
        categoryBreakdown,
        productivityScore,
        streakDays,
        averageTasksPerDay,
        forecast
      };

      callback(analyticsData);
    }, (error) => {
      console.error('Error fetching analytics data:', error);
    });
    */
  } catch (error) {
    console.error('Error setting up analytics subscription:', error);
    throw new Error('Failed to fetch analytics data');
  }
};

// Get real-time analytics updates
export const subscribeToAnalytics = (
  userId: string,
  filters: AnalyticsFilters,
  callback: (data: AnalyticsData) => void
) => {
  return getAnalyticsData(userId, filters, callback);
};

// Get analytics data for a specific time period
export const getAnalyticsForPeriod = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsData> => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore analytics period operations temporarily disabled');
    
    // Return mock data
    return {
      totalTasks: 15,
      completedTasks: 12,
      pendingTasks: 2,
      overdueTasks: 1,
      completionRate: 80,
      dailyCompletions: [],
      weeklyData: [],
      monthlyData: [],
      categoryBreakdown: [],
      productivityScore: 80,
      streakDays: 5,
      averageTasksPerDay: 2.5,
      forecast: {
        nextWeekTasks: 15,
        nextWeekCompletionRate: 75,
        recommendations: ['Maintain your current productivity level'],
        trendDirection: 'stable'
      }
    };

    /*
    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
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

    // Calculate analytics data (same logic as above)
    // ... implementation
    */
  } catch (error) {
    console.error('Error fetching analytics for period:', error);
    throw new Error('Failed to fetch analytics data for period');
  }
}; 