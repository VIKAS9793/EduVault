/**
 * Content Sync Component
 * Manages synchronization of real educational content from various sources
 */

import React, { useState, useEffect } from 'react';
import type { ContentSource, ContentSyncStatus } from '../types';
import { contentManager } from '../services/ContentManager';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

interface ContentSyncComponentProps {
  onSyncComplete?: (status: ContentSyncStatus) => void;
}

export const ContentSyncComponent: React.FC<ContentSyncComponentProps> = ({
  onSyncComplete,
}) => {
  const [isOnline] = useOfflineDetection();
  const [syncStatus, setSyncStatus] = useState<ContentSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ContentSource>('NCERT');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const contentSources: { value: ContentSource; label: string; description: string }[] = [
    {
      value: 'NCERT',
      label: 'NCERT Official',
      description: 'National Council of Educational Research and Training',
    },
    {
      value: 'DIKSHA',
      label: 'DIKSHA Platform',
      description: 'Government digital education repository',
    },
    {
      value: 'ePathshala',
      label: 'ePathshala',
      description: 'NCERT digital content platform',
    },
    {
      value: 'SWAYAM',
      label: 'SWAYAM',
      description: 'Government online learning platform',
    },
  ];

  useEffect(() => {
    // Load last sync time from localStorage
    const saved = localStorage.getItem('lastSyncTime');
    if (saved) {
      setLastSyncTime(saved);
    }
  }, []);

  const handleSync = async (): Promise<void> => {
    if (!isOnline) {
      alert('Internet connection required for content synchronization');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const status = await contentManager.syncFromSource(selectedSource);
      setSyncStatus(status);
      setLastSyncTime(new Date().toISOString());
      localStorage.setItem('lastSyncTime', new Date().toISOString());

      if (onSyncComplete) {
        onSyncComplete(status);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Failed to sync content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSyncTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  const getSyncStatusColor = (status: ContentSyncStatus): string => {
    if (status.failedSyncs > 0) return 'text-yellow-600';
    if (status.syncedLessons === status.totalLessons) return 'text-green-600';
    return 'text-blue-600';
  };

  const getSyncStatusIcon = (status: ContentSyncStatus): React.ReactNode => {
    if (status.failedSyncs > 0) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    if (status.syncedLessons === status.totalLessons) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Synchronization</h2>
        <p className="text-gray-600">
          Sync real educational content from government sources
        </p>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg border-2 ${isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`font-medium ${isOnline ? 'text-green-800' : 'text-red-800'}`}>
            {isOnline ? 'Online - Ready to sync' : 'Offline - Sync unavailable'}
          </span>
        </div>
      </div>

      {/* Source Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Content Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentSources.map((source) => (
            <button
              key={source.value}
              type="button"
              onClick={() => setSelectedSource(source.value)}
              disabled={!isOnline}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedSource === source.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300 bg-white'
              } ${!isOnline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium text-gray-900">{source.label}</div>
              <div className="text-sm text-gray-600 mt-1">{source.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sync Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={!isOnline || isSyncing}
          className={`btn-primary px-8 py-3 text-lg ${
            !isOnline || isSyncing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSyncing ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Syncing...
            </div>
          ) : (
            `Sync from ${contentSources.find((s) => s.value === selectedSource)?.label}`
          )}
        </button>
      </div>

      {/* Last Sync Time */}
      {lastSyncTime && (
        <div className="text-center text-sm text-gray-600">
          Last sync:
          {' '}
          {formatLastSyncTime(lastSyncTime)}
        </div>
      )}

      {/* Sync Status */}
      {syncStatus && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sync Results</h3>
          <div className={`p-4 rounded-lg border-2 ${getSyncStatusColor(syncStatus).replace('text-', 'border-').replace('-600', '-200')} bg-gray-50`}>
            <div className="flex items-center gap-2 mb-3">
              {getSyncStatusIcon(syncStatus)}
              <span className={`font-medium ${getSyncStatusColor(syncStatus)}`}>
                {syncStatus.source}
                {' '}
                Sync Complete
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{syncStatus.totalLessons}</div>
                <div className="text-gray-600">Total Lessons</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{syncStatus.syncedLessons}</div>
                <div className="text-gray-600">Synced</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{syncStatus.failedSyncs}</div>
                <div className="text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{syncStatus.pendingUpdates}</div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>

            {syncStatus.failedSyncs > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  Some lessons failed to sync. Please check your internet connection and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About Content Sync</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Content is downloaded and stored locally for offline access</li>
          <li>• Audio narration is automatically generated for each lesson</li>
          <li>• Quizzes are created from NCERT exercises and questions</li>
          <li>• All content is validated for educational accuracy</li>
        </ul>
      </div>
    </div>
  );
};
