/**
 * Production-Grade TTS Service Tests
 * MAANG Standards: Test behavior, not implementation
 */

import { ttsService } from '../TTSService';
import type { TTSOptions } from '../../types';

// Mock global objects
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(),
} as unknown as SpeechSynthesis;

const mockSpeechSynthesisUtterance = {
  onend: null as (() => void) | null,
  onerror: null as ((event: any) => void) | null,
  rate: 1,
  pitch: 1,
  volume: 1,
  lang: 'en-US',
  voice: null as SpeechSynthesisVoice | null,
};

// Mock SpeechSynthesisUtterance constructor
const MockSpeechSynthesisUtterance = jest.fn().mockImplementation(() => mockSpeechSynthesisUtterance);

describe('TTSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset global mocks
    (global as any).speechSynthesis = mockSpeechSynthesis;
    (global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

    // Reset utterance callbacks
    mockSpeechSynthesisUtterance.onend = null;
    mockSpeechSynthesisUtterance.onerror = null;
  });

  describe('speak', () => {
    it('should_speak_text_successfully', async () => {
      // Arrange
      const text = 'Hello world';
      const options: Partial<TTSOptions> = {
        rate: 0.8, pitch: 1.2, volume: 0.9, lang: 'en',
      };

      // Act
      const speakPromise = ttsService.speak(text, options);

      // Simulate successful speech completion
      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onend) {
          mockSpeechSynthesisUtterance.onend();
        }
      }, 0);

      await speakPromise;

      // Assert
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockSpeechSynthesisUtterance);
      expect(mockSpeechSynthesisUtterance.rate).toBe(0.8);
      expect(mockSpeechSynthesisUtterance.pitch).toBe(1.2);
      expect(mockSpeechSynthesisUtterance.volume).toBe(0.9);
      expect(mockSpeechSynthesisUtterance.lang).toBe('en-US');
    });

    it('should_handle_hindi_language_correctly', async () => {
      // Arrange
      const text = 'नमस्ते';
      const options: Partial<TTSOptions> = { lang: 'hi' };

      // Act
      const speakPromise = ttsService.speak(text, options);

      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onend) {
          mockSpeechSynthesisUtterance.onend();
        }
      }, 0);

      await speakPromise;

      // Assert
      expect(mockSpeechSynthesisUtterance.lang).toBe('hi-IN');
    });

    it('should_use_default_options_when_none_provided', async () => {
      // Arrange
      const text = 'Test text';

      // Act
      const speakPromise = ttsService.speak(text);

      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onend) {
          mockSpeechSynthesisUtterance.onend();
        }
      }, 0);

      await speakPromise;

      // Assert
      expect(mockSpeechSynthesisUtterance.rate).toBe(1.0);
      expect(mockSpeechSynthesisUtterance.pitch).toBe(1.0);
      expect(mockSpeechSynthesisUtterance.volume).toBe(1.0);
      expect(mockSpeechSynthesisUtterance.lang).toBe('en-US');
    });

    it('should_handle_speech_errors', async () => {
      // Arrange
      const text = 'Test text';
      const errorEvent = { error: 'synthesis-failed' };

      // Act
      const speakPromise = ttsService.speak(text);

      // Simulate speech error
      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onerror) {
          mockSpeechSynthesisUtterance.onerror(errorEvent);
        }
      }, 0);

      // Assert
      await expect(speakPromise).rejects.toThrow('TTS error: synthesis-failed');
    });

    it('should_throw_error_when_speech_synthesis_not_supported', async () => {
      // Arrange
      (global as any).speechSynthesis = null;

      // Act & Assert
      await expect(ttsService.speak('test')).rejects.toThrow('Text-to-speech not supported');
    });

    it('should_stop_previous_speech_before_starting_new', async () => {
      // Arrange
      const text1 = 'First text';
      const text2 = 'Second text';

      // Act
      const speakPromise1 = ttsService.speak(text1);
      const speakPromise2 = ttsService.speak(text2);

      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onend) {
          mockSpeechSynthesisUtterance.onend();
        }
      }, 0);

      await Promise.all([speakPromise1, speakPromise2]);

      // Assert
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should_stop_speech_synthesis', () => {
      // Act
      ttsService.stop();

      // Assert
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should_stop_audio_element_when_present', () => {
      // Arrange
      const mockAudioElement = {
        pause: jest.fn(),
        currentTime: 0,
      } as unknown as HTMLAudioElement;

      // Mock the audio element
      (ttsService as any).audioElement = mockAudioElement;

      // Act
      ttsService.stop();

      // Assert
      expect(mockAudioElement.pause).toHaveBeenCalled();
      expect(mockAudioElement.currentTime).toBe(0);
      expect((ttsService as any).audioElement).toBeNull();
    });
  });

  describe('isSupported', () => {
    it('should_return_true_when_speech_synthesis_available', () => {
      // Act
      const result = ttsService.isSupported();

      // Assert
      expect(result).toBe(true);
    });

    it('should_return_false_when_speech_synthesis_not_available', () => {
      // Arrange
      (global as any).speechSynthesis = null;

      // Act
      const result = ttsService.isSupported();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('playAudioFile', () => {
    it('should_play_audio_file_successfully', async () => {
      // Arrange
      const filePath = '/path/to/audio.mp3';
      const mockAudioElement = {
        play: jest.fn().mockResolvedValue(undefined),
        onended: null as (() => void) | null,
        onerror: null as (() => void) | null,
        error: null,
      } as unknown as HTMLAudioElement;

      // Mock Audio constructor
      const MockAudio = jest.fn().mockImplementation(() => mockAudioElement);
      (global as any).Audio = MockAudio;

      // Act
      const playPromise = ttsService.playAudioFile(filePath);

      // Simulate successful playback
      setTimeout(() => {
        if (mockAudioElement.onended) {
          mockAudioElement.onended({} as Event);
        }
      }, 0);

      await playPromise;

      // Assert
      expect(MockAudio).toHaveBeenCalledWith(filePath);
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should_handle_audio_playback_errors', async () => {
      // Arrange
      const filePath = '/path/to/audio.mp3';
      const mockAudioElement = {
        play: jest.fn().mockRejectedValue(new Error('Playback failed')),
        onended: null as (() => void) | null,
        onerror: null as (() => void) | null,
        error: null,
      } as unknown as HTMLAudioElement;

      const MockAudio = jest.fn().mockImplementation(() => mockAudioElement);
      (global as any).Audio = MockAudio;

      // Act & Assert
      await expect(ttsService.playAudioFile(filePath)).rejects.toThrow('Playback failed');
    });

    it('should_handle_audio_element_errors', async () => {
      // Arrange
      const filePath = '/path/to/audio.mp3';
      const mockAudioElement = {
        play: jest.fn().mockResolvedValue(undefined),
        onended: null as (() => void) | null,
        onerror: null as (() => void) | null,
        error: { message: 'Audio error' },
      } as unknown as HTMLAudioElement;

      const MockAudio = jest.fn().mockImplementation(() => mockAudioElement);
      (global as any).Audio = MockAudio;

      // Act
      const playPromise = ttsService.playAudioFile(filePath);

      // Simulate audio error
      setTimeout(() => {
        if (mockAudioElement.onerror) {
          mockAudioElement.onerror({} as Event);
        }
      }, 0);

      // Assert
      await expect(playPromise).rejects.toThrow('Audio playback error: Audio error');
    });
  });

  describe('generateAudioBlob', () => {
    beforeEach(() => {
      // Mock AudioContext
      const mockAudioContext = {
        createMediaStreamDestination: jest.fn(() => ({
          stream: { getTracks: jest.fn(() => []) },
        })),
      };
      (global as any).AudioContext = jest.fn(() => mockAudioContext);
      (global as any).webkitAudioContext = (global as any).AudioContext;

      // Mock MediaRecorder
      const mockMediaRecorder = {
        start: jest.fn(),
        stop: jest.fn(),
        ondataavailable: null as ((event: any) => void) | null,
        onstop: null as (() => void) | null,
      };
      (global as any).MediaRecorder = jest.fn(() => mockMediaRecorder);
    });

    it('should_generate_audio_blob_successfully', async () => {
      // Arrange
      const text = 'Test text';
      const options: Partial<TTSOptions> = { rate: 0.9, lang: 'en' };
      // const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

      // Act
      const generatePromise = ttsService.generateAudioBlob(text, options);

      // Simulate successful generation
      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onend) {
          mockSpeechSynthesisUtterance.onend();
        }
      }, 0);

      const result = await generatePromise;

      // Assert
      expect(result).toBeInstanceOf(Blob);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockSpeechSynthesisUtterance);
    });

    it('should_handle_audio_generation_errors', async () => {
      // Arrange
      const text = 'Test text';
      const errorEvent = { error: 'synthesis-failed' };

      // Act
      const generatePromise = ttsService.generateAudioBlob(text);

      // Simulate generation error
      setTimeout(() => {
        if (mockSpeechSynthesisUtterance.onerror) {
          mockSpeechSynthesisUtterance.onerror(errorEvent);
        }
      }, 0);

      // Assert
      await expect(generatePromise).rejects.toThrow('TTS error: synthesis-failed');
    });

    it('should_throw_error_when_speech_synthesis_not_supported', async () => {
      // Arrange
      (global as any).speechSynthesis = null;

      // Act & Assert
      await expect(ttsService.generateAudioBlob('test')).rejects.toThrow('Text-to-speech not supported');
    });
  });

  describe('getAvailableVoices', () => {
    it('should_return_available_voices', () => {
      // Arrange
      const mockVoices = [
        { voiceURI: 'en-US-Standard-A', name: 'English (US)', lang: 'en-US' },
        { voiceURI: 'hi-IN-Standard-A', name: 'Hindi (India)', lang: 'hi-IN' },
      ];
      (mockSpeechSynthesis.getVoices as jest.Mock).mockReturnValue(mockVoices as SpeechSynthesisVoice[]);

      // Act
      const result = ttsService.getAvailableVoices();

      // Assert
      expect(result).toEqual(mockVoices);
    });

    it('should_return_empty_array_when_speech_synthesis_not_available', () => {
      // Arrange
      (global as any).speechSynthesis = null;

      // Act
      const result = ttsService.getAvailableVoices();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getPreferredVoice', () => {
    it('should_return_preferred_voice_for_language', () => {
      // Arrange
      const mockVoices = [
        { voiceURI: 'en-US-Standard-A', name: 'English (US)', lang: 'en-US' },
        { voiceURI: 'hi-IN-Standard-A', name: 'Hindi (India)', lang: 'hi-IN' },
      ];
      (mockSpeechSynthesis.getVoices as jest.Mock).mockReturnValue(mockVoices as SpeechSynthesisVoice[]);

      // Act
      const englishVoice = ttsService.getPreferredVoice('en');
      const hindiVoice = ttsService.getPreferredVoice('hi');

      // Assert
      expect(englishVoice?.lang).toBe('en-US');
      expect(hindiVoice?.lang).toBe('hi-IN');
    });

    it('should_return_null_when_no_voice_found_for_language', () => {
      // Arrange
      const mockVoices = [
        { voiceURI: 'en-US-Standard-A', name: 'English (US)', lang: 'en-US' },
      ];
      (mockSpeechSynthesis.getVoices as jest.Mock).mockReturnValue(mockVoices as SpeechSynthesisVoice[]);

      // Act
      const result = ttsService.getPreferredVoice('hi');

      // Assert
      expect(result).toBeNull();
    });

    it('should_return_null_when_speech_synthesis_not_available', () => {
      // Arrange
      (global as any).speechSynthesis = null;

      // Act
      const result = ttsService.getPreferredVoice('en');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('speakBrandIntro', () => {
    it('should_speak_english_brand_intro', async () => {
      // Arrange
      const speakSpy = jest.spyOn(ttsService, 'speak').mockResolvedValue();

      // Act
      await ttsService.speakBrandIntro('en');

      // Assert
      expect(speakSpy).toHaveBeenCalledWith(
        'Hello, I am EduVault – Knowledge within reach, everywhere.',
        { lang: 'en' },
      );
    });

    it('should_speak_hindi_brand_intro', async () => {
      // Arrange
      const speakSpy = jest.spyOn(ttsService, 'speak').mockResolvedValue();

      // Act
      await ttsService.speakBrandIntro('hi');

      // Assert
      expect(speakSpy).toHaveBeenCalledWith(
        'नमस्ते, मैं एडुवॉल्ट हूँ – ज्ञान की पहुंच, हर कोने तक।',
        { lang: 'hi' },
      );
    });

    it('should_default_to_english_when_no_language_specified', async () => {
      // Arrange
      const speakSpy = jest.spyOn(ttsService, 'speak').mockResolvedValue();

      // Act
      await ttsService.speakBrandIntro();

      // Assert
      expect(speakSpy).toHaveBeenCalledWith(
        'Hello, I am EduVault – Knowledge within reach, everywhere.',
        { lang: 'en' },
      );
    });
  });
});
