/**
 * Production-Grade ContentManager Service Tests
 * MAANG Standards: Test behavior, not implementation
 */

import { contentManager } from '../ContentManager';
import { enhancedLessonEngine } from '../EnhancedLessonEngine';
import { ttsService } from '../TTSService';
import { LessonFactory, TestDataFactory } from '../../__tests__/factories/LessonFactory';
import type {
  ContentSource, Lesson, NCERTContent,
} from '../../types';

// Mock dependencies
jest.mock('../EnhancedLessonEngine');
jest.mock('../TTSService');

const mockLessonEngine = enhancedLessonEngine as jest.Mocked<typeof enhancedLessonEngine>;
const mockTTSService = ttsService as jest.Mocked<typeof ttsService>;

describe('ContentManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LessonFactory.reset();
  });

  describe('syncFromSource', () => {
    it('should_sync_ncert_content_successfully', async () => {
      // Arrange
      const mockNCERTContent: NCERTContent[] = [TestDataFactory.createNCERTContent()];

      // Spy on private method fetchNCERTContent
      jest.spyOn(contentManager as any, 'fetchNCERTContent').mockResolvedValue(mockNCERTContent);

      // Mock TTS service
      mockTTSService.generateAudioBlob.mockResolvedValueOnce(new Blob(['audio data']));
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-audio-url');

      // Mock lesson engine
      mockLessonEngine.saveLesson.mockResolvedValueOnce();

      // Act
      const result = await contentManager.syncFromSource('NCERT');

      // Assert
      expect(result).toEqual({
        source: 'NCERT',
        lastSyncDate: expect.any(String),
        totalLessons: 1,
        syncedLessons: 1,
        failedSyncs: 0,
        pendingUpdates: 0,
      });

      expect(mockLessonEngine.saveLesson).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'ncert_sci_6_1',
          title: 'Food: Where Does It Come From?',
          source: 'NCERT',
        }),
      );
    });

    it('should_handle_sync_failures_gracefully', async () => {
      // Arrange
      const mockNCERTContent: NCERTContent[] = [TestDataFactory.createNCERTContent()];

      jest.spyOn(contentManager as any, 'fetchNCERTContent').mockResolvedValue(mockNCERTContent);

      // Mock lesson engine to fail
      mockLessonEngine.saveLesson.mockRejectedValueOnce(new Error('Save failed'));

      // Act
      const result = await contentManager.syncFromSource('NCERT');

      // Assert
      expect(result).toEqual({
        source: 'NCERT',
        lastSyncDate: expect.any(String),
        totalLessons: 1,
        syncedLessons: 0,
        failedSyncs: 1,
        pendingUpdates: 0,
      });
    });

    it('should_throw_error_for_unsupported_source', async () => {
      // Act & Assert
      await expect(contentManager.syncFromSource('Custom' as ContentSource))
        .rejects.toThrow('Unsupported content source: Custom');
    });

    it('should_handle_network_errors_during_fetch', async () => {
      // Arrange
      // Spy on private method to throw error
      jest.spyOn(contentManager as any, 'fetchNCERTContent').mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(contentManager.syncFromSource('NCERT'))
        .rejects.toThrow('Network error');
    });
  });

  describe('validateContent', () => {
    it('should_validate_valid_lesson_successfully', async () => {
      // Arrange
      const validLesson = LessonFactory.createMinimal();

      // Act
      const result = await contentManager.validateContent(validLesson);

      // Assert
      expect(result).toBe(true);
    });

    it('should_reject_lesson_without_required_fields', async () => {
      // Arrange
      const invalidLesson = LessonFactory.createMinimal({
        id: '',
        title: '',
        content: [],
      });

      // Act
      const result = await contentManager.validateContent(invalidLesson);

      // Assert
      expect(result).toBe(false);
    });

    it('should_reject_lesson_with_invalid_content_structure', async () => {
      // Arrange
      const invalidLesson = LessonFactory.createMinimal({
        content: [
          {
            id: '',
            type: 'text' as const,
            content: '',
          },
        ],
      });

      // Act
      const result = await contentManager.validateContent(invalidLesson);

      // Assert
      expect(result).toBe(false);
    });

    it('should_reject_lesson_with_invalid_quiz_questions', async () => {
      // Arrange
      const invalidLesson = LessonFactory.createMinimal({
        quiz: [
          {
            id: '',
            question: '',
            questionType: 'multiple_choice' as const,
            answer: '',
            explanation: '',
            difficulty: 'Beginner' as const,
            points: 1,
          },
        ],
      });

      // Act
      const result = await contentManager.validateContent(invalidLesson);

      // Assert
      expect(result).toBe(false);
    });

    it('should_handle_validation_errors_gracefully', async () => {
      // Arrange
      // const lessonWithError = LessonFactory.createMinimal();
      // Simulate validation error by making lesson null
      const nullLesson = null as unknown as Lesson;

      // Act
      const result = await contentManager.validateContent(nullLesson);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('searchContent', () => {
    beforeEach(() => {
      mockLessonEngine.getAllLessons.mockResolvedValue([
        LessonFactory.createMinimal({ title: 'Science Lesson', subject: 'Science', grade: 6 }),
        LessonFactory.createMinimal({ title: 'Math Lesson', subject: 'Mathematics', grade: 7 }),
        LessonFactory.createMinimal({ title: 'History Lesson', subject: 'History', grade: 8 }),
      ]);
    });

    it('should_search_lessons_by_text_query', async () => {
      // Act
      const results = await contentManager.searchContent('Science', {});

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Science Lesson');
    });

    it('should_filter_lessons_by_subject', async () => {
      // Act
      const results = await contentManager.searchContent('', { subject: 'Mathematics' });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].subject).toBe('Mathematics');
    });

    it('should_filter_lessons_by_grade', async () => {
      // Act
      const results = await contentManager.searchContent('', { grade: 6 });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].grade).toBe(6);
    });

    it('should_filter_lessons_by_difficulty', async () => {
      // Arrange
      mockLessonEngine.getAllLessons.mockResolvedValue([
        LessonFactory.createWithDifficulty('Beginner'),
        LessonFactory.createWithDifficulty('Intermediate'),
        LessonFactory.createWithDifficulty('Advanced'),
      ]);

      // Act
      const results = await contentManager.searchContent('', { difficulty: 'Beginner' });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].difficulty).toBe('Beginner');
    });

    it('should_filter_lessons_by_audio_availability', async () => {
      // Arrange
      mockLessonEngine.getAllLessons.mockResolvedValue([
        LessonFactory.createMinimal({ accessibility: { hasAudio: true, hasVideo: false, hasTranscript: true } }),
        LessonFactory.createMinimal({ accessibility: { hasAudio: false, hasVideo: false, hasTranscript: true } }),
      ]);

      // Act
      const results = await contentManager.searchContent('', { hasAudio: true });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].accessibility.hasAudio).toBe(true);
    });

    it('should_combine_multiple_filters', async () => {
      // Arrange
      mockLessonEngine.getAllLessons.mockResolvedValue([
        LessonFactory.createMinimal({
          title: 'Science Grade 6',
          subject: 'Science',
          grade: 6,
          difficulty: 'Beginner',
        }),
        LessonFactory.createMinimal({
          title: 'Science Grade 7',
          subject: 'Science',
          grade: 7,
          difficulty: 'Intermediate',
        }),
      ]);

      // Act
      const results = await contentManager.searchContent('Science', {
        subject: 'Science',
        grade: 6,
        difficulty: 'Beginner',
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Science Grade 6');
    });

    it('should_return_empty_array_when_no_matches', async () => {
      // Act
      const results = await contentManager.searchContent('NonExistent', {});

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe('generateAudio', () => {
    it('should_generate_audio_successfully', async () => {
      // Arrange
      const lesson = LessonFactory.createMinimal();
      const mockAudioBlob = new Blob(['audio data'], { type: 'audio/wav' });

      mockTTSService.generateAudioBlob.mockResolvedValueOnce(mockAudioBlob);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-audio-url');

      // Act
      const result = await contentManager.generateAudio(lesson);

      // Assert
      expect(result).toBe('blob:mock-audio-url');
      expect(mockTTSService.generateAudioBlob).toHaveBeenCalledWith(
        expect.stringContaining('Test lesson content'),
        expect.objectContaining({
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          lang: 'en',
        }),
      );
    });

    it('should_handle_audio_generation_failure', async () => {
      // Arrange
      const lesson = LessonFactory.createMinimal();
      mockTTSService.generateAudioBlob.mockRejectedValueOnce(new Error('TTS failed'));

      // Act & Assert
      await expect(contentManager.generateAudio(lesson))
        .rejects.toThrow('Audio generation failed');
    });
  });

  describe('updateContentMetadata', () => {
    it('should_update_lesson_metadata_successfully', async () => {
      // Arrange
      const lesson = LessonFactory.createMinimal();
      const updatedMetadata = { title: 'Updated Title', difficulty: 'Intermediate' as const };

      mockLessonEngine.getLesson.mockResolvedValueOnce(lesson);
      mockLessonEngine.saveLesson.mockResolvedValueOnce();

      // Act
      await contentManager.updateContentMetadata(lesson.id, updatedMetadata);

      // Assert
      expect(mockLessonEngine.getLesson).toHaveBeenCalledWith(lesson.id);
      expect(mockLessonEngine.saveLesson).toHaveBeenCalledWith(
        expect.objectContaining({
          ...lesson,
          ...updatedMetadata,
        }),
      );
    });

    it('should_throw_error_when_lesson_not_found', async () => {
      // Arrange
      mockLessonEngine.getLesson.mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(contentManager.updateContentMetadata('non-existent', {}))
        .rejects.toThrow('Lesson non-existent not found');
    });
  });

  describe('convertNCERTToLesson', () => {
    it('should_convert_ncert_content_to_lesson_format', async () => {
      // Arrange
      const ncertContent = TestDataFactory.createNCERTContent();
      mockTTSService.generateAudioBlob.mockResolvedValueOnce(new Blob(['audio data']));
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-audio-url');

      // Act - Access private method through any cast for testing
      const result = await (contentManager as any).convertNCERTToLesson(ncertContent);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 'ncert_sci_6_1',
          title: 'Food: Where Does It Come From?',
          language: 'en',
          subject: 'Science',
          grade: 6,
          source: 'NCERT',
          sourceUrl: 'https://ncert.nic.in/textbook/pdf/fesc101.pdf',
          accessibility: expect.objectContaining({
            hasAudio: true,
            hasVideo: false,
            hasTranscript: true,
          }),
        }),
      );
    });
  });

  describe('helper methods', () => {
    it('should_estimate_reading_time_correctly', () => {
      // Arrange
      const shortText = 'Short text';
      const longText = 'This is a much longer text that should take more time to read and understand properly.';

      // Act
      const shortTime = (contentManager as any).estimateReadingTime(shortText);
      const longTime = (contentManager as any).estimateReadingTime(longText);

      // Assert
      expect(shortTime).toBe(1); // 2 words / 200 = 0.01, rounded up to 1
      expect(longTime).toBe(1); // 20 words / 200 = 0.1, rounded up to 1
    });

    it('should_map_exercise_type_to_question_type_correctly', () => {
      // Act & Assert
      expect((contentManager as any).mapExerciseTypeToQuestionType('multiple_choice')).toBe('multiple_choice');
      expect((contentManager as any).mapExerciseTypeToQuestionType('short_answer')).toBe('short_answer');
      expect((contentManager as any).mapExerciseTypeToQuestionType('long_answer')).toBe('essay');
      expect((contentManager as any).mapExerciseTypeToQuestionType('fill_blank')).toBe('fill_blank');
      expect((contentManager as any).mapExerciseTypeToQuestionType('unknown')).toBe('multiple_choice');
    });

    it('should_calculate_points_based_on_difficulty', () => {
      // Act & Assert
      expect((contentManager as any).calculatePoints('Beginner')).toBe(1);
      expect((contentManager as any).calculatePoints('Intermediate')).toBe(2);
      expect((contentManager as any).calculatePoints('Advanced')).toBe(3);
    });

    it('should_assess_difficulty_correctly', () => {
      // Arrange
      const shortContent = 'Short content';
      const longContent = 'This is a much longer content that should be considered more difficult because it contains more information and requires more time to understand and process properly.';
      const easyQuestions = [LessonFactory.createQuizQuestion({ difficulty: 'Beginner' })];
      const hardQuestions = [LessonFactory.createQuizQuestion({ difficulty: 'Advanced' })];

      // Act
      const easyDifficulty = (contentManager as any).assessDifficulty(shortContent, easyQuestions);
      const hardDifficulty = (contentManager as any).assessDifficulty(longContent, hardQuestions);

      // Assert
      expect(easyDifficulty).toBe('Beginner');
      expect(hardDifficulty).toBe('Advanced');
    });
  });
});
