import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface LiveKitTokenResponse {
  access_token: string;
  server_url: string;
  room_name: string;
  participant_name: string;
  expires_at: string;
  permissions: {
    canPublish: boolean;
    canSubscribe: boolean;
    canPublishData: boolean;
    hidden: boolean;
    recorder: boolean;
  };
}

interface JoinSessionResponse {
  success: boolean;
  message: string;
  livekit_token: LiveKitTokenResponse;
  participant: {
    id: string;
    role: string;
    status: string;
  };
}

interface LeaveSessionResponse {
  success: boolean;
  message: string;
  participant: {
    id: string;
  };
}

interface UpcomingSessionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    description: string;
  }[];
}

interface MySessionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    description: string;
  }[];
}

export const useLiveKitSession = () => {
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Join a session using backend API
   * @param sessionId - The ID of the session to join
   * @returns LiveKit token data or null if failed
   */
  const joinSession = async (sessionId: string): Promise<LiveKitTokenResponse | null> => {
    setIsJoining(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sessions/live-sessions/${sessionId}/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data: JoinSessionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل في الانضمام إلى الحصة');
      }
      
      if (data.success) {
        toast.success(data.message || 'تم الانضمام إلى الحصة بنجاح');
        return data.livekit_token;
      } else {
        throw new Error(data.message || 'فشل في الانضمام إلى الحصة');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Leave a session using backend API
   * @param sessionId - The ID of the session to leave
   */
  const leaveSession = async (sessionId: string): Promise<boolean> => {
    setIsLeaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sessions/live-sessions/${sessionId}/leave/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data: LeaveSessionResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل في مغادرة الحصة');
      }
      
      if (data.success) {
        toast.success(data.message || 'تم مغادرة الحصة بنجاح');
        return true;
      } else {
        throw new Error(data.message || 'فشل في مغادرة الحصة');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLeaving(false);
    }
  };

  /**
   * Get upcoming sessions for the current user
   * @param daysAhead - Number of days to look ahead (default: 7)
   * @returns Array of upcoming sessions
   */
  const getUpcomingSessions = async (daysAhead: number = 7): Promise<{ id: string; title: string; start_time: string; end_time: string; description: string }[]> => {
    try {
      const response = await fetch(`/api/sessions/live-sessions/upcoming/?days_ahead=${daysAhead}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب الحصص القادمة');
      }
      
      const data: UpcomingSessionResponse = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  /**
   * Get current user's sessions
   * @returns Array of user's sessions
   */
  const getMySessions = async (): Promise<{ id: string; title: string; start_time: string; end_time: string; description: string }[]> => {
    try {
      const response = await fetch(`/api/sessions/live-sessions/my-sessions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب حصصي');
      }
      
      const data: MySessionResponse = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  };

  return {
    joinSession,
    leaveSession,
    getUpcomingSessions,
    getMySessions,
    isJoining,
    isLeaving,
    error,
  };
};
