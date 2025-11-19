'use client';

import { TimeNames, IPrayerTimes, prayerNamesArabic } from '@/app/prayer-times/types';
import { Hadith } from '@/app/hadith/data/hadiths';
import { hadithCollection } from '@/app/hadith/data/hadiths';

export type ReminderType = 'prayer' | 'hadith' | 'quran' | 'quran-verse' | 'dhikr' | 'friday';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  message: string;
  time: Date;
  data?: any; // Additional data (hadith, surah info, etc.)
  shown: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  prayerReminders: boolean;
  prayerReminderMinutes: number; // Minutes before prayer
  dailyHadith: boolean;
  dailyHadithTime: string; // HH:mm format (Default: 08:00 - After Fajr)
  dailyHadithRepeat: boolean; // Repeat enabled (Default: true)
  dailyHadithRepeatInterval: number; // Repeat interval in minutes (Default: 180 = 3 hours)
  dailyQuranVerse: boolean; // Daily Quran verse
  dailyQuranVerseTime: string; // HH:mm format (Default: 09:30 - Mid-morning)
  dailyQuranVerseRepeat: boolean; // Repeat enabled (Default: true)
  dailyQuranVerseRepeatInterval: number; // Repeat interval in minutes (Default: 240 = 4 hours)
  fridayQuran: boolean;
  fridayQuranTime: string; // HH:mm format (Default: 08:00 - Friday morning)
  dailyDhikr: boolean;
  dailyDhikrTime: string; // HH:mm format (Default: 06:00 - After Fajr)
  dailyDhikrRepeat: boolean; // Not used - Dhikr is fixed 3 times: morning, evening, night
  dailyDhikrRepeatInterval: number; // Not used - Dhikr has fixed times
  hourlyReminder: boolean; // Hourly reminder enabled (Default: false - can be annoying)
  hourlyReminderInterval: number; // Interval in minutes (Default: 120 = 2 hours, range: 8am-10pm)
  browserNotifications: boolean;
}

/*
 * 📅 SMART REMINDER TIMING PATTERN (Default Settings)
 * 
 * This pattern ensures users get spiritual reminders throughout the day
 * without feeling overwhelmed or annoyed. Each type has its own schedule:
 * 
 * 🕌 PRAYER REMINDERS: 10 minutes before each prayer (5 times/day)
 *    - Ensures user is ready for prayer time
 * 
 * 📖 HADITH: Every 3 hours starting from 8:00 AM (≈8 reminders/day)
 *    - Times: 8am, 11am, 2pm, 5pm, 8pm, etc.
 *    - Each reminder shows a different Hadith
 * 
 * 📗 QURAN VERSES: Every 4 hours starting from 9:30 AM (≈6 reminders/day)
 *    - Times: 9:30am, 1:30pm, 5:30pm, 9:30pm
 *    - Offset from Hadith to avoid clustering
 *    - Each reminder shows a different verse
 * 
 * ✨ DHIKR: 2 fixed times per day
 *    - Morning (6:00 AM - After Fajr)
 *    - Evening (5:00 PM - After Asr)
 * 
 * 📅 FRIDAY QURAN: Once on Friday at 8:00 AM
 *    - Reminder to read Surah Al-Kahf
 * 
 * ⏰ HOURLY REMINDER: Optional, disabled by default
 *    - If enabled: Every 2 hours from 8am to 10pm (≈7 reminders/day)
 *    - Alternates between Hadith and Quran verses
 * 
 * TOTAL DAILY REMINDERS (all enabled):
 * - Prayer: 5 reminders
 * - Hadith: 8 reminders (every 3 hours)
 * - Quran: 6 reminders (every 4 hours)
 * - Dhikr: 2 reminders (morning, evening)
 * - Total: ~21 reminders spread over 16 hours (6am-10pm)
 * - Average: ~1.4 reminders per hour (not annoying!)
 * 
 * USER CUSTOMIZATION:
 * All intervals and times can be adjusted in /reminders/settings
 */

const defaultSettings: ReminderSettings = {
  enabled: true,
  prayerReminders: true,
  prayerReminderMinutes: 10, // 10 minutes before prayer
  dailyHadith: true, // Enabled by default
  dailyHadithTime: '08:00', // Morning after Fajr
  dailyHadithRepeat: true, // Repeat enabled
  dailyHadithRepeatInterval: 180, // Every 3 hours (not annoying)
  dailyQuranVerse: true, // Enabled by default
  dailyQuranVerseTime: '09:30', // Mid-morning
  dailyQuranVerseRepeat: true, // Repeat enabled
  dailyQuranVerseRepeatInterval: 240, // Every 4 hours (balanced with Hadith)
  fridayQuran: true, // Enabled by default
  fridayQuranTime: '08:00', // Friday morning
  dailyDhikr: true, // Enabled by default
  dailyDhikrTime: '06:00', // After Fajr
  dailyDhikrRepeat: false, // No repeat - only morning & evening
  dailyDhikrRepeatInterval: 660, // 11 hours (morning to evening)
  hourlyReminder: false, // Disabled by default (can be annoying)
  hourlyReminderInterval: 120, // Every 2 hours if enabled
  browserNotifications: true,
};

export class ReminderService {
  private reminders: Reminder[] = [];
  private settings: ReminderSettings;
  private intervalId: NodeJS.Timeout | null = null;
  private prayerTimes: IPrayerTimes | null = null;
  private onReminderCallback: ((reminder: Reminder) => void) | null = null;
  private isUpdating = false;

  constructor() {
    this.settings = this.loadSettings();
    
    // Don't auto-start in constructor - wait for explicit start() call after callback is set
    // This prevents reminders from triggering before callback is set
    // Initialize reminders if enabled, but don't start checking yet
    if (typeof window !== 'undefined' && this.settings.enabled) {
      // Use setTimeout to avoid blocking constructor
      // Only update reminders, don't start() - start() should be called after callback is set
      setTimeout(() => {
        this.updateReminders();
        // Don't call start() here - it should be called explicitly after callback is set
      }, 100);
    }
  }

  // Load settings from localStorage
  private loadSettings(): ReminderSettings {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const saved = localStorage.getItem('reminder-settings');
      if (!saved) {
        return defaultSettings;
      }
      
      const parsed = JSON.parse(saved);
      
      // Validate parsed data structure
      if (typeof parsed !== 'object' || parsed === null) {
        console.warn('Invalid reminder settings format, using defaults');
        return defaultSettings;
      }
      
      // Merge saved settings with defaults (saved settings take priority)
      const merged = { ...defaultSettings, ...parsed };
      
      // Validate critical settings
      if (typeof merged.enabled !== 'boolean') merged.enabled = defaultSettings.enabled;
      if (typeof merged.prayerReminders !== 'boolean') merged.prayerReminders = defaultSettings.prayerReminders;
      if (typeof merged.dailyHadith !== 'boolean') merged.dailyHadith = defaultSettings.dailyHadith;
      if (typeof merged.dailyQuranVerse !== 'boolean') merged.dailyQuranVerse = defaultSettings.dailyQuranVerse;
      if (typeof merged.dailyDhikr !== 'boolean') merged.dailyDhikr = defaultSettings.dailyDhikr;
      if (typeof merged.fridayQuran !== 'boolean') merged.fridayQuran = defaultSettings.fridayQuran;
      if (typeof merged.browserNotifications !== 'boolean') merged.browserNotifications = defaultSettings.browserNotifications;
      if (typeof merged.hourlyReminder !== 'boolean') merged.hourlyReminder = defaultSettings.hourlyReminder;
      
      // Validate numeric settings
      if (typeof merged.prayerReminderMinutes !== 'number' || merged.prayerReminderMinutes < 0) {
        merged.prayerReminderMinutes = defaultSettings.prayerReminderMinutes;
      }
      // Minimum interval: 1 minute (allow user to set very frequent reminders if they want)
      const MIN_INTERVAL_MINUTES = 1;
      if (typeof merged.dailyHadithRepeatInterval !== 'number' || merged.dailyHadithRepeatInterval < MIN_INTERVAL_MINUTES) {
        merged.dailyHadithRepeatInterval = defaultSettings.dailyHadithRepeatInterval;
      }
      if (typeof merged.dailyQuranVerseRepeatInterval !== 'number' || merged.dailyQuranVerseRepeatInterval < MIN_INTERVAL_MINUTES) {
        merged.dailyQuranVerseRepeatInterval = defaultSettings.dailyQuranVerseRepeatInterval;
      }
      if (typeof merged.hourlyReminderInterval !== 'number' || merged.hourlyReminderInterval < MIN_INTERVAL_MINUTES) {
        merged.hourlyReminderInterval = defaultSettings.hourlyReminderInterval;
      }
      
      // Validate time strings (HH:mm format)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(merged.dailyHadithTime)) merged.dailyHadithTime = defaultSettings.dailyHadithTime;
      if (!timeRegex.test(merged.dailyQuranVerseTime)) merged.dailyQuranVerseTime = defaultSettings.dailyQuranVerseTime;
      if (!timeRegex.test(merged.dailyDhikrTime)) merged.dailyDhikrTime = defaultSettings.dailyDhikrTime;
      if (!timeRegex.test(merged.fridayQuranTime)) merged.fridayQuranTime = defaultSettings.fridayQuranTime;
      
      return merged;
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      // If there's an error, clear corrupted data and return defaults
      try {
        localStorage.removeItem('reminder-settings');
      } catch (e) {
        // Ignore errors when clearing
      }
      return defaultSettings;
    }
  }

  // Save settings to localStorage
  saveSettings(settings: Partial<ReminderSettings>) {
    // Check if critical settings changed (intervals, times, enabled flags)
    // These changes require immediate regeneration of reminders
    const criticalSettingsChanged = 
      (settings.enabled !== undefined && settings.enabled !== this.settings.enabled) ||
      (settings.dailyHadithRepeatInterval !== undefined && settings.dailyHadithRepeatInterval !== this.settings.dailyHadithRepeatInterval) ||
      (settings.dailyQuranVerseRepeatInterval !== undefined && settings.dailyQuranVerseRepeatInterval !== this.settings.dailyQuranVerseRepeatInterval) ||
      (settings.dailyHadithTime !== undefined && settings.dailyHadithTime !== this.settings.dailyHadithTime) ||
      (settings.dailyQuranVerseTime !== undefined && settings.dailyQuranVerseTime !== this.settings.dailyQuranVerseTime) ||
      (settings.dailyHadith !== undefined && settings.dailyHadith !== this.settings.dailyHadith) ||
      (settings.dailyQuranVerse !== undefined && settings.dailyQuranVerse !== this.settings.dailyQuranVerse) ||
      (settings.dailyHadithRepeat !== undefined && settings.dailyHadithRepeat !== this.settings.dailyHadithRepeat) ||
      (settings.dailyQuranVerseRepeat !== undefined && settings.dailyQuranVerseRepeat !== this.settings.dailyQuranVerseRepeat) ||
      (settings.dailyDhikr !== undefined && settings.dailyDhikr !== this.settings.dailyDhikr) ||
      (settings.dailyDhikrTime !== undefined && settings.dailyDhikrTime !== this.settings.dailyDhikrTime) ||
      (settings.fridayQuran !== undefined && settings.fridayQuran !== this.settings.fridayQuran) ||
      (settings.fridayQuranTime !== undefined && settings.fridayQuranTime !== this.settings.fridayQuranTime) ||
      (settings.prayerReminders !== undefined && settings.prayerReminders !== this.settings.prayerReminders) ||
      (settings.prayerReminderMinutes !== undefined && settings.prayerReminderMinutes !== this.settings.prayerReminderMinutes) ||
      (settings.hourlyReminder !== undefined && settings.hourlyReminder !== this.settings.hourlyReminder) ||
      (settings.hourlyReminderInterval !== undefined && settings.hourlyReminderInterval !== this.settings.hourlyReminderInterval);
    
    // Merge settings - ensure all values are properly updated
    this.settings = { ...this.settings, ...settings };
    
    // Explicitly update each property to ensure no undefined values remain
    Object.keys(settings).forEach(key => {
      const value = settings[key as keyof ReminderSettings];
      if (value !== undefined && value !== null) {
        (this.settings as any)[key] = value;
      }
    });
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('reminder-settings', JSON.stringify(this.settings));
        
        // If critical settings changed, force regeneration by clearing last-update
        if (criticalSettingsChanged) {
          localStorage.removeItem('reminders-last-update');
          // Also clear existing reminders to force regeneration
          this.reminders = [];
          
          // If enabled, trigger immediate update (but prevent recursion)
          if (this.settings.enabled && !this.isUpdating) {
            // Use setTimeout to avoid blocking and prevent recursion
            setTimeout(() => {
              if (!this.isUpdating) {
                this.updateReminders();
              }
            }, 100);
          } else if (!this.settings.enabled) {
            // If disabled, stop the service
            this.stop();
          }
        }
      } catch (error) {
        console.error('Error saving reminder settings:', error);
      }
    }
  }

  getSettings(): ReminderSettings {
    return { ...this.settings };
  }

  // Set prayer times
  setPrayerTimes(prayerTimes: IPrayerTimes | null) {
    this.prayerTimes = prayerTimes;
  }

  // Set callback for when reminder is triggered
  setOnReminderCallback(callback: (reminder: Reminder) => void) {
    this.onReminderCallback = callback;
  }

  // Parse time string (HH:mm) to Date for today
  private parseTime(timeString: string, forRepeat: boolean = false): Date {
    // Validate time string format
    if (!timeString || !timeString.includes(':')) {
      console.warn('Invalid time string format:', timeString);
      // Default to current time + 1 hour if invalid
      return new Date(Date.now() + 60 * 60 * 1000);
    }
    
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1] || '0', 10);
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid time values:', { hours, minutes });
      // Default to current time + 1 hour if invalid
      return new Date(Date.now() + 60 * 60 * 1000);
    }
    
    const now = new Date();
    const time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    
    // If for repeat and time has passed, start from next interval
    if (forRepeat && time < now) {
      // Add 1 hour to ensure it's in the future
      return new Date(now.getTime() + 60 * 60 * 1000);
    }
    
    // If time has passed today and not for repeat, set for tomorrow
    if (time < now) {
      time.setDate(time.getDate() + 1);
    }
    
    return time;
  }

  // Calculate prayer reminder time
  private calculatePrayerReminderTime(prayerTime: string, minutesBefore: number): Date {
    // Validate prayer time format
    if (!prayerTime || !prayerTime.includes(':')) {
      console.warn('Invalid prayer time format:', prayerTime);
      // Default to current time + 1 hour if invalid
      return new Date(Date.now() + 60 * 60 * 1000);
    }
    
    const parts = prayerTime.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1] || '0', 10);
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.warn('Invalid prayer time values:', { hours, minutes });
      // Default to current time + 1 hour if invalid
      return new Date(Date.now() + 60 * 60 * 1000);
    }
    
    // Validate minutesBefore
    const validMinutesBefore = Math.max(0, Math.min(1440, minutesBefore)); // Clamp between 0 and 24 hours
    
    const now = new Date();
    const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
    
    // Subtract reminder minutes
    const reminderDate = new Date(prayerDate.getTime() - validMinutesBefore * 60 * 1000);
    
    // If reminder time has passed, set for next day
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    return reminderDate;
  }

  // Get daily hadith with randomization based on time
  private getDailyHadith(): Hadith {
    return this.getDailyHadithForTime(new Date());
  }

  // Get daily hadith for a specific time
  private getDailyHadithForTime(time: Date): Hadith {
    const start = new Date(time.getFullYear(), 0, 0);
    const diff = time.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Add hour, minute, and second to create variation throughout the day
    const hourOfDay = time.getHours();
    const minuteOfHour = time.getMinutes();
    const secondOfMinute = time.getSeconds();
    const combinedIndex = (dayOfYear * 24 * 60 * 60 + hourOfDay * 60 * 60 + minuteOfHour * 60 + secondOfMinute) % hadithCollection.length;
    
    return hadithCollection[combinedIndex];
  }
  
  // Get daily Quran verse with randomization based on time
  private getDailyQuranVerse(): { arabic: string; translation: string; reference: string } {
    return this.getDailyQuranVerseForTime(new Date());
  }

  // Get daily Quran verse for a specific time
  private getDailyQuranVerseForTime(time: Date): { arabic: string; translation: string; reference: string } {
    const verses = [
      {
        arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
        reference: 'سورة الشرح: 5-6'
      },
      {
        arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ',
        translation: 'And despair not of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people.',
        reference: 'سورة يوسف: 87'
      },
      {
        arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
        translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
        reference: 'سورة البقرة: 152'
      },
      {
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        translation: 'And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
        reference: 'سورة البقرة: 186'
      },
      {
        arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
        reference: 'سورة البقرة: 153'
      },
      {
        arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
        translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
        reference: 'سورة آل عمران: 8'
      },
      {
        arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
        translation: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.',
        reference: 'سورة الطلاق: 3'
      },
      {
        arabic: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
        translation: 'Indeed, the patient will be given their reward without account.',
        reference: 'سورة الزمر: 10'
      },
      {
        arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        translation: 'And say, "My Lord, increase me in knowledge."',
        reference: 'سورة طه: 114'
      },
      {
        arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        translation: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.',
        reference: 'سورة آل عمران: 173'
      },
      {
        arabic: 'وَمَا أَصَابَكُم مِّن مُّصِيبَةٍ فَبِمَا كَسَبَتْ أَيْدِيكُمْ وَيَعْفُو عَن كَثِيرٍ',
        translation: 'And whatever strikes you of disaster - it is for what your hands have earned; but He pardons much.',
        reference: 'سورة الشورى: 30'
      },
      {
        arabic: 'فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ ۖ وَلَا يَسْتَخِفَّنَّكَ الَّذِينَ لَا يُوقِنُونَ',
        translation: 'So be patient. Indeed, the promise of Allah is truth. And let them not disquiet you who are not certain [in faith].',
        reference: 'سورة الروم: 60'
      },
      {
        arabic: 'وَاللَّهُ يُرِيدُ أَن يَتُوبَ عَلَيْكُمْ',
        translation: 'And Allah wants to accept your repentance.',
        reference: 'سورة النساء: 27'
      },
      {
        arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
        translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins."',
        reference: 'سورة الزمر: 53'
      },
      {
        arabic: 'وَلَنَبْلُوَنَّكُم بِشَيْءٍ مِّنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِّنَ الْأَمْوَالِ وَالْأَنفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ',
        translation: 'And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.',
        reference: 'سورة البقرة: 155'
      },
      {
        arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي',
        translation: 'My Lord, expand for me my breast and ease for me my task.',
        reference: 'سورة طه: 25-26'
      },
      {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ',
        translation: 'And He is with you wherever you are. And Allah, of what you do, is Seeing.',
        reference: 'سورة الحديد: 4'
      },
      {
        arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        translation: 'Verily, in the remembrance of Allah do hearts find rest.',
        reference: 'سورة الرعد: 28'
      },
      {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
        translation: 'And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.',
        reference: 'سورة الطلاق: 2-3'
      },
      {
        arabic: 'فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
        translation: 'Indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
        reference: 'سورة البقرة: 186'
      }
    ];
    
    const start = new Date(time.getFullYear(), 0, 0);
    const diff = time.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Add hour, minute, and second to create more variation
    const hourOfDay = time.getHours();
    const minuteOfHour = time.getMinutes();
    const secondOfMinute = time.getSeconds();
    // Use a combination that changes with each reminder
    const combinedIndex = (dayOfYear * 24 * 60 * 60 + hourOfDay * 60 * 60 + minuteOfHour * 60 + secondOfMinute) % verses.length;
    
    return verses[combinedIndex];
  }
  
  // Get first ayahs from Surah Al-Kahf
  private getKahfAyahs(): { ayah: string; translation: string }[] {
    return [
      {
        ayah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful'
      },
      {
        ayah: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا',
        translation: '[All] praise is [due] to Allah, who has sent down upon His Servant the Book and has not made therein any deviance'
      },
      {
        ayah: 'قَيِّمًا لِّيُنذِرَ بَأْسًا شَدِيدًا مِّن لَّدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا',
        translation: '[He has made it] straight, to warn of severe punishment from Him and to give good tidings to the believers'
      }
    ];
  }

  // Check if today is Friday
  private isFriday(): boolean {
    return new Date().getDay() === 5; // 5 = Friday
  }

  // Update all reminders based on current settings and prayer times
  updateReminders() {
    // Prevent infinite recursion
    if (this.isUpdating) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ ReminderService: updateReminders called while already updating, skipping');
      }
      return;
    }
    
    if (!this.settings.enabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ ReminderService: Reminders disabled, stopping service');
      }
      this.stop();
      return;
    }

    // Updating reminders
    this.isUpdating = true;
    
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Keep only reminders that haven't been shown yet and are still valid
      const activeReminders = this.reminders.filter(
        (r) => !r.shown && r.time > now
      );

      // Check if we need to regenerate reminders for today
      const lastUpdate = typeof window !== 'undefined' ? localStorage.getItem('reminders-last-update') : null;
      const todayStr = today.toISOString().split('T')[0];
      // Force regeneration if no last update, different day, no active reminders, or reminders list is empty
      const needsRegeneration = lastUpdate !== todayStr || activeReminders.length === 0 || this.reminders.length === 0;

      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 ReminderService: Updating reminders', {
          today: todayStr,
          lastUpdate,
          needsRegeneration,
          activeRemindersCount: activeReminders.length,
          totalRemindersCount: this.reminders.length
        });
      }

      if (needsRegeneration) {
        this.reminders = [];
        if (typeof window !== 'undefined') {
          localStorage.setItem('reminders-last-update', todayStr);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('✨ ReminderService: Regenerating reminders for', todayStr);
        }
      } else {
        // Keep existing active reminders (don't regenerate if we already have reminders for today)
        // Only add new ones if we're missing some
        if (activeReminders.length > 0) {
          this.reminders = activeReminders;
          if (process.env.NODE_ENV === 'development') {
            console.log('♻️ ReminderService: Keeping existing active reminders', {
              count: activeReminders.length
            });
          }
          // Don't regenerate if we already have reminders - this prevents duplicate creation
          return;
        }
      }

      // Prayer reminders
      if (this.settings.prayerReminders && this.prayerTimes) {
        this.prayerTimes.times.forEach((prayer, index) => {
          if (index === TimeNames.Sunrise) return; // Skip sunrise
          
          const reminderTime = this.calculatePrayerReminderTime(
            prayer.time,
            this.settings.prayerReminderMinutes
          );

          const reminderId = `prayer-${index}-${todayStr}`;
          const existingReminder = this.reminders.find(r => r.id === reminderId);
          
          if (!existingReminder || !existingReminder.shown) {
            this.reminders.push({
              id: reminderId,
              type: 'prayer',
              title: `تذكير بموعد الصلاة`,
              message: `موعد صلاة ${prayerNamesArabic[index as TimeNames]} بعد ${this.settings.prayerReminderMinutes} دقائق`,
              time: reminderTime,
              data: { prayerName: prayerNamesArabic[index as TimeNames], prayerIndex: index },
              shown: existingReminder?.shown || false,
            });
          }
        });
      }

      // Daily Hadith reminder
      if (this.settings.dailyHadith) {
        const hadith = this.getDailyHadith();
        
        if (this.settings.dailyHadithRepeat) {
          // Smart timing: Show Hadith at regular intervals throughout the day
          // This ensures users get reminders but not too frequently
          const MIN_INTERVAL_MINUTES = 1; // Minimum 1 minute (allow user to set very frequent reminders)
          const intervalMinutes = Math.max(MIN_INTERVAL_MINUTES, this.settings.dailyHadithRepeatInterval || 180); // Default: 3 hours, minimum 1 minute
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          
          // Parse the start time from settings (for today)
          const [hours, minutes] = this.settings.dailyHadithTime.split(':').map(Number);
          const startTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes || 0, 0, 0);
          
          // Determine the first reminder time - always start from now if interval is small (<= 15 min)
          // Otherwise, use startTime if it's in the future
          let currentTime: Date;
          
          // If interval is small (<= 15 minutes), always start from now, even if startTime is in the future
          // This allows users to get reminders immediately when they set small intervals
          if (startTimeToday > now && intervalMinutes > 15) {
            // Start time hasn't passed today AND interval is large, use start time
            currentTime = new Date(startTimeToday);
          } else {
            // Start from next interval after CURRENT time (don't wait for startTime if interval is small)
            // Round up current time to next interval
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
            const nextIntervalMinutes = Math.ceil((currentTotalMinutes + 1) / intervalMinutes) * intervalMinutes;
            
            // Calculate next reminder time from current time
            currentTime = new Date(now);
            const nextHours = Math.floor(nextIntervalMinutes / 60);
            const nextMins = nextIntervalMinutes % 60;
            
            // Check if we've gone past 24 hours
            if (nextHours >= 24) {
              // Go to tomorrow's start time
              currentTime = new Date(startTimeToday.getTime() + 24 * 60 * 60 * 1000);
            } else {
              currentTime.setHours(nextHours);
              currentTime.setMinutes(nextMins);
              currentTime.setSeconds(0);
              currentTime.setMilliseconds(0);
            }
            
            // If the calculated time is still in the past (shouldn't happen, but safety check), add one interval
            if (currentTime <= now) {
              currentTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
            }
            
            // If we've gone past end of day, start from tomorrow's start time
            if (currentTime > endOfDay) {
              currentTime = new Date(startTimeToday.getTime() + 24 * 60 * 60 * 1000);
            }
          }
          
          let repeatCount = 0;
          // Calculate max repeats: limit to reasonable number to avoid spam
          // For very short intervals (like 1 minute), limit to prevent excessive reminders
          const hoursInDay = 16; // 8am to 12am = 16 hours
          const calculatedMax = Math.floor((hoursInDay * 60) / intervalMinutes);
          const maxRepeats = Math.min(calculatedMax, 1440); // Absolute maximum: 1440 (one per minute for 24 hours)
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📖 ReminderService: Creating Hadith reminders', {
              intervalMinutes,
              now: now.toISOString(),
              startTime: startTimeToday.toISOString(),
              firstReminderTime: currentTime.toISOString(),
              timeFromNow: Math.round((currentTime.getTime() - now.getTime()) / 1000 / 60) + ' minutes',
              endOfDay: endOfDay.toISOString(),
              maxRepeats
            });
          }
          
          // Track used hadith indices to ensure variety
          const usedHadithIndices = new Set<number>();
          
          while (currentTime <= endOfDay && repeatCount < maxRepeats) {
            const reminderId = `hadith-${todayStr}-${repeatCount}`;
            const existingReminder = this.reminders.find(r => r.id === reminderId);
            
            // Skip if reminder already exists and was shown
            if (existingReminder && existingReminder.shown) {
              currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
              repeatCount++;
              continue;
            }
            
            // Get a different hadith for each reminder based on the reminder time
            // Add repeatCount to ensure variation even at same time
            const timeForVariation = new Date(currentTime.getTime() + repeatCount * 1000);
            const hadithForReminder = this.getDailyHadithForTime(timeForVariation);
            
            const reminderTime = new Date(currentTime);
            
            // Only add if it doesn't exist or wasn't shown
            if (!existingReminder || !existingReminder.shown) {
              this.reminders.push({
                id: reminderId,
                type: 'hadith',
                title: 'الحديث اليومي',
                message: hadithForReminder.arabic.substring(0, 100) + '...',
                time: reminderTime,
                data: { hadith: hadithForReminder },
                shown: existingReminder?.shown || false,
              });
              
              if (process.env.NODE_ENV === 'development' && repeatCount < 3) {
                console.log(`📖 ReminderService: Created hadith reminder #${repeatCount}`, {
                  id: reminderId,
                  time: reminderTime.toISOString(),
                  timeFromNow: Math.round((reminderTime.getTime() - now.getTime()) / 1000 / 60) + ' minutes'
                });
              }
            }
            
            currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
            repeatCount++;
          }
          
          if (process.env.NODE_ENV === 'development') {
            const hadithReminders = this.reminders.filter(r => r.type === 'hadith' && !r.shown);
            console.log('📖 ReminderService: Hadith reminders summary', {
              total: hadithReminders.length,
              nextOne: hadithReminders[0] ? {
                time: hadithReminders[0].time.toISOString(),
                minutesFromNow: Math.round((hadithReminders[0].time.getTime() - now.getTime()) / 1000 / 60)
              } : null
            });
          }
        } else {
          // Single reminder at specified time
          const hadithTime = this.parseTime(this.settings.dailyHadithTime, false);
          const reminderId = `hadith-${todayStr}`;
          
          if (hadithTime > now) {
            this.reminders.push({
              id: reminderId,
              type: 'hadith',
              title: 'الحديث اليومي',
              message: hadith.arabic.substring(0, 100) + '...',
              time: hadithTime,
              data: { hadith },
              shown: false,
            });
          }
        }
      }

      // Daily Quran Verse reminder
      if (this.settings.dailyQuranVerse) {
        const verse = this.getDailyQuranVerse();
        
        if (this.settings.dailyQuranVerseRepeat) {
          // Smart timing: Show Quran verses at regular intervals (offset from Hadith)
          // This creates a nice balance: Hadith at 8am, 11am, 2pm, 5pm, 8pm
          //                            Quran at 9:30am, 1:30pm, 5:30pm, 9:30pm
          const MIN_INTERVAL_MINUTES = 1; // Minimum 1 minute (user can set any value)
          const intervalMinutes = Math.max(MIN_INTERVAL_MINUTES, this.settings.dailyQuranVerseRepeatInterval || 240); // Default: 4 hours, minimum 1 minute
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          
          // Parse the start time from settings (for today)
          const [hours, minutes] = this.settings.dailyQuranVerseTime.split(':').map(Number);
          const startTimeToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes || 0, 0, 0);
          
          // Determine the first reminder time - always start from now if interval is small, otherwise use startTime
          let currentTime: Date;
          
          // If interval is small (<= 15 minutes) or start time has passed, start from now
          // Otherwise, wait for start time
          if (startTimeToday > now && intervalMinutes > 15) {
            // Start time hasn't passed today and interval is large, use start time
            currentTime = new Date(startTimeToday);
          } else {
            // Start from next interval after CURRENT time
            // Round up current time to next interval
            const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
            const nextIntervalMinutes = Math.ceil((currentTotalMinutes + 1) / intervalMinutes) * intervalMinutes;
            
            // Calculate next reminder time from current time
            currentTime = new Date(now);
            const nextHours = Math.floor(nextIntervalMinutes / 60);
            const nextMins = nextIntervalMinutes % 60;
            
            // Check if we've gone past 24 hours
            if (nextHours >= 24) {
              // Go to tomorrow's start time
              currentTime = new Date(startTimeToday.getTime() + 24 * 60 * 60 * 1000);
            } else {
              currentTime.setHours(nextHours);
              currentTime.setMinutes(nextMins);
              currentTime.setSeconds(0);
              currentTime.setMilliseconds(0);
            }
            
            // If the calculated time is still in the past (shouldn't happen, but safety check), add one interval
            if (currentTime <= now) {
              currentTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
            }
            
            // If we've gone past end of day, start from tomorrow's start time
            if (currentTime > endOfDay) {
              currentTime = new Date(startTimeToday.getTime() + 24 * 60 * 60 * 1000);
            }
            
            // If interval is small (<= 15 minutes), always start from now, even if startTime is in the future
            // This allows users to get reminders immediately when they set small intervals
            // Only wait for startTime if interval is large (> 15 minutes)
            if (startTimeToday > now && intervalMinutes > 15) {
              // If start time is in the future and interval is large, use start time
              currentTime = new Date(startTimeToday);
            }
          }
          
          let repeatCount = 0;
          // Calculate max repeats: limit to reasonable number to avoid spam
          const hoursInDay = 16; // 8am to 12am = 16 hours
          const calculatedMax = Math.floor((hoursInDay * 60) / intervalMinutes);
          const maxRepeats = Math.min(calculatedMax, 1440); // Absolute maximum: 1440
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📗 ReminderService: Creating Quran verse reminders', {
              intervalMinutes,
              now: now.toISOString(),
              startTime: startTimeToday.toISOString(),
              firstReminderTime: currentTime.toISOString(),
              timeFromNow: Math.round((currentTime.getTime() - now.getTime()) / 1000 / 60) + ' minutes',
              endOfDay: endOfDay.toISOString(),
              maxRepeats
            });
          }
          
          while (currentTime <= endOfDay && repeatCount < maxRepeats) {
            const reminderId = `quran-verse-${todayStr}-${repeatCount}`;
            const existingReminder = this.reminders.find(r => r.id === reminderId);
            
            // Skip if reminder already exists and was shown
            if (existingReminder && existingReminder.shown) {
              currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
              repeatCount++;
              continue;
            }
            
            // Get a different verse for each reminder based on the reminder time
            // Add repeatCount to ensure variation even at same time
            const timeForVariation = new Date(currentTime.getTime() + repeatCount * 1000);
            const verseForReminder = this.getDailyQuranVerseForTime(timeForVariation);
            
            const reminderTime = new Date(currentTime);
            
            // Only add if it doesn't exist or wasn't shown
            if (!existingReminder || !existingReminder.shown) {
              this.reminders.push({
                id: reminderId,
                type: 'quran-verse',
                title: 'آية قرآنية',
                message: verseForReminder.arabic.substring(0, 100) + '...',
                time: reminderTime,
                data: { verse: verseForReminder },
                shown: existingReminder?.shown || false,
              });
            }
            
            currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
            repeatCount++;
          }
        } else {
          // Single reminder at specified time
          const verseTime = this.parseTime(this.settings.dailyQuranVerseTime, false);
          const reminderId = `quran-verse-${todayStr}`;
          
          if (verseTime > now) {
            this.reminders.push({
              id: reminderId,
              type: 'quran-verse',
              title: 'آية قرآنية',
              message: verse.arabic.substring(0, 100) + '...',
              time: verseTime,
              data: { verse },
              shown: false,
            });
          }
        }
      }

      // Friday Quran reminder (Surah Al-Kahf)
      if (this.settings.fridayQuran && this.isFriday()) {
        const quranTime = this.parseTime(this.settings.fridayQuranTime);
        const reminderId = `friday-quran-${todayStr}`;
        const existingReminder = this.reminders.find(r => r.id === reminderId);
        const kahfAyahs = this.getKahfAyahs();
        
        // Only add if it's Friday and time hasn't passed
        if (quranTime > now && (!existingReminder || !existingReminder.shown)) {
          this.reminders.push({
            id: reminderId,
            type: 'friday',
            title: 'قراءة سورة الكهف',
            message: 'يوم الجمعة المبارك، اقرأ سورة الكهف لتكون نوراً بين الجمعتين',
            time: quranTime,
            data: { 
              surahNumber: 18, 
              surahName: 'الكهف',
              ayahs: kahfAyahs 
            },
            shown: existingReminder?.shown || false,
          });
        }
      }

      // Daily Dhikr reminder - Morning & Evening only (2 times per day)
      // Islamic tradition: Morning (after Fajr) and Evening (after Asr)
      if (this.settings.dailyDhikr) {
        // Morning Dhikr - After Fajr (6:00 AM by default)
        const morningTime = this.parseTime(this.settings.dailyDhikrTime || '06:00', false);
        const morningReminderId = `dhikr-morning-${todayStr}`;
        const existingMorningReminder = this.reminders.find(r => r.id === morningReminderId);
        
        if (morningTime > now && (!existingMorningReminder || !existingMorningReminder.shown)) {
          this.reminders.push({
            id: morningReminderId,
            type: 'dhikr',
            title: 'أذكار الصباح',
            message: 'حان وقت أذكار الصباح، ابدأ يومك بذكر الله',
            time: morningTime,
            data: { period: 'morning' },
            shown: existingMorningReminder?.shown || false,
          });
        }
        
        // Evening Dhikr - After Asr (5:00 PM - fixed time)
        const eveningHour = 17; // 5:00 PM
        const eveningTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eveningHour, 0, 0);
        // If evening time has passed, set for tomorrow
        if (eveningTime <= now) {
          eveningTime.setDate(eveningTime.getDate() + 1);
        }
        const eveningReminderId = `dhikr-evening-${todayStr}`;
        const existingEveningReminder = this.reminders.find(r => r.id === eveningReminderId);
        
        if (eveningTime > now && (!existingEveningReminder || !existingEveningReminder.shown)) {
          this.reminders.push({
            id: eveningReminderId,
            type: 'dhikr',
            title: 'أذكار المساء',
            message: 'حان وقت أذكار المساء، اختم يومك بذكر الله',
            time: eveningTime,
            data: { period: 'evening' },
            shown: existingEveningReminder?.shown || false,
          });
        }
        // Note: Night dhikr removed - only morning and evening as per requirements
      }

      // Hourly reminder - Gentle periodic reminders (optional, disabled by default)
      if (this.settings.hourlyReminder) {
        const intervalMinutes = this.settings.hourlyReminderInterval || 120; // Default: 2 hours
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0); // Stop at 10 PM
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0); // Start at 8 AM
        
        // Start from next interval time or 8 AM (whichever is later)
        let currentTime = now < startOfDay ? startOfDay : new Date(now.getTime() + intervalMinutes * 60 * 1000);
        
        // Round to nearest interval
        const roundedMinutes = Math.ceil(currentTime.getMinutes() / intervalMinutes) * intervalMinutes;
        currentTime.setMinutes(roundedMinutes);
        currentTime.setSeconds(0);
        currentTime.setMilliseconds(0);
        
        let repeatCount = 0;
        // Calculate max repeats based on interval (e.g., 2 hours = 7 per day from 8am to 10pm)
        const maxRepeats = Math.floor(((22 - 8) * 60) / intervalMinutes); // From 8am to 10pm
        
        while (currentTime <= endOfDay && repeatCount < maxRepeats) {
          const reminderId = `hourly-${todayStr}-${repeatCount}`;
          
          // Get varied content for hourly reminders
          const hadith = this.getDailyHadithForTime(currentTime);
          const verse = this.getDailyQuranVerseForTime(currentTime);
          
          // Alternate between Hadith and Quran verses
          const useHadith = repeatCount % 2 === 0;
          
          this.reminders.push({
            id: reminderId,
            type: useHadith ? 'hadith' : 'quran-verse',
            title: useHadith ? 'تذكير: حديث شريف' : 'تذكير: آية كريمة',
            message: useHadith 
              ? hadith.arabic.substring(0, 80) + '...'
              : verse.arabic.substring(0, 80) + '...',
            time: new Date(currentTime),
            data: useHadith ? { hadith } : { verse },
            shown: false,
          });
          
          currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
          repeatCount++;
        }
      }

      // Sort reminders by time
      this.reminders.sort((a, b) => a.time.getTime() - b.time.getTime());

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ ReminderService: Reminders updated successfully', {
          totalReminders: this.reminders.length,
          nextReminder: this.reminders[0] ? {
            type: this.reminders[0].type,
            time: this.reminders[0].time.toISOString()
          } : null
        });
      }

      // Only start service if callback is set (prevents reminders from triggering before callback is ready)
      // start() will be called explicitly from useReminder hook after callback is set
      if (this.onReminderCallback && !this.isRunning()) {
        this.start();
      } else if (!this.onReminderCallback && process.env.NODE_ENV === 'development') {
        console.log('ℹ️ ReminderService: Callback not set yet, waiting for callback before starting...');
      }
    } catch (error) {
      console.error('❌ ReminderService: Error updating reminders:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Start checking for reminders
  start() {
    this.stop(); // Clear any existing interval

    if (process.env.NODE_ENV === 'development') {
      console.log('▶️ ReminderService: Starting reminder checks', {
        hasCallback: !!this.onReminderCallback
      });
    }

    // Warn if callback is not set yet (should be set before start())
    if (!this.onReminderCallback && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ ReminderService: Starting without callback - reminders may not trigger modals');
    }

    // Check immediately
    this.checkReminders();

    // Check every 10 seconds for more responsive reminders
    this.intervalId = setInterval(() => {
      this.checkReminders();
    }, 10000); // Check every 10 seconds
  }

  // Stop checking for reminders
  stop() {
    if (this.intervalId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏹️ ReminderService: Stopping reminder checks');
      }
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Check if service is running
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  // Check if any reminders should be shown
  private checkReminders() {
    const now = new Date();

    // Log check in development (but not too frequently - every 60 seconds)
    if (process.env.NODE_ENV === 'development') {
      const lastCheckLog = (this as any).__lastCheckLog || 0;
      if (now.getTime() - lastCheckLog > 60000) {
        console.log('⏰ ReminderService: Checking reminders', {
          totalReminders: this.reminders.length,
          activeReminders: this.reminders.filter(r => !r.shown).length,
          nextReminder: this.reminders.find(r => !r.shown && r.time > now)?.time?.toISOString(),
        });
        (this as any).__lastCheckLog = now.getTime();
      }
    }

    // Find reminders that should be shown now
    const remindersToShow = this.reminders.filter(
      (reminder) => !reminder.shown && reminder.time <= now
    );

    if (remindersToShow.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔔 ReminderService: Found reminders to show', {
          count: remindersToShow.length,
          types: remindersToShow.map(r => r.type),
          reminders: remindersToShow.map(r => ({ id: r.id, type: r.type, time: r.time.toISOString() }))
        });
      }
    }

    // Trigger each reminder
    remindersToShow.forEach((reminder) => {
      reminder.shown = true;
      this.triggerReminder(reminder);
    });

    // Remove shown reminders that have passed
    const beforeCount = this.reminders.length;
    this.reminders = this.reminders.filter((r) => !r.shown || r.time > now);
    
    if (beforeCount !== this.reminders.length && process.env.NODE_ENV === 'development') {
      console.log('🧹 ReminderService: Cleaned up reminders', {
        before: beforeCount,
        after: this.reminders.length
      });
    }
    
    // Check if we need to regenerate for a new day (only if no active reminders)
    // Use setTimeout to prevent recursion
    if (this.reminders.length === 0 && !this.isUpdating) {
      const lastUpdate = typeof window !== 'undefined' ? localStorage.getItem('reminders-last-update') : null;
      const today = new Date().toISOString().split('T')[0];
      
      if (lastUpdate !== today) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ReminderService: No reminders left, regenerating for new day');
        }
        // Regenerate for new day with delay to prevent recursion
        setTimeout(() => {
          if (!this.isUpdating) {
            this.updateReminders();
          }
        }, 2000);
      }
    }
  }

  // Trigger a reminder
  private triggerReminder(reminder: Reminder) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 ReminderService: Triggering reminder', {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        hasCallback: !!this.onReminderCallback,
      });
    }
    
    // Call callback if set
    if (this.onReminderCallback) {
      try {
        this.onReminderCallback(reminder);
        // Mark reminder as shown after successful callback
        reminder.shown = true;
      } catch (error) {
        console.error('Error in reminder callback:', error);
        // Mark as shown even on error to prevent retry loop
        reminder.shown = true;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ ReminderService: No callback set for reminder, will retry in 1 second', reminder.id);
      }
      // Retry after 1 second in case callback is being set (race condition)
      setTimeout(() => {
        if (this.onReminderCallback) {
          try {
            this.onReminderCallback(reminder);
            reminder.shown = true;
          } catch (error) {
            console.error('Error in reminder callback (retry):', error);
            reminder.shown = true;
          }
        } else {
          console.error('❌ ReminderService: Callback still not set after retry, marking as shown', reminder.id);
          // Mark as shown anyway to prevent infinite retries
          reminder.shown = true;
        }
      }, 1000);
      // Don't mark as shown yet - wait for retry
      return;
    }

    // Show browser notification if enabled (if callback was called, notification is handled in callback)
    // This is redundant but kept for backward compatibility
    if (this.settings.browserNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(reminder.title, {
            body: reminder.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            lang: 'ar',
            dir: 'rtl',
          });
        } catch (error) {
          console.error('Error showing browser notification:', error);
        }
      }
    }
  }

  // Get upcoming reminders
  getUpcomingReminders(count: number = 5): Reminder[] {
    return this.reminders
      .filter((r) => !r.shown && r.time > new Date())
      .slice(0, count);
  }

  // Request browser notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

// Singleton instance
let reminderServiceInstance: ReminderService | null = null;

export function getReminderService(): ReminderService {
  if (!reminderServiceInstance) {
    reminderServiceInstance = new ReminderService();
  }
  return reminderServiceInstance;
}
