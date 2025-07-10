import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { messaging, db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notificationPermission: NotificationPermission;
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, body: string, data?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, scheduledTime: Date, data?: any) => Promise<void>;
  clearNotifications: () => void;
  notifications: NotificationItem[];
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  type: 'task' | 'goal' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export { NotificationContext };

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Request notification permission
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await initializeFCM();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Initialize Firebase Cloud Messaging
  const initializeFCM = async () => {
    try {
      if (!currentUser) return;

      // Check if service worker is available
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported, skipping FCM initialization');
        return;
      }

      // Check if messaging is supported
      if (!messaging) {
        console.log('Firebase Messaging not available, skipping FCM initialization');
        return;
      }

      // Get FCM token with proper error handling
      try {
        const token = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        });

        if (token) {
          setFcmToken(token);
          console.log('FCM token obtained successfully');
          
          // Temporarily disable Firestore operations
          // TODO: Re-enable once Firestore is properly configured
          /*
          // Save token to user's profile
          await updateDoc(doc(db, 'users', currentUser.uid), {
            fcmToken: token,
            notificationSettings: {
              enabled: true,
              lastUpdated: new Date(),
            },
          });
          */
        } else {
          console.log('No FCM token available');
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        // Don't fail the entire initialization if token fails
      }

      // Listen for foreground messages with proper error handling
      try {
        onMessage(messaging, (payload) => {
          console.log('Message received:', payload);
          
          const notification: NotificationItem = {
            id: Date.now().toString(),
            title: payload.notification?.title || 'New notification',
            body: payload.notification?.body || '',
            data: payload.data,
            timestamp: new Date(),
            read: false,
            type: (payload.data?.type as any) || 'system',
            priority: (payload.data?.priority as any) || 'medium',
          };

          setNotifications(prev => [notification, ...prev]);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            try {
              new Notification(notification.title, {
                body: notification.body,
                icon: '/logo192.png',
                badge: '/logo192.png',
                tag: notification.id,
                data: notification.data,
              });
            } catch (notificationError) {
              console.error('Error showing browser notification:', notificationError);
            }
          }
        });
      } catch (messageError) {
        console.error('Error setting up message listener:', messageError);
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
    }
  };

  // Send immediate notification
  const sendNotification = async (title: string, body: string, data?: any) => {
    try {
      if (!currentUser) return;

      const notification: NotificationItem = {
        id: Date.now().toString(),
        title,
        body,
        data: data || {}, // Ensure data is never undefined
        timestamp: new Date(),
        read: false,
        type: data?.type || 'system',
        priority: data?.priority || 'medium',
      };

      // Temporarily disable Firestore operations until permissions are configured
      // TODO: Re-enable once Firestore rules are properly set up
      /*
      // Save to Firestore
      await setDoc(doc(db, 'notifications', notification.id), {
        ...notification,
        userId: currentUser.uid,
        timestamp: new Date(),
      });
      */

      setNotifications(prev => [notification, ...prev]);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: notification.id,
          data: data || {},
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Schedule notification
  const scheduleNotification = async (title: string, body: string, scheduledTime: Date, data?: any) => {
    try {
      if (!currentUser) return;

      const notification: NotificationItem = {
        id: Date.now().toString(),
        title,
        body,
        data: data || {}, // Ensure data is never undefined
        timestamp: scheduledTime,
        read: false,
        type: data?.type || 'reminder',
        priority: data?.priority || 'medium',
      };

      // Temporarily disable Firestore operations until permissions are configured
      // TODO: Re-enable once Firestore rules are properly set up
      /*
      // Save scheduled notification to Firestore
      await setDoc(doc(db, 'scheduled-notifications', notification.id), {
        ...notification,
        userId: currentUser.uid,
        scheduledTime,
        sent: false,
      });
      */

      // Schedule browser notification
      if (Notification.permission === 'granted') {
        const timeUntilNotification = scheduledTime.getTime() - Date.now();
        
        if (timeUntilNotification > 0) {
          setTimeout(() => {
            new Notification(title, {
              body,
              icon: '/logo192.png',
              badge: '/logo192.png',
              tag: notification.id,
              data: data || {},
            });
            
            // Add to notifications list
            setNotifications(prev => [notification, ...prev]);
          }, timeUntilNotification);
        }
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update in Firestore
      if (currentUser) {
        await updateDoc(doc(db, 'notifications', notificationId), {
          read: true,
          readAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Update all in Firestore
      if (currentUser) {
        const batch = writeBatch(db);
        notifications.forEach(notification => {
          const ref = doc(db, 'notifications', notification.id);
          batch.update(ref, {
            read: true,
            readAt: new Date(),
          });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Load user's notifications
  const loadNotifications = async () => {
    if (!currentUser) return;

    try {
      // This would typically fetch from Firestore
      // For now, we'll use local state
      console.log('Loading notifications for user:', currentUser.uid);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    // Check notification permission on mount
    setNotificationPermission(Notification.permission);

    if (Notification.permission === 'granted') {
      initializeFCM();
    }

    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser]);

  const value: NotificationContextType = {
    notificationPermission,
    fcmToken,
    requestPermission,
    sendNotification,
    scheduleNotification,
    clearNotifications,
    notifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 