/**
 * Enhanced Quiz Component
 * Supports multiple question types with advanced accessibility features
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion, UserProgress, QuizResult } from '../types';
import { dbManager } from '../utils/IndexedDBManager';
import { useAccessibility } from '../hooks/useAccessibility';

interface EnhancedQuizComponentProps {
  questions: QuizQuestion[];
  lessonId: string;
  onComplete: (results: QuizResult[]) => void;
}

export const EnhancedQuizComponent: React.FC<EnhancedQuizComponentProps> = ({
  questions,
  lessonId,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | string[])[]>(new Array(questions.length).fill(''));
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number[]>(new Array(questions.length).fill(0));
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [startTime] = useState<number>(Date.now());

  const { hapticFeedback, announceToScreenReader, readText } = useAccessibility();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = userAnswers[currentQuestionIndex];

  const handleComplete = useCallback(async (): Promise<void> => {
    const totalScore = quizResults.filter((result) => result.isCorrect).length;
    const totalTime = Date.now() - startTime;

    const progress: UserProgress = {
      lessonId,
      completed: true,
      score: (totalScore / questions.length) * 100,
      attempts: 1,
      lastAttemptDate: new Date().toISOString(),
      timeSpent: Math.round(totalTime / 60000), // Convert to minutes
      quizResults,
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

    onComplete(quizResults);
  }, [quizResults, startTime, lessonId, questions.length, announceToScreenReader, hapticFeedback, onComplete]);

  const handleNext = useCallback((): void => {
    if (isLastQuestion) {
      void handleComplete();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  }, [isLastQuestion, currentQuestionIndex, handleComplete]);

  const handleTimeUp = useCallback((): void => {
    announceToScreenReader('Time is up!');
    hapticFeedback(800);
    handleNext();
  }, [announceToScreenReader, hapticFeedback, handleNext]);

  const checkAnswer = (userAnswer: string | string[], correctAnswer: string | string[]): boolean => {
    if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
      return userAnswer.length === correctAnswer.length
             && userAnswer.every((answer) => correctAnswer.includes(answer));
    }
    return userAnswer === correctAnswer;
  };

  // Timer effect
  useEffect(() => {
    if (currentQuestion.timeLimit && timeRemaining === null) {
      setTimeRemaining(currentQuestion.timeLimit);
    }
  }, [currentQuestionIndex, currentQuestion.timeLimit, timeRemaining]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } if (timeRemaining === 0) {
      handleTimeUp();
    }
    return undefined;
  }, [timeRemaining, handleTimeUp]);

  const handleAnswerSelect = (answer: string | string[]): void => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmitAnswer = (): void => {
    if (!currentAnswer) return;

    const isCorrect = checkAnswer(currentAnswer, currentQuestion.answer);
    const timeSpent = currentQuestion.timeLimit ? (currentQuestion.timeLimit - (timeRemaining || 0)) : 0;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      userAnswer: currentAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      timeSpent,
      hintsUsed: hintsUsed[currentQuestionIndex],
    };

    const newResults = [...quizResults, result];
    setQuizResults(newResults);

    hapticFeedback(isCorrect ? 400 : 200);

    if (isCorrect) {
      announceToScreenReader('Correct!');
    } else {
      announceToScreenReader(`Incorrect. The correct answer is ${Array.isArray(currentQuestion.answer) ? currentQuestion.answer.join(', ') : currentQuestion.answer}`);
    }

    setShowExplanation(true);
  };

  const handleUseHint = (): void => {
    if (currentQuestion.hints && hintsUsed[currentQuestionIndex] < currentQuestion.hints.length) {
      const hintIndex = hintsUsed[currentQuestionIndex];
      const hint = currentQuestion.hints[hintIndex];
      announceToScreenReader(`Hint: ${hint}`);

      const newHintsUsed = [...hintsUsed];
      newHintsUsed[currentQuestionIndex] = hintIndex + 1;
      setHintsUsed(newHintsUsed);
    }
  };

  const handleReadQuestion = (): void => {
    let text = currentQuestion.question;
    if (currentQuestion.options) {
      text += `. Options: ${currentQuestion.options.join(', ')}`;
    }
    void readText(text);
  };

  const renderQuestionInput = (): React.ReactNode => {
    switch (currentQuestion.questionType) {
      case 'multiple_choice':
        return (
          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {currentQuestion.options?.map((option) => {
              const isSelected = currentAnswer === option;
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
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={buttonClass}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={option}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && isCorrect && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Correct">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {showFeedback && !isCorrect && isSelected && (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-label="Incorrect">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3" role="radiogroup" aria-label="True or False">
            {['True', 'False'].map((option) => {
              const isSelected = currentAnswer === option;
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
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={buttonClass}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={option}
                >
                  <span className="font-medium text-lg">{option}</span>
                </button>
              );
            })}
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <textarea
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showExplanation}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none"
              rows={3}
              placeholder="Type your answer here..."
              aria-label="Fill in the blank"
            />
          </div>
        );

      case 'short_answer':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showExplanation}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Type your answer here..."
              aria-label="Short answer"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <textarea
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              disabled={showExplanation}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-y"
              rows={6}
              placeholder="Write your essay here..."
              aria-label="Essay answer"
            />
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Question
            {currentQuestionIndex + 1}
            {' '}
            of
            {questions.length}
          </span>
          <div className="flex gap-4">
            <span>
              Score:
              {quizResults.filter((r) => r.isCorrect).length}
            </span>
            {timeRemaining !== null && (
              <span className={timeRemaining < 10 ? 'text-red-600 font-bold' : ''}>
                Time:
                {' '}
                {timeRemaining}
                s
              </span>
            )}
          </div>
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                {currentQuestion.difficulty}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                {currentQuestion.points}
                {' '}
                points
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentQuestion.question}</h2>
          </div>
          <button
            type="button"
            onClick={handleReadQuestion}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Read question aloud"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Media Content */}
        {currentQuestion.mediaUrl && (
          <div className="mb-4">
            <img
              src={currentQuestion.mediaUrl}
              alt="Question media"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Answer Input */}
        {renderQuestionInput()}

        {/* Hints */}
        {currentQuestion.hints && currentQuestion.hints.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleUseHint}
              disabled={hintsUsed[currentQuestionIndex] >= currentQuestion.hints.length}
              className="text-sm text-primary-600 hover:text-primary-800 disabled:text-gray-400"
            >
              Use Hint (
              {hintsUsed[currentQuestionIndex]}
              /
              {currentQuestion.hints.length}
              )
            </button>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="status" aria-live="polite">
            <p className="text-gray-800">{currentQuestion.explanation}</p>
          </div>
        )}
      </article>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => onComplete(quizResults)}
          className="btn-secondary"
          aria-label="Exit quiz"
        >
          Exit Quiz
        </button>

        <div className="flex gap-2">
          {!showExplanation && currentAnswer && (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="btn-primary"
            >
              Submit Answer
            </button>
          )}

          {showExplanation && !isLastQuestion && (
            <button type="button" onClick={handleNext} className="btn-primary">
              Next Question
            </button>
          )}

          {showExplanation && isLastQuestion && (
            <button
              type="button"
              onClick={() => void handleComplete()}
              className="btn-primary"
            >
              Complete Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
