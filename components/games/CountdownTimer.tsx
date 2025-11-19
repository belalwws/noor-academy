'use client';

import { useState, useEffect, useCallback } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { motion } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import { useGameSounds } from '@/hooks/useGameSounds';

export interface CountdownTimerProps {
  /**
   * Duration in seconds
   */
  duration: number;
  
  /**
   * Whether the timer is playing
   * Default: true
   */
  isPlaying?: boolean;
  
  /**
   * Callback when timer completes
   */
  onComplete?: () => void;
  
  /**
   * Callback when time is running low (30 seconds remaining)
   */
  onTimeWarning?: () => void;
  
  /**
   * Size of the timer circle in pixels
   * Default: 120
   */
  size?: number;
  
  /**
   * Stroke width
   * Default: 8
   */
  strokeWidth?: number;
  
  /**
   * Whether to show warning colors when time is low
   * Default: true
   */
  showWarningColors?: boolean;
  
  /**
   * Whether to play warning sounds
   * Default: true
   */
  playWarningSounds?: boolean;
  
  /**
   * Custom colors array [normal, warning, critical, expired]
   * Default: App theme colors
   */
  colors?: string[];
  
  /**
   * Times for color transitions [normal, warning, critical, expired] in seconds
   * Default: [70%, 30%, 10%, 0%] of duration
   */
  colorsTime?: number[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show remaining time text
   * Default: true
   */
  showTime?: boolean;
  
  /**
   * Format function for displaying time
   */
  formatTime?: (remainingTime: number) => string;
}

/**
 * CountdownTimer Component
 * 
 * A circular countdown timer with visual and audio warnings.
 * Perfect for timed quizzes and games.
 */
export function CountdownTimer({
  duration,
  isPlaying = true,
  onComplete,
  onTimeWarning,
  size = 120,
  strokeWidth = 8,
  showWarningColors = true,
  playWarningSounds = true,
  colors,
  colorsTime,
  className = '',
  showTime = true,
  formatTime,
}: CountdownTimerProps) {
  const [key, setKey] = useState(0);
  const [hasWarned, setHasWarned] = useState(false);
  const sounds = useGameSounds({ enabled: playWarningSounds });

  // Validate duration
  const validDuration = duration && duration > 0 ? duration : 60; // Default to 60 seconds if invalid
  
  // Default colors matching app theme
  const defaultColors = colors || ['#E9A821', '#FFB347', '#FF6B6B', '#FF0000'];
  
  // Default color times (70%, 30%, 10%, 0% of duration)
  const defaultColorsTime = colorsTime || [
    Math.floor(validDuration * 0.7),
    Math.floor(validDuration * 0.3),
    Math.floor(validDuration * 0.1),
    0,
  ];

  // Check for time warning - adapt to timer duration
  // For short timers (< 10s), warn at 3s. For longer timers, warn at 30s or 10% remaining
  const handleUpdate = useCallback((remainingTime: number) => {
    const warningThreshold = validDuration <= 10 ? 3 : Math.min(30, Math.floor(validDuration * 0.1));
    
    if (!hasWarned && remainingTime <= warningThreshold && remainingTime > 0) {
      setHasWarned(true);
      
      // Play warning sound
      if (playWarningSounds) {
        sounds.playTimeWarning();
      }
      
      // Call warning callback
      if (onTimeWarning) {
        onTimeWarning();
      }
    }
    
    // Reset warning flag if timer resets
    if (remainingTime > warningThreshold) {
      setHasWarned(false);
    }
  }, [hasWarned, playWarningSounds, sounds, onTimeWarning, validDuration]);

  // Handle timer completion
  const handleComplete = useCallback(() => {
    // Don't play sound here - let the parent component handle it
    // This prevents duplicate sounds
    
    if (onComplete) {
      onComplete();
    }
    
    // Reset for potential reuse
    setHasWarned(false);
  }, [onComplete]);

  // Format time display
  const formatTimeDisplay = useCallback((remainingTime: number): string => {
    if (formatTime) {
      return formatTime(remainingTime);
    }
    
    // Default format: MM:SS or SS
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return seconds.toString();
  }, [formatTime]);

  // Reset timer
  const reset = useCallback(() => {
    setKey((prev) => prev + 1);
    setHasWarned(false);
  }, []);

  // Expose reset method (can be accessed via ref if needed)
  useEffect(() => {
    // This can be extended to expose reset via ref
  }, []);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} dir="ltr">
      <div className="relative">
        <CountdownCircleTimer
          key={key}
          isPlaying={isPlaying}
          duration={validDuration}
          colors={showWarningColors ? defaultColors : defaultColors}
          colorsTime={defaultColorsTime}
          strokeWidth={strokeWidth}
          size={size}
          trailColor="#E5E7EB"
          strokeLinecap="round"
          onUpdate={handleUpdate}
          onComplete={handleComplete}
        >
          {({ remainingTime }) => (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              {showTime && (
                <div className="text-center">
                  <motion.div
                    key={remainingTime}
                    initial={{ scale: 1.2, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`text-2xl font-bold ${
                      remainingTime <= 30
                        ? 'text-red-600 dark:text-red-400'
                        : remainingTime <= validDuration * 0.3
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {formatTimeDisplay(remainingTime)}
                  </motion.div>
                  {remainingTime <= 30 && remainingTime > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1"
                    >
                      <AlertCircle size={12} />
                      <span>وقت منخفض</span>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </CountdownCircleTimer>
      </div>
      
      {/* Additional info */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <Clock size={14} />
          <span>متوقف</span>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Utility component for displaying timer status
 */
export function TimerStatus({ 
  remainingTime, 
  totalTime 
}: { 
  remainingTime: number; 
  totalTime: number;
}) {
  const percentage = (remainingTime / totalTime) * 100;
  const isLow = remainingTime <= 30;
  const isCritical = remainingTime <= 10;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${
            isCritical
              ? 'bg-red-600'
              : isLow
              ? 'bg-orange-600'
              : 'bg-green-600'
          }`}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          isCritical
            ? 'text-red-600 dark:text-red-400'
            : isLow
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {remainingTime}s
      </span>
    </div>
  );
}

