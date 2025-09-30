/**
 * EduVault Main Application Component
 * Orchestrates the entire application with offline-first architecture
 */

import React, { useState, useEffect } from 'react';
import type { Lesson, Language, AppSettings } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { VoiceButton } from './components/VoiceButton';
import { LessonList } from './components/LessonList';
import { LessonDetail } from './components/LessonDetail';
import { SplashScreen } from './components/SplashScreen';
import { useOfflineDetection } from './hooks/useOfflineDetection';
import { dbManager } from './utils/IndexedDBManager';
import { lessonEngine } from './services/LessonEngine';
import { hybridSyncService } from './services/HybridSyncService';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  voiceEnabled: true,
  textSize: 'medium',
  highContrast: false,
  screenReaderMode: false,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isOnline, wasOffline } = useOfflineDetection();

  // Initialize app
  useEffect(() => {
    const initApp = async (): Promise<void> => {
      try {
        // Initialize database
        await dbManager.init();

        // Load settings
        const savedSettings = await dbManager.getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }

        // Initialize lesson engine
        await lessonEngine.init();

        setInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    void initApp();
  }, []);

  // Handle language change
  const handleLanguageChange = async (lang: Language): Promise<void> => {
    const newSettings = { ...settings, language: lang };
    setSettings(newSettings);
    await dbManager.saveSettings(newSettings);
  };

  // Handle sync
  const handleSync = async (): Promise<void> => {
    if (!isOnline) {
      return;
    }

    setIsSyncing(true);
    try {
      await hybridSyncService.sync();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} language={settings.language} />;
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Initializing EduVault...</p>
          <p className="mt-2 text-sm text-gray-500 font-hindi">कृपया प्रतीक्षा करें...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-10 h-10 text-primary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduVault</h1>
                <p className="tagline text-xs">ज्ञान की पहुंच, हर कोने तक</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <LanguageSelector
                currentLanguage={settings.language}
                onLanguageChange={(lang) => {
                  void handleLanguageChange(lang);
                }}
              />

              {settings.voiceEnabled && <VoiceButton />}

              {isOnline && (
                <button
                  type="button"
                  onClick={() => {
                    void handleSync();
                  }}
                  disabled={isSyncing}
                  className="btn-accent flex items-center gap-2"
                  aria-label="Sync with government content"
                >
                  <svg
                    className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </button>
              )}
            </div>
          </div>

          {/* Online/Offline Status */}
          <div className="mt-3">
            {!isOnline && (
              <div
                className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 shadow-sm"
                role="status"
                aria-live="polite"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  <strong>Offline mode</strong> - Using cached content
                </span>
              </div>
            )}
            {wasOffline && isOnline && (
              <div
                className="flex items-center gap-2 text-sm text-green-800 bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm"
                role="status"
                aria-live="polite"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <strong>Back online!</strong>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedLesson ? (
          <LessonDetail
            lesson={selectedLesson}
            onBack={() => {
              setSelectedLesson(null);
            }}
          />
        ) : (
          <LessonList
            selectedLanguage={settings.language}
            onSelectLesson={setSelectedLesson}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-900 font-semibold">EduVault</p>
            <p className="tagline text-sm mt-1">ज्ञान की पहुंच, हर कोने तक</p>
            <p className="text-gray-500 text-xs mt-2">
              Offline-first education platform • Made in India 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
