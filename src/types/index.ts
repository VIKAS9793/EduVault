/**
 * Type definitions for EduVault platform
 * Following strict TypeScript standards with comprehensive documentation
 */

export type Language = 'hi' | 'en' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'ml' | 'mr' | 'or' | 'pa' | 'as' | 'ur';

export type Subject = 'Science' | 'Mathematics' | 'Civics' | 'History' | 'Geography' | 'Language' | 'Physics' | 'Chemistry' | 'Biology' | 'Economics' | 'Computer Science' | 'Environmental Studies';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ContentSource = 'NCERT' | 'DIKSHA' | 'ePathshala' | 'SWAYAM' | 'Custom';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';

export interface QuizQuestion {
  id: string;
  question: string;
  questionType: QuestionType;
  options?: string[];
  answer: string | string[];
  explanation: string;
  difficulty: DifficultyLevel;
  points: number;
  timeLimit?: number; // in seconds
  hints?: string[];
  mediaUrl?: string; // for image/audio questions
}

export interface LessonContent {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'interactive';
  content: string;
  mediaUrl?: string;
  duration?: number; // for audio/video
  transcript?: string; // for audio/video
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  totalDuration: number; // estimated in minutes
  prerequisites?: string[]; // chapter IDs
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  language: Language;
  subject: Subject;
  grade: Grade;
  chapterId?: string;
  order: number;
  content: LessonContent[];
  audio_file?: string;
  text_content: string;
  quiz: QuizQuestion[];
  duration: number; // estimated in minutes
  difficulty: DifficultyLevel;
  source: ContentSource;
  sourceUrl?: string;
  lastUpdated: string;
  version: string;
  tags: string[];
  learningObjectives: string[];
  prerequisites?: string[]; // lesson IDs
  keywords: string[];
  accessibility: {
    hasAudio: boolean;
    hasVideo: boolean;
    hasTranscript: boolean;
    hasSignLanguage?: boolean;
    hasBraille?: boolean;
  };
}

export interface UserProgress {
  lessonId: string;
  chapterId?: string;
  completed: boolean;
  score: number;
  attempts: number;
  lastAttemptDate: string;
  timeSpent: number; // in minutes
  quizResults: QuizResult[];
  bookmarks: string[]; // content IDs
  notes: UserNote[];
}

export interface QuizResult {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
  hintsUsed: number;
}

export interface UserNote {
  id: string;
  contentId: string;
  text: string;
  timestamp: string;
  position?: number; // for text highlighting
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

// Real Content Integration Types
export interface NCERTContent {
  id: string;
  title: string;
  class: Grade;
  subject: Subject;
  chapter: string;
  content: string;
  images?: string[];
  exercises?: NCERTExercise[];
  sourceUrl: string;
  lastUpdated: string;
}

export interface NCERTExercise {
  id: string;
  type: 'short_answer' | 'long_answer' | 'multiple_choice' | 'fill_blank';
  question: string;
  answer?: string;
  hints?: string[];
  difficulty: DifficultyLevel;
}

export interface ContentSyncStatus {
  source: ContentSource;
  lastSyncDate: string | null;
  totalLessons: number;
  syncedLessons: number;
  failedSyncs: number;
  pendingUpdates: number;
}

export interface ContentManager {
  syncFromSource(source: ContentSource): Promise<ContentSyncStatus>;
  validateContent(lesson: Lesson): Promise<boolean>;
  generateAudio(lesson: Lesson): Promise<string>;
  updateContentMetadata(lessonId: string, metadata: Partial<Lesson>): Promise<void>;
  searchContent(query: string, filters: ContentFilters): Promise<Lesson[]>;
}

export interface ContentFilters {
  language?: Language;
  subject?: Subject;
  grade?: Grade;
  difficulty?: DifficultyLevel;
  source?: ContentSource;
  tags?: string[];
  hasAudio?: boolean;
  hasVideo?: boolean;
}
