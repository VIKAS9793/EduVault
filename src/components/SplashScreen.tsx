/**
 * Splash Screen Component
 * Displays EduVault branding on app load
 */

import React, { useEffect, useState } from 'react';
import { ttsService } from '../services/TTSService';
import type { Language } from '../types';

interface SplashScreenProps {
  onComplete: () => void;
  language: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, language }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    // Speak brand intro on first visit
    const hasPlayedIntro = localStorage.getItem('eduvault-intro-played');
    if (!hasPlayedIntro && ttsService.isSupported()) {
      void ttsService.speakBrandIntro(language);
      localStorage.setItem('eduvault-intro-played', 'true');
    }

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete, language]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500"
      role="dialog"
      aria-label="Loading EduVault"
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6 animate-pulse">
          <svg
            className="w-32 h-32 mx-auto text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-white mb-3">EduVault</h1>

        {/* Tagline */}
        <p className="text-white text-lg font-hindi font-medium">
          {language === 'hi' ? 'ज्ञान की पहुंच, हर कोने तक' : 'Knowledge within reach, everywhere'}
        </p>

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="w-48 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white rounded-full animate-[loading_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Made in India badge */}
        <p className="text-white/80 text-sm mt-6">Made in India 🇮🇳</p>
      </div>

      <style>
        {`
        @keyframes loading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 0%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}
      </style>
    </div>
  );
};
