'use client';

import React, { useState, useEffect } from 'react';
import { getRequestStatus, UserRole, rateLimiter } from '@/lib/rateLimiter';

interface RateLimitStatusProps {
  endpoint?: string;
  showDetails?: boolean;
  className?: string;
}

const ROLE_NAMES: Record<UserRole, string> = {
  anonymous: 'مستخدم غير مسجل',
  student: 'طالب',
  teacher: 'معلم',
  supervisor: 'مشرف',
  general_supervisor: 'مشرف عام',
  academic_supervisor: 'مشرف أكاديمي',
  admin: 'مشرف عام',
};

const ROLE_COLORS: Record<UserRole, string> = {
  anonymous: 'bg-gray-100 text-gray-800',
  student: 'bg-blue-100 text-blue-800',
  teacher: 'bg-green-100 text-green-800',
  supervisor: 'bg-purple-100 text-purple-800',
  general_supervisor: 'bg-purple-100 text-purple-800',
  academic_supervisor: 'bg-indigo-100 text-indigo-800',
  admin: 'bg-red-100 text-red-800',
};

export default function RateLimitStatus({
  endpoint,
  showDetails = false,
  className = ''
}: RateLimitStatusProps) {
  const [status, setStatus] = useState(getRequestStatus(endpoint));
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [freezeEndTime, setFreezeEndTime] = useState<number | null>(null);
  const [timeUntilUnfreeze, setTimeUntilUnfreeze] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
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
      } else {
        setTimeUntilUnfreeze(0);
      }
    };

    // تحديث فوري
    updateStatus();

    // تحديث كل ثانية
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [endpoint]);

  const getProgressColor = () => {
    const percentage = (status.current / status.limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
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

  if (!showDetails && status.current === 0) {
    return null; // لا تعرض شيئاً إذا لم تكن هناك طلبات
  }

  return (
    <div className={`rate-limit-status ${className}`}>
      {showDetails ? (
        // عرض مفصل
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[status.role]}`}>
                {ROLE_NAMES[status.role]}
              </span>
              <span className="text-sm text-gray-600">
                حد الطلبات
              </span>
              {freezeEndTime && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  🚫 مجمد
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {freezeEndTime ? (
                <span className="text-red-600 font-medium">
                  إلغاء التجميد خلال: {formatTime(timeUntilUnfreeze)}
                </span>
              ) : (
                <span>إعادة تعيين خلال: {formatTime(timeUntilReset)}</span>
              )}
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>الطلبات المستخدمة</span>
              <span className="font-medium">
                {status.current} / {status.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{
                  width: `${Math.min(100, (status.current / status.limit) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>متبقي: {status.remaining}</span>
            <span>
              {status.current >= status.limit ? (
                <span className="text-red-600 font-medium">تم الوصول للحد الأقصى</span>
              ) : (
                <span className="text-green-600">متاح</span>
              )}
            </span>
          </div>
        </div>
      ) : (
        // عرض مبسط
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${freezeEndTime ? 'bg-red-500' : getProgressColor()}`}
            />
            <span>{status.current}/{status.limit}</span>
            {freezeEndTime && (
              <span className="text-red-600 font-medium">🚫</span>
            )}
          </div>
          {freezeEndTime ? (
            <span className="text-red-600 font-medium">
              مجمد لـ {formatTime(timeUntilUnfreeze)}
            </span>
          ) : status.current >= status.limit ? (
            <span className="text-red-600">
              إعادة تعيين خلال {formatTime(timeUntilReset)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

// مكون تحذير عند اقتراب الوصول للحد الأقصى
interface RateLimitWarningProps {
  endpoint?: string;
  warningThreshold?: number; // النسبة المئوية للتحذير (افتراضي: 80%)
  onLimitReached?: () => void;
}

export function RateLimitWarning({ 
  endpoint, 
  warningThreshold = 80,
  onLimitReached 
}: RateLimitWarningProps) {
  const [status, setStatus] = useState(getRequestStatus(endpoint));
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const newStatus = getRequestStatus(endpoint);
      setStatus(newStatus);
      
      const percentage = (newStatus.current / newStatus.limit) * 100;
      const shouldShowWarning = percentage >= warningThreshold;
      
      setShowWarning(shouldShowWarning);
      
      if (newStatus.current >= newStatus.limit && onLimitReached) {
        onLimitReached();
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [endpoint, warningThreshold, onLimitReached]);

  if (!showWarning) return null;

  const percentage = (status.current / status.limit) * 100;
  const isAtLimit = status.current >= status.limit;

  return (
    <div className={`p-3 rounded-lg border-l-4 ${
      isAtLimit 
        ? 'bg-red-50 border-red-400 text-red-800' 
        : 'bg-yellow-50 border-yellow-400 text-yellow-800'
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {isAtLimit ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="mr-3">
          <p className="text-sm font-medium">
            {isAtLimit 
              ? 'تم الوصول للحد الأقصى من الطلبات' 
              : `اقتراب من الحد الأقصى (${Math.round(percentage)}%)`
            }
          </p>
          <p className="text-xs mt-1">
            {isAtLimit 
              ? `يرجى الانتظار قبل إرسال طلبات جديدة. الحد: ${status.limit} طلب/دقيقة`
              : `استخدمت ${status.current} من ${status.limit} طلب. متبقي: ${status.remaining}`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
