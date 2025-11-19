'use client';

import { useEffect } from 'react';
import { useReminders } from '@/lib/store/hooks/useReminder';
import { ReminderNotification } from './ReminderNotification';

// Safe wrapper to use prayer times if available
function ReminderConnector() {
  const { setPrayerTimes } = useReminders();

  useEffect(() => {
    // Try to get prayer times from localStorage or context if available
    // This will be updated when user visits prayer times page
    const checkPrayerTimes = () => {
      try {
        const saved = localStorage.getItem('prayer-times-data');
        if (saved) {
          const prayerTimes = JSON.parse(saved);
          setPrayerTimes(prayerTimes);
        }
      } catch (e) {
        // Ignore errors
      }
    };

    checkPrayerTimes();
    
    // Listen for prayer times updates via custom event
    const handlePrayerTimesUpdate = (e: CustomEvent) => {
      setPrayerTimes(e.detail);
      // Force update reminders after prayer times update
      setTimeout(() => {
        // This will trigger updateReminders in the context
      }, 1000);
    };

    // Listen for localStorage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prayer-times-data') {
        try {
          const prayerTimes = e.newValue ? JSON.parse(e.newValue) : null;
          setPrayerTimes(prayerTimes);
        } catch (e) {
          // Ignore errors
        }
      }
    };

    window.addEventListener('prayer-times-updated' as any, handlePrayerTimesUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('prayer-times-updated' as any, handlePrayerTimesUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setPrayerTimes]);

  return null;
}

export function ReminderProviderWrapper({ children }: { children: React.ReactNode }) {
  // ReminderProvider removed - using Redux now
  return (
    <>
      <ReminderConnector />
      {children}
      <ReminderNotification />
    </>
  );
}

