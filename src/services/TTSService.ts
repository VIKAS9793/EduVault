/**
 * Text-to-Speech Service
 * Implements offline TTS using Web Speech API
 * Supports audio file playback for pre-recorded lessons
 */

import type { ITTSService, TTSOptions, Language } from '../types';

class TTSService implements ITTSService {
  private synthesis: SpeechSynthesis | null = null;

  private audioElement: HTMLAudioElement | null = null;

  private readonly BRAND_INTRO_HI = 'नमस्ते, मैं एडुवॉल्ट हूँ – ज्ञान की पहुंच, हर कोने तक।';

  private readonly BRAND_INTRO_EN = 'Hello, I am EduVault – Knowledge within reach, everywhere.';

  constructor() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Speak brand introduction on first launch
   */
  async speakBrandIntro(lang: Language = 'en'): Promise<void> {
    const introText = lang === 'hi' ? this.BRAND_INTRO_HI : this.BRAND_INTRO_EN;
    await this.speak(introText, { lang });
  }

  /**
   * Speak text using browser TTS
   * @param text - Text to speak
   * @param options - TTS configuration options
   */
  async speak(text: string, options?: Partial<TTSOptions>): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Text-to-speech not supported');
    }

    // Stop any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply options
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;
    utterance.lang = options?.lang === 'hi' ? 'hi-IN' : 'en-US';

    // Get appropriate voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find((voice) => voice.lang.startsWith(utterance.lang));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        reject(new Error(`TTS error: ${event.error}`));
      };

      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }
  }

  /**
   * Check if TTS is supported
   */
  isSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Play pre-recorded audio file
   * @param filePath - Path to audio file
   */
  async playAudioFile(filePath: string): Promise<void> {
    this.stop();

    this.audioElement = new Audio(filePath);

    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      this.audioElement.onended = () => {
        this.audioElement = null;
        resolve();
      };

      this.audioElement.onerror = () => {
        const error = this.audioElement?.error;
        this.audioElement = null;
        reject(new Error(`Audio playback error: ${error?.message ?? 'Unknown error'}`));
      };

      this.audioElement.play().catch((error: Error) => {
        this.audioElement = null;
        reject(error);
      });
    });
  }

  /**
   * Generate audio blob from text using TTS
   * @param text - Text to convert to audio
   * @param options - TTS configuration options
   * @returns Audio blob
   */
  async generateAudioBlob(text: string, options?: Partial<TTSOptions>): Promise<Blob> {
    if (!this.synthesis) {
      throw new Error('Text-to-speech not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options
      utterance.rate = options?.rate ?? 1.0;
      utterance.pitch = options?.pitch ?? 1.0;
      utterance.volume = options?.volume ?? 1.0;
      utterance.lang = options?.lang === 'hi' ? 'hi-IN' : 'en-US';

      // Get appropriate voice
      const voices = this.synthesis?.getVoices() || [];
      const preferredVoice = voices.find((voice) => voice.lang.startsWith(utterance.lang));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Create audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      utterance.onend = () => {
        mediaRecorder.stop();
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        reject(new Error(`TTS error: ${event.error}`));
      };

      // Start recording and speaking
      mediaRecorder.start();
      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    });
  }

  /**
   * Get available voices for TTS
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) {
      return [];
    }
    return this.synthesis.getVoices();
  }

  /**
   * Get preferred voice for language
   */
  getPreferredVoice(language: Language): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    const langCode = language === 'hi' ? 'hi-IN' : 'en-US';
    return voices.find((voice) => voice.lang.startsWith(langCode)) || null;
  }
}

export const ttsService = new TTSService();
