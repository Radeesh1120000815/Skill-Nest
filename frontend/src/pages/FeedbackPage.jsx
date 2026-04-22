import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Star, Send, CheckCircle, User, Calendar, Clock } from 'lucide-react';

const API = 'http://localhost:5001/api';

const fmtDuration = (mins) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim() : `${mins}m`;

const FeedbackPage = () => {
  const { id } = useParams(); // booking ID
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  useEffect(() => {
    document.title = 'Session Feedback — Skill Nest';
  }, []);

  useEffect(() => {
    if (booking?.sessionId?.title) {
      document.title = `${booking.sessionId.title} — Feedback — Skill Nest`;
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
      const res = await axios.get(`${API}/bookings/my`, { headers: { Authorization: `Bearer ${token}` } });
      const found = (res.data.data || []).find((b) => b._id === id);
      if (!found) { setError('Booking not found.'); setLoading(false); return; }
      if (!found.isCompleted) { setError('Complete the session before leaving feedback.'); setLoading(false); return; }
      if (found.feedback?.rating) { setSubmitted(true); setBooking(found); setLoading(false); return; }
      setBooking(found);
    } catch { setError('Could not load booking.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setFormError('Please select a star rating.'); return; }
    if (!comment.trim()) { setFormError('Please write a short comment.'); return; }
    setFormError('');
    setSubmitting(true);
    try {
      const info = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post(`${API}/bookings/${id}/feedback`, { rating, comment }, { headers: { Authorization: `Bearer ${info.token}` } });
      setSubmitted(true);
    } catch (err) { setFormError(err.response?.data?.message || 'Submission failed.'); }
    finally { setSubmitting(false); }
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
  const dateStr = new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col font-sans">
      <div className="w-full z-[200] relative"><Navbar /></div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 mt-[84px]">
        <button onClick={() => navigate('/student-dashboard')}
          className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        {/* Session summary */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#1e3a8a] rounded-[2.5rem] p-8 text-white mb-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">{session.subject}</span>
            <h2 className="text-2xl font-black mt-3 mb-1">{session.title}</h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-indigo-200 mt-3">
              {session.lecturerName && <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5" />{session.lecturerName}</span>}
              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" />{dateStr}</span>
              <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5" />{fmtDuration(session.durationMinutes)}</span>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Thank You! 🎉</h3>
            <p className="text-slate-500 font-medium mb-4">Your feedback helps improve the average rating for this session.</p>
            {booking.feedback?.rating && (
              <div className="flex justify-center gap-1 my-4">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-7 h-7 ${s <= booking.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
            )}
            {booking.feedback?.comment && (
              <p className="text-slate-600 italic bg-slate-50 rounded-2xl px-6 py-4 text-sm font-medium mb-6 border border-slate-100">"{booking.feedback.comment}"</p>
            )}
            <button onClick={() => navigate('/student-dashboard')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all">
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 pb-0">
              <h3 className="text-2xl font-black text-slate-900 mb-1">Leave Feedback</h3>
              <p className="text-slate-500 font-medium text-sm">Your honest review helps the lecturer and other students.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Stars */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Your Rating *</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none">
                      <Star className={`w-10 h-10 transition-colors ${star <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-amber-300'}`} />
                    </button>
                  ))}
                  {(hovered || rating) > 0 && (
                    <span className="ml-3 text-sm font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      {ratingLabels[hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Your Comment * <span className="text-slate-400 font-bold normal-case tracking-normal">({comment.length}/500)</span>
                </label>
                <textarea rows={5} value={comment} onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Share what you learned, what was helpful, or how this session could be improved..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-400 transition-all resize-none text-sm" />
              </div>

              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm font-semibold">{formError}</div>
              )}

              <div className="flex gap-4">
                <button type="button" onClick={() => navigate('/student-dashboard')}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-sm">
                  Back to Dashboard
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 text-sm disabled:opacity-70 flex items-center justify-center">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <div className="w-full relative z-[200]"><Footer /></div>
    </div>
  );
};

export default FeedbackPage;
