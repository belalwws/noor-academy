/**
 * Custom Hook for Tasbih State
 * Provides backward-compatible interface for components using Zustand
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { RootState } from '../../store';
import {
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
} from '../slices/tasbihSlice';
import type { TasbihState } from '../slices/tasbihSlice';

// Helper function to play sound
const playSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Audio not supported
  }
};

// Helper function to vibrate
const vibrate = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
};

export const useTasbih = () => {
  const dispatch = useDispatch();
  const tasbih = useSelector((state: RootState) => state.tasbih);
  
  // Enhanced increment with sound and vibration
  const handleIncrement = useCallback(() => {
    dispatch(increment());
    
    // Play sound if enabled
    if (tasbih.soundEnabled) {
      playSound();
    }
    
    // Vibrate if enabled
    if (tasbih.vibrationEnabled) {
      vibrate();
    }
    
    // Auto reset if threshold reached
    if (tasbih.autoReset && tasbih.currentCount + 1 >= tasbih.resetThreshold) {
      setTimeout(() => {
        dispatch(saveSession());
        dispatch(updateStats());
        dispatch(reset());
      }, 500);
    }
  }, [dispatch, tasbih.soundEnabled, tasbih.vibrationEnabled, tasbih.autoReset, tasbih.resetThreshold, tasbih.currentCount]);
  
  // Enhanced saveSession that also updates stats
  const handleSaveSession = useCallback(() => {
    dispatch(saveSession());
    dispatch(updateStats());
  }, [dispatch]);
  
  // Initialize store function - memoized to prevent infinite loops
  const handleInitializeStore = useCallback(() => {
    dispatch(updateStats());
  }, [dispatch]);

  // Initialize store on mount (only once)
  useEffect(() => {
    dispatch(updateStats());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return {
    // State
    currentCount: tasbih.currentCount,
    selectedDhikr: tasbih.selectedDhikr,
    sessionStartTime: tasbih.sessionStartTime ? new Date(tasbih.sessionStartTime) : null,
    dailyGoal: tasbih.dailyGoal,
    customGoals: tasbih.customGoals,
    sessions: tasbih.sessions.map(session => ({
      ...session,
      completedAt: new Date(session.completedAt),
    })),
    stats: tasbih.stats,
    soundEnabled: tasbih.soundEnabled,
    vibrationEnabled: tasbih.vibrationEnabled,
    autoReset: tasbih.autoReset,
    resetThreshold: tasbih.resetThreshold,
    
    // Actions
    increment: handleIncrement,
    reset: () => dispatch(reset()),
    setDhikr: (dhikr: string) => dispatch(setDhikr(dhikr)),
    setDailyGoal: (goal: number) => dispatch(setDailyGoal(goal)),
    saveSession: handleSaveSession,
    updateStats: () => dispatch(updateStats()),
    initializeStore: handleInitializeStore,
    toggleSound: () => dispatch(toggleSound()),
    toggleVibration: () => dispatch(toggleVibration()),
    toggleAutoReset: () => dispatch(toggleAutoReset()),
    setResetThreshold: (threshold: number) => dispatch(setResetThreshold(threshold)),
  };
};

// Export as useTasbihStore for backward compatibility
export const useTasbihStore = useTasbih;

