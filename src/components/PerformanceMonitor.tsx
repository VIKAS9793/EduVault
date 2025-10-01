/**
 * Performance Monitor Component
 * Displays cache statistics, sync status, and performance metrics
 * Useful for debugging and monitoring system performance
 */

import React, { useState, useEffect } from 'react';
import { enhancedLessonEngine } from '../services/EnhancedLessonEngine';
import { contentSyncService } from '../services/ContentSyncService';
import { contentCache } from '../services/ContentCache';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  onToggle,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  useEffect(() => {
    if (!isVisible) return undefined;

    const updateStats = (): void => {
      setStats(enhancedLessonEngine.getStats());
      setSyncStatus(contentSyncService.getSyncStatus());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Performance Monitor</h3>
        <button
          type="button"
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {stats && (
        <div className="space-y-3">
          {/* Cache Statistics */}
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Cache Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Hit Rate:</span>
                <span className="ml-1 font-mono">
                  {(stats.cacheStats.hitRate * 100).toFixed(1)}
                  %
                </span>
              </div>
              <div>
                <span className="text-gray-600">Hits:</span>
                <span className="ml-1 font-mono">{stats.cacheStats.hits}</span>
              </div>
              <div>
                <span className="text-gray-600">Misses:</span>
                <span className="ml-1 font-mono">{stats.cacheStats.misses}</span>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <span className="ml-1 font-mono">{stats.cacheStats.size}</span>
              </div>
            </div>
          </div>

          {/* Engine Statistics */}
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Engine Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">DB Queries:</span>
                <span className="ml-1 font-mono">{stats.dbQueries}</span>
              </div>
              <div>
                <span className="text-gray-600">Version Checks:</span>
                <span className="ml-1 font-mono">{stats.versionChecks}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Lessons:</span>
                <span className="ml-1 font-mono">{stats.totalLessons}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Sync:</span>
                <span className="ml-1 font-mono text-xs">
                  {stats.lastSync ? new Date(stats.lastSync as number).toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-medium text-gray-700 mb-2">Sync Status</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    syncStatus.status === 'success' ? 'bg-green-200 text-green-800'
                      : syncStatus.status === 'syncing' ? 'bg-yellow-200 text-yellow-800'
                        : syncStatus.status === 'error' ? 'bg-red-200 text-red-800'
                          : 'bg-gray-200 text-gray-800'
                  }`}
                  >
                    {syncStatus.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Running:</span>
                  <span className="ml-1 font-mono">
                    {syncStatus.isRunning ? 'Yes' : 'No'}
                  </span>
                </div>
                {syncStatus.error && (
                  <div className="text-red-600 text-xs">
                    Error:
                    {' '}
                    {syncStatus.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                contentCache.clear();
                setStats(enhancedLessonEngine.getStats());
              }}
              className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              Clear Cache
            </button>
            <button
              type="button"
              onClick={() => {
                void (async () => {
                  try {
                    await contentSyncService.forceSync();
                    setSyncStatus(contentSyncService.getSyncStatus());
                  } catch (error) {
                    console.error('Force sync failed:', error);
                  }
                })();
              }}
              className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Force Sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
