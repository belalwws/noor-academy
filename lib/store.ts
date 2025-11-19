/**
 * Redux Store Configuration
 * Unified store with Redux Persist support
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authReducer from './store/authSlice';
import tasbihReducer from './store/slices/tasbihSlice';
import quranReducer from './store/slices/quranSlice';
import themeReducer from './store/slices/themeSlice';
import prayerTimesReducer from './store/slices/prayerTimesSlice';
import reminderReducer from './store/slices/reminderSlice';
import liveSessionsReducer from './store/slices/liveSessionsSlice';

// Note: LiveSessions doesn't need persistence (real-time data)
import { authPersistConfig, tasbihPersistConfig, quranPersistConfig, themePersistConfig, prayerTimesPersistConfig, reminderPersistConfig } from './store/persistConfig';

// Persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedTasbihReducer = persistReducer(tasbihPersistConfig, tasbihReducer);
const persistedQuranReducer = persistReducer(quranPersistConfig, quranReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);
const persistedPrayerTimesReducer = persistReducer(prayerTimesPersistConfig, prayerTimesReducer);
const persistedReminderReducer = persistReducer(reminderPersistConfig, reminderReducer);

// Root reducer
const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  tasbih: persistedTasbihReducer,
  quran: persistedQuranReducer,
  theme: persistedThemeReducer,
  prayerTimes: persistedPrayerTimesReducer,
  reminder: persistedReminderReducer,
  liveSessions: liveSessionsReducer, // No persistence needed for real-time data
});

// Root persist config
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'tasbih', 'quran', 'theme', 'prayerTimes', 'reminder'], // Add other slices as we migrate them
};

// Persisted root reducer
const persistedRootReducer = persistReducer(rootPersistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // Ignore serialization check for reminder actions since we serialize Date objects in reducer
          'reminder/setReminders',
          'reminder/setCurrentReminder',
          'reminder/showReminder',
        ],
        ignoredPaths: ['reminder.reminders', 'reminder.currentReminder'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Re-export auth actions for backward compatibility
export { 
  setUser, 
  setTokens, 
  login, 
  logout, 
  updateUser, 
  setLoading, 
  setError,
  setProfileImageTimestamp 
} from './store/authSlice';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
