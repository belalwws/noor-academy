'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionTimerProps {
  endTime: string;
  sessionDuration: number; // in minutes
  onSessionEnd?: () => void;
}

export default function SessionTimer({ endTime, sessionDuration, onSessionEnd }: SessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMinutes: 0,
    isExpired: false
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(endTime);
      const diffMs = end.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMinutes: 0,
          isExpired: true
        });
        
        if (onSessionEnd) {
          onSessionEnd();
        }
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(diffMs / (1000 * 60));

      setTimeRemaining({
        hours,
        minutes,
        seconds,
        totalMinutes,
        isExpired: false
      });
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onSessionEnd]);

  const getTimerColor = () => {
    if (timeRemaining.isExpired) return 'text-red-600';
    if (timeRemaining.totalMinutes <= 5) return 'text-red-500';
    if (timeRemaining.totalMinutes <= 10) return 'text-orange-500';
    return 'text-green-600';
  };

  const getProgressPercentage = () => {
    if (timeRemaining.isExpired) return 0;
    return (timeRemaining.totalMinutes / sessionDuration) * 100;
  };

  const formatTime = () => {
    if (timeRemaining.isExpired) return 'انتهت الجلسة';
    
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours.toString().padStart(2, '0')}:${timeRemaining.minutes.toString().padStart(2, '0')}:${timeRemaining.seconds.toString().padStart(2, '0')}`;
    }
    
    return `${timeRemaining.minutes.toString().padStart(2, '0')}:${timeRemaining.seconds.toString().padStart(2, '0')}`;
  };

  if (timeRemaining.isExpired) {
    return (
      <Alert variant="destructive" className="fixed top-4 right-4 w-80 z-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          انتهت الجلسة - سيتم إنهاء الاتصال تلقائياً
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-64 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${getTimerColor()}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">الوقت المتبقي</span>
              <span className={`text-lg font-bold ${getTimerColor()}`}>
                {formatTime()}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  timeRemaining.totalMinutes <= 5 
                    ? 'bg-red-500' 
                    : timeRemaining.totalMinutes <= 10 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              مدة الجلسة: {sessionDuration} دقيقة
            </div>
          </div>
        </div>

        {/* Warning for last 5 minutes */}
        {timeRemaining.totalMinutes <= 5 && timeRemaining.totalMinutes > 0 && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            ⚠️ ستنتهي الجلسة خلال {timeRemaining.totalMinutes} دقائق
          </div>
        )}
      </CardContent>
    </Card>
  );
}
