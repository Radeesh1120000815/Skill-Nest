import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Dashboard — Skill Nest';
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

    setAdmin(parsed);

    const fetchStats = async () => {
      try {
        setStatsError('');
        setLoadingStats(true);

        const backendUrl = 'http://localhost:5001';
        const token = parsed.token;

        const { data } = await axios.get(`${backendUrl}/api/admin/stats`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        setStats(data || null);
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load admin stats.';
        setStatsError(message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const displayName = admin?.name || 'Admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Welcome, <span className="text-indigo-700">{displayName}</span>
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              As an admin, I can oversee the Skill Nest platform, review user activity, and manage student and lecturer accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Manage Users
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3 mb-10">
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Users</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {loadingStats || !stats ? '—' : stats?.users?.total ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {loadingStats || !stats
                ? 'Overall students, lecturers, and admins.'
                : `Students ${stats?.users?.students ?? 0} · Lecturers ${stats?.users?.lecturers ?? 0} · Admins ${stats?.users?.admins ?? 0}`}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Blocked Accounts</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {loadingStats || !stats ? '—' : stats?.users?.blocked ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Users currently blocked by admin.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/sessions')}
            className="text-left bg-white rounded-2xl shadow-sm px-5 py-4 border border-indigo-50 hover:bg-indigo-50/40 transition-colors"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Sessions</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {loadingStats || !stats ? '—' : stats?.sessions?.activeUpcoming ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Sessions scheduled for now or the future.</p>
          </button>
        </section>

        {statsError && (
          <p className="text-xs text-red-600 mb-6">Failed to load live stats: {statsError}</p>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Next Steps</h2>
          <p className="text-sm text-slate-600 mb-3">
            Use the <span className="font-semibold">Manage Users</span> page to view all students, lecturers, and admins, block or unblock
            accounts, and keep the platform healthy.
          </p>
          <p className="text-sm text-slate-600">
            To manage accounts now, go to the <span className="font-semibold">Admin &gt; Manage Users</span> page.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
