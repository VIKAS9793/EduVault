/**
 * useAccessibility Hook
 * Provides accessibility utilities: TTS, haptic feedback, high contrast
 */

import { useCallback } from 'react';
import { ttsService } from '../services/TTSService';

interface AccessibilityUtils {
  readText: (text: string) => Promise<void>;
  stopReading: () => void;
  hapticFeedback: (duration?: number) => void;
  announceToScreenReader: (message: string) => void;
}

export const useAccessibility = (): AccessibilityUtils => {
  /**
   * Read text aloud using TTS
   */
  const readText = useCallback(async (text: string): Promise<void> => {
    try {
      await ttsService.speak(text);
    } catch (error) {
      console.error('TTS failed:', error);
    }
  }, []);

  /**
   * Stop current TTS playback
   */
  const stopReading = useCallback((): void => {
    ttsService.stop();
  }, []);

  /**
   * Trigger haptic feedback (vibration)
   */
  const hapticFeedback = useCallback((duration = 200): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  /**
   * Announce message to screen readers via live region
   */
  const announceToScreenReader = useCallback((message: string): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    readText,
    stopReading,
    hapticFeedback,
    announceToScreenReader,
  };
};
