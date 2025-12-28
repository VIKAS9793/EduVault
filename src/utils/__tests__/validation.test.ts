import { describe, it, expect, vi } from 'vitest';
import { validateLessons } from '../validation';
import { LessonFactory } from '../../__tests__/factories/LessonFactory';

describe('validateLessons', () => {
  it('should validate valid lessons correctly', () => {
    const validLessons = [LessonFactory.createMinimal()];
    const result = validateLessons(validLessons);
    expect(result).toEqual(validLessons);
  });

  it('should return null for invalid lesson structure (missing required field)', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-ignore
    delete invalidLesson.id;

    const result = validateLessons([invalidLesson]);
    expect(result).toBeNull();
  });

  it('should return null for invalid lesson structure (wrong type)', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-ignore
    invalidLesson.grade = "six"; // Should be number

    const result = validateLessons([invalidLesson]);
    expect(result).toBeNull();
  });

  it('should return null for invalid content structure', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-ignore
    invalidLesson.content = [{ id: '1', type: 'text' }]; // Missing 'content' string field inside content item

    const result = validateLessons([invalidLesson]);
    expect(result).toBeNull();
  });

  it('should handle empty array', () => {
    const result = validateLessons([]);
    expect(result).toEqual([]);
  });

  it('should return null if input is not an array', () => {
    const result = validateLessons({});
    expect(result).toBeNull();
  });

  it('should log validation errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-ignore
    delete invalidLesson.title;

    validateLessons([invalidLesson]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Data validation failed'));
    consoleSpy.mockRestore();
  });
});
