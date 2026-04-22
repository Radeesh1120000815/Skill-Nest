import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    description: '',
    date: '',
    time: '',
    maxStudents: '',
    duration: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Session - Skill Nest';

    const fetchSessions = async () => {
      try {
        setError('');
        const stored = localStorage.getItem('userInfo');
        // ── Guard: must be defined BEFORE using parsed ──
        if (!stored) { navigate('/signin'); return; }
        const parsed = JSON.parse(stored);
        if (parsed?.role !== 'LECTURER') { navigate('/signin', { replace: true }); return; }
        const token = parsed?.token;   // safe, parsed exists


        // If there is no saved user at all, redirect to sign-in
        /*if (!stored) {
          navigate('/signin');
          return;
        }*/


        const backendUrl = 'http://localhost:5001';

        const { data } = await axios.get(`${backendUrl}/api/sessions/my`, {
          /*headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(userId ? { 'x-user-id': userId } : {}),
          },*/
          headers: { Authorization: `Bearer ${token}` },
        });

        setSessions(data || []);
      } catch (err) {
        // For now, don't show a global error banner when loading sessions fails;
        // just log the problem and show the empty-state card.
        console.error('Error loading sessions:', err?.response || err);
        setError('');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this session?');
    if (!confirm) return;

    try {
      const stored = localStorage.getItem('userInfo');
      const parsed = stored ? JSON.parse(stored) : null;
      const token = parsed?.token;
      const userId = parsed?._id;
      const backendUrl = 'http://localhost:5001';

      await axios.delete(`${backendUrl}/api/sessions/${id}`, {
        /*headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(userId ? { 'x-user-id': userId } : {}),
        },*/
        headers: { Authorization: `Bearer ${token}` },
      });

      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete session.';
      setError(message);
    }
  };

  const toDateInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toTimeInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const startEdit = (session) => {
    setError('');
    setEditingSession(session);
    setEditForm({
      title: session.title || '',
      subject: session.subject || '',
      description: session.description || '',
      date: toDateInput(session.date),
      time: toTimeInput(session.date),
      maxStudents: session.maxStudents || '',
      duration: session.durationMinutes || '',
    });
  };

  const cancelEdit = () => {
    setEditingSession(null);
    setEditForm({
      title: '',
      subject: '',
      description: '',
      date: '',
      time: '',
      maxStudents: '',
      duration: '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      const stored = localStorage.getItem('userInfo');
      const parsed = stored ? JSON.parse(stored) : null;
      const token = parsed?.token;
      const userId = parsed?._id;
      const backendUrl = 'http://localhost:5001';

      const isoDate = editForm.date && editForm.time ? new Date(`${editForm.date}T${editForm.time}`).toISOString() : editingSession.date;

      const { data } = await axios.put(
        `${backendUrl}/api/sessions/${editingSession._id}`,
        {
          title: editForm.title,
          subject: editForm.subject,
          description: editForm.description,
          maxStudents: editForm.maxStudents,
          date: isoDate,
          duration: editForm.duration,
        },
        {
          /* headers: {
             'Content-Type': 'application/json',
             ...(token ? { Authorization: `Bearer ${token}` } : {}),
             ...(userId ? { 'x-user-id': userId } : {}),
           },*/
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSessions((prev) => prev.map((s) => (s._id === editingSession._id ? data.session : s)));
      cancelEdit();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update session.';
      setError(message);
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Sessions</h1>
            <p className="text-slate-500 font-medium max-w-2xl text-sm leading-relaxed">
              This page shows all the sessions i have created as a lecturer.
              I can quickly review the key details, update information when plans change,
              and remove sessions that are no longer needed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lecturer-dashboard')}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Back to Dashboard
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {editingSession && (
          <section className="mb-12 bg-white rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.04)] border border-slate-100 p-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Edit Session</h2>
            <form onSubmit={submitEdit} className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => handleEditChange('subject', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Time</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Max Students</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.maxStudents}
                  onChange={(e) => handleEditChange('maxStudents', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.duration}
                  onChange={(e) => handleEditChange('duration', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300 min-h-[120px]"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-400 bg-white hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#1e3a8a] px-10 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        )}

        {editingSession
          ? null
          : loading
            ? (
              <p className="text-sm text-slate-500">Loading sessions...</p>
            )
            : sessions.length === 0
              ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                  <p className="text-sm text-slate-500">You have not created any sessions yet.</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-100 px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-blue-100 transition-all group"
                    >
                      <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">{session.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <span className="text-blue-600 font-black">{session.subject}</span>
                          {session.date && (
                            <span className="flex items-center">
                              <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                              {formatDateTime(session.date)}
                            </span>
                          )}
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                            {session.maxStudents} Students
                          </span>
                        </div>
                        {session.description && (
                          <p className="text-sm text-slate-500 mt-3 line-clamp-1 italic">"{session.description}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 self-start md:self-auto">
                        <button
                          type="button"
                          onClick={() => startEdit(session)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(session._id)}
                          className="inline-flex items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
      </main>
      <Footer />
    </div>
  );
}
