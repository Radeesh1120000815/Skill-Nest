import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';

const STATUS_CONFIG = {
  APPROVED: { label: '✅ Approved',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING:  { label: '⏳ Pending',   cls: 'bg-amber-50  text-amber-700  border-amber-200' },
  REJECTED: { label: '❌ Rejected',  cls: 'bg-red-50    text-red-700    border-red-200' },
};

const TYPE_ICONS = {
  NOTES: '📝', SLIDES: '📊', PAST_PAPER: '📄', LINK: '🔗', OTHER: '📁',
};

export default function MyUploads() {
  const { myUploads, fetchMyUploads, deleteResource, loading } = useResource();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchMyUploads(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await deleteResource(id);
    if (!res.success) alert(res.message);
    setDeleting(null);
  };

  const filtered = filterStatus
    ? myUploads.filter((r) => r.approvalStatus === filterStatus)
    : myUploads;

  const counts = {
    APPROVED: myUploads.filter((r) => r.approvalStatus === 'APPROVED').length,
    PENDING:  myUploads.filter((r) => r.approvalStatus === 'PENDING').length,
    REJECTED: myUploads.filter((r) => r.approvalStatus === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
              <p className="text-gray-500 text-sm mt-0.5">Manage your contributed resources</p>
            </div>
            <Link to="/upload-resource" className="btn-primary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mt-5">
            {[
              { label: 'Total',    value: myUploads.length, cls: 'bg-gray-100 text-gray-700' },
              { label: 'Approved', value: counts.APPROVED,  cls: 'bg-emerald-50 text-emerald-700' },
              { label: 'Pending',  value: counts.PENDING,   cls: 'bg-amber-50 text-amber-700' },
              { label: 'Rejected', value: counts.REJECTED,  cls: 'bg-red-50 text-red-600' },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setFilterStatus(s.label === 'Total' ? '' : s.label.toUpperCase())}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${s.cls} ${
                  filterStatus === (s.label === 'Total' ? '' : s.label.toUpperCase())
                    ? 'ring-2 ring-indigo-400'
                    : ''
                }`}
              >
                <span className="font-bold">{s.value}</span> {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {filterStatus ? `No ${filterStatus.toLowerCase()} uploads` : 'No uploads yet'}
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              {filterStatus ? 'Try a different filter.' : 'Share your first resource with your peers!'}
            </p>
            {!filterStatus && (
              <Link to="/upload-resource" className="btn-primary text-sm">
                Upload Your First Resource
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resource) => {
              const status = STATUS_CONFIG[resource.approvalStatus] || STATUS_CONFIG.PENDING;
              return (
                <div
                  key={resource._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all"
                >
                  {/* Type icon */}
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {TYPE_ICONS[resource.type] || '📁'}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        to={`/resources/${resource._id}`}
                        className="font-bold text-gray-900 hover:text-indigo-600 transition-colors truncate"
                      >
                        {resource.title}
                      </Link>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {resource.moduleCode}
                      </span>
                      <span>{resource.academicYear}</span>
                      <span>{resource.semester?.replace('_', ' ')}</span>
                      <span>⬇️ {resource.downloadCount || 0}</span>
                      {resource.latestVersionId && (
                        <span className="font-mono text-indigo-600">v{resource.latestVersionId.versionNumber}</span>
                      )}
                    </div>
                    {resource.approvalStatus === 'REJECTED' && resource.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 italic">
                        Reason: "{resource.rejectionReason}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/resources/${resource._id}`}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all font-medium"
                    >
                      View
                    </Link>
                    <Link
                      to={`/resources/${resource._id}/new-version`}
                      className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all font-medium"
                    >
                      New Version
                    </Link>
                    <button
                      onClick={() => handleDelete(resource._id, resource.title)}
                      disabled={deleting === resource._id}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium disabled:opacity-50"
                    >
                      {deleting === resource._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
