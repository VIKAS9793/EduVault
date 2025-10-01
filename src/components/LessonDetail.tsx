/**
 * Lesson Detail Component
 * Displays lesson content with audio playback and quiz access
 */

import React, { useState, useEffect } from 'react';
import type { Lesson, QuizResult } from '../types';
import { ttsService } from '../services/TTSService';
import { useAccessibility } from '../hooks/useAccessibility';
import { QuizComponent } from './QuizComponent';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onStartQuiz?: () => void;
  quizResults?: QuizResult[];
}

export const LessonDetail: React.FC<LessonDetailProps> = ({
  lesson, onBack, onStartQuiz, quizResults = [],
}) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { hapticFeedback, announceToScreenReader } = useAccessibility();

  // Cleanup audio when component unmounts or lesson changes
  useEffect(() => () => {
    ttsService.stop();
  }, [lesson.id]);

  const handlePlayAudio = async (): Promise<void> => {
    try {
      setIsPlayingAudio(true);
      hapticFeedback();
      announceToScreenReader('Playing lesson audio');

      // Try to play pre-recorded audio first
      try {
        if (lesson.audio_file) {
          await ttsService.playAudioFile(lesson.audio_file);
        } else {
          // Fallback to TTS if audio file not available
          await ttsService.speak(lesson.text_content, { lang: lesson.language });
        }
      } catch {
        // Fallback to TTS if audio file not available
        await ttsService.speak(lesson.text_content, { lang: lesson.language });
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      announceToScreenReader('Audio playback failed');
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleReadText = async (): Promise<void> => {
    try {
      hapticFeedback();
      await ttsService.speak(lesson.text_content, { lang: lesson.language });
    } catch (error) {
      console.error('Text-to-speech failed:', error);
    }
  };

  if (showQuiz) {
    return (
      <QuizComponent
        questions={lesson.quiz}
        lessonId={lesson.id}
        onComplete={() => {
          setShowQuiz(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            ttsService.stop();
            onBack();
          }}
          className="btn-secondary flex items-center gap-2"
          aria-label="Go back to lessons"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Lesson Content Card */}
      <article className="card" aria-labelledby="lesson-title">
        <header className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 id="lesson-title" className="text-2xl font-bold text-gray-900">
                {lesson.title}
              </h1>
              <div className="flex gap-3 mt-2 text-sm text-gray-600">
                <span aria-label={`Subject: ${lesson.subject}`}>{lesson.subject}</span>
                <span aria-hidden="true">•</span>
                <span aria-label={`Grade: ${lesson.grade}`}>
                  Grade
                  {lesson.grade}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Audio Controls */}
        <div className="flex gap-3 mb-6" role="group" aria-label="Audio controls">
          <button
            type="button"
            onClick={() => {
              void handlePlayAudio();
            }}
            disabled={isPlayingAudio}
            className="btn-accent flex items-center gap-2"
            aria-label="Play lesson audio"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            {isPlayingAudio ? 'Playing...' : 'Play Audio'}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleReadText();
            }}
            className="btn-primary flex items-center gap-2"
            aria-label="Read lesson text aloud"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                clipRule="evenodd"
              />
            </svg>
            Read Aloud
          </button>
        </div>

        {/* Lesson Content */}
        <div className="prose max-w-none">
          {lesson.content && lesson.content.length > 0 ? (
            lesson.content.map((contentItem) => (
              <div key={contentItem.id} className="mb-4">
                {contentItem.type === 'text' && (
                  <p className="text-accessible-base leading-relaxed">{contentItem.content}</p>
                )}
                {contentItem.type === 'image' && contentItem.mediaUrl && (
                  <img
                    src={contentItem.mediaUrl}
                    alt={contentItem.content}
                    className="max-w-full h-auto rounded-lg my-4"
                  />
                )}
                {contentItem.type === 'audio' && contentItem.mediaUrl && (
                  <div className="my-4">
                    <audio controls className="w-full">
                      <source src={contentItem.mediaUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    {contentItem.transcript && (
                      <p className="text-sm text-gray-600 mt-2">{contentItem.transcript}</p>
                    )}
                  </div>
                )}
                {contentItem.type === 'video' && contentItem.mediaUrl && (
                  <div className="my-4">
                    <video controls className="w-full max-w-2xl">
                      <source src={contentItem.mediaUrl} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                    {contentItem.transcript && (
                      <p className="text-sm text-gray-600 mt-2">{contentItem.transcript}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-accessible-base leading-relaxed">{lesson.text_content}</p>
          )}
        </div>

        {/* Lesson Metadata */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <span className="ml-1 text-gray-600">
                {lesson.duration}
                {' '}
                minutes
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Difficulty:</span>
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                lesson.difficulty === 'Beginner' ? 'bg-green-100 text-green-800'
                  : lesson.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
              >
                {lesson.difficulty}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Source:</span>
              <span className="ml-1 text-gray-600">{lesson.source}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Version:</span>
              <span className="ml-1 text-gray-600">{lesson.version}</span>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Learning Objectives</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              {lesson.learningObjectives.map((objective, index) => (
                <li key={index} className="text-sm">{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Keywords */}
        {lesson.keywords && lesson.keywords.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {lesson.keywords.map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Quiz Section */}
      {lesson.quiz && lesson.quiz.length > 0 && (
        <div className="card bg-accent-50 border-accent-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to test your knowledge?</h2>
          <p className="text-gray-600 mb-4">
            Take the quiz with
            {' '}
            {lesson.quiz.length}
            {' '}
            question
            {lesson.quiz.length > 1 ? 's' : ''}
          </p>

          {/* Quiz Results Summary */}
          {quizResults.length > 0 && (
            <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Your Quiz Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Score:</span>
                  <span className="ml-1 text-gray-600">
                    {quizResults.filter((r) => r.isCorrect).length}
                    {' '}
                    /
                    {quizResults.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Percentage:</span>
                  <span className="ml-1 text-gray-600">
                    {Math.round((quizResults.filter((r) => r.isCorrect).length / quizResults.length) * 100)}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                hapticFeedback();
                ttsService.stop(); // Stop audio before starting quiz
                if (onStartQuiz) {
                  onStartQuiz();
                } else {
                  setShowQuiz(true);
                }
                announceToScreenReader('Starting quiz');
              }}
              className="btn-accent"
            >
              {quizResults.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </button>

            {quizResults.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  hapticFeedback();
                  setShowQuiz(true);
                  announceToScreenReader('Reviewing quiz results');
                }}
                className="btn-secondary"
              >
                Review Results
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
