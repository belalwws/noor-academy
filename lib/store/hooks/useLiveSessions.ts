/**
 * Custom Hook for Live Sessions State
 * Provides backward-compatible interface for components using LiveSessionsContext
 * Integrates SSE connection logic with Redux
 */

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback, useRef } from 'react';
import type { RootState } from '../../store';
import {
  setLiveSessions,
  setLoading,
  setError,
  setConnected,
  clearError,
  updateSession,
  removeSession,
} from '../slices/liveSessionsSlice';
import type { LiveSession } from '../slices/liveSessionsSlice';
import { useLiveSessionsSSE } from '../../../hooks/useLiveSessionsSSE';

export const useLiveSessions = () => {
  const dispatch = useDispatch();
  const liveSessions = useSelector((state: RootState) => state.liveSessions);
  
  // Use the original SSE hook for actual connection logic
  const sseData = useLiveSessionsSSE();

  // Sync SSE data with Redux store
  useEffect(() => {
    dispatch(setLiveSessions(sseData.liveSessions));
    dispatch(setLoading(sseData.loading));
    dispatch(setError(sseData.error));
    dispatch(setConnected(sseData.connected));
  }, [dispatch, sseData.liveSessions, sseData.loading, sseData.error, sseData.connected]);

  const reconnect = useCallback(() => {
    sseData.reconnect();
  }, [sseData]);

  return {
    liveSessions: liveSessions.liveSessions,
    loading: liveSessions.loading,
    error: liveSessions.error,
    connected: liveSessions.connected,
    reconnect,
    setLiveSessions: (sessions: LiveSession[]) => dispatch(setLiveSessions(sessions)),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    setConnected: (connected: boolean) => dispatch(setConnected(connected)),
    clearError: () => dispatch(clearError()),
    updateSession: (session: LiveSession) => dispatch(updateSession(session)),
    removeSession: (id: string) => dispatch(removeSession(id)),
  };
};

