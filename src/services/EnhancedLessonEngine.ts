/**
 * Enhanced Lesson Engine with Modern Caching
 * Implements intelligent content management with versioning and caching
 * Follows industry best practices for content delivery systems
 */

import type { Lesson, Language, Subject } from '../types';
import { dbManager } from '../utils/IndexedDBManager';
import { contentCache } from './ContentCache';
import { contentVersioning } from './ContentVersioning';
import { lessonDataMerger } from '../utils/lessonDataMerger';

interface LessonEngineConfig {
  enableCaching: boolean;
  enableVersioning: boolean;
  cacheStrategy: 'aggressive' | 'conservative' | 'balanced';
  preloadStrategy: 'all' | 'frequent' | 'none';
  syncInterval: number;
}

interface LessonEngineStats {
  cacheHits: number;
  cacheMisses: number;
  dbQueries: number;
  versionChecks: number;
  lastSync: number;
  totalLessons: number;
}

class EnhancedLessonEngine {
  private config: LessonEngineConfig = {
    enableCaching: true,
    enableVersioning: true,
    cacheStrategy: 'balanced',
    preloadStrategy: 'frequent',
    syncInterval: 5 * 60 * 1000, // 5 minutes
  };

  private stats: LessonEngineStats = {
    cacheHits: 0,
    cacheMisses: 0,
    dbQueries: 0,
    versionChecks: 0,
    lastSync: 0,
    totalLessons: 0,
  };

  private initialized = false;

  private syncTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize the enhanced lesson engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await dbManager.init();

      if (this.config.enableVersioning) {
        void this.checkForContentUpdates();
      }

      if (this.config.enableCaching) {
        await this.warmupCache();
      }

      this.startPeriodicSync();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize enhanced lesson engine:', error);
      throw error;
    }
  }

  /**
   * Get all lessons with intelligent caching
   */
  async getAllLessons(): Promise<Lesson[]> {
    const cacheKey = 'all-lessons';

    if (this.config.enableCaching) {
      const cached = await contentCache.get<Lesson[]>(cacheKey, {
        maxAge: this.getCacheTTL('all'),
        fallback: () => this.loadLessonsFromDB(),
      });

      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }

    this.stats.cacheMisses++;
    return this.loadLessonsFromDB();
  }

  /**
   * Get lessons by language with caching
   */
  async getLessonsByLanguage(language: Language): Promise<Lesson[]> {
    const cacheKey = `lessons-by-language-${language}`;

    if (this.config.enableCaching) {
      const cached = await contentCache.get<Lesson[]>(cacheKey, {
        maxAge: this.getCacheTTL('language'),
        fallback: () => this.loadLessonsByLanguageFromDB(language),
      });

      if (cached) {
        this.stats.cacheHits++;
        console.log(`Cache hit for ${language}: ${cached.length} lessons`);
        return cached;
      }
    }

    this.stats.cacheMisses++;
    const lessons = await this.loadLessonsByLanguageFromDB(language);
    console.log(`DB query for ${language}: ${lessons.length} lessons`);
    return lessons;
  }

  /**
   * Get lessons by subject with caching
   */
  async getLessonsBySubject(subject: Subject): Promise<Lesson[]> {
    const cacheKey = `lessons-by-subject-${subject}`;

    if (this.config.enableCaching) {
      const cached = await contentCache.get<Lesson[]>(cacheKey, {
        maxAge: this.getCacheTTL('subject'),
        fallback: () => this.loadLessonsBySubjectFromDB(subject),
      });

      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }

    this.stats.cacheMisses++;
    return this.loadLessonsBySubjectFromDB(subject);
  }

  /**
   * Get single lesson with caching
   */
  async getLesson(id: string): Promise<Lesson | undefined> {
    const cacheKey = `lesson-${id}`;

    if (this.config.enableCaching) {
      const cached = await contentCache.get<Lesson>(cacheKey, {
        maxAge: this.getCacheTTL('single'),
        fallback: async () => {
          const lesson = await this.loadLessonFromDB(id);
          if (!lesson) throw new Error(`Lesson ${id} not found`);
          return lesson;
        },
      });

      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
    }

    this.stats.cacheMisses++;
    return this.loadLessonFromDB(id);
  }

  /**
   * Save lesson with cache invalidation
   */
  async saveLesson(lesson: Lesson): Promise<void> {
    await dbManager.saveLesson(lesson);
    this.invalidateLessonCache(lesson);
    this.stats.dbQueries++;
  }

  /**
   * Save multiple lessons with batch optimization
   */
  async saveLessons(lessons: Lesson[]): Promise<void> {
    await dbManager.saveLessons(lessons);
    this.invalidateAllCache();
    this.stats.dbQueries++;
  }

  /**
   * Force refresh all content
   */
  async refreshContent(): Promise<void> {
    await this.loadAndCacheLessons();
    this.invalidateAllCache();
    this.stats.lastSync = Date.now();
  }

  /**
   * Get engine statistics
   */
  getStats(): LessonEngineStats & { cacheStats: Record<string, number | string> } {
    return {
      ...this.stats,
      cacheStats: contentCache.getStats(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LessonEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.syncInterval) {
      this.restartPeriodicSync();
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    contentCache.clear();
  }

  // Private methods

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private async loadLessonsFromDB(): Promise<Lesson[]> {
    this.stats.dbQueries++;
    const lessons = await dbManager.getAllLessons();
    this.stats.totalLessons = lessons.length;
    return lessons;
  }

  private async loadLessonsByLanguageFromDB(language: Language): Promise<Lesson[]> {
    this.stats.dbQueries++;
    const lessons = await dbManager.getLessonsByLanguage(language);
    console.log(`IndexedDB query for ${language}: ${lessons.length} lessons`);
    return lessons;
  }

  private async loadLessonsBySubjectFromDB(subject: Subject): Promise<Lesson[]> {
    this.stats.dbQueries++;
    return dbManager.getLessonsBySubject(subject);
  }

  private async loadLessonFromDB(id: string): Promise<Lesson | undefined> {
    this.stats.dbQueries++;
    return dbManager.getLesson(id);
  }

  private async loadAndCacheLessons(): Promise<void> {
    try {
      // Load both lesson sources
      let realLessons: Lesson[] = [];
      let fallbackLessons: Lesson[] = [];

      // Try to load real_lessons.json
      try {
        const response = await fetch('/lesson_content/real_lessons.json');
        if (response.ok) {
          realLessons = await response.json();
          console.log(`Loaded ${realLessons.length} lessons from real_lessons.json`);
        }
      } catch (error) {
        console.warn('Failed to load real lessons:', error);
      }

      // Try to load lessons.json
      try {
        const response = await fetch('/lesson_content/lessons.json');
        if (response.ok) {
          fallbackLessons = await response.json();
          console.log(`Loaded ${fallbackLessons.length} lessons from lessons.json`);
        }
      } catch (error) {
        console.warn('Failed to load fallback lessons:', error);
      }

      // Merge lessons using the lesson data merger
      const mergedLessons = lessonDataMerger.mergeLessons(realLessons, fallbackLessons);

      // Ensure equal lesson count across languages
      const balancedLessons = lessonDataMerger.ensureEqualLessonCount(mergedLessons);

      // Get and log statistics
      const stats = lessonDataMerger.getLessonStats(balancedLessons);
      console.log('Final lesson statistics:', stats);

      // Check if content has changed
      if (this.config.enableVersioning) {
        const hasChanged = await contentVersioning.hasContentChanged(balancedLessons);
        if (hasChanged) {
          console.log('Content has changed, updating database...');
          await dbManager.clearLessons();
          await dbManager.saveLessons(balancedLessons);

          const version = contentVersioning.createVersion(balancedLessons);
          await contentVersioning.storeVersion(version);

          this.stats.versionChecks++;
        }
      } else {
        // Always update if versioning is disabled
        await dbManager.clearLessons();
        await dbManager.saveLessons(balancedLessons);
      }
    } catch (error) {
      console.error('Failed to load lessons:', error);
    }
  }

  private async checkForContentUpdates(): Promise<void> {
    if (!(await contentVersioning.shouldCheckForUpdates())) return;

    try {
      await this.loadAndCacheLessons();
      this.stats.lastSync = Date.now();
    } catch (error) {
      console.error('Failed to check for content updates:', error);
    }
  }

  private async warmupCache(): Promise<void> {
    const loaders = [];

    if (this.config.preloadStrategy === 'all') {
      loaders.push(
        { key: 'all-lessons', loader: () => this.loadLessonsFromDB(), priority: 'high' as const },
        { key: 'lessons-by-language-en', loader: () => this.loadLessonsByLanguageFromDB('en'), priority: 'high' as const },
        { key: 'lessons-by-language-hi', loader: () => this.loadLessonsByLanguageFromDB('hi'), priority: 'high' as const },
      );
    } else if (this.config.preloadStrategy === 'frequent') {
      loaders.push(
        { key: 'all-lessons', loader: () => this.loadLessonsFromDB(), priority: 'high' as const },
      );
    }

    if (loaders.length > 0) {
      await contentCache.warmup(loaders);
    }
  }

  private getCacheTTL(type: 'all' | 'language' | 'subject' | 'single'): number {
    switch (this.config.cacheStrategy) {
      case 'aggressive':
        return type === 'all' ? 30 * 60 * 1000 : 15 * 60 * 1000; // 30min/15min
      case 'conservative':
        return type === 'all' ? 2 * 60 * 1000 : 1 * 60 * 1000; // 2min/1min
      case 'balanced':
      default:
        return type === 'all' ? 10 * 60 * 1000 : 5 * 60 * 1000; // 10min/5min
    }
  }

  private invalidateLessonCache(lesson: Lesson): void {
    contentCache.invalidate(`lesson-${lesson.id}`);
    contentCache.invalidate(`lessons-by-language-${lesson.language}`);
    contentCache.invalidate(`lessons-by-subject-${lesson.subject}`);
    contentCache.invalidate('all-lessons');
  }

  private invalidateAllCache(): void {
    contentCache.clear();
  }

  private startPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      void this.checkForContentUpdates();
    }, this.config.syncInterval);
  }

  private restartPeriodicSync(): void {
    this.startPeriodicSync();
  }
}

export const enhancedLessonEngine = new EnhancedLessonEngine();
