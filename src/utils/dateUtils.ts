import { format, isToday, isTomorrow, isYesterday, isThisWeek, isThisYear } from 'date-fns';

/**
 * Date utility functions for consistent date formatting across the application
 */

export interface DateFormatOptions {
  includeTime?: boolean;
  short?: boolean;
  relative?: boolean;
}

/**
 * Format a date with consistent styling
 */
export const formatDate = (date: Date | string, options: DateFormatOptions = {}): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (options.relative) {
    return formatRelativeDate(dateObj);
  }
  
  if (options.short) {
    return format(dateObj, 'MMM d');
  }
  
  if (options.includeTime) {
    return format(dateObj, 'MMM d, yyyy h:mm a');
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format a date as a relative time (e.g., "2 hours ago", "yesterday")
 */
export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }
  
  if (isThisYear(date)) {
    return format(date, 'MMM d');
  }
  
  return format(date, 'MMM d, yyyy');
};

/**
 * Format a time duration in a human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get the start and end of a day
 */
export const getDayBounds = (date: Date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dueDate: Date | string): boolean => {
  const date = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return date < new Date();
};

/**
 * Get the number of days until a date
 */
export const getDaysUntil = (date: Date | string): number => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format a date for input fields
 */
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Parse a date from input field format
 */
export const parseDateFromInput = (dateString: string): Date => {
  return new Date(dateString + 'T00:00:00');
}; 