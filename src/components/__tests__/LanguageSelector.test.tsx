/**
 * Language Selector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSelector } from '../LanguageSelector';

describe('LanguageSelector', () => {
  it('renders with current language', () => {
    const mockOnChange = jest.fn();
    render(<LanguageSelector currentLanguage="en" onLanguageChange={mockOnChange} />);

    const select = screen.getByLabelText('Select language');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('en');
  });

  it('calls onLanguageChange when selection changes', () => {
    const mockOnChange = jest.fn();
    render(<LanguageSelector currentLanguage="en" onLanguageChange={mockOnChange} />);

    const select = screen.getByLabelText('Select language');
    fireEvent.change(select, { target: { value: 'hi' } });

    expect(mockOnChange).toHaveBeenCalledWith('hi');
  });

  it('displays both language options', () => {
    const mockOnChange = jest.fn();
    render(<LanguageSelector currentLanguage="en" onLanguageChange={mockOnChange} />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('हिंदी (Hindi)')).toBeInTheDocument();
  });
});
