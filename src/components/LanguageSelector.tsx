/**
 * Language Selector Component
 * Allows users to switch between supported languages
 */

import React from 'react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => (
  <div className="flex items-center gap-2" role="group" aria-label="Language selection">
    <label htmlFor="language-select" className="font-semibold text-gray-700">
      भाषा / Language:
    </label>
    <select
      id="language-select"
      value={currentLanguage}
      onChange={(e) => {
        onLanguageChange(e.target.value as Language);
      }}
      className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white font-medium shadow-sm"
      aria-label="Select language"
    >
      <option value="en">🇮🇳 English</option>
      <option value="hi">🇮🇳 हिंदी</option>
    </select>
  </div>
);
