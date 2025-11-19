/**
 * Redux Persist Configuration
 * Handles persistence for different slices
 */

import { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Persist config for auth slice
export const authPersistConfig: PersistConfig<any> = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // Only persist user and auth status, not tokens
};

// Persist config for tasbih slice
export const tasbihPersistConfig: PersistConfig<any> = {
  key: 'tasbih',
  storage,
  whitelist: [
    'sessions',
    'dailyGoal',
    'customGoals',
    'selectedDhikr',
    'soundEnabled',
    'vibrationEnabled',
    'autoReset',
    'resetThreshold',
    'stats',
  ],
};

// Persist config for quran slice
export const quranPersistConfig: PersistConfig<any> = {
  key: 'quran',
  storage,
  whitelist: ['currentAyah', 'currentFont'],
};

// Persist config for theme slice
export const themePersistConfig: PersistConfig<any> = {
  key: 'theme',
  storage,
  whitelist: ['theme'],
};

// Persist config for prayer times slice
export const prayerTimesPersistConfig: PersistConfig<any> = {
  key: 'prayerTimes',
  storage,
  whitelist: ['settings'],
};

// Persist config for reminder slice
export const reminderPersistConfig: PersistConfig<any> = {
  key: 'reminder',
  storage,
  whitelist: ['settings'],
};

// Note: Root persist config is now defined in store.ts
// This file contains individual slice persist configs only

