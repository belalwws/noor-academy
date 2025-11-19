import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '@/lib/config';
import { getAccessToken } from '@/lib/auth';

interface LiveSession {
  id: string;
  session_id: string;
  title: string;
  course?: string | null;
  course_id?: string | number | null;
  course_title?: string | null;
  lesson_id?: string | number | null;
  lesson_title?: string | null;
  batch_id?: string | number | null;
  batch_name?: string | null;
  teacher: string;
  session_status: string;
  started_at: string | null;
  actual_started_at?: string | null;
  duration_minutes: number;
  remaining_time: string;
  current_participants: number;
  max_participants: number;
  can_join: boolean;
  is_active: boolean;
}

interface SSEData {
  live_sessions: LiveSession[];
  total_count: number;
  timestamp: number;
  error?: boolean;
  message?: string;
}

interface UseLiveSessionsSSEReturn {
  liveSessions: LiveSession[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  reconnect: () => void;
}

export const useLiveSessionsSSE = (): UseLiveSessionsSSEReturn => {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const endpointNotFoundRef = useRef(false); // Track if endpoint doesn't exist (404)
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnected(false);
  }, []);

  const connect = useCallback(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    // If endpoint doesn't exist, don't try to connect
    if (endpointNotFoundRef.current) {
      setLoading(false);
      return;
    }

    // Disable SSE connection to avoid 404 errors
    setLoading(false);
    setConnected(false);
    return;

    cleanup();
    
    const token = getAccessToken();
    if (!token) {
      setError('حدث الصفحة');
      setLoading(false);
      return;
    }

    try {
      const url = getApiUrl('/sessions/live-sessions-stream/');

      // Add authorization header manually (EventSource doesn't support custom headers)
      // We'll need to pass the token as a query parameter instead
      const urlWithAuth = `${url}?token=${encodeURIComponent(token)}`;
      const authenticatedEventSource = new EventSource(urlWithAuth);

      eventSourceRef.current = authenticatedEventSource;

      authenticatedEventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnected(true);
        setError(null);
        setLoading(false);
        reconnectAttemptsRef.current = 0;
      };

      authenticatedEventSource.onmessage = (event) => {
        try {
          const data: SSEData = JSON.parse(event.data);
          
          if (data.error) {
            setError(data.message || 'خطأ في الاتصال');
            return;
          }

          setLiveSessions(data.live_sessions || []);
          setError(null);
        } catch (err) {
          console.error('Error parsing SSE data:', err);
          setError('خطأ في معالجة البيانات');
        }
      };

      authenticatedEventSource.onerror = (event) => {
        setConnected(false);
        
        // Check if this is likely a 404 (endpoint not found)
        // EventSource closes immediately on 404, so we check if it closed quickly
        const closedImmediately = authenticatedEventSource.readyState === EventSource.CLOSED;
        const isFirstAttempt = reconnectAttemptsRef.current === 0;
        
        // If endpoint doesn't exist (404), mark it and stop trying
        if (isFirstAttempt && closedImmediately) {
          // Try to detect 404 by checking if connection closed very quickly
          // This is a heuristic since EventSource doesn't provide status codes
          endpointNotFoundRef.current = true;
          setError(null);
          setLoading(false);
          cleanup();
          // Don't log error for 404 - endpoint simply doesn't exist
          return;
        }
        
        // For other errors, log and attempt reconnection
        if (reconnectAttemptsRef.current === 0) {
          console.error('SSE connection error:', event);
        }
        
        setError('انقطع الاتصال مع الخادم');
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            // Only log first few reconnection attempts to reduce console noise
            if (reconnectAttemptsRef.current <= 2) {
              console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            }
            connect();
          }, delay);
        } else {
          setError('فشل في الاتصال بعد عدة محاولات');
          setLoading(false);
        }
      };

    } catch (err) {
      console.error('Error creating SSE connection:', err);
      setError('فشل في إنشاء الاتصال');
      setLoading(false);
    }
  }, [cleanup]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setError(null);
    setLoading(true);
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    
    return cleanup;
  }, [connect, cleanup]);

  // Handle page visibility changes
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, close connection to save resources
        cleanup();
      } else {
        // Page is visible, reconnect
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, cleanup]);

  return {
    liveSessions,
    loading,
    error,
    connected,
    reconnect,
  };
};
