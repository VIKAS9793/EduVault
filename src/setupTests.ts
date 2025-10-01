/**
 * Production-Grade Jest Test Setup
 * MAANG Standards: Deterministic, isolated, fast tests
 */

import '@testing-library/jest-dom';

// Mock IndexedDB with fake-indexeddb for deterministic testing
const { indexedDB } = require('fake-indexeddb');

global.indexedDB = indexedDB;

// Mock Web Speech API with comprehensive interface
(global as any).SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onresult: null,
  onerror: null,
  onstart: null,
  onend: null,
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  maxAlternatives: 1,
  serviceURI: '',
}));

(global as any).webkitSpeechRecognition = (global as any).SpeechRecognition;

// Mock SpeechSynthesis with full interface
(global as any).speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => [
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
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as SpeechSynthesis;

// Mock AudioContext for TTS audio generation
(global as any).AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamDestination: jest.fn(() => ({
    stream: {
      getTracks: jest.fn(() => []),
    },
  })),
  close: jest.fn(),
  suspend: jest.fn(),
  resume: jest.fn(),
  state: 'running',
}));

(global as any).webkitAudioContext = (global as any).AudioContext;

// Mock MediaRecorder for audio blob generation
(global as any).MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
}));

// Mock navigator with deterministic behavior
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock URL.createObjectURL for audio blob handling
global.URL.createObjectURL = jest.fn(() => 'blob:mock-audio-url');
global.URL.revokeObjectURL = jest.fn();

// Mock localStorage for deterministic testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Freeze time for deterministic tests
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
    }
  }
}
