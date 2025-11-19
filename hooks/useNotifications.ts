import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { notificationApi, type Notification, type NotificationPreferences } from '@/lib/api/notifications';
import { notificationService, type NotificationEvent } from '@/lib/notificationService';

// Re-export types for backward compatibility
export type { Notification, NotificationPreferences } from '@/lib/api/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  getNotificationById: (notificationId: string) => Promise<Notification | null>;
  getNotificationTemplates: () => Promise<any[]>;
  getNotificationTemplateById: (templateId: number) => Promise<any | null>;
}

export function useNotifications(): UseNotificationsReturn {
  const dispatch = useAppDispatch();
  const { user, tokens } = useAppSelector(state => state.auth);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (unreadOnly: boolean = false) => {
    if (!user || !tokens) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔔 Fetching notifications...', { unreadOnly, user: user.email });
      const result = await notificationApi.getNotifications(unreadOnly);
      console.log('🔔 Notifications API result:', result);
      
      if (result.success) {
        // Handle paginated response structure
        let notificationsData: Notification[];
        if (result.results) {
          // Paginated response
          notificationsData = result.results;
          console.log('🔔 Using paginated results:', notificationsData.length, 'notifications');
        } else if (Array.isArray(result.data)) {
          // Direct array response
          notificationsData = result.data;
          console.log('🔔 Using direct data:', notificationsData.length, 'notifications');
        } else {
          notificationsData = [];
          console.log('🔔 No notifications found, using empty array');
        }
        
        setNotifications(notificationsData);
        // Count unread notifications
        const unread = notificationsData.filter(notification => !notification.is_read).length;
        setUnreadCount(unread);
        console.log('🔔 Set notifications:', notificationsData.length, 'total,', unread, 'unread');
      } else {
        console.error('🔔 API Error:', result.error);
        setError(result.error || 'حدث خطأ أثناء جلب الإشعارات');
      }
    } catch (err) {
      console.error('🔔 Fetch Error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
    } finally {
      setIsLoading(false);
    }
  }, [user, tokens]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user || !tokens) return false;
    
    try {
      const result = await notificationApi.markNotificationsAsRead([notificationId]);
      
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          )
        );
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      } else {
        setError(result.error || 'حدث خطأ أثناء تعليم الإشعار كمقروء');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return false;
    }
  }, [user, tokens]);

  const markAllAsRead = useCallback(async () => {
    if (!user || !tokens) return false;
    
    try {
      const result = await notificationApi.markAllNotificationsAsRead();
      
      if (result.success) {
        // Update local state - mark all as read
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: true }))
        );
        // Reset unread count
        setUnreadCount(0);
        return true;
      } else {
        setError(result.error || 'حدث خطأ أثناء تعليم جميع الإشعارات كمقروءة');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return false;
    }
  }, [user, tokens]);

  const fetchPreferences = useCallback(async () => {
    if (!user || !tokens) return;
    
    try {
      const result = await notificationApi.getNotificationPreferences();
      
      if (result.success && result.data) {
        setPreferences(result.data);
      } else {
        // If endpoint doesn't exist (404), set default preferences instead of showing error
        if (result.error?.includes('404') || result.error?.includes('Not found')) {
          console.log('Notification preferences endpoint not available, using defaults');
          setPreferences({
            id: 0,
            user: 0,
            in_app_enabled: true,
            email_enabled: true,
            course_notifications: true,
            assignment_notifications: true,
            meeting_notifications: true,
            system_notifications: true,
            performance_notifications: true,
            email_frequency: 'daily',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setError(result.error || 'حدث خطأ أثناء جلب تفضيلات الإشعارات');
        }
      }
    } catch (err) {
      // Handle 404 errors gracefully
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('Not found'))) {
        console.log('Notification preferences endpoint not available, using defaults');
        setPreferences({
          id: 0,
          user: 0,
          in_app_enabled: true,
          email_enabled: true,
          course_notifications: true,
          assignment_notifications: true,
          meeting_notifications: true,
          system_notifications: true,
          performance_notifications: true,
          email_frequency: 'daily',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      }
    }
  }, [user, tokens]);

  const updatePreferences = useCallback(async (preferencesData: Partial<NotificationPreferences>) => {
    if (!user || !tokens || !preferences) return false;
    
    try {
      // Use PATCH for partial updates instead of PUT
      const result = await notificationApi.updateNotificationPreferencesPartial(preferencesData);
      
      if (result.success && result.data) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'حدث خطأ أثناء تحديث تفضيلات الإشعارات');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return false;
    }
  }, [user, tokens, preferences]);

  // New methods for additional functionality
  const getNotificationById = useCallback(async (notificationId: string): Promise<Notification | null> => {
    if (!user || !tokens) return null;
    
    try {
      const result = await notificationApi.getNotificationById(notificationId);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'حدث خطأ أثناء جلب تفاصيل الإشعار');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return null;
    }
  }, [user, tokens]);

  const getNotificationTemplates = useCallback(async (): Promise<any[]> => {
    if (!user || !tokens) return [];
    
    try {
      const result = await notificationApi.getNotificationTemplates();
      
      if (result.success) {
        // Handle paginated response structure
        if (result.results) {
          return result.results;
        } else if (Array.isArray(result.data)) {
          return result.data;
        } else {
          return [];
        }
      } else {
        setError(result.error || 'حدث خطأ أثناء جلب قوالب الإشعارات');
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return [];
    }
  }, [user, tokens]);

  const getNotificationTemplateById = useCallback(async (templateId: number): Promise<any | null> => {
    if (!user || !tokens) return null;
    
    try {
      const result = await notificationApi.getNotificationTemplateById(templateId);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || 'حدث خطأ أثناء جلب قالب الإشعار');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      return null;
    }
  }, [user, tokens]);

  // Fetch notifications and preferences on mount
  useEffect(() => {
    if (user && tokens) {
      fetchNotifications();
      fetchPreferences();
      
      // // Set up polling for notifications every 2 minutes (reduced from 30 seconds)
      // const interval = setInterval(() => {
      //   console.log('🔄 Polling for new notifications...');
      //   fetchNotifications();
      // }, 120000); // 2 minutes instead of 30 seconds
      
      // Subscribe to real-time notification events
      const unsubscribe = notificationService.subscribe((event: NotificationEvent) => {
        console.log('🔔 Real-time notification received:', event);
        // Refresh notifications when a new event occurs
        fetchNotifications();
      });
      
      return () => {
        // clearInterval(interval);
        unsubscribe();
      };
    }
  }, [user, tokens]); // Removed fetchNotifications and fetchPreferences from dependencies

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchPreferences,
    updatePreferences,
    getNotificationById,
    getNotificationTemplates,
    getNotificationTemplateById
  };
}
