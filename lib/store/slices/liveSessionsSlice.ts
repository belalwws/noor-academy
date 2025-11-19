/**
 * Live Sessions Redux Slice
 * Converted from React Context to Redux
 * Note: SSE connection logic is handled in the custom hook
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LiveSession {
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

interface LiveSessionsState {
  liveSessions: LiveSession[];
  loading: boolean;
  error: string | null;
  connected: boolean;
}

const initialState: LiveSessionsState = {
  liveSessions: [],
  loading: false,
  error: null,
  connected: false,
};

const liveSessionsSlice = createSlice({
  name: 'liveSessions',
  initialState,
  reducers: {
    setLiveSessions: (state, action: PayloadAction<LiveSession[]>) => {
      state.liveSessions = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSession: (state, action: PayloadAction<LiveSession>) => {
      const index = state.liveSessions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.liveSessions[index] = action.payload;
      } else {
        state.liveSessions.push(action.payload);
      }
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.liveSessions = state.liveSessions.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  setLiveSessions,
  setLoading,
  setError,
  setConnected,
  clearError,
  updateSession,
  removeSession,
} = liveSessionsSlice.actions;

export default liveSessionsSlice.reducer;

