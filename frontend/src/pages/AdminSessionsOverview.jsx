import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminSessionsOverview() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Sessions — Skill Nest';

    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/signin');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      navigate('/signin');
      return;
    }

    if (parsed.role?.toLowerCase() !== 'admin') {
      navigate('/');
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError('');

        const backendUrl = 'http://localhost:5001';
        const token = parsed.token;

        const { data } = await axios.get(`${backendUrl}/api/admin/sessions`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load sessions.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate]);

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} 
${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Active Sessions Overview</h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              All upcoming tutoring sessions on the platform, including the lecturer names.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard')}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
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
          <p className="text-sm text-slate-500">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">No upcoming sessions found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Session</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Lecturer</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Date &amp; Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Duration</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Max Students</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-900 font-medium">{session.title}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {session.lecturer?.name || 'Unknown'}
                        <span className="block text-[11px] text-slate-400">{session.lecturer?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{session.subject}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-pre-line">{formatDateTime(session.date)}</td>
                      <td className="px-4 py-3 text-slate-600">{session.durationMinutes} min</td>
                      <td className="px-4 py-3 text-slate-600">{session.maxStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
