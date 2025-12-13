/**
 * IndexedDB Manager
 * Type-safe wrapper around IndexedDB using idb library
 * Follows singleton pattern for centralized database access
 */

import { openDB, DBSchema as IDBSchema, IDBPDatabase } from 'idb';
import type { Lesson, UserProgress, AppSettings } from '../types';

interface EduVaultDB extends IDBSchema {
  lessons: {
    key: string;
    value: Lesson;
    indexes: { 'by-language': string; 'by-subject': string };
  };
  progress: {
    key: string;
    value: UserProgress;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'EduVaultDB';
const DB_VERSION = 1;

class IndexedDBManager {
  private db: IDBPDatabase<EduVaultDB> | null = null;

  /**
   * Initialize database connection with proper schema
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<EduVaultDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Lessons store
          if (!db.objectStoreNames.contains('lessons')) {
            const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
            lessonStore.createIndex('by-language', 'language');
            lessonStore.createIndex('by-subject', 'subject');
          }

          // Progress store
          if (!db.objectStoreNames.contains('progress')) {
            db.createObjectStore('progress', { keyPath: 'lessonId' });
          }

          // Settings store
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
        },
        blocked() {
          console.error('Database upgrade blocked. Please close other tabs.');
        },
        blocking() {
          console.warn('This tab is blocking a database upgrade.');
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Database initialization failed');
    }
  }

  /**
   * Ensures database is initialized before operations
   */
  private async ensureDB(): Promise<IDBPDatabase<EduVaultDB>> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not available');
    }
    return this.db;
  }

  // Lesson operations
  async saveLesson(lesson: Lesson): Promise<void> {
    const db = await this.ensureDB();
    await db.put('lessons', lesson);
  }

  async saveLessons(lessons: Lesson[]): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction('lessons', 'readwrite');
    const promises = lessons.map((lesson) => tx.store.put(lesson));
    // eslint-disable-next-line max-len
    await Promise.all([...promises, tx.done]);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const db = await this.ensureDB();
    return db.get('lessons', id);
  }

  async getAllLessons(): Promise<Lesson[]> {
    const db = await this.ensureDB();
    return db.getAll('lessons');
  }

  async getLessonsByLanguage(language: string): Promise<Lesson[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('lessons', 'by-language', language);
  }

  async getLessonsBySubject(subject: string): Promise<Lesson[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('lessons', 'by-subject', subject);
  }

  // Progress operations
  async saveProgress(progress: UserProgress): Promise<void> {
    const db = await this.ensureDB();
    await db.put('progress', progress);
  }

  async getProgress(lessonId: string): Promise<UserProgress | undefined> {
    const db = await this.ensureDB();
    return db.get('progress', lessonId);
  }

  async getAllProgress(): Promise<UserProgress[]> {
    const db = await this.ensureDB();
    return db.getAll('progress');
  }

  // Settings operations
  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.ensureDB();
    await db.put('settings', settings, 'app-settings');
  }

  async getSettings(): Promise<AppSettings | undefined> {
    const db = await this.ensureDB();
    return db.get('settings', 'app-settings');
  }

  /**
   * Clear all data (for testing or reset functionality)
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const tx = db.transaction(['lessons', 'progress', 'settings'], 'readwrite');
    await Promise.all([tx.objectStore('lessons').clear(), tx.objectStore('progress').clear(), tx.done]);
  }

  /**
   * Clear only lessons data (useful for reloading lesson content)
   */
  async clearLessons(): Promise<void> {
    const db = await this.ensureDB();
    await db.clear('lessons');
  }
}

// Export singleton instance
export const dbManager = new IndexedDBManager();
