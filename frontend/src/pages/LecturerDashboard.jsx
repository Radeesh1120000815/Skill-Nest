import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = 'http://localhost:5001';

export default function LecturerDashboard() {
  const [user, setUser]               = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [actionLoading, setActionLoading] = useState(null); // bookingId being actioned
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();

  // ── Auth header helper ──────────────────────────────────────────────────
  const authCfg = useCallback((token) => ({
    headers: { Authorization: `Bearer ${token}` },
  }), []);

  // ── Fetch sessions + bookings ───────────────────────────────────────────
  const fetchData = useCallback(async (token) => {
    try {
      const [sessRes, bookRes] = await Promise.allSettled([
        axios.get(`${API}/api/sessions/my/all`,  authCfg(token)),
        axios.get(`${API}/api/bookings/lecturer`, authCfg(token)),
      ]);
      if (sessRes.status === 'fulfilled') setAllSessions(sessRes.value.data || []);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data?.data || []);
    } catch {
      // individual errors handled by allSettled
    }
  }, [authCfg]);

  useEffect(() => {
    document.title = 'Lecturer Dashboard — Skill Nest';
    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/signin', { replace: true }); return; }
    try {
      const parsed = JSON.parse(stored);
      if (!parsed || parsed.role !== 'LECTURER') {
        navigate('/signin', { replace: true }); return;
      }
      setUser(parsed);
      fetchData(parsed.token);
    } catch {
      navigate('/signin', { replace: true });
    }
  }, [navigate, fetchData]);

  // ── Approve ─────────────────────────────────────────────────────────────
  const handleApprove = async (bookingId) => {
    setActionError('');
    setActionLoading(bookingId);
    try {
      await axios.put(`${API}/api/bookings/${bookingId}/approve`, {}, authCfg(user.token));
      // Refresh bookings after action
      const res = await axios.get(`${API}/api/bookings/lecturer`, authCfg(user.token));
      setBookings(res.data?.data || []);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────
  const handleReject = async (bookingId) => {
    setActionError('');
    setActionLoading(bookingId);
    try {
      await axios.put(`${API}/api/bookings/${bookingId}/reject`, {}, authCfg(user.token));
      const res = await axios.get(`${API}/api/bookings/lecturer`, authCfg(user.token));
      setBookings(res.data?.data || []);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const now = new Date();

  const completedSessions = allSessions
    .filter((s) => {
      const startMs    = new Date(s.date).getTime();
      const durationMs = Number(s.durationMinutes || 0) * 60 * 1000;
      return startMs + durationMs < now.getTime();
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const upcoming = allSessions
    .filter((s) => new Date(s.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const pendingBookings  = bookings.filter((b) => b.status === 'pending');
  const approvedBookings = bookings.filter((b) => b.status === 'approved' && !b.isCompleted);

  const stats = {
    totalSessions:     allSessions.length,
    activeStudents:    approvedBookings.length,
    pendingRequests:   pendingBookings.length,
    completedSessions: completedSessions.length,
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const displayName = user?.name || 'Lecturer';

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, <span className="text-indigo-700">{displayName}</span>
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              Track your sessions, manage booking requests, and provide meeting links for students.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lecturer-create-session')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Create New Session
          </button>
        </header>

        {/* Stats row */}
        <section className="grid gap-4 md:grid-cols-4 mb-10">
          {[
            { label: 'Total Sessions',     value: stats.totalSessions,     icon: '📚' },
            { label: 'Active Students',    value: stats.activeStudents,    icon: '👥' },
            { label: 'Pending Requests',   value: stats.pendingRequests,   icon: '⏱️',
              extra: stats.pendingRequests > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                  {stats.pendingRequests}
                </span>
              )
            },
          ].map(({ label, value, icon, extra }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">{icon}</div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center">
                  {label}{extra}
                </p>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => navigate('/lecturer-completed-sessions')}
            className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4 text-left hover:bg-indigo-50/40 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">✅</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed Sessions</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.completedSessions}</p>
            </div>
          </button>
        </section>

        {/* Action error */}
        {actionError && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {actionError}
          </div>
        )}

        {/* Pending booking requests */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Booking Requests</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-2xl">✔️</div>
                <p className="text-base font-semibold text-slate-900 mt-2">All caught up!</p>
                <p className="text-sm text-slate-500">No pending booking requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => {
                  const s = booking.sessionId;
                  const isActioning = actionLoading === booking._id;
                  return (
                    <div
                      key={booking._id}
                      className="border border-amber-100 bg-amber-50/40 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="flex-1">
                        {/* Student info */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base font-bold text-slate-900">{booking.studentName}</span>
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">⏳ Pending</span>
                        </div>
                        <p className="text-xs text-slate-500">{booking.studentEmail}</p>
                        {booking.studentUniversityId && (
                          <p className="text-xs text-slate-500">ID: {booking.studentUniversityId}</p>
                        )}

                        {/* Session info */}
                        {s && (
                          <div className="mt-2 pt-2 border-t border-amber-100">
                            <p className="text-sm font-semibold text-indigo-700">{s.title}</p>
                            <p className="text-xs text-slate-500">{s.subject} · {formatDateTime(s.date)}</p>
                          </div>
                        )}

                        {/* Booking details */}
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                          {booking.experience && (
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold">Experience:</span> {booking.experience}
                            </p>
                          )}
                          {booking.phone && (
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold">Phone:</span> {booking.phone}
                            </p>
                          )}
                          {booking.availability && (
                            <p className="text-xs text-slate-500 md:col-span-2">
                              <span className="font-semibold">Availability:</span> {booking.availability}
                            </p>
                          )}
                          {booking.reason && (
                            <p className="text-xs text-slate-500 md:col-span-2">
                              <span className="font-semibold">Reason:</span> {booking.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 self-start md:self-center shrink-0">
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleApprove(booking._id)}
                          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isActioning ? '...' : '✅ Approve'}
                        </button>
                        <button
                          type="button"
                          disabled={isActioning}
                          onClick={() => handleReject(booking._id)}
                          className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isActioning ? '...' : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Upcoming sessions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Upcoming Sessions</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <p className="text-sm text-slate-500">You don't have any upcoming sessions scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{session.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.subject}{session.date && <> · {formatDateTime(session.date)}</>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Max students: {session.maxStudents} · Enrolled: {session.currentEnrollments || 0}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/lecturer-sessions')}
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 self-start md:self-auto"
                  >
                    View All
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
