import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerCreateSession() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [maxStudents, setMaxStudents] = useState('10');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60'); // minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Create Session - Skill Nest';
    // If user is not logged in at all, redirect to sign-in
    const stored = localStorage.getItem('userInfo');
    /*if (!stored) {
      navigate('/signin');
    }*/
    if (!stored) { navigate('/signin'); return; }
    const parsed = JSON.parse(stored);
    if (parsed?.role !== 'LECTURER') { navigate('/signin', { replace: true }); return; }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const newFieldErrors = {};

    if (!title.trim()) {
      newFieldErrors.title = 'Session title is required.';
    } else if (title.trim().length < 3) {
      newFieldErrors.title = 'Title should be at least 3 characters.';
    }

    if (!subject.trim()) {
      newFieldErrors.subject = 'Please enter a subject.';
    }

    const maxStudentsNumber = Number(maxStudents);
    if (!maxStudents) {
      newFieldErrors.maxStudents = 'Max students is required.';
    } else if (Number.isNaN(maxStudentsNumber) || maxStudentsNumber < 1) {
      newFieldErrors.maxStudents = 'Max students must be a positive number.';
    }

    if (!date) {
      newFieldErrors.date = 'Please select a date.';
    }
    if (!time) {
      newFieldErrors.time = 'Please select a time.';
    }

    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      if (selectedDateTime < new Date()) {
        newFieldErrors.date = 'Session date/time must be in the future.';
      }
    }

    if (!duration) {
      newFieldErrors.duration = 'Please select a duration.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      // Only show inline field errors; keep the top error banner for real API errors.
      return;
    }

    setFieldErrors({});

    // Combine date + time into one ISO string
    const isoDateTime = new Date(`${date}T${time}`).toISOString();

    const stored = localStorage.getItem('userInfo');
    const parsedUser = stored ? JSON.parse(stored) : null;
    const token = parsedUser?.token;

    try {
      setLoading(true);
      const backendUrl = 'http://localhost:5001';

      await axios.post(
        `${backendUrl}/api/sessions`,
        {
          title,
          subject,
          maxStudents,
          description,
          date: isoDateTime,
          duration,
          time, // 🟢 Added for display consistency in lists
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Session created successfully.');
      setTimeout(() => {
        navigate('/lecturer-dashboard');
      }, 800);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create session. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/lecturer-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create New Session</h1>
          <button
            type="button"
            onClick={() => navigate('/lecturer-dashboard')}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm active:scale-95"
          >
            Back to Dashboard
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.04)] border border-slate-100 px-10 py-10 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Session Title</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
              placeholder="e.g. Advanced React Patterns"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Subject</label>
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                placeholder="e.g. Data Structures"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              {fieldErrors.subject && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.subject}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Max Students</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                required
              />
              {fieldErrors.maxStudents && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.maxStudents}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Description</label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300 min-h-[160px]"
              placeholder="What will students learn in this session?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Date</label>
              <input
                type="date"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Time</label>
              <input
                type="time"
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all placeholder-slate-300"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              {fieldErrors.time && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.time}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Duration</label>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm bg-slate-50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all appearance-none"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            >
              <option value="60">1 Hour</option>
              <option value="90">1.5 Hours</option>
              <option value="120">2 Hours</option>
              <option value="180">3 Hours</option>
            </select>
            {fieldErrors.duration && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.duration}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-400 bg-white hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-[#1e3a8a] px-12 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Synthesizing...' : 'Create Session'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
