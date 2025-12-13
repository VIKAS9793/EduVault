/**
 * Production-Grade ContentManager Service Tests
 * MAANG Standards: Test behavior, not implementation
 */

import {
  vi, describe, it, expect, beforeEach,
} from 'vitest';
import { contentManager } from '../ContentManager';
import { enhancedLessonEngine } from '../EnhancedLessonEngine';
import { ttsService } from '../TTSService';
import { LessonFactory, TestDataFactory } from '../../__tests__/factories/LessonFactory';
import type { ContentSource, NCERTContent } from '../../types';

// Mock dependencies with Vitest
vi.mock('../EnhancedLessonEngine', () => ({
  enhancedLessonEngine: {
    saveLesson: vi.fn(),
    updateLesson: vi.fn(),
    getLesson: vi.fn(),
  },
}));

vi.mock('../TTSService', () => ({
  ttsService: {
    generateAudioBlob: vi.fn(),
  },
}));

describe('ContentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    LessonFactory.reset();
  });

  describe('syncFromSource', () => {
    it('should_sync_ncert_content_successfully', async () => {
      // Arrange
      const mockNCERTContent: NCERTContent[] = [TestDataFactory.createNCERTContent()];

      // Spy on the private method via simple property access if possible, OR standard function spy
      // Since it's a private method, we cast to any.
      vi.spyOn(contentManager as any, 'fetchNCERTContent').mockResolvedValue(mockNCERTContent);

      // Mock TTS service
      vi.mocked(ttsService.generateAudioBlob).mockResolvedValue(new Blob(['audio data']));

      // Mock lesson engine
      vi.mocked(enhancedLessonEngine.saveLesson).mockResolvedValue(undefined);

      // Act
      const result = await contentManager.syncFromSource('NCERT');

      // Assert
      expect(result).toMatchObject({
        source: 'NCERT',
        totalLessons: 1,
        syncedLessons: 1,
        failedSyncs: 0,
      });

      expect(enhancedLessonEngine.saveLesson).toHaveBeenCalled();
    });

    it('should_handle_sync_failures_gracefully', async () => {
      // Arrange
      const mockNCERTContent = [TestDataFactory.createNCERTContent()];
      vi.spyOn(contentManager as any, 'fetchNCERTContent').mockResolvedValue(mockNCERTContent);

      // Fail save
      vi.mocked(enhancedLessonEngine.saveLesson).mockRejectedValue(new Error('Save failed'));

      // Act
      const result = await contentManager.syncFromSource('NCERT');

      // Assert
      expect(result).toMatchObject({
        failedSyncs: 1,
        syncedLessons: 0,
      });
    });

    it('should_throw_error_for_unsupported_source', async () => {
      await expect(contentManager.syncFromSource('Custom' as ContentSource))
        .rejects.toThrow('Unsupported content source: Custom');
    });

    it('should_handle_network_errors_during_fetch', async () => {
      vi.spyOn(contentManager as any, 'fetchNCERTContent').mockRejectedValue(new Error('Network error'));

      await expect(contentManager.syncFromSource('NCERT'))
        .rejects.toThrow('Network error');
    });
  });
});
