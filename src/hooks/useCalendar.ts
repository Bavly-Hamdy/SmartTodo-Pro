import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToTasks, createTask, updateTask, deleteTask, Task } from '../services/tasksService';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day';
  currentDate: Date;
}

export const useCalendar = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date()
  });

  // Subscribe to tasks and convert to calendar events
  useEffect(() => {
    if (!currentUser) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTasks(
      currentUser.uid,
      (tasks: Task[]) => {
        const calendarEvents: CalendarEvent[] = tasks
          .filter(task => task.dueDate) // Only include tasks with due dates
          .map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate!,
            priority: task.priority,
            status: task.status,
            category: task.category,
            userId: task.userId,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          }));

        setEvents(calendarEvents);
        setLoading(false);
      },
      {
        orderBy: 'dueDate'
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Create a new task
  const addEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const taskId = await createTask(currentUser.uid, {
        title: eventData.title,
        description: eventData.description,
        priority: eventData.priority,
        dueDate: eventData.dueDate,
        category: eventData.category,
      });

      return taskId;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create event');
    }
  }, [currentUser]);

  // Update an existing task
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await updateTask(currentUser.uid, eventId, updates);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update event');
    }
  }, [currentUser]);

  // Delete a task
  const deleteEvent = useCallback(async (eventId: string) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await deleteTask(currentUser.uid, eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete event');
    }
  }, [currentUser]);

  // Update task due date (for drag and drop)
  const updateEventDate = useCallback(async (eventId: string, newDate: Date) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await updateTask(currentUser.uid, eventId, { dueDate: newDate });
    } catch (error) {
      console.error('Error updating event date:', error);
      throw new Error('Failed to update event date');
    }
  }, [currentUser]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dueDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  // Get events for a date range
  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dueDate);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }, [events]);

  // Navigate calendar view
  const navigateView = useCallback((direction: 'prev' | 'next') => {
    setView(prev => {
      const newDate = new Date(prev.currentDate);
      
      switch (prev.type) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
      }
      
      return { ...prev, currentDate: newDate };
    });
  }, []);

  // Change view type
  const changeView = useCallback((viewType: 'month' | 'week' | 'day') => {
    setView(prev => ({ ...prev, type: viewType }));
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    setView(prev => ({ ...prev, currentDate: new Date() }));
  }, []);

  return {
    events,
    loading,
    error,
    view,
    addEvent,
    updateEvent,
    deleteEvent,
    updateEventDate,
    getEventsForDate,
    getEventsForDateRange,
    navigateView,
    changeView,
    goToToday,
  };
}; 