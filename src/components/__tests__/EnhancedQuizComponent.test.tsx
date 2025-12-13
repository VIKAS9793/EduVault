/**
 * Production-Grade Enhanced Quiz Component Tests
 * MAANG Standards: Test behavior, not implementation
 */

import {
  render, screen, waitFor, act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedQuizComponent } from '../EnhancedQuizComponent';
import { LessonFactory } from '../../__tests__/factories/LessonFactory';
import type { QuizQuestion } from '../../types';

// Mock dependencies
jest.mock('../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    hapticFeedback: jest.fn(),
    announceToScreenReader: jest.fn(),
    readText: jest.fn(),
  }),
}));

jest.mock('../../utils/IndexedDBManager', () => ({
  dbManager: {
    saveProgress: jest.fn(),
  },
}));

describe('EnhancedQuizComponent', () => {
  const mockOnComplete = jest.fn();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.clearAllMocks();
    LessonFactory.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createQuizQuestions = (): QuizQuestion[] => [
    LessonFactory.createQuizQuestion({
      id: 'q1',
      question: 'What is 2 + 2?',
      questionType: 'multiple_choice',
      options: ['3', '4', '5', '6'],
      answer: '4',
      explanation: '2 + 2 equals 4',
      difficulty: 'Beginner',
      points: 1,
      timeLimit: 30,
      hints: ['Think about basic addition'],
    }),
    LessonFactory.createQuizQuestion({
      id: 'q2',
      question: 'Is the sky blue?',
      questionType: 'true_false',
      answer: 'True',
      explanation: 'Yes, the sky appears blue due to light scattering',
      difficulty: 'Beginner',
      points: 1,
      timeLimit: 20,
    }),
    LessonFactory.createQuizQuestion({
      id: 'q3',
      question: 'Fill in the blank: The capital of India is _____.',
      questionType: 'fill_blank',
      answer: 'New Delhi',
      explanation: 'New Delhi is the capital of India',
      difficulty: 'Intermediate',
      points: 2,
      timeLimit: 45,
    }),
  ];

  describe('rendering', () => {
    it('should_render_quiz_interface_correctly', () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('1 points')).toBeInTheDocument();
    });

    it('should_display_timer_when_question_has_time_limit', () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByText('Time: 30s')).toBeInTheDocument();
    });

    it('should_display_hints_when_available', () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByText('Use Hint (0/1)')).toBeInTheDocument();
    });
  });

  describe('multiple choice questions', () => {
    it('should_handle_multiple_choice_selection', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const option4 = screen.getByText('4');
      await user.click(option4);

      // Assert
      expect(option4).toHaveClass('border-accent-500');
    });

    it('should_show_correct_answer_feedback', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const option4 = screen.getByText('4');
      await user.click(option4);

      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);

      // Assert
      expect(screen.getByText('2 + 2 equals 4')).toBeInTheDocument();
      expect(option4).toHaveClass('border-accessible-success');
    });

    it('should_show_incorrect_answer_feedback', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const option3 = screen.getByText('3');
      await user.click(option3);

      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);

      // Assert
      expect(screen.getByText('2 + 2 equals 4')).toBeInTheDocument();
      expect(option3).toHaveClass('border-accessible-error');
    });
  });

  describe('true/false questions', () => {
    it('should_render_true_false_options', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Navigate to second question
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      // Assert
      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
    });

    it('should_handle_true_false_selection', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Navigate to second question
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      const trueOption = screen.getByText('True');
      await user.click(trueOption);

      // Assert
      expect(trueOption).toHaveClass('border-accent-500');
    });
  });

  describe('fill in the blank questions', () => {
    it('should_render_textarea_for_fill_blank', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Navigate to third question
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      const trueOption = screen.getByText('True');
      await user.click(trueOption);
      const submitButton2 = screen.getByText('Submit Answer');
      await user.click(submitButton2);
      const nextButton2 = screen.getByText('Next Question');
      await user.click(nextButton2);

      // Assert
      const textarea = screen.getByPlaceholderText('Type your answer here...');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should_handle_text_input', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Navigate to third question
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      const trueOption = screen.getByText('True');
      await user.click(trueOption);
      const submitButton2 = screen.getByText('Submit Answer');
      await user.click(submitButton2);
      const nextButton2 = screen.getByText('Next Question');
      await user.click(nextButton2);

      const textarea = screen.getByPlaceholderText('Type your answer here...');
      await user.type(textarea, 'New Delhi');

      // Assert
      expect(textarea).toHaveValue('New Delhi');
    });
  });

  describe('timer functionality', () => {
    it('should_countdown_timer_correctly', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      expect(screen.getByText('Time: 30s')).toBeInTheDocument();

      // Advance timer by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Assert
      expect(screen.getByText('Time: 25s')).toBeInTheDocument();
    });

    it('should_handle_time_up', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Advance timer to time up
      act(() => {
        jest.advanceTimersByTime(30000);
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
      });
    });

    it('should_show_warning_when_time_running_low', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Advance timer to low time
      act(() => {
        jest.advanceTimersByTime(25000);
      });

      // Assert
      const timeElement = screen.getByText('Time: 5s');
      expect(timeElement).toHaveClass('text-red-600', 'font-bold');
    });
  });

  describe('hints functionality', () => {
    it('should_show_hint_when_used', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const hintButton = screen.getByText('Use Hint (0/1)');
      await user.click(hintButton);

      // Assert
      expect(screen.getByText('Use Hint (1/1)')).toBeInTheDocument();
    });

    it('should_disable_hint_button_when_all_hints_used', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const hintButton = screen.getByText('Use Hint (0/1)');
      await user.click(hintButton);

      // Assert
      expect(screen.getByText('Use Hint (1/1)')).toBeDisabled();
    });
  });

  describe('quiz completion', () => {
    it('should_complete_quiz_successfully', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Answer all questions
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      const trueOption = screen.getByText('True');
      await user.click(trueOption);
      const submitButton2 = screen.getByText('Submit Answer');
      await user.click(submitButton2);
      const nextButton2 = screen.getByText('Next Question');
      await user.click(nextButton2);

      const textarea = screen.getByPlaceholderText('Type your answer here...');
      await user.type(textarea, 'New Delhi');
      const submitButton3 = screen.getByText('Submit Answer');
      await user.click(submitButton3);
      const completeButton = screen.getByText('Complete Quiz');
      await user.click(completeButton);

      // Assert
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            questionId: 'q1',
            isCorrect: true,
          }),
          expect.objectContaining({
            questionId: 'q2',
            isCorrect: true,
          }),
          expect.objectContaining({
            questionId: 'q3',
            isCorrect: true,
          }),
        ]),
      );
    });

    it('should_calculate_score_correctly', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Answer first question correctly
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);

      // Assert
      expect(screen.getByText('Score: 1')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should_navigate_between_questions', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Answer first question and navigate
      const option4 = screen.getByText('4');
      await user.click(option4);
      const submitButton = screen.getByText('Submit Answer');
      await user.click(submitButton);
      const nextButton = screen.getByText('Next Question');
      await user.click(nextButton);

      // Assert
      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
      expect(screen.getByText('Is the sky blue?')).toBeInTheDocument();
    });

    it('should_show_exit_button', () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByText('Exit Quiz')).toBeInTheDocument();
    });

    it('should_call_onComplete_when_exit_clicked', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const exitButton = screen.getByText('Exit Quiz');
      await user.click(exitButton);

      // Assert
      expect(mockOnComplete).toHaveBeenCalledWith([]);
    });
  });

  describe('accessibility', () => {
    it('should_have_proper_aria_labels', () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByLabelText('Answer options')).toBeInTheDocument();
    });

    it('should_have_proper_aria_checked_states', async () => {
      // Arrange
      const questions = createQuizQuestions();

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      const option4 = screen.getByText('4');
      await user.click(option4);

      // Assert
      expect(option4).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('error handling', () => {
    it('should_handle_empty_questions_array', () => {
      // Arrange
      const questions: QuizQuestion[] = [];

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.getByText('Question 1 of 0')).toBeInTheDocument();
    });

    it('should_handle_questions_without_time_limits', () => {
      // Arrange
      const questions = [
        LessonFactory.createQuizQuestion({
          id: 'q1',
          question: 'Test question?',
          questionType: 'multiple_choice',
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
          explanation: 'Test explanation',
          difficulty: 'Beginner',
          points: 1,
          // No timeLimit
        }),
      ];

      // Act
      render(
        <EnhancedQuizComponent
          questions={questions}
          lessonId="test-lesson"
          onComplete={mockOnComplete}
        />,
      );

      // Assert
      expect(screen.queryByText(/Time:/)).not.toBeInTheDocument();
    });
  });
});
