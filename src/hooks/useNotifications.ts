import { useState, useEffect, useCallback } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: 'task' | 'goal' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
  userId: string;
}

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const { sendNotification } = useNotification();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to user's notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Temporarily disable Firestore operations until permissions are configured
    // TODO: Re-enable once Firestore rules are properly set up
    console.log('Firestore notifications operations temporarily disabled');
    setNotifications([]);
    setIsLoading(false);

    /*
    const unsubscribe: Unsubscribe = onSnapshot(
      query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        const notifications: NotificationItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notifications.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as NotificationItem);
        });
        setNotifications(notifications);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error subscribing to notifications:', error);
        setError('Failed to load notifications');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
    */

    return () => {
      console.log('Dummy notifications unsubscribe called');
    };
  }, [currentUser?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!currentUser?.uid) return;

    try {
      // Temporarily disabled
      console.log('Would mark notification as read:', notificationId);
      
      /*
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date(),
      });
      */

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      sendNotification('Failed to mark notification as read', 'error');
    }
  }, [currentUser?.uid, sendNotification]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      // Temporarily disabled
      console.log('Would mark all notifications as read');
      
      /*
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          read: true,
          readAt: new Date(),
        });
      });
      
      await batch.commit();
      */

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      sendNotification('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      sendNotification('Failed to mark all notifications as read', 'error');
    }
  }, [currentUser?.uid, notifications, sendNotification]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get upcoming tasks (due within next 24 hours)
  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return notifications.filter(notification => {
      if (notification.type !== 'task') return false;
      
      const dueDate = notification.data?.dueDate;
      if (!dueDate) return false;
      
      const taskDueDate = new Date(dueDate);
      return taskDueDate >= now && taskDueDate <= tomorrow;
    });
  }, [notifications]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getUpcomingTasks,
  };
}; 