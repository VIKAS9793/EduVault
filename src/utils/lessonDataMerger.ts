/**
 * Lesson Data Merger
 * Combines lessons from multiple sources to ensure equal content across languages
 */

import type { Lesson, Language } from '../types';

interface LessonDataMergerConfig {
  prioritizeRealLessons: boolean;
  ensureEqualContent: boolean;
  fallbackLanguage: Language;
}

class LessonDataMerger {
  private config: LessonDataMergerConfig = {
    prioritizeRealLessons: true,
    ensureEqualContent: true,
    fallbackLanguage: 'en',
  };

  /**
   * Merge lessons from multiple sources
   * @param realLessons - Lessons from real_lessons.json
   * @param fallbackLessons - Lessons from lessons.json
   * @returns Merged lessons with equal content across languages
   */
  async mergeLessons(realLessons: Lesson[], fallbackLessons: Lesson[]): Promise<Lesson[]> {
    console.log(`Merging lessons: ${realLessons.length} real lessons, ${fallbackLessons.length} fallback lessons`);

    // If we have real lessons, use them as base
    if (realLessons.length > 0) {
      const mergedLessons = [...realLessons];

      // Add missing lessons from fallback to ensure equal content
      if (this.config.ensureEqualContent) {
        const missingLessons = this.findMissingLessons(realLessons, fallbackLessons);
        mergedLessons.push(...missingLessons);
      }

      console.log(`Merged lessons: ${mergedLessons.length} total lessons`);
      return mergedLessons;
    }

    // Fallback to lessons.json if no real lessons
    console.log('No real lessons found, using fallback lessons');
    return fallbackLessons;
  }

  /**
   * Find lessons that exist in fallback but not in real lessons
   * @param realLessons - Lessons from real_lessons.json
   * @param fallbackLessons - Lessons from lessons.json
   * @returns Missing lessons to add
   */
  private findMissingLessons(realLessons: Lesson[], fallbackLessons: Lesson[]): Lesson[] {
    const missingLessons: Lesson[] = [];

    for (const fallbackLesson of fallbackLessons) {
      // Check if this lesson exists in real lessons
      const existsInReal = realLessons.some((realLesson) => realLesson.subject === fallbackLesson.subject
        && realLesson.grade === fallbackLesson.grade
        && realLesson.language === fallbackLesson.language);

      if (!existsInReal) {
        missingLessons.push(fallbackLesson);
      }
    }

    console.log(`Found ${missingLessons.length} missing lessons to add`);
    return missingLessons;
  }

  /**
   * Ensure equal lesson count across languages
   * @param lessons - All lessons
   * @returns Lessons with equal count per language
   */
  ensureEqualLessonCount(lessons: Lesson[]): Lesson[] {
    const lessonsByLanguage = this.groupLessonsByLanguage(lessons);
    const languages = Object.keys(lessonsByLanguage) as Language[];

    if (languages.length === 0) return lessons;

    // Find the language with the most lessons
    const maxCount = Math.max(...languages.map((lang) => lessonsByLanguage[lang].length));

    console.log('Language lesson counts:', languages.map((lang) => `${lang}: ${lessonsByLanguage[lang].length}`));
    console.log(`Target lesson count per language: ${maxCount}`);

    // Ensure all languages have the same number of lessons
    const balancedLessons: Lesson[] = [];

    for (const language of languages) {
      const languageLessons = lessonsByLanguage[language];

      if (languageLessons.length < maxCount) {
        // Duplicate some lessons to match the count
        const needed = maxCount - languageLessons.length;
        const duplicatedLessons = this.duplicateLessons(languageLessons, needed);
        balancedLessons.push(...languageLessons, ...duplicatedLessons);
        console.log(`Added ${needed} duplicated lessons for ${language}`);
      } else {
        balancedLessons.push(...languageLessons);
      }
    }

    return balancedLessons;
  }

  /**
   * Group lessons by language
   * @param lessons - All lessons
   * @returns Lessons grouped by language
   */
  private groupLessonsByLanguage(lessons: Lesson[]): Record<Language, Lesson[]> {
    return lessons.reduce((acc, lesson) => {
      if (!acc[lesson.language]) {
        acc[lesson.language] = [];
      }
      acc[lesson.language].push(lesson);
      return acc;
    }, {} as Record<Language, Lesson[]>);
  }

  /**
   * Duplicate lessons to reach target count
   * @param lessons - Lessons to duplicate
   * @param count - Number of lessons to duplicate
   * @returns Duplicated lessons
   */
  private duplicateLessons(lessons: Lesson[], count: number): Lesson[] {
    const duplicated: Lesson[] = [];

    for (let i = 0; i < count; i++) {
      const sourceLesson = lessons[i % lessons.length];
      const duplicatedLesson: Lesson = {
        ...sourceLesson,
        id: `${sourceLesson.id}_dup_${i + 1}`,
        title: `${sourceLesson.title} (${i + 1})`,
      };
      duplicated.push(duplicatedLesson);
    }

    return duplicated;
  }

  /**
   * Get lesson statistics
   * @param lessons - All lessons
   * @returns Statistics about lessons
   */
  getLessonStats(lessons: Lesson[]): {
    total: number;
    byLanguage: Record<Language, number>;
    bySubject: Record<string, number>;
    byGrade: Record<number, number>;
  } {
    const stats = {
      total: lessons.length,
      byLanguage: {} as Record<Language, number>,
      bySubject: {} as Record<string, number>,
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

// Export singleton instance
export const lessonDataMerger = new LessonDataMerger();
