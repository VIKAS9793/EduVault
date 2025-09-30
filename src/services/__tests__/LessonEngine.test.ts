/**
 * Lesson Engine Unit Tests
 */

import { lessonEngine } from '../LessonEngine';
import type { Lesson } from '../../types';

describe('LessonEngine', () => {
  const mockLesson: Lesson = {
    id: 'test-001',
    title: 'Test Lesson',
    language: 'en',
    subject: 'Science',
    grade: 5,
    audio_file: '/test.mp3',
    text_content: 'Test content',
    quiz: [],
  };

  it('should initialize without errors', async () => {
    await expect(lessonEngine.init()).resolves.not.toThrow();
  });

  it('should save and retrieve lesson', async () => {
    await lessonEngine.init();
    await lessonEngine.saveLesson(mockLesson);
    const retrieved = await lessonEngine.getLesson('test-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Test Lesson');
  });

  it('should filter lessons by language', async () => {
    await lessonEngine.init();
    const lessons = await lessonEngine.getLessonsByLanguage('en');
    expect(Array.isArray(lessons)).toBe(true);
  });

  it('should filter lessons by subject', async () => {
    await lessonEngine.init();
    const lessons = await lessonEngine.getLessonsBySubject('Science');
    expect(Array.isArray(lessons)).toBe(true);
  });
});
