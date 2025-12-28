/**
 * Large Language Model Service
 * Interface for offline LLM integration
 * Uses WebLLM for in-browser inference with fallback to rule-based responses
 */

import { CreateMLCEngine, MLCEngineInterface } from '@mlc-ai/web-llm';
import type { ILLMService, LLMResponse } from '../types';

// Default model to use
// Using Llama-3-8B-Instruct-q4f32_1-MLC as a standard offline-capable model
const DEFAULT_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC';

class LLMService implements ILLMService {
  private engine: MLCEngineInterface | null = null;

  private initialized = false;

  private initializing = false;

  private modelId: string;

  constructor(modelId: string = DEFAULT_MODEL) {
    this.modelId = modelId;
  }

  /**
   * Initialize LLM model
   */
  async init(): Promise<void> {
    if (this.initialized || this.initializing) {
      return;
    }

    this.initializing = true;

    try {
      console.log(`Initializing WebLLM with model: ${this.modelId}`);

      this.engine = await CreateMLCEngine(this.modelId, {
        initProgressCallback: (report) => {
          console.log('LLM Init:', report.text);
        },
      });

      this.initialized = true;
      console.log('WebLLM initialized successfully');
    } catch (error) {
      console.error('LLM initialization failed:', error);
      // We keep initialized = false so fallback is used
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Process text input with LLM
   * @param text - User input text
   * @param context - Optional context for better responses
   */
  async process(text: string, context?: string): Promise<LLMResponse> {
    // Attempt initialization if not ready
    if (!this.initialized && !this.initializing) {
      await this.init();
    }

    if (this.initialized && this.engine) {
      try {
        const messages = [
          { role: 'system', content: 'You are a helpful educational assistant.' },
          ...(context ? [{ role: 'user', content: `Context: ${context}` }] : []),
          { role: 'user', content: text },
        ];

        const reply = await this.engine.chat.completions.create({
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });

        const responseText = reply.choices[0]?.message?.content || '';
        const { usage } = reply;

        return {
          text: responseText,
          confidence: 0.95, // High confidence for LLM response
          tokens: usage?.total_tokens || 0,
        };
      } catch (error) {
        console.error('LLM execution error, falling back to rule-based:', error);
      }
    }

    // Fallback implementation - educational assistance responses
    const response = this.generateEducationalResponse(text, context);

    return {
      text: response,
      confidence: 0.85,
      tokens: response.split(' ').length,
    };
  }

  /**
   * Check if LLM is available
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Generate educational assistance response
   * This is a rule-based fallback until proper LLM integration
   */
  private generateEducationalResponse(text: string, context?: string): string {
    const lowercaseText = text.toLowerCase();

    // Intent detection
    if (lowercaseText.includes('explain') || lowercaseText.includes('what is')) {
      return context
        ? `Based on the lesson, ${context.substring(0, 100)}... Would you like more details on a specific aspect?`
        : 'I can help explain concepts from your lessons. Please select a lesson first.';
    }

    if (lowercaseText.includes('quiz') || lowercaseText.includes('test')) {
      return 'Ready to test your knowledge? You can start a quiz for any completed lesson.';
    }

    if (lowercaseText.includes('help') || lowercaseText.includes('how')) {
      return 'I can help you with: understanding lessons, taking quizzes, tracking progress. What would you like to know?';
    }

    // Default response
    return 'I understand you have a question. Could you please be more specific or select a lesson for detailed help?';
  }
}

export const llmService = new LLMService();
