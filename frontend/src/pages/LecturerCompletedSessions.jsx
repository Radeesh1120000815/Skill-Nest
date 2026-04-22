import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerCompletedSessions() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Completed Sessions — Skill Nest';

    /*const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/signin');
      return;
    }*/

    const stored = localStorage.getItem('userInfo');
    if (!stored) { navigate('/signin'); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'LECTURER') { navigate('/signin', { replace: true }); return; }

    try {
      const backendUrl = 'http://localhost:5001';
      const token = parsed?.token;
      const userId = parsed?._id;

      axios
        .get(`${backendUrl}/api/sessions/my/all`, {
          /*headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(userId ? { 'x-user-id': userId } : {}),
          },*/
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const all = res.data || [];
          const now = new Date();
          const completed = all
            .filter((session) => {
              const startMs = new Date(session.date).getTime();
              const durationMs = Number(session.durationMinutes || 0) * 60 * 1000;
              return startMs + durationMs < now.getTime();
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          setCompletedSessions(completed);
        })
        .catch(() => {
          setCompletedSessions([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch {
      navigate('/signin');
    }
  }, [navigate]);

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
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Completed Sessions Details</h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              Sessions that already ended based on session date and duration.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lecturer-dashboard')}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </header>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">Loading completed sessions...</p>
          </div>
        ) : completedSessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedSessions.map((session) => (
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
                        • Ended after {formatDateTime(session.date)}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: {session.durationMinutes} min • Max students: {session.maxStudents}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 self-start md:self-auto">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
