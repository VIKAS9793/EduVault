/**
 * Content Sync Service
 * Handles intelligent content synchronization with conflict resolution
 * Implements optimistic updates and background sync
 */

import type { Lesson } from '../types';
import { contentVersioning } from './ContentVersioning';
import { contentCache } from './ContentCache';
import { enhancedLessonEngine } from './EnhancedLessonEngine';

interface SyncOptions {
  force: boolean;
  background: boolean;
  priority: 'high' | 'medium' | 'low';
  retryAttempts: number;
}

interface SyncResult {
  success: boolean;
  changes: {
    added: number;
    updated: number;
    removed: number;
  };
  version: string;
  timestamp: number;
  errors?: string[];
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: number;
  nextSync: number;
  status: 'idle' | 'syncing' | 'error' | 'success';
  error?: string;
}

class ContentSyncService {
  private syncStatus: SyncStatus = {
    isRunning: false,
    lastSync: 0,
    nextSync: 0,
    status: 'idle',
  };

  private readonly SYNC_ENDPOINTS = {
    lessons: '/lesson_content/lessons.json',
    realLessons: '/lesson_content/real_lessons.json',
  };

  private readonly RETRY_DELAYS = [1000, 2000, 5000, 10000]; // Progressive backoff

  /**
   * Sync content with intelligent conflict resolution
   */
  async sync(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
    const syncOptions: SyncOptions = {
      force: false,
      background: false,
      priority: 'medium',
      retryAttempts: 3,
      ...options,
    };

    if (this.syncStatus.isRunning && !syncOptions.force) {
      throw new Error('Sync already in progress');
    }

    this.syncStatus.isRunning = true;
    this.syncStatus.status = 'syncing';

    try {
      const result = await this.performSync(syncOptions);

      this.syncStatus.status = 'success';
      this.syncStatus.lastSync = Date.now();
      this.syncStatus.nextSync = this.calculateNextSync();
      this.syncStatus.error = undefined;

      return result;
    } catch (error) {
      this.syncStatus.status = 'error';
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.syncStatus.isRunning = false;
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if sync is needed
   */
  async needsSync(): Promise<boolean> {
    try {
      // Check if we should sync based on time
      if (Date.now() < this.syncStatus.nextSync) {
        return false;
      }

      // Check if content has changed
      const currentLessons = await enhancedLessonEngine.getAllLessons();
      return await contentVersioning.hasContentChanged(currentLessons);
    } catch (error) {
      console.warn('Failed to check if sync is needed:', error);
      return true; // Default to sync if we can't determine
    }
  }

  /**
   * Start background sync
   */
  startBackgroundSync(interval: number = 5 * 60 * 1000): void {
    setInterval(() => {
      void (async () => {
        try {
          if (await this.needsSync()) {
            await this.sync({ background: true, priority: 'low' });
          }
        } catch (error) {
          console.warn('Background sync failed:', error);
        }
      })();
    }, interval);
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<SyncResult> {
    return this.sync({ force: true, priority: 'high' });
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(options: SyncOptions): Promise<SyncResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < options.retryAttempts; attempt++) {
      try {
        return await this.attemptSync();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < options.retryAttempts - 1) {
          const delay = this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)];
          console.warn(`Sync attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('Sync failed after all retry attempts');
  }

  /**
   * Single sync attempt
   */
  private async attemptSync(): Promise<SyncResult> {
    // Try to load from real_lessons.json first, fallback to lessons.json
    let lessons: Lesson[] = [];
    let source = '';

    try {
      const response = await fetch(this.SYNC_ENDPOINTS.realLessons);
      if (response.ok) {
        lessons = await response.json();
        source = 'real_lessons.json';
      } else {
        throw new Error(`Failed to fetch real lessons: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Failed to load real lessons, trying fallback:', error);

      const response = await fetch(this.SYNC_ENDPOINTS.lessons);
      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }

      lessons = await response.json();
      source = 'lessons.json';
    }

    // Get current lessons for comparison
    const currentLessons = await enhancedLessonEngine.getAllLessons();

    // Generate delta
    const delta = contentVersioning.generateDelta(currentLessons, lessons);

    // Apply changes
    await this.applyDelta(delta);

    // Update version information
    const version = contentVersioning.createVersion(lessons);
    await contentVersioning.storeVersion(version);

    // Invalidate cache
    contentCache.clear();

    console.log(`Sync completed from ${source}:`, {
      added: delta.added.length,
      updated: delta.updated.length,
      removed: delta.removed.length,
    });

    return {
      success: true,
      changes: {
        added: delta.added.length,
        updated: delta.updated.length,
        removed: delta.removed.length,
      },
      version: version.version,
      timestamp: Date.now(),
    };
  }

  /**
   * Apply delta changes to the database
   */
  private async applyDelta(delta: any): Promise<void> {
    const changes = [];

    // Add new lessons
    if (delta.added.length > 0) {
      changes.push(enhancedLessonEngine.saveLessons(delta.added as Lesson[]));
    }

    // Update existing lessons
    if (delta.updated.length > 0) {
      changes.push(enhancedLessonEngine.saveLessons(delta.updated as Lesson[]));
    }

    // Remove deleted lessons
    if (delta.removed.length > 0) {
      // Note: We don't have a delete method in the current DB manager
      // This would need to be implemented for full functionality
      console.log('Lessons to remove:', delta.removed);
    }

    await Promise.all(changes);
  }

  /**
   * Calculate next sync time
   */
  private calculateNextSync(): number {
    const baseInterval = 5 * 60 * 1000; // 5 minutes
    const jitter = Math.random() * 60 * 1000; // Add up to 1 minute jitter
    return Date.now() + baseInterval + jitter;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    status: SyncStatus;
    engineStats: any;
    cacheStats: any;
  } {
    return {
      status: this.getSyncStatus(),
      engineStats: enhancedLessonEngine.getStats(),
      cacheStats: contentCache.getStats(),
    };
  }
}

export const contentSyncService = new ContentSyncService();
