import {
  describe, it, expect, vi,
} from 'vitest';
import { validateLessons } from '../validation';
import { LessonFactory } from '../../__tests__/factories/LessonFactory';

describe('validateLessons', () => {
  it('should validate valid lessons correctly', () => {
    const validLessons = [LessonFactory.createMinimal()];
    const result = validateLessons(validLessons);
    expect(result).toEqual(validLessons);
  });

  it('should skip invalid lesson structure (missing required field) and return empty array if all invalid', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-expect-error - Testing missing field
    delete invalidLesson.id;

    const result = validateLessons([invalidLesson]);
    expect(result).toEqual([]);
  });

  it('should skip invalid lesson structure (wrong type)', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-expect-error - Testing wrong type
    invalidLesson.grade = 'six'; // Should be number

    const result = validateLessons([invalidLesson]);
    expect(result).toEqual([]);
  });

  it('should skip invalid content structure', () => {
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-expect-error - Testing invalid content structure
    invalidLesson.content = [{ id: '1', type: 'text' }]; // Missing 'content' string field inside content item

    const result = validateLessons([invalidLesson]);
    expect(result).toEqual([]);
  });

  it('should handle empty array', () => {
    const result = validateLessons([]);
    expect(result).toEqual([]);
  });

  it('should return empty array if input is not an array', () => {
    const result = validateLessons({});
    expect(result).toEqual([]);
  });

  it('should filter out invalid lessons and keep valid ones', () => {
    const validLesson = LessonFactory.createMinimal({ id: 'valid-1' });
    const invalidLesson = { ...LessonFactory.createMinimal({ id: 'invalid-1' }) };
    // @ts-expect-error - Testing missing field
    delete invalidLesson.title;

    const result = validateLessons([validLesson, invalidLesson]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(validLesson);
  });

  it('should log validation warnings to console', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidLesson = { ...LessonFactory.createMinimal() };
    // @ts-expect-error - Testing missing field
    delete invalidLesson.title;

    validateLessons([invalidLesson]);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Data validation warning'));
    consoleSpy.mockRestore();
  });
});
