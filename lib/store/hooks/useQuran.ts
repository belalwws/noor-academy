/**
 * Custom Hook for Quran State
 * Provides backward-compatible interface for components using Jotai
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState } from '../../store';
import {
  setIsPlaying,
  setCurrentAyah,
  setCurrentFont,
  togglePlaying,
} from '../slices/quranSlice';

// Hook that mimics Jotai's useAtom behavior
export const useQuran = () => {
  const dispatch = useDispatch();
  const quran = useSelector((state: RootState) => state.quran);
  
  return {
    isPlaying: quran.isPlaying,
    currentAyah: quran.currentAyah,
    currentFont: quran.currentFont,
    setIsPlaying: useCallback((value: boolean) => {
      dispatch(setIsPlaying(value));
    }, [dispatch]),
    setCurrentAyah: useCallback((value: number) => {
      dispatch(setCurrentAyah(value));
    }, [dispatch]),
    setCurrentFont: useCallback((value: string) => {
      dispatch(setCurrentFont(value));
    }, [dispatch]),
    togglePlaying: useCallback(() => {
      dispatch(togglePlaying());
    }, [dispatch]),
  };
};

// Hook that mimics Jotai's useAtom for isQuranPlayingAtom
export const useIsQuranPlaying = () => {
  const dispatch = useDispatch();
  const isPlaying = useSelector((state: RootState) => state.quran.isPlaying);
  
  return [
    isPlaying,
    useCallback((value: boolean) => {
      dispatch(setIsPlaying(value));
    }, [dispatch]),
  ] as const;
};

// Hook that mimics Jotai's useAtom for currentAyahAtom
export const useCurrentAyah = () => {
  const dispatch = useDispatch();
  const currentAyah = useSelector((state: RootState) => state.quran.currentAyah);
  
  return [
    currentAyah,
    useCallback((value: number) => {
      dispatch(setCurrentAyah(value));
    }, [dispatch]),
  ] as const;
};

// Hook that mimics Jotai's useAtom for currentFontAtom
export const useCurrentFont = () => {
  const dispatch = useDispatch();
  const currentFont = useSelector((state: RootState) => state.quran.currentFont);
  
  return [
    currentFont,
    useCallback((value: string) => {
      dispatch(setCurrentFont(value));
    }, [dispatch]),
  ] as const;
};

