import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LecturerActiveStudents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedTab = searchParams.get('tab') === 'rejected' ? 'rejected' : 'active';

  useEffect(() => {
    document.title = selectedTab === 'rejected'
      ? 'Rejected Students — Skill Nest'
      : 'Active Students — Skill Nest';
  }, [selectedTab]);

  useEffect(() => {
    const fetchActiveStudents = async () => {
      try {
        setError('');
        const stored = localStorage.getItem('userInfo');
        if (!stored) {
          navigate('/signin', { replace: true });
          return;
        }

        const parsed = JSON.parse(stored);
        if (parsed?.role !== 'LECTURER') {
          navigate('/signin', { replace: true });
          return;
        }

        const backendUrl = 'http://localhost:5001';
        const token = parsed?.token;

        const { data } = await axios.get(`${backendUrl}/api/bookings/lecturer`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        setBookings(data?.data || []);
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load active students.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveStudents();
  }, [navigate]);

  const activeStudents = useMemo(() => {
    const nowMs = Date.now();
    return bookings
      .filter((booking) => {
        if (booking.status === 'rejected' || booking.isCompleted) return false;
        const sessionDate = booking?.sessionId?.date;
        if (!sessionDate) return false;
        const startMs = new Date(sessionDate).getTime();
        return Number.isFinite(startMs) && startMs >= nowMs;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings]);

  const rejectedStudents = useMemo(() => {
    const nowMs = Date.now();
    return bookings
      .filter((booking) => {
        if (booking.status !== 'rejected' || booking.isCompleted) return false;
        const sessionDate = booking?.sessionId?.date;
        if (!sessionDate) return false;
        const startMs = new Date(sessionDate).getTime();
        return Number.isFinite(startMs) && startMs >= nowMs;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [bookings]);

  const visibleStudents = selectedTab === 'rejected' ? rejectedStudents : activeStudents;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {selectedTab === 'rejected' ? 'Rejected Students' : 'Active Students'}
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              {selectedTab === 'rejected'
                ? 'Students with rejected booking requests for upcoming sessions.'
                : 'Students with active or pending booking requests for upcoming sessions.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/lecturer-dashboard')}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50"
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
            <p className="text-sm text-slate-500">Loading active students...</p>
          </div>
        ) : visibleStudents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">
              {selectedTab === 'rejected' ? 'No rejected students right now.' : 'No active students right now.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleStudents.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <h2 className="text-base font-semibold text-slate-900">{booking.studentName || booking.studentId?.name || 'Student'}</h2>
                  <p className="text-xs text-slate-600 mt-1">University ID: {booking.studentUniversityId || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">Email: {booking.studentEmail || booking.studentId?.email || 'N/A'}</p>
                  <p className="text-xs text-slate-500 mt-1">Session: {booking.sessionId?.title || 'Session'}</p>
                </div>
                <div className={`text-xs font-semibold rounded-full px-3 py-1 self-start md:self-auto border ${booking.status === 'rejected' ? 'text-rose-700 bg-rose-50 border-rose-100' : booking.status === 'pending' ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
                  {booking.status === 'rejected' ? 'Rejected' : booking.status === 'pending' ? 'Pending' : 'Active'}
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
