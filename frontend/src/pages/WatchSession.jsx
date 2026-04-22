import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, PlayCircle, CheckCircle, Star, Calendar, Clock, User, ExternalLink } from 'lucide-react';

const API = 'http://localhost:5001/api';

const fmtDuration = (mins) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim() : `${mins}m`;

const WatchSession = () => {
  const { id } = useParams();  // booking ID
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Watch Session — Skill Nest';
  }, []);

  useEffect(() => {
    if (booking?.sessionId?.title) {
      document.title = `${booking.sessionId.title} — Watch Session — Skill Nest`;
    }
  }, [booking]);

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const validStudentRoles = ['STUDENT', 'junior', 'senior', 'both'];
    if (!info || !validStudentRoles.includes(info.role)) { navigate('/signin', { replace: true }); return; }
    fetchBooking(info.token);
  }, [id]);

  const fetchBooking = async (token) => {
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API}/bookings/my`, cfg);
      const found = (res.data.data || []).find((b) => b._id === id);
      if (!found) { setError('Booking not found.'); setLoading(false); return; }
      if (found.status !== 'approved') { setError('This session has not been approved yet.'); setLoading(false); return; }
      setBooking(found);
    } catch {
      setError('Could not load session.');
    } finally { setLoading(false); }
  };

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      const info = JSON.parse(localStorage.getItem('userInfo'));
      await axios.put(`${API}/bookings/${id}/complete`, {}, { headers: { Authorization: `Bearer ${info.token}` } });
      setBooking((prev) => ({ ...prev, isCompleted: true, completedAt: new Date().toISOString() }));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not mark complete.');
    } finally { setCompleting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] flex-col gap-4">
      <p className="text-2xl font-black text-slate-800">{error}</p>
      <button onClick={() => navigate('/student-dashboard')} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl">Back to Dashboard</button>
    </div>
  );

  const session = booking.sessionId;
  const dateStr = new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col font-sans">
      <div className="w-full z-[200] relative"><Navbar /></div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 mt-[84px]">
        <button onClick={() => navigate('/student-dashboard')}
          className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e3a8a] rounded-[2.5rem] p-10 text-white mb-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">{session.subject}</span>
            <h1 className="text-4xl font-black mt-3 mb-2 tracking-tight">{session.title}</h1>
            {session.description && <p className="text-indigo-200 font-medium mb-4 max-w-xl">{session.description}</p>}
            <div className="flex flex-wrap gap-6 text-sm font-bold text-indigo-200">
              {session.lecturerName && <span className="flex items-center"><User className="w-4 h-4 mr-2" />{session.lecturerName}</span>}
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" />{dateStr}{session.time && ` · ${session.time}`}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2" />{fmtDuration(session.durationMinutes)}</span>
              {session.averageRating > 0 && (
                <span className="flex items-center text-amber-300"><Star className="w-4 h-4 mr-1 fill-amber-400" />{session.averageRating}</span>
              )}
            </div>
          </div>
        </div>

        {/* Watch card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10 mb-6 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-indigo-100">
            <PlayCircle className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to Watch?</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            Click below to open the session recording. After watching, mark it as complete.
          </p>
          {session.sessionLink ? (
            <a href={session.sessionLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
              <PlayCircle className="w-5 h-5 mr-3" /> Open Session Recording
              <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
            </a>
          ) : (
            <p className="text-slate-400 font-bold bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100">
              Session link will be shared by the lecturer.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          <h3 className="text-lg font-black text-slate-900 mb-5">Session Progress</h3>
          {booking.isCompleted ? (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex-1">
                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 shrink-0" />
                <div>
                  <p className="font-black text-emerald-700">Session Completed!</p>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">
                    {new Date(booking.completedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              {!booking.feedback?.rating ? (
                <button onClick={() => navigate(`/feedback/${booking._id}`)}
                  className="flex items-center px-6 py-4 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 font-black rounded-2xl border border-amber-200 transition-all">
                  <Star className="w-5 h-5 mr-2" /> Leave Feedback
                </button>
              ) : (
                <div className="flex items-center bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400 mr-2" />
                  <div>
                    <p className="font-black text-amber-700">Feedback Submitted</p>
                    <p className="text-xs text-amber-600 font-bold">You rated {booking.feedback.rating}/5</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4">
                <p className="font-black text-indigo-700 text-sm">After watching the full session, mark it as complete to unlock feedback.</p>
              </div>
              <button onClick={handleMarkComplete} disabled={completing}
                className="flex items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70">
                <CheckCircle className="w-5 h-5 mr-2" />
                {completing ? 'Marking...' : 'Mark as Complete'}
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="w-full relative z-[200]"><Footer /></div>
    </div>
  );
};

export default WatchSession;
