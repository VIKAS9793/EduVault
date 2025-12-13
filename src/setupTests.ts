/**
 * Production-Grade Vitest Test Setup
 * MAANG Standards: Deterministic, isolated, fast tests
 */

import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Jest compatibility shim for existing test files
(global as any).jest = vi;

// Mock SpeechSynthesisUtterance
(global as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
  text,
  lang: 'en-US',
  volume: 1,
  rate: 1,
  pitch: 1,
  voice: null,
  onstart: null,
  onend: null,
  onerror: null,
}));

// Mock Web Speech API with comprehensive interface
(global as any).SpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
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
const speechSynthesisMock = {
  speak: vi.fn(),
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
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
} as unknown as SpeechSynthesis;

Object.defineProperty(global, 'speechSynthesis', {
  value: speechSynthesisMock,
  writable: true,
});

// Mock AudioContext for TTS audio generation
(global as any).AudioContext = vi.fn().mockImplementation(() => ({
  createMediaStreamDestination: vi.fn(() => ({
    stream: {
      getTracks: vi.fn(() => []),
    },
  })),
  close: vi.fn(),
  suspend: vi.fn(),
  resume: vi.fn(),
  state: 'running',
}));

(global as any).webkitAudioContext = (global as any).AudioContext;

// Mock MediaRecorder for audio blob generation
(global as any).MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
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
  value: vi.fn(),
});

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock URL.createObjectURL for audio blob handling
global.URL.createObjectURL = vi.fn(() => 'blob:mock-audio-url');
global.URL.revokeObjectURL = vi.fn();

// Mock localStorage for deterministic testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});
