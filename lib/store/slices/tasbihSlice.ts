/**
 * Tasbih Redux Slice
 * Converted from Zustand store to Redux
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TasbihSession {
  id: string;
  date: string;
  count: number;
  dhikrType: string;
  duration: number; // in minutes
  completedAt: string; // ISO string for serialization
}

export interface DailyGoal {
  target: number;
  current: number;
  date: string;
}

export interface TasbihStats {
  totalCount: number;
  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  longestStreak: number;
  currentStreak: number;
  averageDaily: number;
  totalSessions: number;
}

interface TasbihState {
  // Current session
  currentCount: number;
  selectedDhikr: string;
  sessionStartTime: string | null; // ISO string for serialization
  
  // Goals and targets
  dailyGoal: number;
  customGoals: DailyGoal[];
  
  // History and stats
  sessions: TasbihSession[];
  stats: TasbihStats;
  
  // Settings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoReset: boolean;
  resetThreshold: number;
}

const defaultDhikrTypes = [
  'سبحان الله',
  'الحمد لله', 
  'الله أكبر',
  'لا إله إلا الله',
  'استغفر الله',
  'لا حول ولا قوة إلا بالله',
  'سبحان الله وبحمده',
  'سبحان الله العظيم'
];

const initialState: TasbihState = {
  currentCount: 0,
  selectedDhikr: defaultDhikrTypes[0],
  sessionStartTime: null,
  dailyGoal: 300,
  customGoals: [],
  sessions: [],
  stats: {
    totalCount: 0,
    todayCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    longestStreak: 0,
    currentStreak: 0,
    averageDaily: 0,
    totalSessions: 0
  },
  soundEnabled: true,
  vibrationEnabled: true,
  autoReset: false,
  resetThreshold: 300,
};

const tasbihSlice = createSlice({
  name: 'tasbih',
  initialState,
  reducers: {
    increment: (state) => {
      state.currentCount += 1;
      
      // Start session if first count
      if (!state.sessionStartTime) {
        state.sessionStartTime = new Date().toISOString();
      }
      
      // Note: Sound and vibration will be handled in the component/thunk
      // Auto reset logic will be handled in the component/thunk
    },
    
    reset: (state) => {
      state.currentCount = 0;
      state.sessionStartTime = null;
    },
    
    setDhikr: (state, action: PayloadAction<string>) => {
      state.selectedDhikr = action.payload;
    },
    
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
    },
    
    saveSession: (state) => {
      if (state.currentCount === 0) return;
      
      const now = new Date();
      const sessionStartTime = state.sessionStartTime ? new Date(state.sessionStartTime) : now;
      const duration = Math.round((now.getTime() - sessionStartTime.getTime()) / 60000);
      
      const session: TasbihSession = {
        id: `session_${Date.now()}`,
        date: now.toISOString().split('T')[0],
        count: state.currentCount,
        dhikrType: state.selectedDhikr,
        duration,
        completedAt: now.toISOString()
      };
      
      // Keep last 100 sessions
      state.sessions = [session, ...state.sessions].slice(0, 100);
      
      // Update stats will be handled by a separate action
    },
    
    updateStats: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const totalCount = state.sessions.reduce((sum, session) => sum + session.count, 0);
      const todayCount = state.sessions
        .filter(session => session.date === today)
        .reduce((sum, session) => sum + session.count, 0);
      const weeklyCount = state.sessions
        .filter(session => session.date >= weekAgo)
        .reduce((sum, session) => sum + session.count, 0);
      const monthlyCount = state.sessions
        .filter(session => session.date >= monthAgo)
        .reduce((sum, session) => sum + session.count, 0);
      
      // Calculate streaks
      const dailyCounts = new Map<string, number>();
      state.sessions.forEach(session => {
        const current = dailyCounts.get(session.date) || 0;
        dailyCounts.set(session.date, current + session.count);
      });
      
      const sortedDates = Array.from(dailyCounts.keys()).sort().reverse();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const count = dailyCounts.get(date) || 0;
        
        if (count >= state.dailyGoal) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      const averageDaily = state.sessions.length > 0 
        ? Math.round(totalCount / Math.max(dailyCounts.size, 1))
        : 0;
      
      state.stats = {
        totalCount,
        todayCount,
        weeklyCount,
        monthlyCount,
        longestStreak,
        currentStreak,
        averageDaily,
        totalSessions: state.sessions.length
      };
    },
    
    initializeStore: (state) => {
      // Stats will be updated by updateStats action
      // This is a no-op in Redux, but kept for backward compatibility
    },
    
    // Settings actions
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled;
    },
    
    toggleVibration: (state) => {
      state.vibrationEnabled = !state.vibrationEnabled;
    },
    
    toggleAutoReset: (state) => {
      state.autoReset = !state.autoReset;
    },
    
    setResetThreshold: (state, action: PayloadAction<number>) => {
      state.resetThreshold = action.payload;
    },
  },
});

export const {
  increment,
  reset,
  setDhikr,
  setDailyGoal,
  saveSession,
  updateStats,
  initializeStore,
  toggleSound,
  toggleVibration,
  toggleAutoReset,
  setResetThreshold,
} = tasbihSlice.actions;

export default tasbihSlice.reducer;

