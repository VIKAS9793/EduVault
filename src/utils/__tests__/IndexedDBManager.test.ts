/**
 * IndexedDB Manager Unit Tests
 */

import { dbManager } from '../IndexedDBManager';
import type { Lesson, UserProgress } from '../../types';

describe('IndexedDBManager', () => {
  beforeAll(async () => {
    await dbManager.init();
  });

  const testLesson: Lesson = {
    id: 'db-test-001',
    title: 'Database Test',
    description: 'Test Description',
    language: 'en',
    subject: 'Mathematics',
    grade: 6,
    chapterId: 'ch1',
    order: 1,
    content: [],
    audio_file: '/test.mp3',
    text_content: 'Test',
    quiz: [],
    duration: 10,
    difficulty: 'Beginner',
    source: 'Custom',
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    tags: ['test'],
    learningObjectives: ['test'],
    keywords: ['test'],
    accessibility: {
      hasAudio: true,
      hasVideo: false,
      hasTranscript: true,
    },
  };

  it('should initialize database', async () => {
    await expect(dbManager.init()).resolves.not.toThrow();
  });

  it('should save and retrieve lesson', async () => {
    await dbManager.saveLesson(testLesson);
    const retrieved = await dbManager.getLesson('db-test-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Database Test');
  });

  it('should save and retrieve progress', async () => {
    const progress: UserProgress = {
      lessonId: 'db-test-001',
      completed: true,
      score: 95,
      attempts: 1,
      lastAttemptDate: new Date().toISOString(),
      timeSpent: 10,
      quizResults: [],
      bookmarks: [],
      notes: [],
    };

    await dbManager.saveProgress(progress);
    const retrieved = await dbManager.getProgress('db-test-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.score).toBe(95);
  });
});
