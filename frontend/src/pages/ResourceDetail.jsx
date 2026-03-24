import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import StarRatingInput from '../components/resources/StarRatingInput.jsx';

const INTENT_OPTIONS = [
  { value: 'EXAM',         label: '📝 Exam Revision',          desc: 'Prep for exams' },
  { value: 'CONCEPT',      label: '💡 Concept Clarification',   desc: 'Understand topics' },
  { value: 'ASSIGNMENT',   label: '📋 Assignment Preparation',  desc: 'Work on assignments' },
  { value: 'QUICK_REVIEW', label: '⚡ Quick Review',            desc: 'Fast reference' },
];

const TYPE_COLORS = {
  NOTES: 'text-blue-700 bg-blue-50 border-blue-200',
  SLIDES: 'text-purple-700 bg-purple-50 border-purple-200',
  PAST_PAPER: 'text-amber-700 bg-amber-50 border-amber-200',
  LINK: 'text-teal-700 bg-teal-50 border-teal-200',
  OTHER: 'text-gray-600 bg-gray-50 border-gray-200',
};

const STATUS_CONFIG = {
  APPROVED: { label: '✅ Approved',  style: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  PENDING:  { label: '⏳ Pending',   style: 'bg-amber-50  text-amber-700  border border-amber-200'  },
  REJECTED: { label: '❌ Rejected',  style: 'bg-red-50    text-red-700    border border-red-200'    },
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchResourceById, downloadResource,
    rateResource, bookmarkResource, removeBookmark, deleteResource,
  } = useResource();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [detail, setDetail]               = useState(null);
  const [loading, setLoading]             = useState(true);
  const [versionExpanded, setVersionExpanded] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedIntent, setSelectedIntent]       = useState('');
  const [ratingStars, setRatingStars]             = useState(0);
  const [ratingComment, setRatingComment]         = useState('');
  const [ratingLoading, setRatingLoading]         = useState(false);
  const [actionMsg, setActionMsg]                 = useState({ type: '', text: '' });
  const [downloading, setDownloading]             = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchResourceById(id);
      if (data) {
        setDetail(data);
        setRatingStars(data.userRating?.stars || 0);
        setRatingComment(data.userRating?.comment || '');
      } else {
        navigate('/resources');
      }
      setLoading(false);
    })();
  }, [id]);

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({ type: '', text: '' }), 4000);
  };

  const handleDownload = async () => {
    if (!user) return navigate('/login');
    setDownloading(true);
    const res = await downloadResource(id);
    if (res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
      setDetail((prev) => ({
        ...prev,
        resource: { ...prev.resource, downloadCount: res.downloadCount },
      }));
      showMsg('success', '⬇️ Download started!');
    } else {
      showMsg('error', res.message || 'Download failed');
    }
    setDownloading(false);
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    if (detail.isBookmarked) {
      const res = await removeBookmark(id);
      if (res.success) {
        setDetail((prev) => ({ ...prev, isBookmarked: false, bookmarkIntent: null }));
        showMsg('success', '🗑️ Bookmark removed!');
      }
    } else {
      setShowBookmarkModal(true);
    }
  };

  const submitBookmark = async () => {
    if (!selectedIntent) return;
    const res = await bookmarkResource(id, selectedIntent);
    if (res.success) {
      setDetail((prev) => ({ ...prev, isBookmarked: true, bookmarkIntent: selectedIntent }));
      setShowBookmarkModal(false);
      showMsg('success', res.message);
    } else {
      showMsg('error', res.message);
    }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!ratingStars) return showMsg('error', 'Please select a star rating');
    setRatingLoading(true);
    const res = await rateResource(id, ratingStars, ratingComment);
    if (res.success) {
      setDetail((prev) => ({
        ...prev,
        userRating: res.data,
        ratingStats: {
          avg: res.data.stars,
          count: (prev.ratingStats?.count || 0) + (prev.userRating ? 0 : 1),
        },
      }));
      showMsg('success', '⭐ Rating submitted!');
    } else {
      showMsg('error', res.message);
    }
    setRatingLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource? This cannot be undone.')) return;
    const res = await deleteResource(id);
    if (res.success) navigate('/resources');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { resource, versions, ratings, ratingStats, userRating, isBookmarked, bookmarkIntent } = detail;
  const isOwner = user && resource.createdBy?._id === user._id;
  const isAdmin = user?.role === 'ADMIN';
  const statusCfg = STATUS_CONFIG[resource.approvalStatus] || STATUS_CONFIG.PENDING;
  const typeCfg   = TYPE_COLORS[resource.type] || TYPE_COLORS.OTHER;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Action message toast ──────────────────────────────────────── */}
      {actionMsg.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse ${
          actionMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {actionMsg.text}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/resources" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Hub
          </Link>
          {(isOwner || isAdmin) && (
            <div className="flex items-center gap-2">
              <Link
                to={`/resources/${id}/edit`}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content column ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resource header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border ${typeCfg}`}>
                {resource.type?.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg ${statusCfg.style}`}>
                {statusCfg.label}
              </span>
              {resource.approvalStatus === 'REJECTED' && resource.rejectionReason && (
                <span className="text-xs text-red-500 italic">"{resource.rejectionReason}"</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">{resource.title}</h1>

            {resource.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{resource.description}</p>
            )}

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: '🎓', label: 'Module', value: `${resource.moduleCode} – ${resource.moduleName}` },
                { icon: '📅', label: 'Year',   value: resource.academicYear },
                { icon: '📚', label: 'Semester',value: resource.semester?.replace('_', ' ') },
                { icon: '⬇️', label: 'Downloads',value: resource.downloadCount || 0 },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{item.icon} {item.label}</div>
                  <div className="text-sm font-semibold text-gray-800 truncate">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {resource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {resource.tags.map((tag) => (
                  <span key={tag} className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Uploader info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                {resource.createdBy?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-gray-700">{resource.createdBy?.name}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="text-xs capitalize">{resource.createdBy?.role?.toLowerCase()}</span>
              </div>
              {resource.approvedBy && (
                <span className="ml-auto text-xs text-emerald-600">
                  Approved by {resource.approvedBy?.name}
                </span>
              )}
            </div>
          </div>

          {/* ── Version History ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <button
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors rounded-2xl"
              onClick={() => setVersionExpanded(!versionExpanded)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-800">Version History</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {versions.length} version{versions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${versionExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {versionExpanded && (
              <div className="px-6 pb-4 space-y-3">
                {versions.map((v) => (
                  <div
                    key={v._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      v.isLatest
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-gray-50 border-gray-100 opacity-70'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      v.isLatest ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      v{v.versionNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {v.isLatest && (
                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-semibold">
                            LATEST
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(v.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-gray-400">by {v.uploadedBy?.name}</span>
                      </div>
                      <p className="text-sm text-gray-700">{v.changeNote}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        {v.storageType === 'FILE' ? `📄 ${v.fileName || 'File'}` : `🔗 External Link`}
                        {v.fileSize && ` · ${(v.fileSize / 1024 / 1024).toFixed(2)} MB`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Ratings & Comments ──────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-gray-800">Ratings & Reviews</span>
              {ratingStats.count > 0 && (
                <span className="text-sm font-bold text-amber-600">
                  {ratingStats.avg.toFixed(1)} / 5
                </span>
              )}
              <span className="text-xs text-gray-400">({ratingStats.count} review{ratingStats.count !== 1 ? 's' : ''})</span>
            </div>

            {/* Rating form */}
            {user ? (
              <form onSubmit={handleRating} className="bg-indigo-50 rounded-xl p-4 mb-5">
                <p className="text-sm font-semibold text-indigo-900 mb-3">
                  {userRating ? 'Update your rating' : 'Leave a rating'}
                </p>
                <StarRatingInput value={ratingStars} onChange={setRatingStars} />
                <textarea
                  rows={2}
                  placeholder="Add an optional comment..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="w-full mt-3 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={ratingLoading || !ratingStars}
                  className="mt-2 btn-primary text-sm disabled:opacity-50"
                >
                  {ratingLoading ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center">
                <p className="text-sm text-gray-500">
                  <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
                  {' '}to leave a rating
                </p>
              </div>
            )}

            {/* Existing ratings list */}
            {ratings.length > 0 ? (
              <div className="space-y-3">
                {ratings.map((r) => (
                  <div key={r._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {r.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{r.userId?.name}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map((n) => (
                            <svg key={n} className={`w-3.5 h-3.5 ${n <= r.stars ? 'text-amber-400' : 'text-gray-200'}`}
                              fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No reviews yet. Be the first!
              </p>
            )}
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <button
              onClick={handleDownload}
              disabled={downloading || resource.approvalStatus !== 'APPROVED'}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {downloading ? 'Opening...' : 'Download / Open'}
            </button>

            <button
              onClick={handleBookmark}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all active:scale-95 border ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{isBookmarked ? '🔖' : '☆'}</span>
              {isBookmarked ? `Bookmarked (${bookmarkIntent?.replace('_', ' ')})` : 'Bookmark'}
            </button>

            {isOwner && (
              <Link
                to={`/resources/${id}/new-version`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-sm"
              >
                📤 Upload New Version
              </Link>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Resource Stats</h4>
            <div className="space-y-2.5">
              {[
                { icon: '⬇️', label: 'Downloads', value: resource.downloadCount || 0 },
                { icon: '⭐', label: 'Avg Rating', value: ratingStats.avg ? `${ratingStats.avg}/5` : 'No ratings' },
                { icon: '💬', label: 'Reviews',   value: ratingStats.count },
                { icon: '📋', label: 'Versions',  value: versions.length },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{s.icon} {s.label}</span>
                  <span className="font-semibold text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bookmark Modal ──────────────────────────────────────────────── */}
      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">📚 Save to Bookmarks</h3>
            <p className="text-sm text-gray-500 mb-5">
              Select your study intent for "<strong>{resource.title}</strong>"
            </p>
            <div className="space-y-2.5 mb-6">
              {INTENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedIntent === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="intent"
                    value={opt.value}
                    checked={selectedIntent === opt.value}
                    onChange={() => setSelectedIntent(opt.value)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowBookmarkModal(false); setSelectedIntent(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitBookmark}
                disabled={!selectedIntent}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Bookmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
