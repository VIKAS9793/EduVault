/**
 * Lesson List Component
 * Displays available lessons with filtering and accessibility
 */

import React, { useEffect, useState } from 'react';
import type { Lesson, Language, Subject } from '../types';
import { enhancedLessonEngine } from '../services/EnhancedLessonEngine';
import { useAccessibility } from '../hooks/useAccessibility';
import { getTranslatedSubject, getAllSubjectsText } from '../utils/subjectTranslations';

interface LessonListProps {
  selectedLanguage: Language;
  onSelectLesson: (lesson: Lesson) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  selectedLanguage,
  onSelectLesson,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState<Subject | 'all'>('all');
  const { hapticFeedback, announceToScreenReader } = useAccessibility();

  useEffect(() => {
    const loadLessons = async (): Promise<void> => {
      try {
        setLoading(true);
        const allLessons = await enhancedLessonEngine.getLessonsByLanguage(selectedLanguage);
        setLessons(allLessons);
        announceToScreenReader(`Loaded ${allLessons.length} lessons`);
      } catch (error) {
        console.error('Failed to load lessons:', error);
        announceToScreenReader('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    void loadLessons();
  }, [selectedLanguage, announceToScreenReader]);

  const filteredLessons = filterSubject === 'all'
    ? lessons
    : lessons.filter((lesson) => lesson.subject === filterSubject);

  const subjects = Array.from(new Set(lessons.map((l) => l.subject)));

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        <span className="sr-only">Loading lessons...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by subject">
        <button
          type="button"
          onClick={() => {
            setFilterSubject('all');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
            filterSubject === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-light text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={filterSubject === 'all'}
        >
          {getAllSubjectsText(selectedLanguage)}
        </button>
        {subjects.map((subject) => (
          <button
            key={subject}
            type="button"
            onClick={() => {
              setFilterSubject(subject);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
              filterSubject === subject
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-light text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={filterSubject === subject}
          >
            {getTranslatedSubject(subject, selectedLanguage)}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Available lessons"
      >
        {filteredLessons.map((lesson) => (
          <article
            key={lesson.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              hapticFeedback();
              onSelectLesson(lesson);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                hapticFeedback();
                onSelectLesson(lesson);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Lesson: ${lesson.title}, Subject: ${getTranslatedSubject(lesson.subject, selectedLanguage)}, Grade: ${lesson.grade}`}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
              <span className="px-2 py-1 bg-accent-100 text-accent-700 text-sm rounded font-medium">
                Grade
                {' '}
                {lesson.grade}
              </span>
            </div>
            <p className="text-primary-600 mt-2 font-medium">{getTranslatedSubject(lesson.subject, selectedLanguage)}</p>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{lesson.text_content}</p>
          </article>
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center p-8 text-gray-500" role="status">
          No lessons available for selected filters.
        </div>
      )}
    </div>
  );
};
