'use client';

import React from 'react';
import { useRateLimitMonitor } from '@/hooks/useRateLimit';

interface RateLimitNotificationsProps {
  endpoint?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

const POSITION_CLASSES = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export default function RateLimitNotifications({
  endpoint,
  position = 'top-right',
  className = '',
}: RateLimitNotificationsProps) {
  const { notifications, removeNotification } = useRateLimitMonitor({
    endpoint,
    showNotifications: true,
  });

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed z-50 ${POSITION_CLASSES[position]} ${className}`}>
      <div className="space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
  };
  onRemove: () => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-400',
          iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-400',
          iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-400',
          iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div className={`${styles.bg} border rounded-lg shadow-lg p-4 transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
          </svg>
        </div>
        <div className="mr-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString('ar-EG')}
          </p>
        </div>
        <div className="flex-shrink-0 mr-2">
          <button
            onClick={onRemove}
            className={`${styles.text} hover:opacity-75 transition-opacity`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// مكون مبسط لعرض حالة Rate Limiting في شريط علوي
interface RateLimitBannerProps {
  endpoint?: string;
  showWhenNormal?: boolean;
  className?: string;
}

export function RateLimitBanner({ 
  endpoint, 
  showWhenNormal = false, 
  className = '' 
}: RateLimitBannerProps) {
  const { status, isNearLimit, isAtLimit, timeUntilReset, percentage } = useRateLimitMonitor({
    endpoint,
    showNotifications: false,
  });

  // إخفاء البانر إذا كان الوضع طبيعي ولا نريد عرضه
  if (!showWhenNormal && !isNearLimit && !isAtLimit) {
    return null;
  }

  const getBannerStyles = () => {
    if (isAtLimit) {
      return 'bg-red-100 border-red-300 text-red-800';
    }
    if (isNearLimit) {
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    }
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0s';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className={`border-l-4 p-3 ${getBannerStyles()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {isAtLimit ? (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : isNearLimit ? (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="mr-3">
            <p className="text-sm font-medium">
              {isAtLimit 
                ? 'تم الوصول للحد الأقصى من الطلبات' 
                : isNearLimit 
                ? `اقتراب من الحد الأقصى (${Math.round(percentage)}%)`
                : 'حالة الطلبات طبيعية'
              }
            </p>
            <p className="text-xs mt-1">
              استخدمت {status.current} من {status.limit} طلب. 
              {isAtLimit || isNearLimit ? ` إعادة تعيين خلال ${formatTime(timeUntilReset)}` : ` متبقي: ${status.remaining}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(100, percentage)}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
