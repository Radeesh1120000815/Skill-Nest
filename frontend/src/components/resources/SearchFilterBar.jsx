import { useState } from 'react';

const SEMESTERS = [
  { value: '', label: 'All Semesters' },
  { value: 'SEMESTER_1', label: 'Semester 1' },
  { value: 'SEMESTER_2', label: 'Semester 2' },
  { value: 'FULL_YEAR',  label: 'Full Year' },
];

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'NOTES',      label: '📝 Notes' },
  { value: 'SLIDES',     label: '📊 Slides' },
  { value: 'PAST_PAPER', label: '📄 Past Paper' },
  { value: 'LINK',       label: '🔗 Link' },
  { value: 'OTHER',      label: '📁 Other' },
];

const SORT_OPTIONS = [
  { value: 'newest',          label: '🕐 Newest First' },
  { value: 'most_downloaded', label: '⬇️ Most Downloaded' },
  { value: 'top_rated',       label: '⭐ Top Rated' },
];

export default function SearchFilterBar({ filters, onFilterChange, onClear, activeFilterCount }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main search row */}
      <div className="flex items-center gap-3 p-3">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, module name or keyword..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="py-2.5 pl-3 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 appearance-none cursor-pointer min-w-[160px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Toggle advanced filters */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
            isExpanded || activeFilterCount > 0
              ? 'bg-indigo-600 text-white border-indigo-600 shadow'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-white text-indigo-700 text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters  */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Module Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Module Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS301"
                value={filters.moduleCode}
                onChange={(e) => handleChange('moduleCode', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Academic Year
              </label>
              <input
                type="text"
                placeholder="e.g. 2023/2024"
                value={filters.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all appearance-none"
              >
                {SEMESTERS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Resource Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all appearance-none"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips + clear button */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.moduleCode && (
                  <FilterChip label={`Module: ${filters.moduleCode}`} onRemove={() => handleChange('moduleCode', '')} />
                )}
                {filters.academicYear && (
                  <FilterChip label={`Year: ${filters.academicYear}`} onRemove={() => handleChange('academicYear', '')} />
                )}
                {filters.semester && (
                  <FilterChip label={`Sem: ${filters.semester.replace('_', ' ')}`} onRemove={() => handleChange('semester', '')} />
                )}
                {filters.type && (
                  <FilterChip label={`Type: ${filters.type.replace('_', ' ')}`} onRemove={() => handleChange('type', '')} />
                )}
              </div>
              <button
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-indigo-900 ml-0.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

