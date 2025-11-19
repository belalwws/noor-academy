/**
 * Custom Hook for Theme State
 * Provides backward-compatible interface for components using ThemeContext
 */

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState } from '../../store';
import { toggleTheme, initializeTheme } from '../slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  // Initialize theme on mount
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);
  
  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
  };
};

