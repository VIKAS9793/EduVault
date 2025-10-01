/**
 * Quiz Component
 * Interactive quiz with accessibility features and progress tracking
 */

import React, { useState, useEffect } from 'react';
import type { QuizQuestion, UserProgress } from '../types';
import { dbManager } from '../utils/IndexedDBManager';
import { useAccessibility } from '../hooks/useAccessibility';
import { ttsService } from '../services/TTSService';

interface QuizComponentProps {
  questions: QuizQuestion[];
  lessonId: string;
  onComplete: () => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  lessonId,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false),
  );
  const { hapticFeedback, announceToScreenReader, readText } = useAccessibility();

  // Cleanup audio when component unmounts
  useEffect(() => () => {
    ttsService.stop();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const quizCompleted = answeredQuestions.every((answered) => answered);

  const handleAnswerSelect = (answer: string): void => {
    if (answeredQuestions[currentQuestionIndex]) return;

    setSelectedAnswer(answer);
    setShowExplanation(true);

    const isCorrect = answer === currentQuestion.answer;
    hapticFeedback(isCorrect ? 400 : 200);

    if (isCorrect) {
      setScore(score + 1);
      announceToScreenReader('Correct!');
    } else {
      announceToScreenReader(`Incorrect. The correct answer is ${String(currentQuestion.answer)}`);
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnswered);
  };

  const handleNext = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleComplete = async (): Promise<void> => {
    const progress: UserProgress = {
      lessonId,
      completed: true,
      score: (score / questions.length) * 100,
      attempts: 1,
      lastAttemptDate: new Date().toISOString(),
      timeSpent: 0,
      quizResults: [],
      bookmarks: [],
      notes: [],
    };

    try {
      await dbManager.saveProgress(progress);
      announceToScreenReader(`Quiz complete! Your score: ${progress.score.toFixed(0)}%`);
      hapticFeedback(600);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }

    ttsService.stop(); // Stop audio before completing quiz
    onComplete();
  };

  const handleReadQuestion = (): void => {
    const optionsText = Array.isArray(currentQuestion.options) ? currentQuestion.options.join(', ') : 'No options available';
    const text = `${currentQuestion.question}. Options: ${optionsText}`;
    void readText(text);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Question
            {' '}
            {currentQuestionIndex + 1}
            {' '}
            of
            {' '}
            {questions.length}
          </span>
          <span>
            Score:
            {score}
          </span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
        >
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <article className="card">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">{currentQuestion.question}</h2>
          <button
            type="button"
            onClick={handleReadQuestion}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Read question aloud"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Answer Options */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options?.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.answer;
            const showFeedback = showExplanation && isSelected;

            let buttonClass = 'w-full p-4 text-left border-2 rounded-lg transition-all shadow-sm ';
            if (showFeedback && isCorrect) {
              buttonClass += 'border-accessible-success bg-green-50';
            } else if (showFeedback && !isCorrect) {
              buttonClass += 'border-accessible-error bg-red-50';
            } else if (isSelected) {
              buttonClass += 'border-accent-500 bg-accent-50';
            } else {
              buttonClass += 'border-gray-300 hover:border-primary-400 bg-white';
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  handleAnswerSelect(option);
                }}
                disabled={answeredQuestions[currentQuestionIndex]}
                className={buttonClass}
                role="radio"
                aria-checked={isSelected}
                aria-label={option}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showFeedback && isCorrect && (
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Correct"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {showFeedback && !isCorrect && isSelected && (
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-label="Incorrect"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-gray-800">{currentQuestion.explanation}</p>
          </div>
        )}
      </article>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => {
            ttsService.stop();
            onComplete();
          }}
          className="btn-secondary"
          aria-label="Exit quiz"
        >
          Exit Quiz
        </button>

        {!isLastQuestion && answeredQuestions[currentQuestionIndex] && (
          <button type="button" onClick={handleNext} className="btn-primary">
            Next Question
          </button>
        )}

        {isLastQuestion && quizCompleted && (
          <button
            type="button"
            onClick={() => {
              void handleComplete();
            }}
            className="btn-primary"
          >
            Complete Quiz
          </button>
        )}
      </div>
    </div>
  );
};
