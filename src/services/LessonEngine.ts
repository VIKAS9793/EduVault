/**
 * Lesson Engine Service
 * Manages lesson content loading, caching, and retrieval
 * Implements offline-first data strategy
 */

import type { Lesson, Language, Subject } from '../types';
import { dbManager } from '../utils/IndexedDBManager';

class LessonEngine {
  private lessonsLoaded = false;

  /**
   * Initialize lesson engine and load preloaded lessons
   */
  async init(): Promise<void> {
    if (this.lessonsLoaded) {
      return;
    }

    try {
      await dbManager.init();

      // Check if lessons already exist in IndexedDB
      const existingLessons = await dbManager.getAllLessons();

      if (existingLessons.length === 0) {
        // Load preloaded lessons from JSON
        await this.loadPreloadedLessons();
      }

      this.lessonsLoaded = true;
    } catch (error) {
      console.error('Failed to initialize lesson engine:', error);
      throw new Error('Lesson engine initialization failed');
    }
  }

  /**
   * Load preloaded lessons from bundled JSON
   */
  private async loadPreloadedLessons(): Promise<void> {
    try {
      const response = await fetch('/lesson_content/lessons.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }

      const lessons: Lesson[] = (await response.json()) as Lesson[];
      await dbManager.saveLessons(lessons);
    } catch (error) {
      console.error('Failed to load preloaded lessons:', error);
      // Don't throw - app can still function with empty lessons
    }
  }

  /**
   * Get all available lessons
   */
  async getAllLessons(): Promise<Lesson[]> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    return dbManager.getAllLessons();
  }

  /**
   * Get single lesson by ID
   */
  async getLesson(id: string): Promise<Lesson | undefined> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    return dbManager.getLesson(id);
  }

  /**
   * Get lessons filtered by language
   */
  async getLessonsByLanguage(language: Language): Promise<Lesson[]> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    return dbManager.getLessonsByLanguage(language);
  }

  /**
   * Get lessons filtered by subject
   */
  async getLessonsBySubject(subject: Subject): Promise<Lesson[]> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    return dbManager.getLessonsBySubject(subject);
  }

  /**
   * Save new lesson (from sync or manual addition)
   */
  async saveLesson(lesson: Lesson): Promise<void> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    await dbManager.saveLesson(lesson);
  }

  /**
   * Save multiple lessons (bulk operation)
   */
  async saveLessons(lessons: Lesson[]): Promise<void> {
    if (!this.lessonsLoaded) {
      await this.init();
    }
    await dbManager.saveLessons(lessons);
  }
}

export const lessonEngine = new LessonEngine();
