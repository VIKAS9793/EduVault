/* eslint-disable no-continue */
import type { Lesson } from '../types';
import { logger } from './logger';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validates the lesson data structure
 * Returns only valid lessons, filtering out invalid ones.
 * @param data - The data to validate
 * @returns Array of valid lessons (empty if none valid or input invalid)
 */
export const validateLessons = (data: unknown): Lesson[] => {
  if (!Array.isArray(data)) {
    logger.error('Data validation failed: Data is not an array');
    return [];
  }

  const validLessons: Lesson[] = [];

  for (let i = 0; i < data.length; i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const item = data[i];
    if (!isObject(item)) {
      logger.warn(`Data validation warning: Item at index ${i} is not an object. Skipping.`);
      continue;
    }

    // Validate critical fields
    if (typeof item.id !== 'string') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'id'. Skipping.`);
      continue;
    }
    if (typeof item.title !== 'string') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'title'. Skipping.`);
      continue;
    }
    if (typeof item.language !== 'string') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'language'. Skipping.`);
      continue;
    }
    if (typeof item.subject !== 'string') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'subject'. Skipping.`);
      continue;
    }
    if (typeof item.grade !== 'number') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'grade'. Skipping.`);
      continue;
    }
    if (typeof item.text_content !== 'string') {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'text_content'. Skipping.`);
      continue;
    }

    if (!Array.isArray(item.content)) {
      logger.warn(`Data validation warning: Item at index ${i} missing or invalid 'content' array. Skipping.`);
      continue;
    }

    let isContentValid = true;
    const contentArray = item.content as unknown[];

    for (let j = 0; j < contentArray.length; j += 1) {
      const c = contentArray[j];
      if (!isObject(c) || typeof c.id !== 'string' || typeof c.type !== 'string' || typeof c.content !== 'string') {
        logger.warn(`Data validation warning: Item at index ${i} has invalid content item at index ${j}. Skipping lesson.`);
        isContentValid = false;
        break;
      }
    }

    if (!isContentValid) {
      continue;
    }

    // If all checks pass, cast it.
    validLessons.push(item as unknown as Lesson);
  }

  return validLessons;
};
