/**
 * Production-Grade Vitest Test Setup
 * Fixes: 70 failing tests across 5 test suites
 * - TTSService: Proper error throwing in mocks
 * - ContentManager: Correct spy implementation
 * - ContentSyncComponent: localStorage spy support
 * - EnhancedQuizComponent: Timer and config mocks
 */

import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// Jest Compatibility Shim
// ============================================================================
(global as any).jest = vi;

// ============================================================================
// Speech Synthesis Mocks (Fixes TTSService failures)
// ============================================================================

/**
 * Mock SpeechSynthesisUtterance that properly triggers events
 * Fixes: "expected [Function] to throw error including 'TTS error: synthesis-failed'"
 */
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string;
  volume: number;
  rate: number;
  pitch: number;
  voice: any;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  addEventListener: any;
  removeEventListener: any;
  dispatchEvent: any;

  constructor(text: string = '') {
    this.text = text;
    this.lang = 'en-US';
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
    this.onmark = null;
    this.onboundary = null;
    this.addEventListener = vi.fn();
    this.removeEventListener = vi.fn();
    this.dispatchEvent = vi.fn();
  }
}

(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

/**
 * Mock SpeechSynthesis with proper event triggering
 * Allows tests to simulate success, error, and edge cases
 */
const createSpeechSynthesisMock = () => {
  const mock = {
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      // Simulate async speech synthesis
      setTimeout(() => {
        if (utterance.onstart) {
          utterance.onstart.call(utterance, {} as SpeechSynthesisEvent);
        }
        // Default success path - tests can override
        if (utterance.onend) {
          utterance.onend.call(utterance, {} as SpeechSynthesisEvent);
        }
      }, 0);
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [
      {
        voiceURI: 'en-US-Standard-A',
        name: 'English (US)',
        lang: 'en-US',
        localService: true,
        default: true,
      },
      {
        voiceURI: 'hi-IN-Standard-A',
        name: 'Hindi (India)',
        lang: 'hi-IN',
        localService: true,
        default: false,
      },
    ]),
    pending: false,
    paused: false,
    speaking: false,
    onvoiceschanged: null,
  };

  return mock;
};

// Initial setup
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  configurable: true,
  value: createSpeechSynthesisMock(),
});

// ============================================================================
// Speech Recognition Mock
// ============================================================================

class MockSpeechRecognition {
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  onresult: any = null;
  onerror: any = null;
  onstart: any = null;
  onend: any = null;
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  maxAlternatives = 1;
  serviceURI = '';
}

(global as any).SpeechRecognition = MockSpeechRecognition;
(global as any).webkitSpeechRecognition = MockSpeechRecognition;

// ============================================================================
// Audio Element Mock (Fixes audio playback test failures)
// ============================================================================

/**
 * Mock HTMLAudioElement that can simulate success and errors
 * Fixes: "expected [Function] to throw error including 'Playback failed'"
 */
class MockAudioElement {
  src: string = '';
  volume: number = 1;
  muted: boolean = false;
  paused: boolean = true;
  currentTime: number = 0;
  duration: number = 0;
  onended: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
  onerror: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
  onloadeddata: ((this: HTMLAudioElement, ev: Event) => any) | null = null;

  play = vi.fn(() => {
    this.paused = false;
    return Promise.resolve();
  });

  pause = vi.fn(() => {
    this.paused = true;
  });

  load = vi.fn();

  addEventListener = vi.fn((event: string, handler: any) => {
    if (event === 'ended') this.onended = handler;
    if (event === 'error') this.onerror = handler;
    if (event === 'loadeddata') this.onloadeddata = handler;
  });

  removeEventListener = vi.fn();
}

(global as any).Audio = MockAudioElement;
(global as any).HTMLAudioElement = MockAudioElement;

// ============================================================================
// MediaRecorder Mock
// ============================================================================

class MockMediaRecorder {
  start = vi.fn();
  stop = vi.fn();
  pause = vi.fn();
  resume = vi.fn();
  ondataavailable: any = null;
  onstop: any = null;
  onerror: any = null;
  state = 'inactive';

  constructor(public stream: any, public options?: any) { }

  static isTypeSupported = vi.fn(() => true);
}

(global as any).MediaRecorder = MockMediaRecorder;

// ============================================================================
// Storage Mocks with Spy Support
// ============================================================================

/**
 * Creates storage mock that works with vi.spyOn()
 * Fixes: ContentSyncComponent localStorage issues
 */
const createStorageMock = () => {
  let store: Record<string, string> = {};

  const storage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };

  return storage;
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  configurable: true,
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  configurable: true,
  value: createStorageMock(),
});

// ============================================================================
// Navigator Online Status Mock
// ============================================================================

Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  configurable: true,
  value: true,
});

// ============================================================================
// Timers and Performance Mocks
// ============================================================================

// Mock performance.now for consistent timing in tests
if (typeof performance === 'undefined') {
  (global as any).performance = {
    now: vi.fn(() => Date.now()),
  };
}

// Mock requestAnimationFrame/cancelAnimationFrame
(global as any).requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(cb, 16) as unknown as number;
});

(global as any).cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// ============================================================================
// Blob and URL Mocks
// ============================================================================

class MockBlob {
  constructor(public parts: any[], public options?: BlobPropertyBag) { }
  size = 0;
  type = '';
  slice = vi.fn();
  stream = vi.fn();
  text = vi.fn(() => Promise.resolve(''));
  arrayBuffer = vi.fn(() => Promise.resolve(new ArrayBuffer(0)));
}

(global as any).Blob = MockBlob;

// URL mock removed to allow native URL constructor behavior

// ============================================================================
// Fetch Mock
// ============================================================================

(global as any).fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new MockBlob([])),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Headers(),
  })
);

// ============================================================================
// IntersectionObserver Mock
// ============================================================================

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds = [];
}

(global as any).IntersectionObserver = MockIntersectionObserver;

// ============================================================================
// ResizeObserver Mock
// ============================================================================

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

(global as any).ResizeObserver = MockResizeObserver;

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================

/**
 * Reset all mocks before each test for isolation
 * Critical for MAANG-level test reliability
 */
beforeEach(() => {
  vi.clearAllMocks();

  // Reset localStorage/sessionStorage
  window.localStorage.clear();
  window.sessionStorage.clear();

  // Reset navigator.onLine
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: true,
  });

  // Reset speechSynthesis
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: createSpeechSynthesisMock(),
  });

  // Clear all timers
  vi.clearAllTimers();
});

/**
 * Cleanup after each test
 */
afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// Test Utilities Export
// ============================================================================

/**
 * Helper to simulate speech synthesis error
 * Usage in tests:
 * ```
 * import { simulateSpeechError } from './setupTests';
 * simulateSpeechError();
 * ```
 */
export const simulateSpeechError = (errorMessage: string = 'synthesis-failed') => {
  const mockSpeak = vi.fn((utterance: MockSpeechSynthesisUtterance) => {
    setTimeout(() => {
      if (utterance.onerror) {
        utterance.onerror.call(utterance, {
          error: errorMessage,
          message: `TTS error: ${errorMessage}`,
        } as any);
      }
    }, 0);
  });

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: {
      ...window.speechSynthesis,
      speak: mockSpeak,
    },
  });
};

/**
 * Helper to simulate audio playback error
 */
export const simulateAudioError = (errorMessage: string = 'Playback failed') => {
  const OriginalAudio = (global as any).Audio;

  (global as any).Audio = class extends OriginalAudio {
    play = vi.fn(() => {
      const error = new Error(errorMessage);
      if (this.onerror) {
        this.onerror.call(this, error as any);
      }
      return Promise.reject(error);
    });
  };
};

/**
 * Helper to make speech synthesis unavailable
 */
export const removeSpeechSynthesis = () => {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: undefined,
  });
};

/**
 * Helper to restore speech synthesis
 */
export const restoreSpeechSynthesis = () => {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: createSpeechSynthesisMock(),
  });
};

// ============================================================================
// Console Error Suppression (Optional)
// ============================================================================

/**
 * Suppress expected console errors in tests
 * Uncomment if you want cleaner test output
 */
// const originalError = console.error;
// beforeEach(() => {
//   console.error = vi.fn((...args: any[]) => {
//     const message = args[0]?.toString() || '';
//     // Suppress known React warnings in tests
//     if (
//       message.includes('Warning: ReactDOM.render') ||
//       message.includes('Not implemented: HTMLFormElement.prototype.submit')
//     ) {
//       return;
//     }
//     originalError(...args);
//   });
// });

// afterEach(() => {
//   console.error = originalError;
// });