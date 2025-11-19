'use client';

import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Clock,
  ExternalLink,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Session } from '@/types/session';
import { sessionService } from '@/lib/services/sessionService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ActiveSessionCardProps {
  session: Session;
  onSessionClosed?: () => void;
  onSessionExtended?: () => void;
  userRole?: 'teacher' | 'student' | 'supervisor';
}

export default function ActiveSessionCard({
  session,
  onSessionClosed,
  onSessionExtended,
  userRole = 'student',
}: ActiveSessionCardProps) {
  const router = useRouter();
  const [liveData, setLiveData] = useState<any>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isTeacher = userRole === 'teacher';
  const isSupervisor = userRole === 'supervisor';
  const canManage = isTeacher || isSupervisor;

  // Fetch live session data periodically
  useEffect(() => {
    if (!session.session_id) return;

    const fetchLiveData = async () => {
      try {
        const data = await sessionService.getLiveSessionInfo(
          session.session_id
        );
        setLiveData(data);
      } catch (error) {
        console.error('Error fetching live data:', error);
      }
    };

    // Initial fetch
    fetchLiveData();

    // Poll every 5 seconds
    const interval = setInterval(fetchLiveData, 5000);

    return () => clearInterval(interval);
  }, [session.session_id]);

  // Calculate remaining time
  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const expires = new Date(session.expires_at).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSeconds(diff);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [session.expires_at]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinSession = async () => {
    try {
      toast.loading('جاري الانضمام للجلسة...');
      
      await sessionService.joinSession(session.session_id);
      
      toast.dismiss();
      toast.success('تم الانضمام للجلسة!');

      // Redirect to meet room
      const meetUrl = `/meet/rooms/${session.session_id}`;
      router.push(meetUrl);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'فشل في الانضمام للجلسة');
    }
  };

  const handleExtendSession = async () => {
    if (!isTeacher) {
      toast.error('فقط المعلم يمكنه تمديد الجلسة');
      return;
    }

    setIsExtending(true);
    try {
      await sessionService.extendSession(session.session_id);
      toast.success('تم تمديد الجلسة بنجاح! (+10 دقائق)');
      if (onSessionExtended) {
        onSessionExtended();
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في تمديد الجلسة');
    } finally {
      setIsExtending(false);
    }
  };

  const handleCloseSession = async () => {
    if (!canManage) {
      toast.error('ليس لديك صلاحية لإغلاق الجلسة');
      return;
    }

    if (!confirm('هل أنت متأكد من إغلاق الجلسة؟')) {
      return;
    }

    setIsClosing(true);
    try {
      await sessionService.closeSession(session.session_id);
      toast.success('تم إغلاق الجلسة بنجاح');
      if (onSessionClosed) {
        onSessionClosed();
      }
    } catch (error: any) {
      toast.error(error.message || 'فشل في إغلاق الجلسة');
    } finally {
      setIsClosing(false);
    }
  };

  const getTimerColor = () => {
    if (remainingSeconds > 600) return 'text-emerald-600'; // > 10 mins
    if (remainingSeconds > 300) return 'text-yellow-600'; // > 5 mins
    return 'text-red-600'; // < 5 mins
  };

  const participantCount = liveData?.participant_count ?? session.participant_count;
  const hasBeenExtended = liveData?.has_been_extended ?? session.has_been_extended ?? false;

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-lg">
                {session.title}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                نشطة
              </span>
            </div>
            {session.lesson_details && (
              <p className="text-sm text-gray-600 mt-1">
                📚 {session.lesson_details}
              </p>
            )}
          </div>
        </div>

        {canManage && (
          <button
            onClick={handleCloseSession}
            disabled={isClosing}
            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors disabled:opacity-50"
            title="إغلاق الجلسة"
          >
            {isClosing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Timer */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`w-5 h-5 ${getTimerColor()}`} />
            <span className="text-sm text-gray-600 font-medium">
              الوقت المتبقي
            </span>
          </div>
          <div className={`text-2xl font-bold ${getTimerColor()}`}>
            {formatTime(remainingSeconds)}
          </div>
          {remainingSeconds < 300 && remainingSeconds > 0 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ أقل من 5 دقائق
            </p>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 font-medium">
              المشاركون
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {participantCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">متصل الآن</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleJoinSession}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-5 h-5" />
          الانضمام للجلسة
        </button>

        {isTeacher && !hasBeenExtended && remainingSeconds < 600 && (
          <button
            onClick={handleExtendSession}
            disabled={isExtending}
            className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            title="تمديد +10 دقائق"
          >
            {isExtending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                +10
              </>
            )}
          </button>
        )}
      </div>

      {/* Extension Notice */}
      {hasBeenExtended && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>تم تمديد هذه الجلسة مسبقاً (لا يمكن التمديد مرة أخرى)</span>
        </div>
      )}

      {/* Session Info */}
      <div className="mt-4 pt-4 border-t border-emerald-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">المدة الأصلية:</span>{' '}
            {session.duration_minutes} دقيقة
          </div>
          <div>
            <span className="font-medium">بدأت في:</span>{' '}
            {session.started_at
              ? new Date(session.started_at).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'لم تبدأ بعد'}
          </div>
        </div>
      </div>
    </div>
  );
}
