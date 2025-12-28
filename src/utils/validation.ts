import type { Lesson } from '../types';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Validates the lesson data structure
 * @param data - The data to validate
 * @returns The validated lessons or null if validation fails
 */
export const validateLessons = (data: unknown): Lesson[] | null => {
  if (!Array.isArray(data)) {
    console.error('Data validation failed: Data is not an array');
    return null;
  }

  const validLessons: Lesson[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!isObject(item)) {
      console.error(`Data validation failed: Item at index ${i} is not an object`);
      return null;
    }

    // Validate critical fields
    if (typeof item.id !== 'string') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'id'`);
      return null;
    }
    if (typeof item.title !== 'string') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'title'`);
      return null;
    }
    if (typeof item.language !== 'string') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'language'`);
      return null;
    }
    if (typeof item.subject !== 'string') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'subject'`);
      return null;
    }
    if (typeof item.grade !== 'number') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'grade'`);
      return null;
    }
    if (typeof item.text_content !== 'string') {
      console.error(`Data validation failed: Item at index ${i} missing or invalid 'text_content'`);
      return null;
    }

    if (!Array.isArray(item.content)) {
       console.error(`Data validation failed: Item at index ${i} missing or invalid 'content' array`);
       return null;
    }

    for (let j = 0; j < item.content.length; j++) {
      const c = item.content[j];
      if (!isObject(c) || typeof c.id !== 'string' || typeof c.type !== 'string' || typeof c.content !== 'string') {
           console.error(`Data validation failed: Item at index ${i} has invalid content item at index ${j}`);
           return null;
      }
    }

    // If all checks pass, cast it.
    validLessons.push(item as unknown as Lesson);
  }

  return validLessons;
};
