'use client';

import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  created_at: string;
  is_read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

interface StudentNotificationsProps {
  className?: string;
}

export default function StudentNotifications({ className = '' }: StudentNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousUnreadCount = useRef(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    // const interval = setInterval(fetchNotifications, 30000);
    // return () => clearInterval(interval);
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.preload = 'auto';
  }, []);

  // Play sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > previousUnreadCount.current && previousUnreadCount.current > 0) {
      playNotificationSound();
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log('Could not play notification sound:', error);
        });
      }
    } catch (error) {
      console.log('Error playing notification sound:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Try to get notifications from localStorage first
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        setNotifications(notifications);
        setUnreadCount(notifications.filter((n: Notification) => !n.is_read).length);
        return;
      }

      // If no notifications in localStorage, start with empty array
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update localStorage
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        const updatedNotifications = notifications.map((n: Notification) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        const updatedNotifications = notifications.map((n: Notification) => ({ ...n, is_read: true }));
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_created':
        return 'fas fa-video text-blue-600';
      case 'course_approved':
        return 'fas fa-check-circle text-green-600';
      case 'course_request_created':
        return 'fas fa-plus-circle text-purple-600';
      case 'assignment_due':
        return 'fas fa-clock text-orange-600';
      default:
        return 'fas fa-bell text-gray-600';
    }
  };


  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="الإشعارات"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[32rem] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center me-3">
                  <i className="fas fa-bell text-white text-sm"></i>
                </div>
                الإشعارات
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-100"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full me-2 animate-pulse"></div>
                <p className="text-sm text-gray-700 font-medium">
                  {unreadCount} إشعار جديد
                </p>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <i className="fas fa-spinner fa-spin text-blue-500 text-lg"></i>
                </div>
                <p className="text-gray-600 font-medium">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <i className="fas fa-bell-slash text-2xl text-gray-400"></i>
                </div>
                <h4 className="text-gray-800 font-semibold mb-1">لا توجد إشعارات</h4>
                <p className="text-gray-500 text-sm">ستظهر الإشعارات الجديدة هنا</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    index !== notifications.length - 1 ? 'border-b border-gray-100' : ''
                  } ${!notification.is_read ? 'bg-blue-50/30' : 'bg-white'}`}
                >
                  {/* Priority indicator */}
                  <div className={`absolute right-0 top-0 bottom-0 w-1 ${
                    !notification.is_read 
                      ? notification.priority === 'high' 
                        ? 'bg-red-500' 
                        : notification.priority === 'medium' 
                          ? 'bg-yellow-500' 
                          : 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}></div>
                  
                  <div className="p-4 pr-6">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <i className={`${getNotificationIcon(notification.type)} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-sm font-semibold leading-tight ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed mb-3 ${
                          !notification.is_read ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            <i className="fas fa-clock me-1"></i>
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {notification.action_text && notification.action_url && (
                            <span className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                              <i className="fas fa-external-link-alt me-1"></i>
                              {notification.action_text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium py-2 rounded-lg hover:bg-gray-100"
              >
                <i className="fas fa-times me-2"></i>
                إغلاق الإشعارات
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
}
