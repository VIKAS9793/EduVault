/**
 * Content Manager Service
 * Handles real content integration from NCERT, DIKSHA, and other sources
 * Implements content validation, audio generation, and metadata management
 */

import type {
  Lesson,
  NCERTContent,
  ContentSyncStatus,
  ContentFilters,
  ContentSource,
  Subject,
  DifficultyLevel,
  LessonContent,
  QuizQuestion,
  QuestionType,
} from '../types';
import { enhancedLessonEngine } from './EnhancedLessonEngine';
import { ttsService } from './TTSService';

class ContentManager {
  // private readonly NCERT_BASE_URL = 'https://ncert.nic.in/textbook';
  // private readonly DIKSHA_BASE_URL = 'https://diksha.gov.in/api';
  // private readonly EPATHSHALA_BASE_URL = 'https://epathshala.nic.in/api';

  /**
   * Sync content from specified source
   */
  async syncFromSource(source: ContentSource): Promise<ContentSyncStatus> {
    const status: ContentSyncStatus = {
      source,
      lastSyncDate: null,
      totalLessons: 0,
      syncedLessons: 0,
      failedSyncs: 0,
      pendingUpdates: 0,
    };

    try {
      let content: NCERTContent[] = [];

      switch (source) {
        case 'NCERT':
          content = await this.fetchNCERTContent();
          break;
        case 'DIKSHA':
          content = await this.fetchDIKSHAContent();
          break;
        case 'ePathshala':
          content = await this.fetchEPathshalaContent();
          break;
        default:
          throw new Error(`Unsupported content source: ${source}`);
      }

      status.totalLessons = content.length;

      // Convert and save content
      for (const ncertContent of content) {
        try {
          const lesson = await this.convertNCERTToLesson(ncertContent);
          await enhancedLessonEngine.saveLesson(lesson);
          status.syncedLessons++;
        } catch (error) {
          console.error(`Failed to sync lesson ${ncertContent.id}:`, error);
          status.failedSyncs++;
        }
      }

      status.lastSyncDate = new Date().toISOString();
    } catch (error) {
      console.error(`Failed to sync from ${source}:`, error);
      throw error;
    }

    return status;
  }

  /**
   * Fetch content from NCERT official sources
   */
  private async fetchNCERTContent(): Promise<NCERTContent[]> {
    // Mock implementation - in production, this would fetch from real NCERT APIs
    const mockNCERTContent: NCERTContent[] = [
      {
        id: 'ncert_sci_6_1',
        title: 'Food: Where Does It Come From?',
        class: 6,
        subject: 'Science',
        chapter: 'Chapter 1',
        content: `All living things need food to survive. Food provides us with energy and nutrients necessary for growth and development. Let's explore where our food comes from.

Plants are the primary source of food. They make their own food through the process of photosynthesis. Animals depend on plants directly or indirectly for their food.

Food sources can be classified into:
1. Plant sources: Fruits, vegetables, grains, pulses
2. Animal sources: Milk, eggs, meat, fish

Different parts of plants are used as food:
- Roots: Carrot, radish, sweet potato
- Stems: Potato, ginger, sugarcane
- Leaves: Spinach, cabbage, lettuce
- Flowers: Cauliflower, broccoli
- Fruits: Apple, mango, banana
- Seeds: Rice, wheat, pulses`,
        images: [
          'https://ncert.nic.in/textbook/pdf/fesc101.pdf',
          'https://ncert.nic.in/textbook/pdf/fesc102.pdf',
        ],
        exercises: [
          {
            id: 'ex_1',
            type: 'multiple_choice',
            question: 'Which of the following is a plant source of food?',
            answer: 'Rice',
            hints: ['Think about what grows in fields'],
            difficulty: 'Beginner',
          },
          {
            id: 'ex_2',
            type: 'short_answer',
            question: 'Name three parts of plants that we eat as food.',
            answer: 'Roots, stems, leaves, flowers, fruits, seeds (any three)',
            hints: ['Consider different parts of plants'],
            difficulty: 'Intermediate',
          },
        ],
        sourceUrl: 'https://ncert.nic.in/textbook/pdf/fesc101.pdf',
        lastUpdated: '2024-01-15T00:00:00Z',
      },
      {
        id: 'ncert_math_7_1',
        title: 'Integers',
        class: 7,
        subject: 'Mathematics',
        chapter: 'Chapter 1',
        content: `Integers are whole numbers that can be positive, negative, or zero. They are represented on a number line where:
- Positive integers are to the right of zero
- Negative integers are to the left of zero
- Zero is neither positive nor negative

Properties of integers:
1. Closure property: Sum of two integers is always an integer
2. Commutative property: a + b = b + a
3. Associative property: (a + b) + c = a + (b + c)
4. Additive identity: a + 0 = a
5. Additive inverse: a + (-a) = 0

Operations with integers:
- Addition: Same signs add, different signs subtract
- Subtraction: Add the opposite
- Multiplication: Same signs positive, different signs negative
- Division: Same signs positive, different signs negative`,
        exercises: [
          {
            id: 'ex_3',
            type: 'multiple_choice',
            question: 'What is the sum of -5 and 3?',
            answer: '-2',
            hints: ['Different signs, so subtract'],
            difficulty: 'Beginner',
          },
          {
            id: 'ex_4',
            type: 'short_answer',
            question: 'Find the product of -4 and -6.',
            answer: '24',
            hints: ['Same signs give positive result'],
            difficulty: 'Intermediate',
          },
        ],
        sourceUrl: 'https://ncert.nic.in/textbook/pdf/gemh101.pdf',
        lastUpdated: '2024-01-15T00:00:00Z',
      },
    ];

    return mockNCERTContent;
  }

  /**
   * Fetch content from DIKSHA platform
   */
  private async fetchDIKSHAContent(): Promise<NCERTContent[]> {
    // Mock implementation for DIKSHA content
    return [];
  }

  /**
   * Fetch content from ePathshala platform
   */
  private async fetchEPathshalaContent(): Promise<NCERTContent[]> {
    // Mock implementation for ePathshala content
    return [];
  }

  /**
   * Convert NCERT content to EduVault lesson format
   */
  private async convertNCERTToLesson(ncertContent: NCERTContent): Promise<Lesson> {
    const lessonContent: LessonContent[] = [
      {
        id: 'content_1',
        type: 'text',
        content: ncertContent.content,
        duration: this.estimateReadingTime(ncertContent.content),
      },
    ];

    // Add image content if available
    if (ncertContent.images && ncertContent.images.length > 0) {
      ncertContent.images.forEach((imageUrl, index) => {
        lessonContent.push({
          id: `image_${index + 1}`,
          type: 'image',
          content: `Educational diagram ${index + 1}`,
          mediaUrl: imageUrl,
        });
      });
    }

    // Convert exercises to quiz questions
    const quizQuestions: QuizQuestion[] = ncertContent.exercises?.map((exercise) => ({
      id: `quiz_${exercise.id}`,
      question: exercise.question,
      questionType: this.mapExerciseTypeToQuestionType(exercise.type),
      options: exercise.type === 'multiple_choice' ? this.generateOptions(exercise.answer || '') : undefined,
      answer: exercise.answer || '',
      explanation: `This question tests your understanding of ${ncertContent.title}`,
      difficulty: this.mapDifficulty(exercise.difficulty),
      points: this.calculatePoints(exercise.difficulty),
      hints: exercise.hints,
    })) || [];

    const lesson: Lesson = {
      id: ncertContent.id,
      title: ncertContent.title,
      description: `NCERT ${ncertContent.subject} - ${ncertContent.chapter}`,
      language: 'en', // Default to English, can be enhanced for multilingual support
      subject: this.mapSubject(ncertContent.subject),
      grade: ncertContent.class,
      order: 1,
      content: lessonContent,
      text_content: ncertContent.content,
      quiz: quizQuestions,
      duration: this.estimateLessonDuration(ncertContent.content, quizQuestions.length),
      difficulty: this.assessDifficulty(ncertContent.content, quizQuestions),
      source: 'NCERT',
      sourceUrl: ncertContent.sourceUrl,
      lastUpdated: ncertContent.lastUpdated,
      version: '1.0.0',
      tags: this.generateTags(ncertContent),
      learningObjectives: this.extractLearningObjectives(ncertContent.content),
      keywords: this.extractKeywords(ncertContent.content),
      accessibility: {
        hasAudio: false, // Will be generated
        hasVideo: false,
        hasTranscript: true,
        hasSignLanguage: false,
        hasBraille: false,
      },
    };

    // Generate audio for the lesson
    try {
      const audioUrl = await this.generateAudio(lesson);
      lesson.audio_file = audioUrl;
      lesson.accessibility.hasAudio = true;
    } catch (error) {
      console.warn(`Failed to generate audio for lesson ${lesson.id}:`, error);
    }

    return lesson;
  }

  /**
   * Generate audio for lesson content
   */
  async generateAudio(lesson: Lesson): Promise<string> {
    try {
      // Use TTS service to generate audio
      const audioText = this.prepareTextForTTS(lesson.text_content);
      const audioBlob = await ttsService.generateAudioBlob(audioText, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        lang: lesson.language,
      });

      // Save audio blob to IndexedDB or generate URL
      const audioUrl = await this.saveAudioBlob(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error('Failed to generate audio:', error);
      throw new Error('Audio generation failed');
    }
  }

  /**
   * Validate lesson content
   */
  async validateContent(lesson: Lesson): Promise<boolean> {
    try {
      // Check required fields
      if (!lesson.id || !lesson.title || !lesson.content || lesson.content.length === 0) {
        return false;
      }

      // Validate content structure
      for (const content of lesson.content) {
        if (!content.id || !content.type || !content.content) {
          return false;
        }
      }

      // Validate quiz questions
      for (const question of lesson.quiz) {
        if (!question.id || !question.question || !question.answer) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Content validation failed:', error);
      return false;
    }
  }

  /**
   * Search content with filters
   */
  async searchContent(query: string, filters: ContentFilters): Promise<Lesson[]> {
    const allLessons = await enhancedLessonEngine.getAllLessons();

    return allLessons.filter((lesson) => {
      // Text search
      const matchesQuery = !query
        || lesson.title.toLowerCase().includes(query.toLowerCase())
        || lesson.text_content.toLowerCase().includes(query.toLowerCase())
        || lesson.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      // Filter by language
      const matchesLanguage = !filters.language || lesson.language === filters.language;

      // Filter by subject
      const matchesSubject = !filters.subject || lesson.subject === filters.subject;

      // Filter by grade
      const matchesGrade = !filters.grade || lesson.grade === filters.grade;

      // Filter by difficulty
      const matchesDifficulty = !filters.difficulty || lesson.difficulty === filters.difficulty;

      // Filter by source
      const matchesSource = !filters.source || lesson.source === filters.source;

      // Filter by audio availability
      const matchesAudio = filters.hasAudio === undefined || lesson.accessibility.hasAudio === filters.hasAudio;

      // Filter by video availability
      const matchesVideo = filters.hasVideo === undefined || lesson.accessibility.hasVideo === filters.hasVideo;

      return matchesQuery && matchesLanguage && matchesSubject
             && matchesGrade && matchesDifficulty && matchesSource
             && matchesAudio && matchesVideo;
    });
  }

  /**
   * Update content metadata
   */
  async updateContentMetadata(lessonId: string, metadata: Partial<Lesson>): Promise<void> {
    const lesson = await enhancedLessonEngine.getLesson(lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }

    const updatedLesson = { ...lesson, ...metadata };
    await enhancedLessonEngine.saveLesson(updatedLesson);
  }

  // Helper methods
  private estimateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private mapExerciseTypeToQuestionType(type: string): QuestionType {
    switch (type) {
      case 'multiple_choice': return 'multiple_choice';
      case 'short_answer': return 'short_answer';
      case 'long_answer': return 'essay';
      case 'fill_blank': return 'fill_blank';
      default: return 'multiple_choice';
    }
  }

  private mapSubject(subject: string): Subject {
    const subjectMap: Record<string, Subject> = {
      Science: 'Science',
      Mathematics: 'Mathematics',
      Civics: 'Civics',
      History: 'History',
      Geography: 'Geography',
      Language: 'Language',
      Physics: 'Physics',
      Chemistry: 'Chemistry',
      Biology: 'Biology',
      Economics: 'Economics',
      'Computer Science': 'Computer Science',
      'Environmental Studies': 'Environmental Studies',
    };
    return subjectMap[subject] || 'Science';
  }

  private mapDifficulty(difficulty: string): DifficultyLevel {
    return difficulty as DifficultyLevel;
  }

  private calculatePoints(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'Beginner': return 1;
      case 'Intermediate': return 2;
      case 'Advanced': return 3;
      default: return 1;
    }
  }

  private generateOptions(answer: string): string[] {
    // Simple option generation - in production, this would be more sophisticated
    const options = [answer];
    const distractors = ['Option A', 'Option B', 'Option C'];
    return [...options, ...distractors].slice(0, 4);
  }

  private estimateLessonDuration(content: string, quizCount: number): number {
    const readingTime = this.estimateReadingTime(content);
    const quizTime = quizCount * 2; // 2 minutes per question
    return readingTime + quizTime;
  }

  private assessDifficulty(content: string, questions: QuizQuestion[]): DifficultyLevel {
    const contentLength = content.length;
    const avgQuestionDifficulty = questions.reduce((sum, q) => {
      const difficultyScore = q.difficulty === 'Beginner' ? 1 : q.difficulty === 'Intermediate' ? 2 : 3;
      return sum + difficultyScore;
    }, 0) / questions.length;

    if (contentLength > 2000 || avgQuestionDifficulty > 2.5) return 'Advanced';
    if (contentLength > 1000 || avgQuestionDifficulty > 1.5) return 'Intermediate';
    return 'Beginner';
  }

  private generateTags(ncertContent: NCERTContent): string[] {
    return [
      ncertContent.subject.toLowerCase(),
      `class-${ncertContent.class}`,
      ncertContent.chapter.toLowerCase().replace(/\s+/g, '-'),
      'ncert',
      'government-approved',
    ];
  }

  private extractLearningObjectives(content: string): string[] {
    // Simple extraction - in production, this would use NLP
    const objectives: string[] = [];
    const sentences = content.split(/[.!?]+/);

    sentences.forEach((sentence) => {
      if (sentence.toLowerCase().includes('learn')
          || sentence.toLowerCase().includes('understand')
          || sentence.toLowerCase().includes('know')) {
        objectives.push(sentence.trim());
      }
    });

    return objectives.slice(0, 3); // Limit to 3 objectives
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 4);

    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private prepareTextForTTS(text: string): string {
    // Clean text for TTS
    return text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async saveAudioBlob(audioBlob: Blob): Promise<string> {
    // In a real implementation, this would save to IndexedDB or generate a blob URL
    return URL.createObjectURL(audioBlob);
  }
}

export const contentManager = new ContentManager();
