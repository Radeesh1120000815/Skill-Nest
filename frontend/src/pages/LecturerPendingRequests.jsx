import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerPendingRequests() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [approveModal, setApproveModal] = useState({ open: false, booking: null });
  const [sessionLink, setSessionLink] = useState('');
  const navigate = useNavigate();

  const fetchPending = async (token) => {
    const backendUrl = 'http://localhost:5001';
    const { data } = await axios.get(`${backendUrl}/api/bookings/lecturer`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const bookings = data?.data || [];
    const pending = bookings
      .filter((b) => b.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setPendingBookings(pending);
  };

  useEffect(() => {
    document.title = 'Pending Booking Requests — Skill Nest';

    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/signin', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const role = String(parsed?.role || '').toUpperCase();
      if (role !== 'LECTURER') {
        navigate('/signin', { replace: true });
        return;
      }

      fetchPending(parsed.token)
        .catch(() => setError('Failed to load pending requests.'))
        .finally(() => setLoading(false));
    } catch {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  const handleAction = async (bookingId, action, payload = {}) => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) return;

    try {
      setActionLoading(bookingId);
      setError('');
      const parsed = JSON.parse(stored);
      const backendUrl = 'http://localhost:5001';

      await axios.put(
        `${backendUrl}/api/bookings/${bookingId}/${action}`,
        payload,
        { headers: { Authorization: `Bearer ${parsed.token}` } }
      );

      await fetchPending(parsed.token);
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${action} booking.`);
    } finally {
      setActionLoading('');
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const openApproveModal = (booking) => {
    setSessionLink(booking?.sessionId?.sessionLink || '');
    setApproveModal({ open: true, booking });
  };

  const closeApproveModal = () => {
    setApproveModal({ open: false, booking: null });
    setSessionLink('');
  };

  const submitApprove = async () => {
    const bookingId = approveModal?.booking?._id;
    const link = sessionLink.trim();
    if (!bookingId) return;
    if (!link) {
      setError('Please add a video link before approving.');
      return;
    }

    await handleAction(bookingId, 'approve', { sessionLink: link });
    closeApproveModal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Pending Booking Requests</h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              Review student requests and approve or reject bookings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lecturer-dashboard')}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">Loading pending requests...</p>
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">No pending booking requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{booking.studentName}</p>
                  <p className="text-xs text-slate-600 mt-1">{booking.studentEmail}</p>
                  {booking.studentUniversityId && (
                    <p className="text-xs text-slate-500 mt-1">ID: {booking.studentUniversityId}</p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm font-semibold text-indigo-700">
                      {booking.sessionId?.title || 'Session'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {booking.sessionId?.subject || 'Subject'}
                      {booking.sessionId?.date && (
                        <>
                          {' '}
                          • {formatDateTime(booking.sessionId.date)}
                        </>
                      )}
                    </p>
                    {booking.reason && (
                      <p className="text-xs text-slate-500 mt-2">Reason: {booking.reason}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    disabled={actionLoading === booking._id}
                    onClick={() => openApproveModal(booking)}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {actionLoading === booking._id ? '...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === booking._id}
                    onClick={() => handleAction(booking._id, 'reject')}
                    className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {actionLoading === booking._id ? '...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {approveModal.open && (
        <div className="fixed inset-0 z-[320] bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900">Approve Booking & Add Video Link</h3>
            <p className="text-sm text-slate-600 mt-1">
              This link will be visible to the students once you approve the bookings. Make sure to add the correct meeting URL for the session.
            </p>
            {approveModal.booking?.sessionId?.title && (
              <p className="text-xs text-indigo-700 font-semibold mt-3">
                Session: {approveModal.booking.sessionId.title}
              </p>
            )}

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Video Link</label>
              <input
                type="url"
                value={sessionLink}
                onChange={(e) => setSessionLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeApproveModal}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitApprove}
                disabled={actionLoading === approveModal?.booking?._id}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {actionLoading === approveModal?.booking?._id ? 'Saving...' : 'Approve & Save Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
