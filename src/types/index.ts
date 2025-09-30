/**
 * Type definitions for EduVault platform
 * Following strict TypeScript standards with comprehensive documentation
 */

export type Language = 'hi' | 'en';

export type Subject = 'Science' | 'Mathematics' | 'Civics' | 'History' | 'Geography' | 'Language';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  language: Language;
  subject: Subject;
  grade: number;
  audio_file: string;
  text_content: string;
  quiz: QuizQuestion[];
}

export interface UserProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  lastAttemptDate: string;
}

export interface AppSettings {
  language: Language;
  voiceEnabled: boolean;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReaderMode: boolean;
}

export interface SyncStatus {
  lastSyncDate: string | null;
  isOnline: boolean;
  pendingUpdates: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface TTSOptions {
  rate: number;
  pitch: number;
  volume: number;
  lang: Language;
}

export interface LLMResponse {
  text: string;
  confidence: number;
  tokens: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// IndexedDB schema types
export interface DBSchema {
  lessons: {
    key: string;
    value: Lesson;
    indexes: { 'by-language': Language; 'by-subject': Subject };
  };
  progress: {
    key: string;
    value: UserProgress;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

// Service interfaces for dependency injection
export interface IASRService {
  init(lang: Language): Promise<void>;
  startListening(): Promise<void>;
  stopListening(): Promise<VoiceRecognitionResult | null>;
  isSupported(): boolean;
}

export interface ITTSService {
  speak(text: string, options?: Partial<TTSOptions>): Promise<void>;
  stop(): void;
  isSupported(): boolean;
  playAudioFile(filePath: string): Promise<void>;
}

export interface ILLMService {
  init(): Promise<void>;
  process(text: string, context?: string): Promise<LLMResponse>;
  isAvailable(): boolean;
}
