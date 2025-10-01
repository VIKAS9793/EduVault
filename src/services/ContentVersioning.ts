/**
 * Content Versioning Service
 * Manages content versions, change detection, and synchronization
 * Implements content fingerprinting and delta updates
 */

import type { Lesson, Language, Subject } from '../types';

interface ContentVersion {
  version: string;
  timestamp: number;
  checksum: string;
  etag: string;
  lastModified: string;
  totalLessons: number;
  languages: Language[];
  subjects: Subject[];
  metadata: {
    [key: string]: any;
  };
}

interface ContentDelta {
  added: Lesson[];
  updated: Lesson[];
  removed: string[];
  version: string;
  timestamp: number;
}

interface VersionHistory {
  versions: ContentVersion[];
  current: string;
  lastCheck: number;
}

class ContentVersioning {
  private readonly VERSION_KEY = 'eduvault-content-version';

  private readonly HISTORY_KEY = 'eduvault-version-history';

  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate content fingerprint for change detection
   */
  generateFingerprint(lessons: Lesson[]): string {
    // Create a deterministic hash of all lesson content
    const content = lessons
      .map((lesson) => `${lesson.id}:${lesson.title}:${lesson.language}:${lesson.subject}:${lesson.text_content}`)
      .sort()
      .join('|');

    return this.hashString(content);
  }

  /**
   * Create content version metadata
   */
  createVersion(lessons: Lesson[]): ContentVersion {
    const timestamp = Date.now();
    const checksum = this.generateFingerprint(lessons);
    const languages = Array.from(new Set(lessons.map((l) => l.language)));
    const subjects = Array.from(new Set(lessons.map((l) => l.subject)));

    return {
      version: this.generateVersionNumber(timestamp),
      timestamp,
      checksum,
      etag: `"${checksum}"`,
      lastModified: new Date(timestamp).toISOString(),
      totalLessons: lessons.length,
      languages,
      subjects,
      metadata: {
        generatedAt: timestamp,
        source: 'lessons.json',
        compression: 'gzip',
      },
    };
  }

  /**
   * Check if content has changed
   */
  async hasContentChanged(lessons: Lesson[]): Promise<boolean> {
    const currentVersion = this.createVersion(lessons);
    const storedVersion = await this.getStoredVersion();

    if (!storedVersion) return true;

    return currentVersion.checksum !== storedVersion.checksum;
  }

  /**
   * Get stored version from localStorage
   */
  async getStoredVersion(): Promise<ContentVersion | null> {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) as ContentVersion : null;
    } catch {
      return null;
    }
  }

  /**
   * Store version information
   */
  async storeVersion(version: ContentVersion): Promise<void> {
    try {
      localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
      await this.addToHistory(version);
    } catch (error) {
      console.warn('Failed to store version:', error);
    }
  }

  /**
   * Add version to history
   */
  private async addToHistory(version: ContentVersion): Promise<void> {
    try {
      const history = await this.getVersionHistory();
      history.versions.unshift(version);

      // Keep only last 10 versions
      if (history.versions.length > 10) {
        history.versions = history.versions.slice(0, 10);
      }

      history.current = version.version;
      history.lastCheck = Date.now();

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to update version history:', error);
    }
  }

  /**
   * Get version history
   */
  async getVersionHistory(): Promise<VersionHistory> {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored) as VersionHistory;
      }
    } catch (error) {
      console.warn('Failed to get version history:', error);
    }

    return {
      versions: [],
      current: '1.0.0',
      lastCheck: 0,
    };
  }

  /**
   * Check if we should check for updates
   */
  async shouldCheckForUpdates(): Promise<boolean> {
    const history = await this.getVersionHistory();
    return Date.now() - history.lastCheck > this.CHECK_INTERVAL;
  }

  /**
   * Generate semantic version number
   */
  private generateVersionNumber(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day}.${hour}${minute}`;
  }

  /**
   * Simple hash function for content fingerprinting
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash * 31) + char) % 2147483647;
      hash = Math.floor(hash); // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Compare two lesson arrays and generate delta
   */
  generateDelta(oldLessons: Lesson[], newLessons: Lesson[]): ContentDelta {
    const oldMap = new Map(oldLessons.map((l) => [l.id, l]));
    const newMap = new Map(newLessons.map((l) => [l.id, l]));

    const added: Lesson[] = [];
    const updated: Lesson[] = [];
    const removed: string[] = [];

    // Find added and updated lessons
    for (const [id, newLesson] of newMap) {
      const oldLesson = oldMap.get(id);
      if (!oldLesson) {
        added.push(newLesson);
      } else if (this.lessonChanged(oldLesson, newLesson)) {
        updated.push(newLesson);
      }
    }

    // Find removed lessons
    for (const [id] of oldMap) {
      if (!newMap.has(id)) {
        removed.push(id);
      }
    }

    return {
      added,
      updated,
      removed,
      version: this.generateVersionNumber(Date.now()),
      timestamp: Date.now(),
    };
  }

  /**
   * Check if a lesson has changed
   */
  private lessonChanged(oldLesson: Lesson, newLesson: Lesson): boolean {
    return (
      oldLesson.title !== newLesson.title
      || oldLesson.text_content !== newLesson.text_content
      || oldLesson.language !== newLesson.language
      || oldLesson.subject !== newLesson.subject
      || JSON.stringify(oldLesson.quiz) !== JSON.stringify(newLesson.quiz)
    );
  }

  /**
   * Get content statistics
   */
  getContentStats(lessons: Lesson[]): {
    totalLessons: number;
    byLanguage: Record<Language, number>;
    bySubject: Record<Subject, number>;
    byGrade: Record<number, number>;
  } {
    const stats = {
      totalLessons: lessons.length,
      byLanguage: {} as Record<Language, number>,
      bySubject: {} as Record<Subject, number>,
      byGrade: {} as Record<number, number>,
    };

    lessons.forEach((lesson) => {
      stats.byLanguage[lesson.language] = (stats.byLanguage[lesson.language] || 0) + 1;
      stats.bySubject[lesson.subject] = (stats.bySubject[lesson.subject] || 0) + 1;
      stats.byGrade[lesson.grade] = (stats.byGrade[lesson.grade] || 0) + 1;
    });

    return stats;
  }
}

export const contentVersioning = new ContentVersioning();
