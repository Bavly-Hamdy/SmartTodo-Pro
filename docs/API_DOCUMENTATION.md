# SmartTodo Pro - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication Services](#authentication-services)
3. [Task Management Services](#task-management-services)
4. [Goal Management Services](#goal-management-services)
5. [Analytics Services](#analytics-services)
6. [Notification Services](#notification-services)
7. [Custom Hooks](#custom-hooks)
8. [Utility Functions](#utility-functions)
9. [UI Components](#ui-components)
10. [Error Handling](#error-handling)

## Overview

SmartTodo Pro is a comprehensive task management application built with React, TypeScript, and Firebase. This documentation covers all the APIs, services, hooks, and utilities used throughout the application.

## Authentication Services

### AuthContext

The main authentication context that provides user authentication state and methods.

```typescript
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
```

#### Methods

- **signIn(email, password)**: Authenticates a user with email and password
- **signUp(email, password, displayName)**: Creates a new user account
- **signOut()**: Signs out the current user
- **sendPasswordResetEmail(email)**: Sends a password reset email
- **updateProfile(data)**: Updates the user's profile information

### Firebase Configuration

```typescript
// src/config/firebase.ts
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
```

## Task Management Services

### TasksService

Handles all task-related operations with Firebase Firestore.

```typescript
class TasksService {
  // Get all tasks for a user
  static async getTasks(userId: string): Promise<Task[]>
  
  // Get a single task by ID
  static async getTask(userId: string, taskId: string): Promise<Task | null>
  
  // Create a new task
  static async createTask(userId: string, taskData: CreateTaskData): Promise<Task>
  
  // Update an existing task
  static async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void>
  
  // Delete a task
  static async deleteTask(userId: string, taskId: string): Promise<void>
  
  // Toggle task completion status
  static async toggleTaskCompletion(userId: string, taskId: string): Promise<void>
}
```

#### Task Interface

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  userId: string;
}
```

### useTasks Hook

Custom hook for managing tasks with caching and real-time updates.

```typescript
function useTasks(): {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (taskData: CreateTaskData) => Promise<void>;
  editTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
}
```

### useTaskStats Hook

Hook for computing task statistics and analytics.

```typescript
function useTaskStats(): {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    weeklyProgress: number;
  };
  isLoading: boolean;
}
```

## Goal Management Services

### GoalsService

Manages user goals and progress tracking.

```typescript
class GoalsService {
  // Get all goals for a user
  static async getGoals(userId: string): Promise<Goal[]>
  
  // Create a new goal
  static async createGoal(userId: string, goalData: CreateGoalData): Promise<Goal>
  
  // Update a goal
  static async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void>
  
  // Delete a goal
  static async deleteGoal(userId: string, goalId: string): Promise<void>
  
  // Update goal progress
  static async updateProgress(userId: string, goalId: string, progress: number): Promise<void>
}
```

#### Goal Interface

```typescript
interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### useGoals Hook

```typescript
function useGoals(): {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  addGoal: (goalData: CreateGoalData) => Promise<void>;
  editGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (goalId: string) => Promise<void>;
  updateProgress: (goalId: string, progress: number) => Promise<void>;
}
```

## Analytics Services

### AnalyticsService

Handles analytics data collection and processing.

```typescript
class AnalyticsService {
  // Track user action
  static async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void>
  
  // Track page view
  static async trackPageView(pageName: string): Promise<void>
  
  // Get user analytics
  static async getUserAnalytics(userId: string): Promise<AnalyticsData>
  
  // Get task completion trends
  static async getTaskTrends(userId: string, period: 'week' | 'month' | 'year'): Promise<TrendData[]>
}
```

### useAnalytics Hook

```typescript
function useAnalytics(): {
  trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
  trackPageView: (pageName: string) => Promise<void>;
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
}
```

### useAnalyticsMetrics Hook

```typescript
function useAnalyticsMetrics(): {
  metrics: {
    totalTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    productivityScore: number;
  };
  trends: TrendData[];
  isLoading: boolean;
}
```

## Notification Services

### NotificationContext

Manages in-app notifications and user alerts.

```typescript
interface NotificationContextType {
  notifications: Notification[];
  sendNotification: (notification: CreateNotificationData) => void;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}
```

#### Notification Interface

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  userId: string;
}
```

### useNotifications Hook

```typescript
function useNotifications(): {
  notifications: Notification[];
  sendNotification: (notification: CreateNotificationData) => void;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
  unreadCount: number;
}
```

## Custom Hooks

### useAuthForm Hook

Manages authentication form state and validation.

```typescript
function useAuthForm(mode: 'login' | 'signup' | 'forgot'): {
  formData: AuthFormData;
  errors: AuthFormErrors;
  isLoading: boolean;
  handleInputChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
}
```

### useDebounce Hook

Debounces function calls to improve performance.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

### useLocalStorage Hook

Manages local storage with automatic serialization.

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

### useCalendar Hook

Manages calendar events and scheduling.

```typescript
function useCalendar(): {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  addEvent: (eventData: CreateEventData) => Promise<void>;
  editEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
}
```

## Utility Functions

### Date Utilities

```typescript
// src/utils/dateUtils.ts

// Format date for display
export function formatDate(date: Date, format?: string): string

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: Date): string

// Check if date is overdue
export function isOverdue(date: Date): boolean

// Get days until due
export function getDaysUntilDue(date: Date): number

// Format date for input fields
export function formatDateForInput(date: Date): string
```

### Validation Utilities

```typescript
// src/utils/validationUtils.ts

// Validate email format
export function validateEmail(email: string): boolean

// Validate password strength
export function validatePassword(password: string): PasswordValidationResult

// Validate task data
export function validateTask(taskData: CreateTaskData): ValidationResult

// Validate goal data
export function validateGoal(goalData: CreateGoalData): ValidationResult
```

### Color Utilities

```typescript
// src/utils/colorUtils.ts

// Get priority color
export function getPriorityColor(priority: TaskPriority): string

// Get status color
export function getStatusColor(status: TaskStatus): string

// Generate gradient colors
export function generateGradient(colors: string[]): string

// Get contrast color for background
export function getContrastColor(backgroundColor: string): string
```

## UI Components

### Button Component

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
```

### FormField Component

```typescript
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  showPasswordToggle?: boolean;
}
```

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}
```

### Card Component

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

### Data Visualization Components

#### StatCard

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}
```

#### ProgressRing

```typescript
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  color?: string;
}
```

#### BarChart

```typescript
interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  showGrid?: boolean;
}
```

#### LineChart

```typescript
interface LineChartProps {
  data: Array<{ date: string; value: number }>;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}
```

### Animation Components

#### FadeIn

```typescript
interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}
```

#### SlideUp

```typescript
interface SlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}
```

#### ScaleIn

```typescript
interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}
```

### Loading States

#### CardSkeleton

```typescript
interface CardSkeletonProps {
  className?: string;
  lines?: number;
}
```

#### ListSkeleton

```typescript
interface ListSkeletonProps {
  className?: string;
  items?: number;
}
```

## Error Handling

### Error Types

```typescript
interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### Error Handling Utilities

```typescript
// Handle Firebase errors
export function handleFirebaseError(error: FirebaseError): AppError

// Handle network errors
export function handleNetworkError(error: Error): AppError

// Handle validation errors
export function handleValidationError(errors: ValidationErrors): AppError

// Log error for analytics
export function logError(error: AppError): void
```

### Error Boundaries

The application uses React Error Boundaries to catch and handle component errors gracefully.

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}
```

## Environment Variables

Required environment variables for the application:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Analytics (Optional)
REACT_APP_ANALYTICS_ID=your_analytics_id

# Feature Flags (Optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_GOALS=true
```

## Performance Considerations

### Bundle Optimization

- Components are lazy-loaded using React.lazy()
- Heavy components are memoized with React.memo()
- Event handlers are memoized with useCallback()
- Computed values are memoized with useMemo()

### Caching Strategy

- Task data is cached in memory with automatic invalidation
- User preferences are stored in localStorage
- Analytics data is cached for 24 hours
- Images and static assets are cached by the browser

### Real-time Updates

- Firebase Firestore listeners for real-time data synchronization
- Optimistic updates for better UX
- Debounced search and filter operations
- Throttled analytics tracking

## Security Considerations

### Data Validation

- All user inputs are validated on both client and server
- SQL injection prevention through parameterized queries
- XSS prevention through proper escaping
- CSRF protection through Firebase Auth

### Authentication

- JWT tokens managed by Firebase Auth
- Automatic token refresh
- Secure password requirements
- Email verification required

### Data Privacy

- User data is isolated by userId
- Sensitive data is encrypted at rest
- GDPR compliance for data handling
- Automatic data retention policies

## Testing

### Unit Tests

All components and utilities include comprehensive unit tests:

```bash
npm test
```

### Integration Tests

End-to-end testing with Cypress:

```bash
npm run cypress:open
```

### Performance Tests

Bundle size and performance monitoring:

```bash
npm run build
npm run analyze
```

## Deployment

### Build Process

```bash
npm run build
```

### Environment Setup

1. Configure Firebase project
2. Set environment variables
3. Deploy to hosting platform
4. Configure custom domain (optional)

### Monitoring

- Firebase Analytics for user behavior
- Error tracking with Firebase Crashlytics
- Performance monitoring with Firebase Performance
- Custom metrics for business KPIs

---

This documentation is maintained and updated regularly. For questions or contributions, please refer to the project repository. 