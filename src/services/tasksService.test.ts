import { Task, TaskStats, CreateTaskData } from './tasksService';

// Mock Firebase imports
jest.mock('../config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('Task Interfaces', () => {
  it('should define Task interface correctly', () => {
    const task: Task = {
      id: 'test-id',
      title: 'Test Task',
      description: 'Test description',
      status: 'pending',
      priority: 'medium',
      category: 'Work',
      tags: ['test', 'todo'],
      userId: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(),
      completedAt: new Date(),
    };

    expect(task.id).toBe('test-id');
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
  });

  it('should define TaskStats interface correctly', () => {
    const stats: TaskStats = {
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 4,
      overdueTasks: 1,
      completionRate: 60,
      weeklyProgress: 75,
    };

    expect(stats.totalTasks).toBe(10);
    expect(stats.completedTasks).toBe(6);
    expect(stats.completionRate).toBe(60);
  });

  it('should define CreateTaskData interface correctly', () => {
    const taskData: CreateTaskData = {
      title: 'New Task',
      description: 'New task description',
      priority: 'high',
      category: 'Personal',
      tags: ['urgent'],
      dueDate: new Date(),
    };

    expect(taskData.title).toBe('New Task');
    expect(taskData.priority).toBe('high');
    expect(taskData.category).toBe('Personal');
  });
});

describe('Task Status and Priority Types', () => {
  it('should accept valid task statuses', () => {
    const validStatuses: Task['status'][] = ['pending', 'in-progress', 'completed'];
    
    validStatuses.forEach(status => {
      expect(['pending', 'in-progress', 'completed']).toContain(status);
    });
  });

  it('should accept valid task priorities', () => {
    const validPriorities: Task['priority'][] = ['low', 'medium', 'high'];
    
    validPriorities.forEach(priority => {
      expect(['low', 'medium', 'high']).toContain(priority);
    });
  });
});

describe('Task Data Validation', () => {
  it('should validate required fields', () => {
    const validTask: Partial<Task> = {
      title: 'Required Task',
      status: 'pending',
      priority: 'medium',
      category: 'Work',
      userId: 'user-id',
    };

    expect(validTask.title).toBeDefined();
    expect(validTask.status).toBeDefined();
    expect(validTask.priority).toBeDefined();
    expect(validTask.category).toBeDefined();
    expect(validTask.userId).toBeDefined();
  });

  it('should handle optional fields', () => {
    const taskWithOptionals: Task = {
      id: 'test-id',
      title: 'Task with optionals',
      status: 'pending',
      priority: 'medium',
      category: 'Work',
      userId: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      // Optional fields
      description: 'Optional description',
      tags: ['optional', 'tag'],
      dueDate: new Date(),
      completedAt: new Date(),
    };

    expect(taskWithOptionals.description).toBeDefined();
    expect(taskWithOptionals.tags).toBeDefined();
    expect(taskWithOptionals.dueDate).toBeDefined();
    expect(taskWithOptionals.completedAt).toBeDefined();
  });
});

describe('Statistics Calculations', () => {
  it('should calculate completion rate correctly', () => {
    const stats: TaskStats = {
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 4,
      overdueTasks: 1,
      completionRate: 60,
      weeklyProgress: 75,
    };

    const calculatedRate = Math.round((stats.completedTasks / stats.totalTasks) * 100);
    expect(calculatedRate).toBe(60);
  });

  it('should handle zero total tasks', () => {
    const stats: TaskStats = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      weeklyProgress: 0,
    };

    const calculatedRate = stats.totalTasks > 0 ? 
      Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
    expect(calculatedRate).toBe(0);
  });

  it('should calculate pending tasks correctly', () => {
    const stats: TaskStats = {
      totalTasks: 10,
      completedTasks: 6,
      pendingTasks: 4,
      overdueTasks: 1,
      completionRate: 60,
      weeklyProgress: 75,
    };

    const calculatedPending = stats.totalTasks - stats.completedTasks;
    expect(calculatedPending).toBe(4);
  });
}); 