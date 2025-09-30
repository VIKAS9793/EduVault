/**
 * Hybrid Sync Service
 * Manages online/offline sync with government content sources
 * Implements background sync and conflict resolution
 */

import type { SyncStatus } from '../types';
import { govContentFetcher } from './GovContentFetcher';

class HybridSyncService {
  private syncStatus: SyncStatus = {
    lastSyncDate: null,
    isOnline: navigator.onLine,
    pendingUpdates: 0,
  };

  private syncInProgress = false;

  constructor() {
    this.setupNetworkListeners();
    this.loadSyncStatus();
  }

  /**
   * Setup online/offline event listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      void this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.saveSyncStatus();
    });
  }

  /**
   * Load sync status from localStorage
   */
  private loadSyncStatus(): void {
    try {
      const saved = localStorage.getItem('sync-status');
      if (saved) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  /**
   * Save sync status to localStorage
   */
  private saveSyncStatus(): void {
    try {
      localStorage.setItem('sync-status', JSON.stringify(this.syncStatus));
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    if (this.syncInProgress) {
      console.warn('Sync already in progress');
      return;
    }

    this.syncInProgress = true;

    try {
      const syncedCount = await govContentFetcher.syncLessons();

      this.syncStatus.lastSyncDate = new Date().toISOString();
      this.syncStatus.pendingUpdates = 0;

      this.saveSyncStatus();

      console.log(`Successfully synced ${syncedCount} lessons`);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Auto sync when coming online (if needed)
   */
  private async autoSync(): Promise<void> {
    const lastSync = this.syncStatus.lastSyncDate
      ? new Date(this.syncStatus.lastSyncDate)
      : null;
    const now = new Date();

    // Auto sync if last sync was more than 24 hours ago or never synced
    const shouldSync =
      !lastSync || now.getTime() - lastSync.getTime() > 24 * 60 * 60 * 1000;

    if (shouldSync) {
      try {
        await this.sync();
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }
}

export const hybridSyncService = new HybridSyncService();
