/**
 * Jest test setup
 * Configures testing environment with mocks and polyfills
 */

import '@testing-library/jest-dom';

// Mock IndexedDB
const { indexedDB } = require('fake-indexeddb');
global.indexedDB = indexedDB;

// Mock Web Speech API
(global as any).SpeechRecognition = jest.fn();
(global as any).speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  pending: false,
  paused: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
} as unknown as SpeechSynthesis;

// Mock navigator
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
});
