'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRequestStatus, canMakeRequest, waitForAvailableSlot, UserRole, rateLimiter } from '@/lib/rateLimiter';

interface RateLimitStatus {
  role: UserRole;
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

interface UseRateLimitOptions {
  endpoint?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onLimitReached?: () => void;
  onLimitWarning?: (percentage: number) => void;
  warningThreshold?: number;
}

interface UseRateLimitReturn {
  status: RateLimitStatus;
  canMakeRequest: boolean;
  isNearLimit: boolean;
  isAtLimit: boolean;
  isFrozen: boolean;
  freezeEndTime: number | null;
  timeUntilReset: number;
  timeUntilUnfreeze: number;
  percentage: number;
  checkRequest: () => boolean;
  waitForSlot: (maxWaitMs?: number) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Hook لإدارة Rate Limiting في المكونات
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const {
    endpoint,
    autoRefresh = true,
    refreshInterval = 1000,
    onLimitReached,
    onLimitWarning,
    warningThreshold = 80,
  } = options;

  const [status, setStatus] = useState<RateLimitStatus>(getRequestStatus(endpoint));
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [freezeEndTime, setFreezeEndTime] = useState<number | null>(null);
  const [timeUntilUnfreeze, setTimeUntilUnfreeze] = useState(0);

  const refresh = useCallback(() => {
    const newStatus = getRequestStatus(endpoint);
    setStatus(newStatus);

    const now = Date.now();
    const timeLeft = Math.max(0, newStatus.resetTime - now);
    setTimeUntilReset(Math.ceil(timeLeft / 1000));

    // فحص التجميد
    const currentFreezeEndTime = rateLimiter.getFreezeEndTime(endpoint);
    setFreezeEndTime(currentFreezeEndTime);

    if (currentFreezeEndTime) {
      const freezeTimeLeft = Math.max(0, currentFreezeEndTime - now);
      setTimeUntilUnfreeze(Math.ceil(freezeTimeLeft / 1000));

      if (onLimitReached) {
        onLimitReached();
      }
    } else {
      setTimeUntilUnfreeze(0);
    }

    // تحقق من الوصول للحد الأقصى
    if (newStatus.current >= newStatus.limit && onLimitReached) {
      onLimitReached();
    }

    // تحقق من اقتراب الوصول للحد الأقصى
    const percentage = (newStatus.current / newStatus.limit) * 100;
    if (percentage >= warningThreshold && percentage < 100 && onLimitWarning) {
      onLimitWarning(percentage);
    }
  }, [endpoint, onLimitReached, onLimitWarning, warningThreshold]);

  useEffect(() => {
    if (!autoRefresh) return;

    refresh();
    const interval = setInterval(refresh, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refresh, refreshInterval]);

  const checkRequest = useCallback(() => {
    return canMakeRequest(endpoint);
  }, [endpoint]);

  const waitForSlot = useCallback(async (maxWaitMs: number = 5000) => {
    return waitForAvailableSlot(endpoint, maxWaitMs);
  }, [endpoint]);

  const canMake = canMakeRequest(endpoint);
  const percentage = (status.current / status.limit) * 100;
  const isNearLimit = percentage >= warningThreshold;
  const isAtLimit = status.current >= status.limit;

  return {
    status,
    canMakeRequest: canMake,
    isNearLimit,
    isAtLimit,
    isFrozen: freezeEndTime !== null,
    freezeEndTime,
    timeUntilReset,
    timeUntilUnfreeze,
    percentage,
    checkRequest,
    waitForSlot,
    refresh,
  };
}

/**
 * Hook مبسط للتحقق السريع من إمكانية إرسال الطلب
 */
export function useCanMakeRequest(endpoint?: string): boolean {
  const [canMake, setCanMake] = useState(canMakeRequest(endpoint));

  useEffect(() => {
    const checkAndUpdate = () => {
      setCanMake(canMakeRequest(endpoint));
    };

    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 1000);

    return () => clearInterval(interval);
  }, [endpoint]);

  return canMake;
}

/**
 * Hook للانتظار حتى يصبح الطلب متاحاً
 */
export function useWaitForRequest(endpoint?: string) {
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waitAndExecute = useCallback(async <T>(
    requestFn: () => Promise<T>,
    maxWaitMs: number = 5000
  ): Promise<T | null> => {
    setIsWaiting(true);
    setError(null);

    try {
      // انتظار حتى يصبح الطلب متاحاً
      const available = await waitForAvailableSlot(endpoint, maxWaitMs);
      
      if (!available) {
        throw new Error('انتهت مهلة الانتظار. يرجى المحاولة مرة أخرى لاحقاً.');
      }

      // تنفيذ الطلب
      const result = await requestFn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      return null;
    } finally {
      setIsWaiting(false);
    }
  }, [endpoint]);

  return {
    waitAndExecute,
    isWaiting,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook لمراقبة حالة Rate Limiting مع إشعارات
 */
export function useRateLimitMonitor(options: {
  endpoint?: string;
  showNotifications?: boolean;
  warningThreshold?: number;
} = {}) {
  const { endpoint, showNotifications = true, warningThreshold = 80 } = options;

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  // تتبع آخر إشعار لتجنب التكرار
  const lastNotificationRef = useRef<{type: string, message: string, timestamp: number} | null>(null);

  const addNotification = useCallback((type: 'warning' | 'error' | 'info', message: string) => {
    if (!showNotifications) return;

    // تحقق من التكرار باستخدام ref
    const now = Date.now();
    const lastNotification = lastNotificationRef.current;

    if (lastNotification &&
        lastNotification.type === type &&
        lastNotification.message === message &&
        (now - lastNotification.timestamp) < 3000) { // خلال 3 ثوان
      return; // تجاهل الإشعار المكرر
    }

    // تحديث آخر إشعار
    lastNotificationRef.current = { type, message, timestamp: now };

    const notification = {
      id: `${now}_${Math.random().toString(36).substr(2, 9)}`, // مفتاح فريد
      type,
      message,
      timestamp: now,
    };

    // الاحتفاظ بإشعار واحد فقط لتجنب الازدحام
    setNotifications([notification]);

    // إزالة الإشعار تلقائياً - أوقات مختلفة حسب النوع
    const autoCloseTime = type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, autoCloseTime);
  }, [showNotifications]);

  // Debounced callbacks لتجنب الإشعارات المتكررة
  const debouncedLimitReached = useCallback(() => {
    addNotification('error', 'تم الوصول للحد الأقصى من الطلبات. يرجى الانتظار قبل المحاولة مرة أخرى.');
  }, [addNotification]);

  const debouncedLimitWarning = useCallback((percentage: number) => {
    addNotification('warning', `اقتراب من الحد الأقصى للطلبات (${Math.round(percentage)}%). يرجى تقليل عدد الطلبات.`);
  }, [addNotification]);

  const rateLimitData = useRateLimit({
    endpoint,
    onLimitReached: debouncedLimitReached,
    onLimitWarning: debouncedLimitWarning,
    warningThreshold,
    autoRefresh: true,
    refreshInterval: 2000, // تحديث كل ثانيتين بدلاً من كل ثانية
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    ...rateLimitData,
    notifications,
    clearNotifications,
    removeNotification,
  };
}
