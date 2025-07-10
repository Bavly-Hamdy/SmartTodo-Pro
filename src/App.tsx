import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

// Direct imports for components that use useTasks (to avoid chunk issues)
// TODO: Refactor to lazy load if chunking issues are resolved
import Dashboard from './pages/dashboard/Dashboard';
import TaskList from './pages/tasks/TaskList';
import TaskForm from './pages/tasks/TaskForm';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load components for better performance
const AuthLayout = React.lazy(() => import('./layouts/AuthLayout'));
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));

// Auth pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const SignUp = React.lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const VerifyEmail = React.lazy(() => import('./pages/auth/VerifyEmail'));

// Other dashboard pages
const GoalList = React.lazy(() => import('./pages/goals/GoalList'));
const Calendar = React.lazy(() => import('./pages/calendar/Calendar'));
const Analytics = React.lazy(() => import('./pages/analytics/Analytics'));
const Settings = React.lazy(() => import('./pages/settings/Settings'));
const Profile = React.lazy(() => import('./pages/profile/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  const { currentUser, isEmailVerified } = useAuth();

  return (
    <>
      <Helmet>
        <title>SmartTodo Pro - Next-Generation Task Management</title>
        <meta name="description" content="AI-powered task and goal management platform with real-time collaboration and end-to-end encryption." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>

      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthLayout><Outlet /></AuthLayout>}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                currentUser ? (
                  isEmailVerified ? (
                    <DashboardLayout><Outlet /></DashboardLayout>
                  ) : (
                    <Navigate to="/auth/verify-email" replace />
                  )
                ) : (
                  <Navigate to="/auth/login" replace />
                )
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<TaskList />} />
              <Route path="tasks/new" element={<TaskForm />} />
              <Route path="goals" element={<GoalList />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
};

export default App; 