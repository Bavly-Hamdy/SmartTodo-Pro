/**
 * Color utility functions for consistent theming and color management across the application
 */

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
}

/**
 * Light theme color scheme
 */
export const lightColors: ColorScheme = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  accent: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
  border: '#E5E7EB',
};

/**
 * Dark theme color scheme
 */
export const darkColors: ColorScheme = {
  primary: '#60A5FA',
  secondary: '#9CA3AF',
  accent: '#A78BFA',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#22D3EE',
  background: '#111827',
  surface: '#1F2937',
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },
  border: '#374151',
};

/**
 * Get color scheme based on theme
 */
export const getColorScheme = (isDark: boolean): ColorScheme => {
  return isDark ? darkColors : lightColors;
};

/**
 * Priority color mapping
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Status color mapping
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    case 'in-progress':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    case 'overdue':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Delta color mapping for analytics
 */
export const getDeltaColor = (delta: number): string => {
  if (delta > 0) return 'text-green-600 dark:text-green-400';
  if (delta < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
};

/**
 * Delta icon mapping for analytics
 */
export const getDeltaIcon = (delta: number): string => {
  if (delta > 0) return '↗';
  if (delta < 0) return '↘';
  return '→';
};

/**
 * Format delta percentage for display
 */
export const formatDelta = (delta: number): string => {
  if (delta > 0) return `+${delta}%`;
  if (delta < 0) return `${delta}%`;
  return '0%';
};

/**
 * Get category color
 */
export const getCategoryColor = (category: string): string => {
  const colors = [
    'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
    'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
    'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300',
    'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
    'text-teal-600 bg-teal-100 dark:bg-teal-900 dark:text-teal-300',
    'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  ];
  
  // Use category name to generate consistent color
  const index = category.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Get notification type color
 */
export const getNotificationColor = (type: 'success' | 'error' | 'warning' | 'info'): string => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
    case 'error':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    case 'info':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Generate a consistent color from a string (for avatars, etc.)
 */
export const getStringColor = (str: string): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#F97316', '#EC4899', '#84CC16', '#6366F1',
  ];
  
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Get contrast color for text on a background
 */
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#FFFFFF';
}; 