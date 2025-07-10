import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  Timestamp,
  writeBatch,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'personal' | 'work' | 'health' | 'learning' | 'financial';
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  targetDate: Date;
  progress: number;
  milestones: Milestone[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

export interface GoalSuggestion {
  id: string;
  goalId: string;
  suggestions: string[];
  tips: string[];
  subtasks: string[];
  generatedAt: Date;
  expiresAt: Date;
}

export interface CreateGoalData {
  title: string;
  description: string;
  category: Goal['category'];
  priority: Goal['priority'];
  targetDate: Date;
  milestones?: Milestone[];
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  category?: Goal['category'];
  status?: Goal['status'];
  priority?: Goal['priority'];
  targetDate?: Date;
  progress?: number;
  milestones?: Milestone[];
}

// Goals Collection Reference
const goalsCollection = collection(db, 'goals');

// Goals Service
export const goalsService = {
  // Create a new goal
  async createGoal(userId: string, goalData: CreateGoalData): Promise<string> {
    try {
      const goalDoc = {
        ...goalData,
        userId,
        status: 'active' as const,
        progress: 0,
        milestones: goalData.milestones || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(goalsCollection, goalDoc);
      console.log('Goal created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error('Failed to create goal');
    }
  },

  // Update an existing goal
  async updateGoal(goalId: string, updateData: UpdateGoalData): Promise<void> {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      console.log('Goal updated successfully:', goalId);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error('Failed to update goal');
    }
  },

  // Delete a goal
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await deleteDoc(goalRef);
      console.log('Goal deleted successfully:', goalId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error('Failed to delete goal');
    }
  },

  // Get a single goal by ID
  async getGoal(goalId: string): Promise<Goal | null> {
    try {
      const goalRef = doc(db, 'goals', goalId);
      const goalDoc = await getDocs(query(goalsCollection, where('__name__', '==', goalId)));
      
      if (goalDoc.empty) {
        return null;
      }

      const goalData = goalDoc.docs[0].data();
      return {
        id: goalDoc.docs[0].id,
        ...goalData,
        targetDate: goalData.targetDate?.toDate() || new Date(),
        createdAt: goalData.createdAt?.toDate() || new Date(),
        updatedAt: goalData.updatedAt?.toDate() || new Date(),
      } as Goal;
    } catch (error) {
      console.error('Error getting goal:', error);
      throw new Error('Failed to get goal');
    }
  },

  // Subscribe to user's goals in real-time
  subscribeToUserGoals(userId: string, callback: (goals: Goal[]) => void): () => void {
    try {
      // Temporarily disable Firestore operations until permissions are configured
      // TODO: Re-enable once Firestore rules are properly set up
      console.log('Firestore goals subscription temporarily disabled');
      callback([]);
      return () => {
        console.log('Dummy unsubscribe called for goals');
      };

      /*
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(goalsQuery, (snapshot) => {
        const goals: Goal[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          goals.push({
            id: doc.id,
            ...data,
            targetDate: data.targetDate?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Goal);
        });
        callback(goals);
      }, (error) => {
        console.error('Error subscribing to goals:', error);
        // Return empty array on error to prevent app crash
        callback([]);
      });

      return unsubscribe;
      */
    } catch (error) {
      console.error('Error setting up goals subscription:', error);
      // Return empty array on error to prevent app crash
      callback([]);
      return () => {};
    }
  },

  // Update goal progress
  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      const goalRef = doc(db, 'goals', goalId);
      await updateDoc(goalRef, {
        progress,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw new Error('Failed to update goal progress');
    }
  },

  // Toggle milestone completion
  async toggleMilestone(goalId: string, milestoneId: string, completed: boolean): Promise<void> {
    try {
      const goal = await this.getGoal(goalId);
      if (!goal) throw new Error('Goal not found');

      const updatedMilestones = goal.milestones.map(milestone =>
        milestone.id === milestoneId ? { ...milestone, completed } : milestone
      );

      const completedMilestones = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedMilestones / updatedMilestones.length) * 100);

      await this.updateGoal(goalId, {
        milestones: updatedMilestones,
        progress,
      });
    } catch (error) {
      console.error('Error toggling milestone:', error);
      throw new Error('Failed to toggle milestone');
    }
  },

  // Search goals
  async searchGoals(userId: string, searchTerm: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const goal = {
          id: doc.id,
          ...data,
          targetDate: data.targetDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal;

        // Filter by search term
        if (
          goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error searching goals:', error);
      throw new Error('Failed to search goals');
    }
  },

  // Get goals by category
  async getGoalsByCategory(userId: string, category: Goal['category']): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          targetDate: data.targetDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal);
      });

      return goals;
    } catch (error) {
      console.error('Error getting goals by category:', error);
      throw new Error('Failed to get goals by category');
    }
  },

  // Get goals by status
  async getGoalsByStatus(userId: string, status: Goal['status']): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        goals.push({
          id: doc.id,
          ...data,
          targetDate: data.targetDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal);
      });

      return goals;
    } catch (error) {
      console.error('Error getting goals by status:', error);
      throw new Error('Failed to get goals by status');
    }
  },

  // Get overdue goals
  async getOverdueGoals(userId: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('targetDate', 'asc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      const now = new Date();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const goal = {
          id: doc.id,
          ...data,
          targetDate: data.targetDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal;

        if (goal.targetDate < now) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error getting overdue goals:', error);
      throw new Error('Failed to get overdue goals');
    }
  },

  // Get goals due soon (within next 7 days)
  async getGoalsDueSoon(userId: string): Promise<Goal[]> {
    try {
      const goalsQuery = query(
        goalsCollection,
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('targetDate', 'asc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals: Goal[] = [];
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const goal = {
          id: doc.id,
          ...data,
          targetDate: data.targetDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Goal;

        if (goal.targetDate >= now && goal.targetDate <= sevenDaysFromNow) {
          goals.push(goal);
        }
      });

      return goals;
    } catch (error) {
      console.error('Error getting goals due soon:', error);
      throw new Error('Failed to get goals due soon');
    }
  },
};

// AI Suggestions Service
export const aiSuggestionsService = {
  // Generate AI suggestions for a goal
  async generateSuggestions(goalId: string, goalTitle: string, goalDescription: string): Promise<GoalSuggestion> {
    try {
      // For now, we'll use a mock AI service
      // In production, this would call a Cloud Function or external AI API
      const suggestions = await this.mockAIService(goalTitle, goalDescription);
      
      const suggestionDoc = {
        goalId,
        suggestions: suggestions.suggestions,
        tips: suggestions.tips,
        subtasks: suggestions.subtasks,
        generatedAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      const suggestionsRef = collection(db, 'goals', goalId, 'suggestions');
      const docRef = await addDoc(suggestionsRef, suggestionDoc);
      
      return {
        id: docRef.id,
        goalId,
        suggestions: suggestions.suggestions,
        tips: suggestions.tips,
        subtasks: suggestions.subtasks,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  },

  // Get AI suggestions for a goal
  async getSuggestions(goalId: string): Promise<GoalSuggestion | null> {
    try {
      const suggestionsRef = collection(db, 'goals', goalId, 'suggestions');
      const suggestionsQuery = query(suggestionsRef, orderBy('generatedAt', 'desc'));
      const snapshot = await getDocs(suggestionsQuery);
      
      if (snapshot.empty) {
        return null;
      }

      const latestSuggestion = snapshot.docs[0];
      const data = latestSuggestion.data();
      
      return {
        id: latestSuggestion.id,
        goalId,
        suggestions: data.suggestions || [],
        tips: data.tips || [],
        subtasks: data.subtasks || [],
        generatedAt: data.generatedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      throw new Error('Failed to get AI suggestions');
    }
  },

  // Subscribe to AI suggestions in real-time
  subscribeToSuggestions(goalId: string, callback: (suggestion: GoalSuggestion | null) => void): () => void {
    try {
      const suggestionsRef = collection(db, 'goals', goalId, 'suggestions');
      const suggestionsQuery = query(suggestionsRef, orderBy('generatedAt', 'desc'));

      const unsubscribe = onSnapshot(suggestionsQuery, (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const latestSuggestion = snapshot.docs[0];
        const data = latestSuggestion.data();
        
        const suggestion: GoalSuggestion = {
          id: latestSuggestion.id,
          goalId,
          suggestions: data.suggestions || [],
          tips: data.tips || [],
          subtasks: data.subtasks || [],
          generatedAt: data.generatedAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date(),
        };

        callback(suggestion);
      }, (error) => {
        console.error('Error subscribing to suggestions:', error);
        // Return null on error to prevent app crash
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up suggestions subscription:', error);
      // Return null on error to prevent app crash
      callback(null);
      return () => {};
    }
  },

  // Mock AI service (replace with real AI integration)
  async mockAIService(title: string, description: string): Promise<{
    suggestions: string[];
    tips: string[];
    subtasks: string[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const category = this.detectCategory(title, description);
    
    return {
      suggestions: [
        `Break down "${title}" into smaller, manageable tasks`,
        `Set specific milestones with deadlines`,
        `Track your progress regularly`,
        `Celebrate small wins along the way`,
      ],
      tips: [
        `Start with the most important tasks first`,
        `Review your progress weekly`,
        `Adjust your timeline if needed`,
        `Share your goal with someone for accountability`,
      ],
      subtasks: this.generateSubtasks(title, category),
    };
  },

  // Detect goal category from title and description
  detectCategory(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('work') || text.includes('career') || text.includes('job')) return 'work';
    if (text.includes('health') || text.includes('fitness') || text.includes('exercise')) return 'health';
    if (text.includes('learn') || text.includes('study') || text.includes('education')) return 'learning';
    if (text.includes('money') || text.includes('save') || text.includes('financial')) return 'financial';
    return 'personal';
  },

  // Generate subtasks based on goal title and category
  generateSubtasks(title: string, category: string): string[] {
    const subtasks: string[] = [];
    
    switch (category) {
      case 'work':
        subtasks.push(
          'Research best practices',
          'Create a detailed plan',
          'Set up necessary tools',
          'Track progress metrics'
        );
        break;
      case 'health':
        subtasks.push(
          'Consult with a professional',
          'Create a workout schedule',
          'Plan healthy meals',
          'Monitor your progress'
        );
        break;
      case 'learning':
        subtasks.push(
          'Find learning resources',
          'Create a study schedule',
          'Practice regularly',
          'Test your knowledge'
        );
        break;
      case 'financial':
        subtasks.push(
          'Create a budget',
          'Set up automatic savings',
          'Track your expenses',
          'Review and adjust monthly'
        );
        break;
      default:
        subtasks.push(
          'Define clear objectives',
          'Create a timeline',
          'Set up reminders',
          'Review progress regularly'
        );
    }
    
    return subtasks;
  },
}; 