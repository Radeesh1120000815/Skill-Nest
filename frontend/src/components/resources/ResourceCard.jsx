import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  NOTES:      { label: 'Notes',      bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-100', icon: '📝' },
  SLIDES:     { label: 'Slides',     bg: 'bg-purple-50', text: 'text-purple-700',border: 'border-purple-100',icon: '📊' },
  PAST_PAPER: { label: 'Past Paper', bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-100', icon: '📄' },
  LINK:       { label: 'Link',       bg: 'bg-teal-50',   text: 'text-teal-700',  border: 'border-teal-100',  icon: '🔗' },
  OTHER:      { label: 'Other',      bg: 'bg-gray-50',   text: 'text-gray-600',  border: 'border-gray-100',  icon: '📁' },
};

const ROLE_BADGE = {
  LECTURER: { label: 'Lecturer', style: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
  STUDENT:  { label: 'Student',  style: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  ADMIN:    { label: 'Admin',    style: 'bg-red-50 text-red-600 border border-red-100' },
};

const StarRating = ({ avg, count }) => {
  const rounded = Math.round(avg);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            className={`w-3.5 h-3.5 ${n <= rounded ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className="text-xs text-gray-400">{avg.toFixed(1)} ({count})</span>
      )}
    </div>
  );
};

export default function ResourceCard({ resource }) {
  const type    = TYPE_CONFIG[resource.type] || TYPE_CONFIG.OTHER;
  const role    = ROLE_BADGE[resource.createdBy?.role] || ROLE_BADGE.STUDENT;
  const rating  = resource.ratingStats || { avg: 0, count: 0 };
  const version = resource.latestVersionId?.versionNumber;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30)  return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <Link to={`/resources/${resource._id}`} className="block h-full group">
      <article className={`h-full flex flex-col bg-white rounded-2xl border ${type.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden`}>
        {/* Top accent bar */}
        <div className={`h-1 ${type.bg.replace('50', '400')}`} />

        <div className="flex flex-col flex-1 p-5">
          {/* Type + Role badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${type.bg} ${type.text} ${type.border}`}>
              <span>{type.icon}</span> {type.label}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${role.style}`}>
              {role.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {resource.title}
          </h3>

          {/* Module info */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center text-[10px] font-mono font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {resource.moduleCode}
            </span>
            <span className="inline-flex items-center text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded">
              {resource.academicYear}
            </span>
            <span className="inline-flex items-center text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded">
              {resource.semester?.replace('_', ' ')}
            </span>
          </div>

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed flex-1">
              {resource.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <StarRating avg={rating.avg} count={rating.count} />
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              {/* Download count */}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {resource.downloadCount || 0}
              </span>
              {/* Version indicator */}
              {version && (
                <span className="font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                  v{version}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate max-w-[100px]">{resource.createdBy?.name}</span>
            <span className="mx-1">·</span>
            <span>{timeAgo(resource.createdAt)}</span>
            {resource.isBookmarked && (
              <span className="ml-auto text-indigo-500">🔖</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
