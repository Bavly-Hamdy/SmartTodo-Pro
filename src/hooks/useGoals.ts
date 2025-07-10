import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { goalsService, Goal, CreateGoalData, UpdateGoalData } from '../services/goalsService';

export const useGoals = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user's goals in real-time
  useEffect(() => {
    if (!currentUser?.uid) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = goalsService.subscribeToUserGoals(currentUser.uid, (goals) => {
      setGoals(goals);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  // Create a new goal
  const createGoal = useCallback(async (goalData: CreateGoalData): Promise<string> => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const goalId = await goalsService.createGoal(currentUser.uid, goalData);
      return goalId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Update an existing goal
  const updateGoal = useCallback(async (goalId: string, updateData: UpdateGoalData): Promise<void> => {
    try {
      setError(null);
      await goalsService.updateGoal(goalId, updateData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete a goal
  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    try {
      setError(null);
      await goalsService.deleteGoal(goalId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Update goal progress
  const updateGoalProgress = useCallback(async (goalId: string, progress: number): Promise<void> => {
    try {
      setError(null);
      await goalsService.updateGoalProgress(goalId, progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal progress';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Toggle milestone completion
  const toggleMilestone = useCallback(async (goalId: string, milestoneId: string, completed: boolean): Promise<void> => {
    try {
      setError(null);
      await goalsService.toggleMilestone(goalId, milestoneId, completed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle milestone';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Search goals
  const searchGoals = useCallback(async (searchTerm: string): Promise<Goal[]> => {
    if (!currentUser?.uid) {
      return [];
    }

    try {
      setError(null);
      return await goalsService.searchGoals(currentUser.uid, searchTerm);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search goals';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Get goals by category
  const getGoalsByCategory = useCallback(async (category: Goal['category']): Promise<Goal[]> => {
    if (!currentUser?.uid) {
      return [];
    }

    try {
      setError(null);
      return await goalsService.getGoalsByCategory(currentUser.uid, category);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get goals by category';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Get goals by status
  const getGoalsByStatus = useCallback(async (status: Goal['status']): Promise<Goal[]> => {
    if (!currentUser?.uid) {
      return [];
    }

    try {
      setError(null);
      return await goalsService.getGoalsByStatus(currentUser.uid, status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get goals by status';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Get overdue goals
  const getOverdueGoals = useCallback(async (): Promise<Goal[]> => {
    if (!currentUser?.uid) {
      return [];
    }

    try {
      setError(null);
      return await goalsService.getOverdueGoals(currentUser.uid);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get overdue goals';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Get goals due soon
  const getGoalsDueSoon = useCallback(async (): Promise<Goal[]> => {
    if (!currentUser?.uid) {
      return [];
    }

    try {
      setError(null);
      return await goalsService.getGoalsDueSoon(currentUser.uid);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get goals due soon';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser?.uid]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    toggleMilestone,
    searchGoals,
    getGoalsByCategory,
    getGoalsByStatus,
    getOverdueGoals,
    getGoalsDueSoon,
    clearError,
  };
}; 