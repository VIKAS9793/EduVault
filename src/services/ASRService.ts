/**
 * Automatic Speech Recognition Service
 * Implements offline-capable speech recognition using Web Speech API
 * Falls back gracefully when not supported
 */

import type { IASRService, VoiceRecognitionResult, Language } from '../types';

// Define types for Web Speech API since they might not be in the global scope for all environments
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// We can assume standard SpeechRecognition type definitions exist in modern TS environments or dom lib
// But if they are missing, we might need to augment the window interface or use a polyfill type.
// For this fix, we will cast `window` safely.

class ASRService implements IASRService {
  private recognition: SpeechRecognition | null = null;

  private isListening = false;

  private lastResult: VoiceRecognitionResult | null = null;

  constructor() {
    // Check for browser support
    const SpeechRecognitionAPI = window.SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognition();
    }
  }

  /**
   * Configure speech recognition instance
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const { transcript } = result[0];
      const { confidence } = result[0];

      this.lastResult = {
        transcript,
        confidence,
        isFinal: result.isFinal,
      };
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Initialize ASR with specified language
   */
  async init(lang: Language): Promise<void> {
    if (this.recognition) {
      this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    }
  }

  /**
   * Start listening for speech input
   */
  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.lastResult = null;
    this.isListening = true;

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      throw new Error(`Failed to start recognition: ${(error as Error).message}`);
    }
  }

  /**
   * Stop listening and return final result
   */
  async stopListening(): Promise<VoiceRecognitionResult | null> {
    if (!this.recognition || !this.isListening) {
      return null;
    }

    this.recognition.stop();
    this.isListening = false;

    // Wait for final result (max 1 second)
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    return this.lastResult;
  }

  /**
   * Check if ASR is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const asrService = new ASRService();
