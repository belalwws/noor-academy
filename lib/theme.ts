'use client';

import { useEffect } from 'react';

/**
 * Available brand themes for Rushd Academy System
 */
export type Theme = 'default' | 'islamic-green' | 'blue-ocean' | 'purple-royal';

const THEME_STORAGE_KEY = 'rushd-brand-theme';

/**
 * Set the brand theme by applying data-theme attribute to root element
 * @param theme - The theme to apply
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove all theme attributes
  root.removeAttribute('data-theme');
  
  // Apply new theme (only if not default)
  if (theme !== 'default') {
    root.setAttribute('data-theme', theme);
  }
  
  // Save to localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Get the current brand theme from localStorage
 * @returns The current theme or 'default' if not set
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'default';
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  
  if (stored && ['default', 'islamic-green', 'blue-ocean', 'purple-royal'].includes(stored)) {
    return stored as Theme;
  }
  
  return 'default';
}

/**
 * React hook to initialize and manage brand theme
 * Call this in your root layout or app component
 */
export function useBrandTheme(): void {
  useEffect(() => {
    const theme = getTheme();
    setTheme(theme);
  }, []);
}

/**
 * Get theme display name (for UI)
 */
export function getThemeName(theme: Theme): string {
  const names: Record<Theme, string> = {
    'default': 'الذهبي (افتراضي)',
    'islamic-green': 'الأخضر الإسلامي',
    'blue-ocean': 'الأزرق المحيط',
    'purple-royal': 'البنفسجي الملكي',
  };
  
  return names[theme];
}

/**
 * Get all available themes
 */
export function getAllThemes(): Theme[] {
  return ['default', 'islamic-green', 'blue-ocean', 'purple-royal'];
}

