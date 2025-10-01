/**
 * Production-Grade Test Factories
 * MAANG Standards: Deterministic, maintainable test data generation
 */

import type {
  Lesson,
  LessonContent,
  QuizQuestion,
  Language,
  DifficultyLevel,
} from '../../types';

/**
 * Factory for creating test lessons with realistic data
 * Follows AAA pattern: Arrange test data consistently
 */
export class LessonFactory {
  private static lessonCounter = 1;

  private static contentCounter = 1;

  private static quizCounter = 1;

  /**
   * Create a minimal valid lesson for testing
   */
  static createMinimal(overrides: Partial<Lesson> = {}): Lesson {
    return {
      id: `lesson_${this.lessonCounter++}`,
      title: `Test Lesson ${this.lessonCounter}`,
      description: `Test lesson description ${this.lessonCounter}`,
      language: 'en',
      subject: 'Science',
      grade: 6,
      order: 1,
      content: [this.createContent()],
      text_content: 'Test lesson content',
      quiz: [this.createQuizQuestion()],
      duration: 10,
      difficulty: 'Beginner',
      source: 'NCERT',
      lastUpdated: '2024-01-15T10:00:00Z',
      version: '1.0.0',
      tags: ['test'],
      learningObjectives: ['Test objective'],
      keywords: ['test'],
      accessibility: {
        hasAudio: false,
        hasVideo: false,
        hasTranscript: true,
      },
      ...overrides,
    };
  }

  /**
   * Create a complete NCERT-style lesson
   */
  static createNCERTStyle(overrides: Partial<Lesson> = {}): Lesson {
    return this.createMinimal({
      id: 'ncert_sci_6_1',
      title: 'Food: Where Does It Come From?',
      description: 'NCERT Science Class 6 - Chapter 1: Understanding food sources and nutrition',
      language: 'en',
      subject: 'Science',
      grade: 6,
      content: [
        this.createContent({
          type: 'text',
          content: 'All living things need food to survive. Food provides us with energy and nutrients necessary for growth and development.',
        }),
        this.createContent({
          type: 'text',
          content: 'Plants are the primary source of food. They make their own food through the process of photosynthesis.',
        }),
      ],
      text_content: 'All living things need food to survive. Plants are the primary source of food.',
      quiz: [
        this.createQuizQuestion({
          questionType: 'multiple_choice',
          question: 'Which of the following is a plant source of food?',
          options: ['Rice', 'Milk', 'Eggs', 'Meat'],
          answer: 'Rice',
          difficulty: 'Beginner',
        }),
        this.createQuizQuestion({
          questionType: 'short_answer',
          question: 'Name three parts of plants that we eat as food.',
          answer: 'Roots, stems, leaves',
          difficulty: 'Intermediate',
        }),
      ],
      duration: 15,
      difficulty: 'Beginner',
      source: 'NCERT',
      sourceUrl: 'https://ncert.nic.in/textbook/pdf/fesc101.pdf',
      tags: ['science', 'class-6', 'ncert', 'food', 'nutrition'],
      learningObjectives: [
        'Understand the importance of food for living organisms',
        'Identify different sources of food',
        'Classify food into plant and animal sources',
      ],
      keywords: ['food', 'plants', 'animals', 'nutrition', 'photosynthesis'],
      accessibility: {
        hasAudio: true,
        hasVideo: false,
        hasTranscript: true,
      },
      ...overrides,
    });
  }

  /**
   * Create a lesson with specific language
   */
  static createWithLanguage(language: Language, overrides: Partial<Lesson> = {}): Lesson {
    const baseLesson = this.createMinimal();
    return {
      ...baseLesson,
      language,
      title: language === 'hi' ? 'परीक्षण पाठ' : 'Test Lesson',
      description: language === 'hi' ? 'परीक्षण पाठ विवरण' : 'Test lesson description',
      text_content: language === 'hi' ? 'परीक्षण पाठ सामग्री' : 'Test lesson content',
      ...overrides,
    };
  }

  /**
   * Create a lesson with specific difficulty
   */
  static createWithDifficulty(difficulty: DifficultyLevel, overrides: Partial<Lesson> = {}): Lesson {
    return this.createMinimal({
      difficulty,
      duration: difficulty === 'Advanced' ? 30 : difficulty === 'Intermediate' ? 20 : 10,
      quiz: [
        this.createQuizQuestion({ difficulty }),
        this.createQuizQuestion({ difficulty }),
        this.createQuizQuestion({ difficulty }),
      ],
      ...overrides,
    });
  }

  /**
   * Create multiple lessons for testing collections
   */
  static createMany(count: number, overrides: Partial<Lesson> = {}): Lesson[] {
    return Array.from({ length: count }, (_, index) => this.createMinimal({
      id: `lesson_${index + 1}`,
      title: `Test Lesson ${index + 1}`,
      order: index + 1,
      ...overrides,
    }));
  }

  /**
   * Create lesson content
   */
  static createContent(overrides: Partial<LessonContent> = {}): LessonContent {
    return {
      id: `content_${this.contentCounter++}`,
      type: 'text',
      content: `Test content ${this.contentCounter}`,
      duration: 2,
      ...overrides,
    };
  }

  /**
   * Create quiz question
   */
  static createQuizQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
    return {
      id: `quiz_${this.quizCounter++}`,
      question: `Test question ${this.quizCounter}?`,
      questionType: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
      explanation: `Test explanation ${this.quizCounter}`,
      difficulty: 'Beginner',
      points: 1,
      timeLimit: 30,
      hints: [`Test hint ${this.quizCounter}`],
      ...overrides,
    };
  }

  /**
   * Reset counters for test isolation
   */
  static reset(): void {
    this.lessonCounter = 1;
    this.contentCounter = 1;
    this.quizCounter = 1;
  }
}

/**
 * Factory for creating test data with specific scenarios
 */
export class TestDataFactory {
  /**
   * Create realistic NCERT content for testing
   */
  static createNCERTContent(): any {
    return {
      id: 'ncert_sci_6_1',
      title: 'Food: Where Does It Come From?',
      class: 6,
      subject: 'Science',
      chapter: 'Chapter 1',
      content: 'All living things need food to survive...',
      images: ['https://ncert.nic.in/image1.jpg'],
      exercises: [
        {
          id: 'ex_1',
          type: 'multiple_choice',
          question: 'Which of the following is a plant source of food?',
          answer: 'Rice',
          hints: ['Think about what grows in fields'],
          difficulty: 'Beginner',
        },
      ],
      sourceUrl: 'https://ncert.nic.in/textbook/pdf/fesc101.pdf',
      lastUpdated: '2024-01-15T00:00:00Z',
    };
  }

  /**
   * Create mock API response
   */
  static createAPIResponse<T>(data: T, success = true) {
    return {
      success,
      data: success ? data : undefined,
      error: success ? undefined : 'Test error',
      timestamp: '2024-01-15T10:00:00Z',
    };
  }

  /**
   * Create user progress data
   */
  static createUserProgress(lessonId: string, overrides = {}): any {
    return {
      lessonId,
      completed: false,
      score: 0,
      attempts: 0,
      lastAttemptDate: '2024-01-15T10:00:00Z',
      timeSpent: 0,
      quizResults: [],
      bookmarks: [],
      notes: [],
      ...overrides,
    };
  }
}
