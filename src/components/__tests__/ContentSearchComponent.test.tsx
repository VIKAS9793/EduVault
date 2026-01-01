import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import { vi } from 'vitest';
import { ContentSearchComponent } from '../ContentSearchComponent';
import { contentManager } from '../../services/ContentManager';

// Mock dependencies
vi.mock('../../services/ContentManager', () => ({
  contentManager: {
    searchContent: vi.fn(),
  },
}));

describe('ContentSearchComponent', () => {
  const mockOnLessonSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (contentManager.searchContent as any).mockResolvedValue([]);
  });

  it('renders search input', async () => {
    render(<ContentSearchComponent onLessonSelect={mockOnLessonSelect} />);

    // Check if input exists
    const input = await screen.findByRole('textbox', { name: /search content/i });
    expect(input).toBeInTheDocument();
  });

  it('updates search query on typing', async () => {
    render(<ContentSearchComponent onLessonSelect={mockOnLessonSelect} />);

    const input = await screen.findByRole('textbox', { name: /search content/i });
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(input).toHaveValue('test query');
  });

  it('shows clear button when text is entered and clears it on click', async () => {
    render(<ContentSearchComponent onLessonSelect={mockOnLessonSelect} />);

    const input = await screen.findByRole('textbox', { name: /search content/i });
    fireEvent.change(input, { target: { value: 'test' } });

    // Clear button should be visible (looking for button with aria-label "Clear search")
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();

    // Click clear
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('focuses input when "/" key is pressed', async () => {
    render(<ContentSearchComponent onLessonSelect={mockOnLessonSelect} />);

    const input = await screen.findByRole('textbox', { name: /search content/i });

    // Press "/" key on body
    fireEvent.keyDown(document.body, { key: '/' });

    expect(input).toHaveFocus();
  });

  it('does not focus input when "/" is pressed while typing in another input', async () => {
    render(
      <div>
        <ContentSearchComponent onLessonSelect={mockOnLessonSelect} />
        <input data-testid="other-input" />
      </div>,
    );

    const otherInput = screen.getByTestId('other-input');
    const searchInput = await screen.findByRole('textbox', { name: /search content/i });

    // Focus other input and type "/"
    otherInput.focus();
    fireEvent.keyDown(otherInput, { key: '/' });

    expect(searchInput).not.toHaveFocus();
    expect(otherInput).toHaveFocus();
  });
});
