import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';

const INTENT_CONFIG = {
  EXAM:         { label: 'Exam Revision',         icon: '📝', cls: 'bg-red-50    text-red-700    border-red-200',    active: 'bg-red-600    text-white border-red-600' },
  CONCEPT:      { label: 'Concept Clarification',  icon: '💡', cls: 'bg-blue-50   text-blue-700   border-blue-200',   active: 'bg-blue-600   text-white border-blue-600' },
  ASSIGNMENT:   { label: 'Assignment Prep',         icon: '📋', cls: 'bg-purple-50 text-purple-700 border-purple-200', active: 'bg-purple-600 text-white border-purple-600' },
  QUICK_REVIEW: { label: 'Quick Review',            icon: '⚡', cls: 'bg-amber-50  text-amber-700  border-amber-200',  active: 'bg-amber-500  text-white border-amber-500' },
};

const TYPE_ICONS = { NOTES: '📝', SLIDES: '📊', PAST_PAPER: '📄', LINK: '🔗', OTHER: '📁' };

export default function MyBookmarks() {
  const { myBookmarks, fetchMyBookmarks, removeBookmark, loading } = useResource();
  const [activeIntent, setActiveIntent] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => { fetchMyBookmarks(activeIntent); }, [activeIntent]);

  const handleRemove = async (resourceId, title) => {
    if (!window.confirm(`Remove "${title}" from bookmarks?`)) return;
    setRemoving(resourceId);
    await removeBookmark(resourceId);
    setRemoving(null);
  };

  // Group summary counts from full list
  const counts = Object.keys(INTENT_CONFIG).reduce((acc, key) => {
    acc[key] = myBookmarks.filter((b) => b.intent === key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">🔖 My Bookmarks</h1>
          <p className="text-gray-500 text-sm">Your personal study resource collection, organised by intent.</p>

          {/* Intent filter tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setActiveIntent('')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                activeIntent === ''
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              📚 All
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeIntent === '' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {myBookmarks.length}
              </span>
            </button>

            {Object.entries(INTENT_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setActiveIntent(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  activeIntent === key ? cfg.active : `${cfg.cls} border-current hover:opacity-80`
                }`}
              >
                {cfg.icon} {cfg.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeIntent === key ? 'bg-white/20' : 'bg-current/10'
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : myBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔖</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {activeIntent ? `No ${INTENT_CONFIG[activeIntent]?.label} bookmarks` : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              {activeIntent
                ? 'Try a different study intent filter.'
                : 'Browse resources and bookmark them with a study intent to organise your learning.'}
            </p>
            <Link to="/resources" className="btn-primary text-sm">
              Browse Resources
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-semibold text-gray-700">{myBookmarks.length}</span> bookmark{myBookmarks.length !== 1 ? 's' : ''}
              {activeIntent && ` · ${INTENT_CONFIG[activeIntent]?.label}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBookmarks.map((bookmark) => {
                const r = bookmark.resourceId;
                if (!r) return null;
                const intent = INTENT_CONFIG[bookmark.intent];
                return (
                  <div
                    key={bookmark._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                  >
                    {/* Intent stripe */}
                    <div className={`px-4 py-2 flex items-center gap-1.5 text-xs font-semibold border-b ${intent?.cls}`}>
                      {intent?.icon} {intent?.label}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xl flex-shrink-0">{TYPE_ICONS[r.type] || '📁'}</span>
                        <Link
                          to={`/resources/${r._id}`}
                          className="font-bold text-gray-900 hover:text-indigo-600 text-sm leading-snug line-clamp-2 transition-colors"
                        >
                          {r.title}
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {r.moduleCode}
                        </span>
                        <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded">
                          {r.academicYear}
                        </span>
                        <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded">
                          {r.semester?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{r.createdBy?.name}</span>
                        <span className="mx-1">·</span>
                        <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <Link
                        to={`/resources/${r._id}`}
                        className="flex-1 text-center text-xs font-semibold py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => handleRemove(r._id, r.title)}
                        disabled={removing === r._id}
                        className="text-xs px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-semibold disabled:opacity-50"
                      >
                        {removing === r._id ? '...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
