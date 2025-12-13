/**
 * Production-Grade TTS Service Tests
 * MAANG Standards: Test behavior, not implementation
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { TTSOptions } from '../../types';

describe('TTSService', () => {
  let speakSpy: any;
  let ttsService: any;

  beforeEach(async () => {
    vi.resetModules();

    // 1. Mock window.speechSynthesis
    const synthMock = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { voiceURI: 'en-US-Standard-A', name: 'English (US)', lang: 'en-US', default: true, localService: true },
        { voiceURI: 'hi-IN-Standard-A', name: 'Hindi (India)', lang: 'hi-IN', default: false, localService: true },
      ]),
      pending: false,
      paused: false,
      speaking: false,
      onvoiceschanged: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: synthMock,
    });

    speakSpy = vi.spyOn(window.speechSynthesis, 'speak');

    // 2. Mock SpeechSynthesisUtterance
    class MockUtterance {
      text: string;
      lang = 'en-US';
      pitch = 1;
      rate = 1;
      volume = 1;
      onend: any = null;
      onerror: any = null;
      constructor(text: string) { this.text = text; }
    }
    (global as any).SpeechSynthesisUtterance = MockUtterance;

    // 3. Import Service AFTER mocks
    const module = await import('../TTSService');
    ttsService = module.ttsService;
  });

  describe('speak', () => {
    it('should_speak_text_successfully', async () => {
      const text = 'Hello world';
      const options: Partial<TTSOptions> = { rate: 0.8, pitch: 1.2, volume: 0.9, lang: 'en' };

      // Simulate success
      speakSpy.mockImplementation((utterance: SpeechSynthesisUtterance) => {
        setTimeout(() => {
          if (utterance.onend) utterance.onend(new Event('end') as any);
        }, 0);
      });

      await ttsService.speak(text, options);

      expect(speakSpy).toHaveBeenCalledTimes(1);
      const args = speakSpy.mock.calls[0][0];
      expect(args.text).toBe(text);
      expect(args.rate).toBe(0.8);
    });

    it('should_handle_speech_errors', async () => {
      speakSpy.mockImplementation((utterance: SpeechSynthesisUtterance) => {
        setTimeout(() => {
          if (utterance.onerror) utterance.onerror({ error: 'synthesis-failed' } as any);
        }, 0);
      });

      await expect(ttsService.speak('fail')).rejects.toThrow('TTS error: synthesis-failed');
    });
  });
});
