import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { LiveSession } from '@/types/session';
import { sessionApi } from '@/lib/api/sessions';

interface UseSessionsOptions {
  autoFetch?: boolean;
  page?: number;
  pageSize?: number;
}

export function useSessions(options: UseSessionsOptions = {}) {
  const {
    autoFetch = true,
    page: initialPage = 1,
    pageSize: initialPageSize = 10,
  } = options;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState({
    fetch: autoFetch,
    join: false,
  });
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    hasMore: false,
    total: 0,
  });

  const fetchSessions = useCallback(async (page = pagination.page, pageSize = pagination.pageSize) => {
    try {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError(null);

      const response = await sessionApi.getUpcomingSessions(page, pageSize);
      
      if (response.success && response.data) {
        setSessions(prev => (page === 1 ? response.data.results : [...prev, ...response.data.results]));
        setPagination(prev => ({
          ...prev,
          page,
          pageSize,
          hasMore: !!response.data?.next,
          total: response.data?.count || 0,
        }));
      }
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch sessions');
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [pagination.page, pagination.pageSize]);

  const joinSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(prev => ({ ...prev, join: true }));
      setError(null);
      
      const response = await sessionApi.joinSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to join session');
      }
      
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join session');
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, join: false }));
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.hasMore) {
      return fetchSessions(pagination.page + 1, pagination.pageSize);
    }
    return Promise.resolve();
  }, [fetchSessions, pagination]);

  const refresh = useCallback(() => {
    return fetchSessions(1, pagination.pageSize);
  }, [fetchSessions, pagination.pageSize]);

  useEffect(() => {
    if (autoFetch) {
      fetchSessions().catch(console.error);
    }
  }, [autoFetch, fetchSessions]);

  return {
    sessions,
    loading,
    error,
    pagination,
    fetchSessions,
    joinSession,
    loadMore,
    refresh,
  };
}

export default useSessions;
