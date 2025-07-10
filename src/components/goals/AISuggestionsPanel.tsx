import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import { GoalSuggestion } from '../../services/goalsService';

interface AISuggestionsPanelProps {
  goalId: string;
  goalTitle: string;
  goalDescription: string;
  onApplySuggestions: (suggestions: string[]) => void;
  onApplyTips: (tips: string[]) => void;
}

const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  goalId,
  goalTitle,
  goalDescription,
  onApplySuggestions,
  onApplyTips,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestions = async () => {
    if (!goalTitle || !goalDescription) {
      setError('Please fill in goal title and description first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestion: GoalSuggestion = {
        id: 'mock-suggestion',
        goalId,
        suggestions: [
          'Break down your goal into smaller, manageable tasks',
          'Set specific milestones with deadlines',
          'Track your progress regularly',
          'Celebrate small wins along the way',
        ],
        tips: [
          'Start with the most important tasks first',
          'Review your progress weekly',
          'Adjust your timeline if needed',
          'Share your goal with someone for accountability',
        ],
        subtasks: [
          'Define clear objectives',
          'Create a detailed timeline',
          'Set up progress tracking',
          'Plan regular check-ins',
        ],
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };
      
      setSuggestion(mockSuggestion);
      setIsExpanded(true);
    } catch (err) {
      setError('Failed to generate AI suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySuggestions = () => {
    if (suggestion) {
      onApplySuggestions(suggestion.subtasks);
    }
  };

  const handleApplyTips = () => {
    if (suggestion) {
      onApplyTips(suggestion.tips);
    }
  };

  const isExpired = suggestion ? new Date() > suggestion.expiresAt : false;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300">
                AI-Powered Suggestions
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                Personalized insights for your goal
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Generate Button */}
        {!suggestion && (
          <div className="text-center">
            <button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating AI suggestions...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate AI Suggestions
                </>
              )}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        )}

        {/* Suggestions Content */}
        <AnimatePresence>
          {isExpanded && suggestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Expired Warning */}
              {isExpired && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    These suggestions were generated on {format(suggestion.generatedAt, 'MMM dd, yyyy')} and may be outdated.
                  </p>
                </div>
              )}

              {/* Subtasks */}
              {suggestion.subtasks.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-400">
                      Suggested Subtasks
                    </h4>
                    <button
                      onClick={handleApplySuggestions}
                      className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Apply All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {suggestion.subtasks.map((subtask, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-purple-100 dark:border-purple-700"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{subtask}</span>
                        </div>
                        <button
                          onClick={() => onApplySuggestions([subtask])}
                          className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Add
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {suggestion.tips.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-400">
                      Tips for Success
                    </h4>
                    <button
                      onClick={handleApplyTips}
                      className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Apply All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {suggestion.tips.map((tip, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + suggestion.subtasks.length) * 0.1 }}
                        className="flex items-start space-x-2 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-blue-700"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-purple-200 dark:border-purple-700">
                Generated on {format(suggestion.generatedAt, 'MMM dd, yyyy at h:mm a')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AISuggestionsPanel; 