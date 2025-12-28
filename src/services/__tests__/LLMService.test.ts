/**
 * LLM Service Tests
 * Verifies integration with WebLLM and fallback mechanisms
 */

import {
  vi, describe, it, expect, beforeEach, afterEach,
} from 'vitest';
import type { ILLMService } from '../../types';

// Mock WebLLM
const mockChatCompletionsCreate = vi.fn();
const mockCreateMLCEngine = vi.fn();

vi.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: (...args: any[]) => mockCreateMLCEngine(...args),
}));

describe('LLMService', () => {
  let llmService: ILLMService;

  beforeEach(async () => {
    vi.resetModules();
    mockChatCompletionsCreate.mockReset();
    mockCreateMLCEngine.mockReset();

    // Default mock setup
    mockCreateMLCEngine.mockResolvedValue({
      chat: {
        completions: {
          create: mockChatCompletionsCreate,
        },
      },
    });

    // Import service after mocking
    const module = await import('../LLMService');
    llmService = module.llmService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize WebLLM successfully', async () => {
      await llmService.init();

      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
      expect(llmService.isAvailable()).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      mockCreateMLCEngine.mockRejectedValue(new Error('WebGPU not supported'));

      await llmService.init();

      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
      expect(llmService.isAvailable()).toBe(false);
    });
  });

  describe('process', () => {
    it('should use WebLLM when initialized', async () => {
      // Setup successful response
      mockChatCompletionsCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'This is a generated response.',
            },
          },
        ],
        usage: {
          total_tokens: 10,
        },
      });

      await llmService.init();
      const response = await llmService.process('Hello');

      expect(mockChatCompletionsCreate).toHaveBeenCalled();
      expect(response.text).toBe('This is a generated response.');
      expect(response.confidence).toBe(0.95);
    });

    it('should use fallback when WebLLM initialization fails', async () => {
      mockCreateMLCEngine.mockRejectedValue(new Error('WebGPU not supported'));

      // This will try init, fail, and then use fallback
      const response = await llmService.process('Explain photosynthesis');

      expect(mockCreateMLCEngine).toHaveBeenCalled();
      expect(response.text).toContain('I can help explain concepts');
      expect(response.confidence).toBe(0.85);
    });

    it('should use fallback when WebLLM execution fails', async () => {
      // Init succeeds
      await llmService.init();

      // Execution fails
      mockChatCompletionsCreate.mockRejectedValue(new Error('OOM'));

      const response = await llmService.process('Explain photosynthesis');

      expect(mockChatCompletionsCreate).toHaveBeenCalled();
      // Should fall back to rule-based
      expect(response.text).toContain('I can help explain concepts');
    });

    it('should correctly format messages with context', async () => {
       mockChatCompletionsCreate.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      await llmService.init();
      await llmService.process('Question', 'Lesson Content');

      const callArgs = mockChatCompletionsCreate.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(3);
      expect(callArgs.messages[0].role).toBe('system');
      expect(callArgs.messages[1].role).toBe('user');
      expect(callArgs.messages[1].content).toContain('Context: Lesson Content');
      expect(callArgs.messages[2].role).toBe('user');
      expect(callArgs.messages[2].content).toBe('Question');
    });
  });
});
