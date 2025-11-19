/**
 * Reminder Redux Slice
 * Converted from React Context to Redux
 * Note: ReminderService is a singleton that handles the actual reminder logic
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reminder, ReminderSettings, getReminderService } from '@/lib/services/reminder-service';
import { IPrayerTimes } from '@/app/prayer-times/types';

// Serialized reminder for Redux state (Date objects converted to ISO strings)
interface SerializedReminder extends Omit<Reminder, 'time'> {
  time: string; // ISO string instead of Date object
}

interface ReminderState {
  reminders: SerializedReminder[]; // Use serialized version for Redux
  settings: ReminderSettings;
  currentReminder: SerializedReminder | null;
  isServiceInitialized: boolean;
}

// Helper functions to convert between Reminder and SerializedReminder
const serializeReminder = (reminder: Reminder): SerializedReminder => ({
  ...reminder,
  time: reminder.time.toISOString(),
});

const deserializeReminder = (serialized: SerializedReminder): Reminder => ({
  ...serialized,
  time: new Date(serialized.time),
});

const serializeReminders = (reminders: Reminder[]): SerializedReminder[] => 
  reminders.map(serializeReminder);

// Get default settings (same as ReminderService)
const getDefaultSettings = (): ReminderSettings => {
  if (typeof window === 'undefined') {
    return {
      enabled: true,
      prayerReminders: true,
      prayerReminderMinutes: 10,
      dailyHadith: true,
      dailyHadithTime: '08:00',
      dailyHadithRepeat: true,
      dailyHadithRepeatInterval: 180,
      dailyQuranVerse: true,
      dailyQuranVerseTime: '09:30',
      dailyQuranVerseRepeat: true,
      dailyQuranVerseRepeatInterval: 240,
      fridayQuran: true,
      fridayQuranTime: '08:00',
      dailyDhikr: true,
      dailyDhikrTime: '06:00',
      dailyDhikrRepeat: false,
      dailyDhikrRepeatInterval: 660,
      browserNotifications: true,
      hourlyReminder: false,
      hourlyReminderInterval: 120,
    };
  }

  // Try to get from ReminderService
  try {
    const service = getReminderService();
    return service.getSettings();
  } catch {
    // Return defaults if service not available
    return {
      enabled: true,
      prayerReminders: true,
      prayerReminderMinutes: 10,
      dailyHadith: true,
      dailyHadithTime: '08:00',
      dailyHadithRepeat: true,
      dailyHadithRepeatInterval: 180,
      dailyQuranVerse: true,
      dailyQuranVerseTime: '09:30',
      dailyQuranVerseRepeat: true,
      dailyQuranVerseRepeatInterval: 240,
      fridayQuran: true,
      fridayQuranTime: '08:00',
      dailyDhikr: true,
      dailyDhikrTime: '06:00',
      dailyDhikrRepeat: false,
      dailyDhikrRepeatInterval: 660,
      browserNotifications: true,
      hourlyReminder: false,
      hourlyReminderInterval: 120,
    };
  }
};

const initialState: ReminderState = {
  reminders: [],
  settings: getDefaultSettings(),
  currentReminder: null,
  isServiceInitialized: false,
};

const reminderSlice = createSlice({
  name: 'reminder',
  initialState,
  reducers: {
    setReminders: (state, action: PayloadAction<Reminder[]>) => {
      // Convert Date objects to ISO strings for Redux serialization
      state.reminders = serializeReminders(action.payload);
    },
    setSettings: (state, action: PayloadAction<ReminderSettings>) => {
      state.settings = action.payload;
      
      // Save to ReminderService if available
      if (typeof window !== 'undefined') {
        try {
          const service = getReminderService();
          service.saveSettings(action.payload);
        } catch (error) {
          // Service not available yet
        }
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<ReminderSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Save to ReminderService if available
      if (typeof window !== 'undefined') {
        try {
          const service = getReminderService();
          service.saveSettings(action.payload);
        } catch (error) {
          // Service not available yet
        }
      }
    },
    setCurrentReminder: (state, action: PayloadAction<Reminder | null>) => {
      // Convert Date object to ISO string for Redux serialization
      state.currentReminder = action.payload ? serializeReminder(action.payload) : null;
    },
    showReminder: (state, action: PayloadAction<Reminder>) => {
      // Convert Date object to ISO string for Redux serialization
      state.currentReminder = serializeReminder(action.payload);
    },
    closeCurrentReminder: (state) => {
      state.currentReminder = null;
    },
    setServiceInitialized: (state, action: PayloadAction<boolean>) => {
      state.isServiceInitialized = action.payload;
    },
    initializeService: (state) => {
      if (typeof window === 'undefined' || state.isServiceInitialized) return;
      
      try {
        const service = getReminderService();
        const loadedSettings = service.getSettings();
        state.settings = loadedSettings;
        // Convert Date objects to ISO strings for Redux serialization
        state.reminders = serializeReminders(service.getUpcomingReminders(10));
        state.isServiceInitialized = true;
        // Start service only if not already running (callback should be set before this)
        if (!service.isRunning()) {
          service.start();
        }
      } catch (error) {
        console.error('Error initializing reminder service:', error);
      }
    },
    refreshReminders: (state) => {
      if (typeof window === 'undefined' || !state.isServiceInitialized) return;
      
      try {
        const service = getReminderService();
        // Only update if needed (don't regenerate unnecessarily)
        // Just refresh the list from service, don't call updateReminders() which regenerates all reminders
        // Convert Date objects to ISO strings for Redux serialization
        state.reminders = serializeReminders(service.getUpcomingReminders(10));
      } catch (error) {
        // Service not available
      }
    },
    setPrayerTimes: (state, action: PayloadAction<IPrayerTimes | null>) => {
      if (typeof window === 'undefined' || !state.isServiceInitialized) return;
      
      try {
        const service = getReminderService();
        service.setPrayerTimes(action.payload);
        // Only update reminders if prayer times changed (service will handle regeneration if needed)
        // Don't force updateReminders() as it causes duplicate reminders
        // Convert Date objects to ISO strings for Redux serialization
        state.reminders = serializeReminders(service.getUpcomingReminders(10));
      } catch (error) {
        // Service not available
      }
    },
  },
});

export const {
  setReminders,
  setSettings,
  updateSettings,
  setCurrentReminder,
  showReminder,
  closeCurrentReminder,
  setServiceInitialized,
  initializeService,
  refreshReminders,
  setPrayerTimes,
} = reminderSlice.actions;

export default reminderSlice.reducer;

