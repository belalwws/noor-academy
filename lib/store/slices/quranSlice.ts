/**
 * Quran Redux Slice
 * Converted from Jotai atoms to Redux
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuranState {
  isPlaying: boolean;
  currentAyah: number;
  currentFont: string;
}

// Get default font from constants if available, otherwise use a default
const getDefaultFont = () => {
  try {
    // Try to import FontNames dynamically
    const FontNames = require('../../../app/quran/constants/index').FontNames;
    return FontNames?.[0]?.value || 'amiri-quran';
  } catch {
    return 'amiri-quran';
  }
};

const initialState: QuranState = {
  isPlaying: false,
  currentAyah: 0,
  currentFont: getDefaultFont(),
};

const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentAyah: (state, action: PayloadAction<number>) => {
      state.currentAyah = action.payload;
    },
    setCurrentFont: (state, action: PayloadAction<string>) => {
      state.currentFont = action.payload;
    },
    togglePlaying: (state) => {
      state.isPlaying = !state.isPlaying;
    },
  },
});

export const {
  setIsPlaying,
  setCurrentAyah,
  setCurrentFont,
  togglePlaying,
} = quranSlice.actions;

export default quranSlice.reducer;

