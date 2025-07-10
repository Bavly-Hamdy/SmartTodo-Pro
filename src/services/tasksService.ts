import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: string;
  tags?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  weeklyProgress: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  category: string;
  tags?: string[];
}

// Collection reference
const getTasksCollection = (userId: string) => collection(db, 'tasks');

// Create a new task
export const createTask = async (userId: string, taskData: CreateTaskData): Promise<string> => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore create task operations temporarily disabled');
    const taskId = `temp-${Date.now()}`;
    console.log('Created temporary task with ID:', taskId);
    return taskId;

    /*
    const taskRef = doc(getTasksCollection(userId));
    const task: Omit<Task, 'id'> = {
      ...taskData,
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(taskRef, task);
    return taskRef.id;
    */
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
};

// Update a task
export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore update task operations temporarily disabled');
    console.log('Would update task:', taskId, 'with updates:', updates);
    return;

    /*
    const taskRef = doc(getTasksCollection(userId), taskId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(taskRef, updateData);
    console.log('Task updated successfully:', taskId);
    */
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
};

// Delete a task
export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore delete task operations temporarily disabled');
    console.log('Would delete task:', taskId);
    return;

    /*
    const taskRef = doc(getTasksCollection(userId), taskId);
    await deleteDoc(taskRef);
    console.log('Task deleted successfully:', taskId);
    */
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
};

// Subscribe to tasks with real-time updates
export const subscribeToTasks = (
  userId: string,
  callback: (tasks: Task[]) => void,
  options?: {
    status?: 'pending' | 'in-progress' | 'completed';
    limit?: number;
    orderBy?: 'createdAt' | 'dueDate' | 'priority';
  }
) => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore operations temporarily disabled - returning empty array');
    callback([]);
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Dummy unsubscribe called');
    };

    /*
    let q = query(getTasksCollection(userId), where('userId', '==', userId));

    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy, 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Task);
      });
      callback(tasks);
    }, (error) => {
      console.error('Error subscribing to tasks:', error);
    });
    */
  } catch (error) {
    console.error('Error setting up task subscription:', error);
    throw new Error('Failed to subscribe to tasks');
  }
};

// Search tasks by title or tags
export const searchTasks = (
  userId: string,
  searchTerm: string,
  callback: (tasks: Task[]) => void
) => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore search operations temporarily disabled - returning empty array');
    callback([]);
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Dummy search unsubscribe called');
    };

    /*
    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = [];
      const searchLower = searchTerm.toLowerCase();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Task;

        // Filter by title or tags
        if (
          task.title.toLowerCase().includes(searchLower) ||
          task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          tasks.push(task);
        }
      });

      callback(tasks);
    }, (error) => {
      console.error('Error searching tasks:', error);
    });
    */
  } catch (error) {
    console.error('Error setting up task search:', error);
    throw new Error('Failed to search tasks');
  }
};

// Get task statistics
export const getTaskStats = async (userId: string): Promise<TaskStats> => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore stats operations temporarily disabled - returning default stats');
    
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      weeklyProgress: 0,
    };

    /*
    const q = query(getTasksCollection(userId), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let weeklyCompleted = 0;
    let weeklyTotal = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalTasks++;

      if (data.status === 'completed') {
        completedTasks++;
        
        // Check if completed this week
        const completedAt = data.completedAt?.toDate();
        if (completedAt && completedAt >= startOfWeek && completedAt <= endOfWeek) {
          weeklyCompleted++;
        }
      }

      // Check for overdue tasks
      const dueDate = data.dueDate?.toDate();
      if (dueDate && dueDate < now && data.status !== 'completed') {
        overdueTasks++;
      }

      // Check if due this week
      if (dueDate && dueDate >= startOfWeek && dueDate <= endOfWeek) {
        weeklyTotal++;
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const weeklyProgress = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      overdueTasks,
      completionRate,
      weeklyProgress,
    };
    */
  } catch (error) {
    console.error('Error getting task stats:', error);
    throw new Error('Failed to get task statistics');
  }
};

// Get overdue tasks
export const getOverdueTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore overdue tasks operations temporarily disabled - returning empty array');
    callback([]);
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Dummy overdue tasks unsubscribe called');
    };

    /*
    const now = new Date();
    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      where('status', '!=', 'completed'),
      orderBy('dueDate', 'asc')
    );

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Task;

        // Filter overdue tasks
        if (task.dueDate && task.dueDate < now) {
          tasks.push(task);
        }
      });
      callback(tasks);
    }, (error) => {
      console.error('Error getting overdue tasks:', error);
    });
    */
  } catch (error) {
    console.error('Error setting up overdue tasks subscription:', error);
    throw new Error('Failed to get overdue tasks');
  }
};

// Get today's tasks
export const getTodayTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  try {
    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore today tasks operations temporarily disabled - returning empty array');
    callback([]);
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Dummy today tasks unsubscribe called');
    };

    /*
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const q = query(
      getTasksCollection(userId),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const task = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate(),
          completedAt: data.completedAt?.toDate(),
        } as Task;

        // Filter today's tasks
        if (task.dueDate && task.dueDate >= startOfDay && task.dueDate <= endOfDay) {
          tasks.push(task);
        }
      });
      callback(tasks);
    }, (error) => {
      console.error('Error getting today\'s tasks:', error);
    });
    */
  } catch (error) {
    console.error('Error setting up today\'s tasks subscription:', error);
    throw new Error('Failed to get today\'s tasks');
  }
}; 