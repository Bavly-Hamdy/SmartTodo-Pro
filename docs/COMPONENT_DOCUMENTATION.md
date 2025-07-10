# SmartTodo Pro - Component Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core UI Components](#core-ui-components)
3. [Form Components](#form-components)
4. [Data Visualization Components](#data-visualization-components)
5. [Animation Components](#animation-components)
6. [Loading State Components](#loading-state-components)
7. [Layout Components](#layout-components)
8. [Feature-Specific Components](#feature-specific-components)
9. [Best Practices](#best-practices)
10. [Accessibility Guidelines](#accessibility-guidelines)

## Overview

This documentation covers all UI components in the SmartTodo Pro application. Each component is designed to be reusable, accessible, and performant. Components follow a consistent design system and support theming.

## Core UI Components

### Button Component

A versatile button component with multiple variants, sizes, and states.

```typescript
import { Button } from '../components/ui/Button';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With loading state
<Button isLoading={true}>Loading...</Button>

// Full width
<Button fullWidth>Full Width</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Button content |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disable the button |
| `isLoading` | `boolean` | `false` | Show loading state |
| `onClick` | `() => void` | - | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `fullWidth` | `boolean` | `false` | Make button full width |

### Card Component

A flexible card container with customizable padding and shadows.

```typescript
import { Card } from '../components/ui/Card';

// Basic usage
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// With different padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// With shadows
<Card shadow="none">No shadow</Card>
<Card shadow="sm">Small shadow</Card>
<Card shadow="md">Medium shadow</Card>
<Card shadow="lg">Large shadow</Card>

// With hover effect
<Card hover>Hover me</Card>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Card content |
| `className` | `string` | - | Additional CSS classes |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Card padding |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Card shadow |
| `hover` | `boolean` | `false` | Enable hover effect |

### Modal Component

A modal dialog component with backdrop and keyboard support.

```typescript
import { Modal } from '../components/ui/Modal';

// Basic usage
<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">
  <p>Modal content goes here</p>
</Modal>

// With different sizes
<Modal isOpen={isOpen} onClose={handleClose} title="Small Modal" size="sm">
  Small modal content
</Modal>

<Modal isOpen={isOpen} onClose={handleClose} title="Large Modal" size="lg">
  Large modal content
</Modal>

// Without overlay click to close
<Modal 
  isOpen={isOpen} 
  onClose={handleClose} 
  title="Confirm Action"
  closeOnOverlayClick={false}
>
  <p>This modal cannot be closed by clicking outside</p>
</Modal>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether modal is open |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Modal title |
| `children` | `React.ReactNode` | - | Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Modal size |
| `closeOnOverlayClick` | `boolean` | `true` | Close on backdrop click |

## Form Components

### FormField Component

A flexible form field component supporting various input types.

```typescript
import { FormField } from '../components/ui/FormField';

// Text input
<FormField
  label="Name"
  name="name"
  type="text"
  value={name}
  onChange={handleChange}
  placeholder="Enter your name"
  required
/>

// Email input
<FormField
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={handleChange}
  error={emailError}
  required
/>

// Password input with toggle
<FormField
  label="Password"
  name="password"
  type="password"
  value={password}
  onChange={handleChange}
  showPasswordToggle
  required
/>

// Textarea
<FormField
  label="Description"
  name="description"
  type="textarea"
  value={description}
  onChange={handleChange}
  placeholder="Enter description"
/>

// Select dropdown
<FormField
  label="Priority"
  name="priority"
  type="select"
  value={priority}
  onChange={handleChange}
  options={[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]}
/>

// Date input
<FormField
  label="Due Date"
  name="dueDate"
  type="date"
  value={dueDate}
  onChange={handleChange}
  required
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Field label |
| `name` | `string` | - | Field name |
| `type` | `'text' \| 'email' \| 'password' \| 'textarea' \| 'select' \| 'date'` | `'text'` | Input type |
| `value` | `string` | - | Field value |
| `onChange` | `(e: ChangeEvent) => void` | - | Change handler |
| `error` | `string` | - | Error message |
| `required` | `boolean` | `false` | Required field |
| `placeholder` | `string` | - | Placeholder text |
| `options` | `Array<{value: string, label: string}>` | - | Options for select |
| `showPasswordToggle` | `boolean` | `false` | Show password toggle |

### AuthFormField Component

A specialized form field for authentication forms with enhanced styling.

```typescript
import { AuthFormField } from '../components/auth/AuthFormField';

// Email field
<AuthFormField
  label="Email Address"
  name="email"
  type="email"
  value={email}
  onChange={handleChange}
  error={emailError}
  required
/>

// Password field with icon
<AuthFormField
  label="Password"
  name="password"
  type="password"
  value={password}
  onChange={handleChange}
  error={passwordError}
  showPasswordToggle
  required
/>
```

### AuthButton Component

A specialized button for authentication forms.

```typescript
import { AuthButton } from '../components/auth/AuthButton';

// Submit button
<AuthButton
  type="submit"
  isLoading={isLoading}
  fullWidth
>
  Sign In
</AuthButton>

// Cancel button
<AuthButton
  variant="secondary"
  onClick={handleCancel}
  fullWidth
>
  Cancel
</AuthButton>
```

## Data Visualization Components

### StatCard Component

A card component for displaying statistics with optional icons and trends.

```typescript
import { StatCard } from '../components/ui/DataVisualization';

// Basic stat card
<StatCard
  title="Total Tasks"
  value={totalTasks}
/>

// With icon
<StatCard
  title="Completed Tasks"
  value={completedTasks}
  icon={<CheckIcon className="w-6 h-6" />}
/>

// With trend
<StatCard
  title="Completion Rate"
  value={`${completionRate}%`}
  trend={{
    value: 12,
    isPositive: true
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Stat title |
| `value` | `string \| number` | - | Stat value |
| `icon` | `React.ReactNode` | - | Optional icon |
| `trend` | `{value: number, isPositive: boolean}` | - | Trend data |
| `className` | `string` | - | Additional CSS classes |

### ProgressRing Component

A circular progress indicator with customizable styling.

```typescript
import { ProgressRing } from '../components/ui/DataVisualization';

// Basic progress ring
<ProgressRing progress={75} />

// With label
<ProgressRing 
  progress={60} 
  showLabel 
/>

// Custom styling
<ProgressRing
  progress={85}
  size={120}
  strokeWidth={8}
  color="#10B981"
  showLabel
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | - | Progress percentage (0-100) |
| `size` | `number` | `100` | Ring size in pixels |
| `strokeWidth` | `number` | `4` | Stroke width |
| `showLabel` | `boolean` | `false` | Show percentage label |
| `color` | `string` | - | Custom color |

### BarChart Component

A bar chart component for displaying data trends.

```typescript
import { BarChart } from '../components/ui/DataVisualization';

// Basic bar chart
<BarChart
  data={[
    { label: 'Mon', value: 5 },
    { label: 'Tue', value: 8 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 12 },
    { label: 'Fri', value: 7 }
  ]}
/>

// Custom styling
<BarChart
  data={weeklyData}
  height={200}
  color="#3B82F6"
  showGrid
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{label: string, value: number}>` | - | Chart data |
| `height` | `number` | `150` | Chart height |
| `color` | `string` | - | Bar color |
| `showGrid` | `boolean` | `false` | Show grid lines |

### LineChart Component

A line chart component for displaying time-series data.

```typescript
import { LineChart } from '../components/ui/DataVisualization';

// Basic line chart
<LineChart
  data={[
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 15 },
    { date: '2024-01-03', value: 8 },
    { date: '2024-01-04', value: 20 }
  ]}
/>

// With custom styling
<LineChart
  data={monthlyData}
  height={250}
  color="#10B981"
  showGrid
  showPoints
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{date: string, value: number}>` | - | Chart data |
| `height` | `number` | `150` | Chart height |
| `color` | `string` | - | Line color |
| `showGrid` | `boolean` | `false` | Show grid lines |
| `showPoints` | `boolean` | `true` | Show data points |

### DonutChart Component

A donut chart component for displaying proportions.

```typescript
import { DonutChart } from '../components/ui/DataVisualization';

// Basic donut chart
<DonutChart
  data={[
    { label: 'Completed', value: 60, color: '#10B981' },
    { label: 'Pending', value: 30, color: '#F59E0B' },
    { label: 'Overdue', value: 10, color: '#EF4444' }
  ]}
/>

// With legend
<DonutChart
  data={taskStatusData}
  showLegend
  size={200}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<{label: string, value: number, color: string}>` | - | Chart data |
| `size` | `number` | `150` | Chart size |
| `showLegend` | `boolean` | `false` | Show legend |
| `strokeWidth` | `number` | `20` | Stroke width |

## Animation Components

### FadeIn Component

A fade-in animation wrapper component.

```typescript
import { FadeIn } from '../components/ui/AnimatedContainer';

// Basic fade in
<FadeIn>
  <div>This will fade in</div>
</FadeIn>

// With custom delay and duration
<FadeIn delay={0.5} duration={0.8}>
  <div>Delayed fade in</div>
</FadeIn>

// With custom className
<FadeIn className="mb-4">
  <Card>Animated card</Card>
</FadeIn>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to animate |
| `className` | `string` | - | Additional CSS classes |
| `delay` | `number` | `0` | Animation delay in seconds |
| `duration` | `number` | `0.5` | Animation duration in seconds |

### SlideUp Component

A slide-up animation wrapper component.

```typescript
import { SlideUp } from '../components/ui/AnimatedContainer';

// Basic slide up
<SlideUp>
  <div>This will slide up</div>
</SlideUp>

// With custom delay
<SlideUp delay={0.2}>
  <div>Delayed slide up</div>
</SlideUp>

// With custom duration
<SlideUp duration={1.0}>
  <div>Slow slide up</div>
</SlideUp>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to animate |
| `className` | `string` | - | Additional CSS classes |
| `delay` | `number` | `0` | Animation delay in seconds |
| `duration` | `number` | `0.5` | Animation duration in seconds |

### ScaleIn Component

A scale-in animation wrapper component.

```typescript
import { ScaleIn } from '../components/ui/AnimatedContainer';

// Basic scale in
<ScaleIn>
  <Button>Animated button</Button>
</ScaleIn>

// With delay
<ScaleIn delay={0.3}>
  <Card>Animated card</Card>
</ScaleIn>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to animate |
| `delay` | `number` | `0` | Animation delay in seconds |
| `duration` | `number` | `0.5` | Animation duration in seconds |

## Loading State Components

### CardSkeleton Component

A skeleton loading component for cards.

```typescript
import { CardSkeleton } from '../components/ui/LoadingStates';

// Basic skeleton
<CardSkeleton />

// With custom lines
<CardSkeleton lines={3} />

// With custom className
<CardSkeleton className="mb-4" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `lines` | `number` | `2` | Number of skeleton lines |

### ListSkeleton Component

A skeleton loading component for lists.

```typescript
import { ListSkeleton } from '../components/ui/LoadingStates';

// Basic list skeleton
<ListSkeleton />

// With custom items
<ListSkeleton items={5} />

// With custom className
<ListSkeleton className="space-y-4" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `items` | `number` | `3` | Number of skeleton items |

### LoadingSpinner Component

A loading spinner component.

```typescript
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Basic spinner
<LoadingSpinner />

// With custom size
<LoadingSpinner size="lg" />

// With custom color
<LoadingSpinner color="primary" />
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `color` | `'primary' \| 'secondary' \| 'white'` | `'primary'` | Spinner color |

## Layout Components

### Header Component

The main application header with navigation and user menu.

```typescript
import { Header } from '../components/layout/Header';

// Basic usage
<Header />

// With custom props
<Header 
  showNotifications={true}
  showSearch={true}
/>
```

### Sidebar Component

The main navigation sidebar.

```typescript
import { Sidebar } from '../components/layout/Sidebar';

// Basic usage
<Sidebar />

// With custom navigation items
<Sidebar 
  items={customNavItems}
  collapsed={false}
/>
```

### MobileSidebar Component

A mobile-optimized sidebar component.

```typescript
import { MobileSidebar } from '../components/layout/MobileSidebar';

// Basic usage
<MobileSidebar isOpen={isOpen} onClose={handleClose} />
```

### DashboardLayout Component

A layout wrapper for dashboard pages.

```typescript
import { DashboardLayout } from '../layouts/DashboardLayout';

// Basic usage
<DashboardLayout>
  <Dashboard />
</DashboardLayout>
```

### AuthLayout Component

A layout wrapper for authentication pages.

```typescript
import { AuthLayout } from '../layouts/AuthLayout';

// Basic usage
<AuthLayout>
  <Login />
</AuthLayout>
```

## Feature-Specific Components

### TaskList Component

A comprehensive task list component with filtering and sorting.

```typescript
import TaskList from '../pages/tasks/TaskList';

// Basic usage
<TaskList />

// With custom filters
<TaskList 
  initialFilters={{
    status: 'pending',
    priority: 'high'
  }}
/>
```

### TaskForm Component

A form component for creating and editing tasks.

```typescript
import TaskForm from '../pages/tasks/TaskForm';

// Create new task
<TaskForm 
  isOpen={isOpen}
  onClose={handleClose}
  addTask={handleAddTask}
/>

// Edit existing task
<TaskForm 
  task={existingTask}
  isOpen={isOpen}
  onClose={handleClose}
  editTask={handleEditTask}
/>
```

### Dashboard Component

The main dashboard component with statistics and recent tasks.

```typescript
import Dashboard from '../pages/dashboard/Dashboard';

// Basic usage
<Dashboard />

// With custom data
<Dashboard 
  initialStats={customStats}
  showAnalytics={true}
/>
```

### SearchBar Component

A search component with autocomplete functionality.

```typescript
import { SearchBar } from '../components/dashboard/SearchBar';

// Basic usage
<SearchBar onSearch={handleSearch} />

// With task selection
<SearchBar 
  onSearch={handleSearch}
  onTaskSelect={handleTaskSelect}
  placeholder="Search tasks..."
/>
```

### AccountMenu Component

A user account menu component.

```typescript
import { AccountMenu } from '../components/dashboard/AccountMenu';

// Basic usage
<AccountMenu />

// With custom user data
<AccountMenu 
  user={customUser}
  onSignOut={handleSignOut}
/>
```

### QuickActions Component

A component for quick action buttons.

```typescript
import { QuickActions } from '../components/dashboard/QuickActions';

// Basic usage
<QuickActions />

// With custom actions
<QuickActions 
  actions={customActions}
  onAction={handleAction}
/>
```

## Best Practices

### Component Composition

1. **Keep components small and focused**: Each component should have a single responsibility.

2. **Use composition over inheritance**: Combine smaller components to create complex UIs.

3. **Pass props explicitly**: Avoid prop drilling by using context or custom hooks.

```typescript
// Good: Explicit props
<Button variant="primary" size="lg" onClick={handleClick}>
  Submit
</Button>

// Bad: Implicit props
<Button {...props}>
  Submit
</Button>
```

### Performance Optimization

1. **Use React.memo for expensive components**:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});
```

2. **Memoize callbacks with useCallback**:

```typescript
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

3. **Memoize computed values with useMemo**:

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.status === 'pending');
}, [tasks]);
```

### Error Handling

1. **Use error boundaries**:

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

2. **Handle loading states**:

```typescript
if (isLoading) {
  return <CardSkeleton />;
}

if (error) {
  return <ErrorMessage error={error} />;
}
```

### Accessibility

1. **Use semantic HTML**:

```typescript
// Good
<button onClick={handleClick}>Click me</button>

// Bad
<div onClick={handleClick}>Click me</div>
```

2. **Provide ARIA labels**:

```typescript
<button aria-label="Close modal" onClick={handleClose}>
  ×
</button>
```

3. **Support keyboard navigation**:

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
};
```

## Accessibility Guidelines

### Color and Contrast

1. **Ensure sufficient contrast ratios** (minimum 4.5:1 for normal text)
2. **Don't rely solely on color** to convey information
3. **Provide alternative indicators** for color-coded information

### Keyboard Navigation

1. **All interactive elements** should be keyboard accessible
2. **Logical tab order** should be maintained
3. **Skip links** should be provided for long pages

### Screen Reader Support

1. **Use proper heading hierarchy** (h1, h2, h3, etc.)
2. **Provide alt text** for images
3. **Use ARIA labels** for complex interactions
4. **Announce dynamic content** changes

### Focus Management

1. **Visible focus indicators** should be provided
2. **Focus should be trapped** in modals
3. **Focus should be restored** when modals close

### Form Accessibility

1. **All form fields** should have labels
2. **Error messages** should be associated with fields
3. **Required fields** should be clearly indicated
4. **Form validation** should be announced to screen readers

### Animation and Motion

1. **Respect user preferences** for reduced motion
2. **Provide pause/stop controls** for auto-playing content
3. **Ensure animations don't interfere** with reading

### Testing Accessibility

1. **Use automated tools** like axe-core
2. **Test with screen readers** (NVDA, JAWS, VoiceOver)
3. **Test keyboard-only navigation**
4. **Test with high contrast mode**

---

This documentation should be updated as new components are added or existing components are modified. For questions or contributions, please refer to the project repository. 