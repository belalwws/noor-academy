'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { CreateTypes, GlobalOptions as ConfettiGlobalOptions } from 'canvas-confetti';

interface ConfettiEffectProps {
  /**
   * Whether to trigger the confetti effect
   */
  trigger: boolean;
  
  /**
   * Confetti configuration options
   */
  config?: confetti.Options;
  
  /**
   * Custom colors for confetti particles
   * Default: orange/amber theme matching the app
   */
  colors?: string[];
  
  /**
   * Number of confetti particles
   * Default: 100
   */
  particleCount?: number;
  
  /**
   * Spread angle in degrees
   * Default: 70
   */
  spread?: number;
  
  /**
   * Duration in milliseconds before stopping
   * Default: 3000 (3 seconds)
   */
  duration?: number;
  
  /**
   * Whether to recycle confetti particles
   * Default: false
   */
  recycle?: boolean;
  
  /**
   * Origin point (x, y) where confetti starts
   * Default: { y: 0.6 } (center of screen)
   */
  origin?: { x?: number; y?: number };
  
  /**
   * Callback when confetti animation completes
   */
  onComplete?: () => void;
}

/**
 * ConfettiEffect Component
 * 
 * A reusable component for displaying celebratory confetti effects.
 * Perfect for game victories, correct answers, and achievements.
 */
export function ConfettiEffect({
  trigger,
  config,
  colors = ['var(--color-primary)', 'var(--color-primary-light)', '#FFD700', '#FFA500', '#FF8C00'],
  particleCount = 100,
  spread = 70,
  duration = 3000,
  recycle = false,
  origin = { y: 0.6 },
  onComplete,
}: ConfettiEffectProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasId = useRef(`confetti-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!trigger) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Default configuration with app theme colors
    const defaultConfig: confetti.Options = {
      particleCount,
      spread,
      origin,
      colors,
      recycle,
      ...config,
    };

    // Create a custom canvas for this instance
    const myCanvas = document.createElement('canvas');
    myCanvas.id = canvasId.current;
    myCanvas.style.position = 'fixed';
    myCanvas.style.top = '0';
    myCanvas.style.left = '0';
    myCanvas.style.width = '100%';
    myCanvas.style.height = '100%';
    myCanvas.style.pointerEvents = 'none';
    myCanvas.style.zIndex = '9999';
    document.body.appendChild(myCanvas);

    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true,
    });

    // Fire confetti
    myConfetti(defaultConfig);

    // Set timeout to clean up
    timeoutRef.current = setTimeout(() => {
      // Stop confetti and remove canvas
      myConfetti.reset();
      document.body.removeChild(myCanvas);
      
      if (onComplete) {
        onComplete();
      }
    }, duration);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const canvas = document.getElementById(canvasId.current);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [trigger, colors, particleCount, spread, duration, recycle, origin, config, onComplete]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Utility function to fire confetti programmatically
 */
export function fireConfetti(options?: confetti.Options) {
  const defaultOptions: confetti.Options = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['var(--color-primary)', 'var(--color-primary-light)', '#FFD700', '#FFA500', '#FF8C00'],
  };

  return confetti({
    ...defaultOptions,
    ...options,
  });
}

/**
 * Utility function to fire confetti from a specific element
 */
export function fireConfettiFromElement(
  element: HTMLElement,
  options?: confetti.Options
) {
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  const defaultOptions: confetti.Options = {
    particleCount: 100,
    angle: 90,
    spread: 55,
    origin: { x, y },
    colors: ['var(--color-primary)', 'var(--color-primary-light)', '#FFD700', '#FFA500', '#FF8C00'],
  };

  return confetti({
    ...defaultOptions,
    ...options,
  });
}

