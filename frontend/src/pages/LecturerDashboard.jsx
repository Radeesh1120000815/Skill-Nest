import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = 'http://localhost:5001';

export default function LecturerDashboard() {
  const [user, setUser] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Lecturer Dashboard — Skill Nest';
    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/signin', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      const backendUrl = 'http://localhost:5001';
      const token = parsed?.token;
      const userId = parsed?._id;

      Promise.allSettled([
        axios.get(`${backendUrl}/api/sessions/my/all`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(userId ? { 'x-user-id': userId } : {}),
          },
        }),
        axios.get(`${backendUrl}/api/bookings/lecturer`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }),
      ]).then(([sessionsRes, bookingsRes]) => {
        if (sessionsRes.status === 'fulfilled') {
          setAllSessions(sessionsRes.value?.data || []);
        } else {
          setAllSessions([]);
        }

        if (bookingsRes.status === 'fulfilled') {
          setBookings(bookingsRes.value?.data?.data || []);
        } else {
          setBookings([]);
        }
      });
    } catch {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  const now = new Date();
  const nowMs = now.getTime();

  const isUpcomingBooking = (booking) => {
    const sessionDate = booking?.sessionId?.date;
    if (!sessionDate) return false;
    const startMs = new Date(sessionDate).getTime();
    return Number.isFinite(startMs) && startMs >= nowMs;
  };

  const completedSessions = allSessions
    .filter((session) => {
      const startMs = new Date(session.date).getTime();
      const durationMs = Number(session.durationMinutes || 0) * 60 * 1000;
      return startMs + durationMs < now.getTime();
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const upcoming = allSessions
    .filter((session) => new Date(session.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const upcomingStudentBookings = bookings.filter((b) => {
    if (b.status === 'rejected' || b.isCompleted) return false;
    return isUpcomingBooking(b);
  });

  const rejectedStudentBookings = bookings.filter((b) => {
    if (b.status !== 'rejected' || b.isCompleted) return false;
    return isUpcomingBooking(b);
  });

  const stats = {
    totalSessions: allSessions.length,
    activeStudents: upcomingStudentBookings.length,
    rejectedStudents: rejectedStudentBookings.length,
    pendingRequests: bookings.filter((b) => b.status === 'pending').length,
    completedSessions: completedSessions.length,
  };

  const pendingBookings = bookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const displayName = user?.name || 'Lecturer';

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, <span className="text-indigo-700">{displayName}</span>
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              Track your sessions, manage booking requests, and quickly provide meeting links for students.
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

        <section className="grid gap-4 md:grid-cols-5 mb-10">
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">📚</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.totalSessions}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/lecturer-active-students?tab=active')}
            className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4 text-left hover:bg-indigo-50/40 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">👥</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Students</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.activeStudents}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/lecturer-active-students?tab=rejected')}
            className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-rose-100 flex items-center gap-4 text-left hover:bg-rose-50/40 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-700 text-xl">🚫</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rejected Students</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.rejectedStudents}</p>
            </div>
          </button>

          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">⏱️</div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Requests</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.pendingRequests}</p>
            </div>
          </div>

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

        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2 w-full text-left">Pending Booking Requests</h2>
            {pendingBookings.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-2xl">✔️</div>
                <p className="text-base font-semibold text-slate-900 mt-2">All caught up!</p>
                <p className="text-sm text-slate-500">No pending booking requests at the moment.</p>
              </div>
            ) : (
              <div className="mt-4 w-full space-y-3">
                {pendingBookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking._id}
                    className="w-full rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3 text-left"
                  >
                    <p className="text-sm font-semibold text-slate-900">{booking.studentName}</p>
                    <p className="text-xs text-slate-600 mt-1">{booking.studentEmail}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Session: {booking.sessionId?.title || 'Session'}
                    </p>
                    {booking.reason && (
                      <p className="text-xs text-slate-500 mt-1">Reason: {booking.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

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
                      {session.subject}
                      {session.date && (
                        <>
                          {' '}
                          • {formatDateTime(session.date)}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Max students: {session.maxStudents}</p>
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
