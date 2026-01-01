/**
 * Content Search Component
 * Advanced search and filtering for educational content
 */

import React, {
  useState, useEffect, useMemo, useRef,
} from 'react';
import type {
  Lesson, ContentFilters, Language, Subject, Grade, DifficultyLevel,
} from '../types';
import { contentManager } from '../services/ContentManager';

interface ContentSearchComponentProps {
  onLessonSelect: (lesson: Lesson) => void;
}

export const ContentSearchComponent: React.FC<ContentSearchComponentProps> = ({
  onLessonSelect,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [sortBy, setSortBy] = useState<'title' | 'grade' | 'difficulty' | 'duration'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Focus search on '/' key press if no input is currently focused
      if (
        e.key === '/'
        && !e.ctrlKey
        && !e.metaKey
        && !e.altKey
        && document.activeElement?.tagName !== 'INPUT'
        && document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load lessons on component mount
  useEffect(() => {
    const loadLessons = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const allLessons = await contentManager.searchContent('', {});
        setFilteredLessons(allLessons);
      } catch (error) {
        console.error('Failed to load lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLessons();
  }, []);

  // Filter and search lessons
  useEffect(() => {
    const searchAndFilter = async (): Promise<void> => {
      try {
        const results = await contentManager.searchContent(searchQuery, filters);
        setFilteredLessons(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    void searchAndFilter();
  }, [searchQuery, filters]);

  // Sort lessons
  const sortedLessons = useMemo(() => [...filteredLessons].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'grade':
        aValue = a.grade;
        bValue = b.grade;
        break;
      case 'difficulty': {
        const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        aValue = difficultyOrder[a.difficulty];
        bValue = difficultyOrder[b.difficulty];
        break;
      }
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  }), [filteredLessons, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof ContentFilters, value: any): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = (): void => {
    setFilters({});
    setSearchQuery('');
  };

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: Subject): string => {
    const colors: Record<Subject, string> = {
      Science: 'bg-blue-100 text-blue-800',
      Mathematics: 'bg-purple-100 text-purple-800',
      Civics: 'bg-green-100 text-green-800',
      History: 'bg-orange-100 text-orange-800',
      Geography: 'bg-teal-100 text-teal-800',
      Language: 'bg-pink-100 text-pink-800',
      Physics: 'bg-indigo-100 text-indigo-800',
      Chemistry: 'bg-cyan-100 text-cyan-800',
      Biology: 'bg-emerald-100 text-emerald-800',
      Economics: 'bg-amber-100 text-amber-800',
      'Computer Science': 'bg-violet-100 text-violet-800',
      'Environmental Studies': 'bg-lime-100 text-lime-800',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Educational Content</h2>
        <p className="text-gray-600">
          Find lessons by subject, grade, difficulty, or keywords
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons, topics, or keywords... (Press '/')"
          aria-label="Search content"
          className="w-full p-4 pl-12 pr-12 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-500"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Language Filter */}
        <select
          value={filters.language || ''}
          onChange={(e) => handleFilterChange('language', e.target.value as Language)}
          className="p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="bn">Bengali</option>
          <option value="gu">Gujarati</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
          <option value="mr">Marathi</option>
          <option value="or">Odia</option>
          <option value="pa">Punjabi</option>
          <option value="as">Assamese</option>
          <option value="ur">Urdu</option>
        </select>

        {/* Subject Filter */}
        <select
          value={filters.subject || ''}
          onChange={(e) => handleFilterChange('subject', e.target.value as Subject)}
          className="p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Subjects</option>
          <option value="Science">Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Civics">Civics</option>
          <option value="History">History</option>
          <option value="Geography">Geography</option>
          <option value="Language">Language</option>
          <option value="Economics">Economics</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Environmental Studies">Environmental Studies</option>
        </select>

        {/* Grade Filter */}
        <select
          value={filters.grade || ''}
          onChange={(e) => handleFilterChange('grade', e.target.value ? parseInt(e.target.value, 10) as Grade : undefined)}
          className="p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Grades</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
            <option key={grade} value={grade}>
              Grade
              {grade}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={filters.difficulty || ''}
          onChange={(e) => handleFilterChange('difficulty', e.target.value as DifficultyLevel)}
          className="p-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasAudio || false}
            onChange={(e) => handleFilterChange('hasAudio', e.target.checked ? true : undefined)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Has Audio</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasVideo || false}
            onChange={(e) => handleFilterChange('hasVideo', e.target.checked ? true : undefined)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Has Video</span>
        </label>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-800"
        >
          Clear All Filters
        </button>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="p-2 border border-gray-300 rounded focus:border-primary-500"
        >
          <option value="title">Title</option>
          <option value="grade">Grade</option>
          <option value="difficulty">Difficulty</option>
          <option value="duration">Duration</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {sortedLessons.length}
        {' '}
        lesson
        {sortedLessons.length !== 1 ? 's' : ''}
        {' '}
        found
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onLessonSelect(lesson)}
          >
            <div className="space-y-3">
              {/* Lesson Header */}
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-gray-900 line-clamp-2">{lesson.title}</h3>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded whitespace-nowrap">
                  Grade
                  {' '}
                  {lesson.grade}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getSubjectColor(lesson.subject)}`}>
                  {lesson.subject}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(lesson.difficulty)}`}>
                  {lesson.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                  {lesson.duration}
                  {' '}
                  min
                </span>
              </div>

              {/* Features */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {lesson.accessibility.hasAudio && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                    </svg>
                    Audio
                  </div>
                )}
                {lesson.accessibility.hasVideo && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Video
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {lesson.quiz.length}
                  {' '}
                  questions
                </div>
              </div>

              {/* Source */}
              <div className="text-xs text-gray-500">
                Source:
                {' '}
                {lesson.source}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {sortedLessons.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lessons found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
};
