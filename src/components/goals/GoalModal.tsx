import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import { Goal, CreateGoalData, UpdateGoalData, Milestone } from '../../services/goalsService';
import { useGoalSuggestions } from '../../hooks/useGoalSuggestions';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSubmit: (data: CreateGoalData | UpdateGoalData) => Promise<void>;
  isSubmitting?: boolean;
}

const GoalModal: React.FC<GoalModalProps> = ({ 
  isOpen, 
  onClose, 
  goal, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const isEditing = !!goal;
  const { suggestion, isGenerating, generateSuggestions } = useGoalSuggestions(goal?.id || '');

  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    targetDate: new Date(),
    milestones: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });

  // Initialize form data when editing
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        category: goal.category,
        priority: goal.priority,
        targetDate: goal.targetDate,
        milestones: goal.milestones,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        targetDate: new Date(),
        milestones: [],
      });
    }
    setErrors({});
  }, [goal]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    if (formData.targetDate && formData.targetDate < new Date()) {
      newErrors.targetDate = 'Target date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting goal:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: new Date(value),
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMilestoneAdd = () => {
    if (!newMilestone.title.trim() || !newMilestone.dueDate) {
      return;
    }

    const milestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestone.title.trim(),
      completed: false,
      dueDate: new Date(newMilestone.dueDate),
    };

    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), milestone],
    }));

    setNewMilestone({ title: '', dueDate: '' });
  };

  const handleMilestoneRemove = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: (prev.milestones || []).filter(m => m.id !== milestoneId),
    }));
  };

  const handleGenerateAISuggestions = async () => {
    if (!formData.title || !formData.description) {
      setErrors(prev => ({ ...prev, ai: 'Please fill in title and description first' }));
      return;
    }

    try {
      await generateSuggestions(formData.title, formData.description);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const handleSuggestionApply = (suggestions: string[]) => {
    const newMilestones: Milestone[] = suggestions.map((suggestion, index) => ({
      id: `ai-${Date.now()}-${index}`,
      title: suggestion,
      completed: false,
      dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000), // 1 week apart
    }));

    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), ...newMilestones],
    }));
  };

  const categories = [
    { value: 'personal', label: 'Personal' },
    { value: 'work', label: 'Work' },
    { value: 'health', label: 'Health' },
    { value: 'learning', label: 'Learning' },
    { value: 'financial', label: 'Financial' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter goal title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Describe your goal in detail"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Date *
                </label>
                <input
                  type="datetime-local"
                  id="targetDate"
                  name="targetDate"
                  value={formData.targetDate ? new Date(formData.targetDate).toISOString().slice(0, 16) : ''}
                  onChange={handleDateChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm ${
                    errors.targetDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.targetDate}</p>
                )}
              </div>

              {/* AI Suggestions */}
              {!isEditing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        AI-Powered Suggestions
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Get personalized subtasks and tips for your goal
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAISuggestions}
                      disabled={isGenerating || !formData.title || !formData.description}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isGenerating ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          Get Suggestions
                        </>
                      )}
                    </button>
                  </div>
                  {errors.ai && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.ai}</p>
                  )}
                </div>
              )}

              {/* AI Suggestions Panel */}
              {suggestion && showAISuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700"
                >
                  <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-3">
                    AI Suggestions
                  </h3>
                  
                  {/* Subtasks */}
                  {suggestion.subtasks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-purple-800 dark:text-purple-400 mb-2">
                        Suggested Subtasks
                      </h4>
                      <div className="space-y-2">
                        {suggestion.subtasks.map((subtask, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-700/50 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{subtask}</span>
                            <button
                              type="button"
                              onClick={() => handleSuggestionApply([subtask])}
                              className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSuggestionApply(suggestion.subtasks)}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        Add All Subtasks
                      </button>
                    </div>
                  )}

                  {/* Tips */}
                  {suggestion.tips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-purple-800 dark:text-purple-400 mb-2">
                        Tips for Success
                      </h4>
                      <ul className="space-y-1">
                        {suggestion.tips.map((tip, index) => (
                          <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Milestones
                </label>
                
                {/* Existing Milestones */}
                {(formData.milestones || []).length > 0 && (
                  <div className="space-y-2 mb-4">
                    {(formData.milestones || []).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{milestone.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {format(milestone.dueDate, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMilestoneRemove(milestone.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Milestone */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-sm"
                    placeholder="Milestone title"
                  />
                  <input
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleMilestoneAdd}
                  disabled={!newMilestone.title.trim() || !newMilestone.dueDate}
                  className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Milestone
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    isEditing ? 'Update Goal' : 'Create Goal'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal; 