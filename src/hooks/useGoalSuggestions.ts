import { useState, useEffect, useCallback } from 'react';
import { aiSuggestionsService, GoalSuggestion } from '../services/goalsService';

export const useGoalSuggestions = (goalId: string) => {
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to AI suggestions in real-time
  useEffect(() => {
    if (!goalId) {
      setSuggestion(null);
      return;
    }

    const unsubscribe = aiSuggestionsService.subscribeToSuggestions(goalId, (suggestion) => {
      setSuggestion(suggestion);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [goalId]);

  // Generate AI suggestions for a goal
  const generateSuggestions = useCallback(async (goalTitle: string, goalDescription: string): Promise<void> => {
    if (!goalId) {
      throw new Error('Goal ID is required');
    }

    try {
      setIsGenerating(true);
      setError(null);
      await aiSuggestionsService.generateSuggestions(goalId, goalTitle, goalDescription);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI suggestions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [goalId]);

  // Get existing suggestions
  const getSuggestions = useCallback(async (): Promise<void> => {
    if (!goalId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const existingSuggestion = await aiSuggestionsService.getSuggestions(goalId);
      setSuggestion(existingSuggestion);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI suggestions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [goalId]);

  // Check if suggestions are expired
  const isExpired = useCallback((): boolean => {
    if (!suggestion) return true;
    return new Date() > suggestion.expiresAt;
  }, [suggestion]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    suggestion,
    isLoading,
    isGenerating,
    error,
    generateSuggestions,
    getSuggestions,
    isExpired,
    clearError,
  };
}; 