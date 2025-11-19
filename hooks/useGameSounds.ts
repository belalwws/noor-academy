'use client';

import { useMemo, useEffect } from 'react';
import useSound from 'use-sound';

export interface GameSoundsOptions {
  /**
   * Volume level (0-1)
   * Default: 0.5
   */
  volume?: number;
  
  /**
   * Whether sounds are enabled
   * Default: true
   */
  enabled?: boolean;
  
  /**
   * Base path for sound files
   * Default: '/sounds'
   */
  soundsPath?: string;
}

export interface GameSoundsReturn {
  /**
   * Play correct answer sound
   */
  playCorrect: () => void;
  
  /**
   * Play incorrect answer sound
   */
  playIncorrect: () => void;
  
  /**
   * Play win/victory sound
   */
  playWin: () => void;
  
  /**
   * Play time warning sound
   */
  playTimeWarning: () => void;
  
  /**
   * Whether sounds are currently enabled
   */
  enabled: boolean;
  
  /**
   * Current volume level
   */
  volume: number;
}

/**
 * useGameSounds Hook
 * 
 * Provides sound effects for interactive games.
 * Handles loading and playing game-related sounds.
 */
export function useGameSounds(options: GameSoundsOptions = {}): GameSoundsReturn {
  const {
    volume = 0.5,
    enabled = true,
    soundsPath = '/sounds',
  } = options;

  // Load sound files with error handling and preload
  const [playCorrectSound, { stop: stopCorrect }] = useSound(
    `${soundsPath}/correct.mp3`,
    {
      volume,
      interrupt: true,
      preload: true,
    }
  );

  const [playIncorrectSound, { stop: stopIncorrect }] = useSound(
    `${soundsPath}/incorrect.mp3`,
    {
      volume,
      interrupt: true,
      preload: true,
    }
  );

  const [playWinSound, { stop: stopWin }] = useSound(
    `${soundsPath}/win.mp3`,
    {
      volume,
      interrupt: true,
      preload: true,
    }
  );

  const [playTimeWarningSound, { stop: stopTimeWarning }] = useSound(
    `${soundsPath}/time-warning.mp3`,
    {
      volume,
      interrupt: true,
      preload: true,
    }
  );

  // Preload sounds on mount to avoid delay when playing
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      // Preload sounds by creating audio elements and loading them
      // This ensures sounds are ready when needed
      const preloadSounds = () => {
        try {
          const soundFiles = [
            `${soundsPath}/correct.mp3`,
            `${soundsPath}/incorrect.mp3`,
            `${soundsPath}/win.mp3`,
            `${soundsPath}/time-warning.mp3`,
          ];

          soundFiles.forEach((soundFile) => {
            try {
              const audio = new Audio();
              audio.volume = volume;
              audio.preload = 'auto';
              // Set source and load
              audio.src = soundFile;
              // Trigger load without playing
              const loadPromise = audio.load();
              // Handle load errors silently
              audio.addEventListener('error', () => {
                // Silently handle errors - file might not exist or might fail to load
              }, { once: true });
            } catch (error) {
              // Silently handle individual sound load errors
            }
          });
        } catch (error) {
          // Silently handle preload errors
        }
      };

      // Preload immediately to ensure sounds are ready
      preloadSounds();
    }
  }, [enabled, volume, soundsPath]);

  // Wrapper functions that check if sounds are enabled
  const playCorrect = useMemo(() => {
    return () => {
      if (enabled) {
        try {
          playCorrectSound();
        } catch (error) {
          console.warn('Failed to play correct sound:', error);
        }
      }
    };
  }, [enabled, playCorrectSound]);

  const playIncorrect = useMemo(() => {
    return () => {
      if (enabled) {
        try {
          playIncorrectSound();
        } catch (error) {
          console.warn('Failed to play incorrect sound:', error);
        }
      }
    };
  }, [enabled, playIncorrectSound]);

  const playWin = useMemo(() => {
    return () => {
      if (enabled) {
        try {
          playWinSound();
        } catch (error) {
          console.warn('Failed to play win sound:', error);
        }
      }
    };
  }, [enabled, playWinSound]);

  const playTimeWarning = useMemo(() => {
    return () => {
      if (enabled) {
        try {
          playTimeWarningSound();
        } catch (error) {
          console.warn('Failed to play time warning sound:', error);
        }
      }
    };
  }, [enabled, playTimeWarningSound]);

  return {
    playCorrect,
    playIncorrect,
    playWin,
    playTimeWarning,
    enabled,
    volume,
  };
}

/**
 * Hook for managing sound settings (volume, mute state)
 * Can be persisted to localStorage if needed
 */
export function useSoundSettings() {
  // This can be extended to use localStorage or context
  // For now, it's a simple implementation
  return {
    volume: 0.5,
    enabled: true,
  };
}

