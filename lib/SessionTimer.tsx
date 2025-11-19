import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { getAccessToken } from '@/lib/auth';

interface SessionTimerProps {
  roomName: string;
}

export function SessionTimer({ roomName }: SessionTimerProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const router = useRouter();

  // Poll backend for authoritative remaining time and live status
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let initialTimeout: NodeJS.Timeout;

    // فترة سماح أولية 3 ثوانٍ للسماح بحدث الانضمام وتحديث العداد في الباك إند
    let graceUntil = Date.now() + 3000;

    const fetchSessionStatus = async () => {
      try {
        const accessToken = getAccessToken();

        // Debug: تشخيص شامل
        console.log('🔍 SessionTimer Debug Info:');
        console.log('  Room Name:', roomName);
        console.log('  Room Name type:', typeof roomName);
        console.log('  Access Token exists:', !!accessToken);

        if (!roomName || roomName === 'undefined' || typeof roomName !== 'string') {
          console.error('❌ Invalid roomName:', roomName);
          setIsLoading(false);
          return;
        }

        let apiUrl: string;
        try {
          apiUrl = getApiUrl(`/sessions/${roomName}/live/`);
          console.log('  API URL:', apiUrl);
        } catch (urlError) {
          console.error('❌ Error constructing URL:', urlError);
          setIsLoading(false);
          return;
        }

        const response = await fetch(apiUrl, {
          headers: {
            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
          },
        });

        console.log('  Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Session live data:', data);

          // استخدام القيمة القادمة من السيرفر إن توفرت
          const remainingSecondsFromServer = typeof data.remaining_time_seconds === 'number'
            ? data.remaining_time_seconds
            : undefined;

          let nextRemaining = remainingSecondsFromServer ?? (
            data.duration_minutes * 60 - Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000)
          );

          // Update remaining time and authoritative expiry state from backend only
          setRemainingTime(Math.max(0, nextRemaining));
          setIsExpired(!data.is_live || nextRemaining <= 0);
          setParticipantCount(data.current_participants ?? 0);
          setIsActive(!!data.is_live);
          setIsLoading(false);

          // سياسة الإغلاق: لا نغلق إلا عند انتهاء الوقت أو عندما is_live = false
          if (!data.is_live || nextRemaining <= 0) {
            alert('Meeting time has expired. You will be redirected to the home page.');
            router.push('/');
            return;
          }
        } else {
          console.error('❌ Failed to fetch session live info:', response.status, response.statusText);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in fetchSessionStatus:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch after grace period
    initialTimeout = setTimeout(fetchSessionStatus, Math.max(0, graceUntil - Date.now()));

    // Polling كل 5 ثواني
    intervalId = setInterval(fetchSessionStatus, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeout);
    };
  }, [roomName, router]);

  // عدّاد بصري محلي يبدأ فقط بعد أول جلب ناجح ومن دون فرض انتهاء الاجتماع
  useEffect(() => {
    if (isLoading || isExpired) return;
    const countdownId = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdownId);
  }, [isLoading, isExpired]);

  // Auto-redirect عندما يؤكد الباك إند انتهاء الجلسة
  useEffect(() => {
    if (isExpired && !isLoading) {
      alert('Meeting time has expired. You will be redirected to the home page.');
      router.push('/');
    }
  }, [isExpired, isLoading, router]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (remainingTime <= 60) return '#ff4444';
    if (remainingTime <= 300) return '#ff8800';
    return '#00aa00';
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        zIndex: 1000,
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: getTimerColor(),
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      zIndex: 1000,
      border: `2px solid ${getTimerColor()}`,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      minWidth: '140px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.8 }}>
          Time Remaining
        </div>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
          {formatTime(remainingTime)}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
          Participants: {participantCount}
        </div>
      </div>
    </div>
  );
}
