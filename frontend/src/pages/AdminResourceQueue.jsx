import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';

const TYPE_ICONS = { NOTES: '📝', SLIDES: '📊', PAST_PAPER: '📄', LINK: '🔗', OTHER: '📁' };

export default function AdminResourceQueue() {
  const {
    pendingQueue, fetchPendingQueue,
    approveResource, rejectResource,
    adminStats, fetchAdminStats,
    loading,
  } = useResource();

  const [rejectModal, setRejectModal]   = useState({ open: false, id: null, title: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toastMsg, setToastMsg]         = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingQueue();
    fetchAdminStats();
  }, []);

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type: '', text: '' }), 3500);
  };

  const handleApprove = async (id, title) => {
    setProcessingId(id);
    const res = await approveResource(id);
    showToast(res.success ? 'success' : 'error', res.message);
    setProcessingId(null);
  };

  const openRejectModal = (id, title) => {
    setRejectModal({ open: true, id, title });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessingId(rejectModal.id);
    const res = await rejectResource(rejectModal.id, rejectReason.trim());
    showToast(res.success ? 'success' : 'error', res.message);
    setRejectModal({ open: false, id: null, title: '' });
    setRejectReason('');
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toastMsg.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toastMsg.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🛡️ Resource Review Queue</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Review and moderate student-uploaded resources
              </p>
            </div>
            <Link to="/resources" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View Public Hub →
            </Link>
          </div>

          {/* Stats bar */}
          {adminStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pending',   value: adminStats.pendingCount,  icon: '⏳', cls: 'bg-amber-50  text-amber-700'  },
                { label: 'Approved',  value: adminStats.approvedCount, icon: '✅', cls: 'bg-emerald-50 text-emerald-700'},
                { label: 'Rejected',  value: adminStats.rejectedCount, icon: '❌', cls: 'bg-red-50     text-red-700'   },
                { label: 'Downloads', value: adminStats.totalDownloads,icon: '⬇️', cls: 'bg-blue-50    text-blue-700'  },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl px-4 py-3 ${s.cls}`}>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs font-medium opacity-80">{s.icon} {s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Pending count badge */}
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-lg font-bold text-gray-800">Pending Review</h2>
          {pendingQueue.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {pendingQueue.length} awaiting
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : pendingQueue.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🎉
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">All clear!</h3>
            <p className="text-gray-400 text-sm">No resources pending review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingQueue.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Type icon */}
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {TYPE_ICONS[resource.type] || '📁'}
                  </div>

                  {/* Resource info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 text-base">{resource.title}</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                        ⏳ Pending
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {resource.type?.replace('_', ' ')}
                      </span>
                    </div>

                    {resource.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{resource.description}</p>
                    )}

                    {/* Meta grid */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span><strong>Module:</strong> {resource.moduleCode} – {resource.moduleName}</span>
                      <span><strong>Year:</strong> {resource.academicYear}</span>
                      <span><strong>Sem:</strong> {resource.semester?.replace('_', ' ')}</span>
                    </div>

                    {/* Uploader info */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {resource.createdBy?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span>
                        Uploaded by <strong className="text-gray-700">{resource.createdBy?.name}</strong>
                        <span className="ml-1 text-gray-400">({resource.createdBy?.email})</span>
                      </span>
                      <span className="ml-2">
                        {new Date(resource.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Preview link for file */}
                    {resource.latestVersionId?.storageType === 'FILE' && resource.latestVersionId?.fileUrl && (
                      <a
                        href={resource.latestVersionId.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:underline"
                      >
                        📄 Preview file →
                      </a>
                    )}
                    {resource.latestVersionId?.storageType === 'LINK' && resource.latestVersionId?.externalUrl && (
                      <a
                        href={resource.latestVersionId.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:underline"
                      >
                        🔗 Open link →
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(resource._id, resource.title)}
                      disabled={processingId === resource._id}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 shadow"
                    >
                      {processingId === resource._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : '✅'}
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(resource._id, resource.title)}
                      disabled={processingId === resource._id}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                      ❌ Reject
                    </button>
                    <Link
                      to={`/resources/${resource._id}`}
                      className="text-center px-5 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">❌ Reject Resource</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason for rejecting "<strong>{rejectModal.title}</strong>".
              The uploader will see this message.
            </p>
            <textarea
              rows={4}
              placeholder="e.g. Content is inaccurate. Please review Chapter 3 and resubmit..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
              maxLength={500}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ open: false, id: null, title: '' })}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
