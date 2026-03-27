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
        const parsed = stored ? JSON.parse(stored) : null;
        const token = parsed?.token;
        const userId = parsed?._id;

        // If there is no saved user at all, redirect to sign-in
        if (!stored) {
          navigate('/signin');
          return;
        }
        const backendUrl = 'http://localhost:5001';

        const { data } = await axios.get(`${backendUrl}/api/sessions/my`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(userId ? { 'x-user-id': userId } : {}),
          },
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
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(userId ? { 'x-user-id': userId } : {}),
        },
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
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(userId ? { 'x-user-id': userId } : {}),
          },
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
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">My Sessions</h1>
          <p className="text-slate-600 mt-2 max-w-2xl text-sm">
            This page shows all the sessions i have created as a lecturer.
            I can quickly review the key details, update information when plans change,
            and remove sessions that are no longer needed.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {editingSession && (
          <section className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Session</h2>
            <form onSubmit={submitEdit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => handleEditChange('subject', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max Students</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.maxStudents}
                  onChange={(e) => handleEditChange('maxStudents', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.duration}
                  onChange={(e) => handleEditChange('duration', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
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
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{session.title}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {session.subject}
                        {session.date && (
                          <>
                            {' '}
                            • {formatDateTime(session.date)}
                          </>
                        )}
                      </p>
                      {session.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{session.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">Max students: {session.maxStudents}</p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => startEdit(session)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(session._id)}
                        className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
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
