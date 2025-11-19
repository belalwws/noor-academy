/**
 * Custom Hook for Reminder State
 * Provides backward-compatible interface for components using ReminderContext
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import type { RootState } from '../../store';
import {
  setReminders,
  updateSettings,
  showReminder,
  closeCurrentReminder,
  initializeService,
  refreshReminders,
  setPrayerTimes,
  setCurrentReminder,
} from '../slices/reminderSlice';
import { Reminder, getReminderService } from '@/lib/services/reminder-service';
import { IPrayerTimes } from '@/app/prayer-times/types';

// Helper function to deserialize reminders from Redux state (ISO strings -> Date objects)
const deserializeReminder = (serialized: { time: string; [key: string]: any }): Reminder => ({
  ...serialized,
  time: new Date(serialized.time),
});

const deserializeReminders = (serialized: { time: string; [key: string]: any }[]): Reminder[] =>
  serialized.map(deserializeReminder);

export const useReminders = () => {
  const dispatch = useDispatch();
  const reminder = useSelector((state: RootState) => state.reminder);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize service on mount
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    try {
      const service = getReminderService();
      
      // IMPORTANT: Set callback BEFORE initializing service to ensure it's set when start() is called
      // Set callback for when reminder triggers
      service.setOnReminderCallback((reminder: Reminder) => {
        console.log('🔔 Reminder triggered:', reminder);
        // Dispatch to show modal
        dispatch(setCurrentReminder(reminder));
        
        // Show browser notification if enabled (get settings from service, not from reminder object)
        const settings = service.getSettings();
        if (settings.browserNotifications && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(reminder.title, {
              body: reminder.message,
              icon: '/logo.png',
            });
          } catch (error) {
            console.error('Error showing notification:', error);
          }
        }
        
        // Refresh reminders after showing
        setTimeout(() => {
          dispatch(refreshReminders());
        }, 100);
      });

      // Now initialize service (which will update reminders but won't start until callback is set)
      dispatch(initializeService());
      
      // Start the service manually now that callback is set
      // This ensures service starts only after callback is ready
      if (!service.isRunning()) {
        service.start();
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ReminderService: Started checking for reminders (callback is set)');
        }
      } else {
        // If service is already running (from updateReminders), ensure it has the callback
        // Service should now have callback, so it's ready
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ ReminderService: Already running, callback is now set');
        }
      }

      // Initial update with delay
      const initTimeout = setTimeout(() => {
        dispatch(refreshReminders());
      }, 1000);

      // Update reminders every 5 minutes (only if needed)
      updateIntervalRef.current = setInterval(() => {
        try {
          const service = getReminderService();
          // Check if we need to regenerate (e.g., new day)
          const lastUpdate = typeof window !== 'undefined' ? localStorage.getItem('reminders-last-update') : null;
          const today = new Date().toISOString().split('T')[0];
          
          if (lastUpdate !== today) {
            // New day - regenerate reminders
            dispatch(refreshReminders());
          } else {
            // Same day - just refresh the list
            dispatch(setReminders(service.getUpcomingReminders(10)));
          }
        } catch (error) {
          // Service not available
        }
      }, 5 * 60 * 1000);

      // Refresh reminder list every 30 seconds (just update Redux state, don't regenerate)
      checkIntervalRef.current = setInterval(() => {
        try {
          const service = getReminderService();
          // Just refresh the list, don't regenerate
          dispatch(setReminders(service.getUpcomingReminders(10)));
        } catch (error) {
          // Service not available
        }
      }, 30 * 1000);

      isInitializedRef.current = true;

      return () => {
        clearTimeout(initTimeout);
        if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        try {
          service.stop();
        } catch (error) {
          // Ignore errors
        }
      };
    } catch (error) {
      // Service not available
    }
  }, [dispatch]);

  // Listen for prayer times updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePrayerTimesUpdate = (e: CustomEvent) => {
      dispatch(setPrayerTimes(e.detail));
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prayer-times-data') {
        try {
          const prayerTimes = e.newValue ? JSON.parse(e.newValue) : null;
          dispatch(setPrayerTimes(prayerTimes));
        } catch (e) {
          // Ignore errors
        }
      }
    };

    window.addEventListener('prayer-times-updated' as any, handlePrayerTimesUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Load initial prayer times from localStorage
    try {
      const saved = localStorage.getItem('prayer-times-data');
      if (saved) {
        const prayerTimes = JSON.parse(saved);
        dispatch(setPrayerTimes(prayerTimes));
      }
    } catch (e) {
      // Ignore errors
    }

    return () => {
      window.removeEventListener('prayer-times-updated' as any, handlePrayerTimesUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  const updateSettingsCallback = useCallback((newSettings: Partial<typeof reminder.settings>) => {
    dispatch(updateSettings(newSettings));
    
    // Debounce reminder refresh
    setTimeout(() => {
      dispatch(refreshReminders());
    }, 300);
  }, [dispatch, reminder.settings]);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }, []);

  const getUpcomingReminders = useCallback((count: number = 5): Reminder[] => {
    try {
      const service = getReminderService();
      return service.getUpcomingReminders(count);
    } catch (error) {
      // Convert serialized reminders (ISO strings) back to Reminder objects (Date objects)
      return deserializeReminders(reminder.reminders).slice(0, count);
    }
  }, [reminder.reminders]);

  const showReminderCallback = useCallback((reminder: Reminder) => {
    dispatch(showReminder(reminder));
  }, [dispatch]);

  const closeCurrentReminderCallback = useCallback(() => {
    dispatch(closeCurrentReminder());
  }, [dispatch]);

  const setPrayerTimesCallback = useCallback((prayerTimes: IPrayerTimes | null) => {
    dispatch(setPrayerTimes(prayerTimes));
  }, [dispatch]);

  // Convert serialized reminders from Redux state (ISO strings) back to Reminder objects (Date objects)
  const deserializedReminders = useMemo(
    () => deserializeReminders(reminder.reminders),
    [reminder.reminders]
  );

  // Convert serialized current reminder from Redux state (ISO string) back to Reminder object (Date object)
  const deserializedCurrentReminder = useMemo(
    () => (reminder.currentReminder ? deserializeReminder(reminder.currentReminder) : null),
    [reminder.currentReminder]
  );

  return {
    reminders: deserializedReminders, // Convert ISO strings back to Date objects
    settings: reminder.settings,
    updateSettings: updateSettingsCallback,
    requestNotificationPermission,
    getUpcomingReminders,
    showReminder: showReminderCallback,
    currentReminder: deserializedCurrentReminder, // Convert ISO string back to Date object
    closeCurrentReminder: closeCurrentReminderCallback,
    setPrayerTimes: setPrayerTimesCallback,
  };
};

// Export as useReminder for backward compatibility
export const useReminder = useReminders;

