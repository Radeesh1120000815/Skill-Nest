import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerDashboard() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Lecturer Dashboard — Skill Nest';
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);

        const backendUrl = 'http://localhost:5001';
        const token = parsed?.token;
        const userId = parsed?._id;

        axios
          .get(`${backendUrl}/api/sessions/my`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...(userId ? { 'x-user-id': userId } : {}),
            },
          })
          .then((res) => {
            setSessions(res.data || []);
          })
          .catch(() => {
            setSessions([]);
          });
      } catch {
        setUser(null);
      }
    }
  }, []);

  const displayName = user?.name || 'Lecturer';

  const handleCreateSession = () => {
    navigate('/lecturer-create-session');
  };

  const stats = {
    totalSessions: sessions.length,
    activeStudents: 0,
    pendingRequests: 0,
    completedSessions: 0,
  };

  const upcoming = sessions
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header + primary action */}
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
            onClick={handleCreateSession}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Create New Session
          </button>
        </header>

        {/* Top stats row */}
        <section className="grid gap-4 md:grid-cols-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">
              📚
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sessions</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.totalSessions}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">
              👥
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Students</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.activeStudents}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Requests</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.pendingRequests}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-xl">
              ✅
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed Sessions</p>
              <p className="text-2xl font-extrabold text-slate-900">{stats.completedSessions}</p>
            </div>
          </div>
        </section>

        {/* Pending booking requests */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2 w-full text-left">Pending Booking Requests</h2>
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 text-2xl">
                ✔️
              </div>
              <p className="text-base font-semibold text-slate-900 mt-2">All caught up!</p>
              <p className="text-sm text-slate-500">No pending booking requests at the moment.</p>
            </div>
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
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => navigate('/lecturer-sessions')}
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      View All
                    </button>
                  </div>
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
