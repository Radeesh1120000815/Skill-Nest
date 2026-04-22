import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  LayoutDashboard, BookOpen, User, LogOut, Search,
  Calendar, Clock, Users, Star, ChevronRight, X, CheckCircle,
  Sparkles, BookMarked, GraduationCap, Mail, Camera, Save,
  AlertCircle, PlayCircle, Edit3, Trash2, ChevronLeft,
} from 'lucide-react';

const API = 'http://localhost:5001/api';

const authCfg = () => {
  const u = JSON.parse(localStorage.getItem('userInfo') || 'null');
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

const statusStyle = (s) =>
  s === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
  s === 'rejected' ? 'bg-rose-100 text-rose-700 border-rose-200' :
  'bg-amber-100 text-amber-700 border-amber-200';

const statusLabel = (s) =>
  s === 'approved' ? '✅ Approved' :
  s === 'rejected' ? '❌ Rejected' : '⏳ Pending';

const fmtDuration = (mins) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`.trim() : `${mins}m`;

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ─── Enrollment Modal ────────────────────────────────────────────────────────
function EnrollModal({ session, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    studentUniversityId: user?.universityId || '',
    phone: '',
    reason: '',
    experience: 'beginner',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.studentUniversityId.trim()) e.studentUniversityId = 'University ID is required.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Phone must be exactly 10 digits.';
    if (!form.reason.trim()) e.reason = 'Please state your reason.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/bookings`, { sessionId: session._id, ...form }, authCfg());
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1800);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Booking failed.' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar border border-indigo-100">
        <div className="relative p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-t-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[50px]"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-black mb-1">Enroll in Session</h3>
              <p className="text-indigo-200 text-sm font-medium">{session.title}</p>
              <p className="text-indigo-300 text-xs mt-1">{session.subject} · {new Date(session.date).toLocaleDateString()} {session.time && `· ${session.time}`}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {success ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Booking Submitted!</h3>
            <p className="text-slate-500 font-medium">Awaiting lecturer approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {errors.api && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {errors.api}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                <input readOnly value={user?.name || ''} className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
                <input readOnly value={user?.email || ''} className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">University ID *</label>
              <input value={form.studentUniversityId} onChange={(e) => setForm({ ...form, studentUniversityId: e.target.value })} placeholder="IT23XXXXXX"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none focus:bg-white text-sm transition-all ${errors.studentUniversityId ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.studentUniversityId && <p className="text-rose-500 text-xs font-bold">{errors.studentUniversityId}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: digits }); }}
                placeholder="0XXXXXXXXX"
                inputMode="numeric"
                maxLength={10}
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none focus:bg-white text-sm transition-all ${errors.phone ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-400'}`}
              />
              {errors.phone && <p className="text-rose-500 text-xs font-bold">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Experience Level</label>
              <select value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-400 text-sm">
                <option value="beginner">🟢 Beginner</option>
                <option value="intermediate">🟡 Intermediate</option>
                <option value="advanced">🔴 Advanced</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Reason for Enrolling *</label>
              <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why do you want to join this session?"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none focus:bg-white text-sm resize-none transition-all ${errors.reason ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.reason && <p className="text-rose-500 text-xs font-bold">{errors.reason}</p>}
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/30 text-sm disabled:opacity-70">
                {loading ? 'Submitting...' : 'Submit Enrollment Request 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Edit Booking Modal ───────────────────────────────────────────────────────
function EditBookingModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({
    phone: booking.phone || '',
    reason: booking.reason || '',
    experience: booking.experience || 'beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/bookings/${booking._id}`, form, authCfg());
      onSuccess(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md border border-indigo-100">
        <div className="p-8 bg-gradient-to-br from-slate-800 to-indigo-900 text-white rounded-t-[2.5rem] flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black mb-1">Edit Booking</h3>
            <p className="text-slate-300 text-sm">{booking.sessionId?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm font-semibold">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => { const digits = e.target.value.replace(/\D/g, '').slice(0, 10); setForm({ ...form, phone: digits }); }}
              placeholder="0XXXXXXXXX"
              inputMode="numeric"
              maxLength={10}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Experience</label>
            <select value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-400 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Reason</label>
            <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-400 text-sm resize-none" />
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm disabled:opacity-70">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Day Detail Modal (Calendar) ─────────────────────────────────────────────
function DayModal({ date, bookings, onClose }) {
  const navigate = useNavigate();
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const dayNum  = date.getDate();
  const monthYr = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const accentMap = {
    approved: { bar: 'bg-emerald-400', bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: '✅' },
    rejected: { bar: 'bg-rose-400',    bg: 'bg-rose-50/60', border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-600',     icon: '❌' },
    pending:  { bar: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',   icon: '⏳' },
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
      <div
        className="bg-white w-full max-w-md flex flex-col overflow-hidden shadow-[0_32px_80px_rgba(99,102,241,0.22)]"
        style={{ borderRadius: '2.25rem' }}
      >
        {/* ── Header ── */}
        <div className="relative overflow-hidden px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#e0e7ff 50%,#ddd6fe 100%)' }}>
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-indigo-200/50 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-violet-200/40 blur-2xl pointer-events-none" />

          <button onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 rounded-2xl shadow-sm transition-all backdrop-blur-sm">
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex items-center gap-5">
            {/* Big date pill */}
            <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-lg text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
              <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">
                {date.toLocaleDateString('en-GB', { month: 'short' })}
              </span>
              <span className="text-3xl font-black leading-tight">{dayNum}</span>
            </div>
            <div>
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">{weekday}</p>
              <h3 className="text-xl font-black text-slate-800 leading-tight">{monthYr}</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {bookings.length === 0 ? 'No sessions' : `${bookings.length} session${bookings.length > 1 ? 's' : ''} scheduled`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[55vh] px-6 py-5 space-y-3 no-scrollbar">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-3">
                <Calendar className="w-7 h-7 text-slate-300" />
              </div>
              <p className="font-black text-slate-400 text-sm">Nothing scheduled</p>
              <p className="text-xs text-slate-300 mt-1">Enjoy your free day! 🌸</p>
            </div>
          ) : (
            bookings.map((booking) => {
              const s = booking.sessionId;
              if (!s) return null;
              const a = accentMap[booking.status] || accentMap.pending;
              return (
                <div key={booking._id}
                  className={`relative rounded-2xl border ${a.border} ${a.bg} overflow-hidden transition-all hover:shadow-md`}>
                  {/* left colour bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.bar} rounded-l-2xl`} />
                  <div className="pl-5 pr-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                          {s.subject}
                        </span>
                        <h4 className="font-black text-slate-800 text-sm leading-snug line-clamp-2">{s.title}</h4>
                      </div>
                      <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${a.badge}`}>
                        {a.icon} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500 mb-3">
                      {s.lecturerName && (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-[8px]">👤</span>
                          {s.lecturerName}
                        </span>
                      )}
                      {s.time && (
                        <span className="flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-[8px]">🕐</span>
                          {s.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-[8px]">⏱</span>
                        {fmtDuration(s.durationMinutes)}
                      </span>
                    </div>

                    {booking.lecturerNote && (
                      <p className="text-[11px] text-slate-400 italic bg-white/80 rounded-xl px-3 py-2 border border-white mb-3">
                        💬 {booking.lecturerNote}
                      </p>
                    )}

                    {booking.status === 'approved' && (
                      <button onClick={() => navigate(`/watch-session/${booking._id}`)}
                        className="w-full py-2.5 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                        <PlayCircle className="w-3.5 h-3.5" />
                        {booking.isCompleted ? 'Rewatch Session' : 'Watch Now'}
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <div className="w-full py-2.5 bg-amber-100 text-amber-700 font-black rounded-xl text-[11px] text-center border border-amber-200 animate-pulse">
                        ⏳ Awaiting lecturer approval
                      </div>
                    )}
                    {booking.status === 'rejected' && (
                      <div className="w-full py-2.5 bg-rose-100 text-rose-500 font-black rounded-xl text-[11px] text-center border border-rose-200">
                        ❌ Application declined
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2">
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [enrollModal, setEnrollModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [profileData, setProfileData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [greeting, setGreeting] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ── Calendar state ──────────────────────────────────────────────────────────
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  useEffect(() => {
    const titleByTab = {
      dashboard: 'Student Dashboard — Skill Nest',
      enrolled: 'My Sessions — Skill Nest',
      profile: 'My Profile — Skill Nest',
    };
    document.title = titleByTab[activeTab] || 'Student Dashboard — Skill Nest';
  }, [activeTab]);

  useEffect(() => {
    const hr = new Date().getHours();
    setGreeting(hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening');
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const validStudentRoles = ['STUDENT', 'junior', 'senior', 'both'];
    if (!info || !validStudentRoles.includes(info.role)) { navigate('/signin', { replace: true }); return; }
    setUser(info);
    setProfileData({ name: info.name || '' });
    fetchAll(info.token);
  }, [navigate]);

  const fetchAll = async (token) => {
    try {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const [sRes, bRes] = await Promise.all([
        axios.get(`${API}/sessions`, cfg),
        axios.get(`${API}/bookings/my`, cfg),
      ]);
      setSessions(sRes.data.data || []);
      setMyBookings(bRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('userInfo'); navigate('/signin', { replace: true }); }
    } finally { setLoading(false); }
  };

  const refreshAll = () => {
    const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (info?.token) fetchAll(info.token);
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await axios.delete(`${API}/bookings/${id}`, authCfg()); refreshAll(); }
    catch (err) { alert(err.response?.data?.message || 'Could not cancel.'); }
  };

  const handleMarkComplete = async (id) => {
    try { await axios.put(`${API}/bookings/${id}/complete`, {}, authCfg()); refreshAll(); }
    catch (err) { alert(err.response?.data?.message || 'Could not mark complete.'); }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result;
      setUser((prev) => ({ ...prev, avatar: b64 }));
      const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
      info.avatar = b64; localStorage.setItem('userInfo', JSON.stringify(info));
    };
    reader.readAsDataURL(file);
  };

  /*const handleProfileSave = (e) => {
    e.preventDefault(); setIsSaving(true);
    setTimeout(() => {
      setUser((prev) => ({ ...prev, name: profileData.name }));
      const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
      info.name = profileData.name; localStorage.setItem('userInfo', JSON.stringify(info));
      setIsSaving(false); alert('✅ Profile updated!');
    }, 600);
  };*/

    const handleProfileSave = async (e) => {
  e.preventDefault();

  try {
    const { data } = await axios.put(
      "http://localhost:5000/api/users/profile",
      profileData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    alert("✅ Profile updated!");

    setUser((prev) => ({ ...prev, ...data }));

  } catch (err) {
    alert("❌ Failed to update");
  }
};

const handleDeleteAccount = async () => {
  if (!window.confirm("Are you sure you want to delete your account?"))
    return;

  try {
    await axios.delete(
      `http://localhost:5000/api/users/${user._id}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    alert("Account deleted");
    localStorage.removeItem("userInfo");
    window.location.href = "/login";

  } catch (err) {
    alert("Delete failed");
  }
};



  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/signin', { replace: true }); };

  // ── Derived ──────────────────────────────────────────────────────────────
  const bookingMap = {};
  myBookings.forEach((b) => { if (b.sessionId?._id) bookingMap[b.sessionId._id] = b; });

  const isSessionNotExpired = (session) => {
    const startMs = new Date(session?.date).getTime();
    if (!Number.isFinite(startMs)) return false;
    const durationMs = Number(session?.durationMinutes || 60) * 60 * 1000;
    return startMs + durationMs > Date.now();
  };

  const availableSessions = sessions.filter(isSessionNotExpired);

  const filtered = availableSessions.filter((s) => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q) || (s.lecturerName || '').toLowerCase().includes(q);
  });

  const approved  = myBookings.filter((b) => b.status === 'approved');
  const pending   = myBookings.filter((b) => b.status === 'pending');
  const completed = myBookings.filter((b) => b.isCompleted);

  // ── Calendar derived ──────────────────────────────────────────────────────
  const calYear  = viewDate.getFullYear();
  const calMonth = viewDate.getMonth();

  const bookingsByDate = useMemo(() => {
    const map = {};
    myBookings.forEach((b) => {
      const s = b.sessionId;
      if (!s?.date) return;
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [myBookings]);

  const calFirstDay    = new Date(calYear, calMonth, 1).getDay();
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells = [];
  for (let i = 0; i < calFirstDay; i++) calCells.push(null);
  for (let d = 1; d <= calDaysInMonth; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null);

  const calDotColor = (s) =>
    s === 'approved' ? 'bg-emerald-500' :
    s === 'rejected' ? 'bg-rose-400' : 'bg-amber-400';

  const monthBookings  = myBookings.filter((b) => {
    const d = new Date(b.sessionId?.date);
    return d.getFullYear() === calYear && d.getMonth() === calMonth;
  });
  const monthApproved  = monthBookings.filter((b) => b.status === 'approved').length;
  const monthPending   = monthBookings.filter((b) => b.status === 'pending').length;
  const monthCompleted = monthBookings.filter((b) => b.isCompleted).length;

  const selectedDayBookings = selectedCalDay
    ? bookingsByDate[`${selectedCalDay.getFullYear()}-${selectedCalDay.getMonth()}-${selectedCalDay.getDate()}`] || []
    : [];

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  // ─── TAB: DASHBOARD ──────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative rounded-[2.5rem] p-10 md:p-12 text-white shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#1e3a8a]"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/10">
              <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
              <p className="text-indigo-100 font-bold tracking-[0.15em] uppercase text-[10px]">{greeting}, {user.name?.split(' ')[0]}!</p>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.05]">
              Your Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Journey Awaits.</span>
            </h2>
            <p className="text-slate-300 text-base max-w-lg font-medium">
              Explore <span className="text-white font-black bg-white/10 px-2 py-1 rounded-lg">{availableSessions.length} live sessions</span> — book, watch, and grow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            {[
              { label: 'Enrolled',  value: approved.length,  icon: BookOpen,     color: 'text-blue-300' },
              { label: 'Pending',   value: pending.length,   icon: Clock,        color: 'text-amber-300' },
              { label: 'Completed', value: completed.length, icon: CheckCircle,  color: 'text-emerald-300' },
              { label: 'Available', value: availableSessions.length, icon: Calendar, color: 'text-indigo-300' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, subject or lecturer..."
          className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-200 rounded-2xl outline-none font-bold text-slate-700 shadow-sm text-sm" />
      </div>

      {/* Sessions grid */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
          <BookOpen className="w-7 h-7 mr-3 text-indigo-600" /> Available Sessions
        </h3>
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No sessions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((session) => {
              const booking = bookingMap[session._id];
              const isFull  = session.currentEnrollments >= session.maxStudents;
              const fillPct = Math.min(100, Math.round((session.currentEnrollments / session.maxStudents) * 100));
              const dateStr = new Date(session.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div key={session._id}
                  className={`bg-white rounded-[2rem] shadow-sm border-2 p-7 flex flex-col hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden
                    ${booking?.status === 'approved' ? 'border-emerald-300 shadow-emerald-50' :
                      booking?.status === 'pending'  ? 'border-amber-300' :
                      booking?.status === 'rejected' ? 'border-rose-200 opacity-80' :
                      'border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10'}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700"></div>

                  {booking && (
                    <span className={`absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full border ${statusStyle(booking.status)}`}>
                      {statusLabel(booking.status)}
                    </span>
                  )}

                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg uppercase tracking-wider w-fit mb-3">
                    {session.subject}
                  </span>

                  <h4 className="font-black text-slate-900 text-xl mb-4 leading-tight pr-16">{session.title}</h4>

                  <div className="space-y-2 mb-5">
                    {session.lecturerName && (
                      <div className="flex items-center text-slate-500 text-xs font-bold">
                        <User className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {session.lecturerName}
                      </div>
                    )}
                    <div className="flex items-center text-slate-500 text-xs font-bold">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {dateStr} {session.time && `· ${session.time}`}
                    </div>
                    <div className="flex items-center text-slate-500 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {fmtDuration(session.durationMinutes)}
                    </div>
                    {session.averageRating > 0 && (
                      <div className="flex items-center text-amber-500 text-xs font-black">
                        <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" /> {session.averageRating} ({session.totalRatings})
                      </div>
                    )}
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-5 mt-auto">
                    <div className="flex justify-between text-xs font-black text-slate-500 mb-1.5">
                      <span>Capacity</span>
                      <span className={fillPct >= 90 ? 'text-rose-500' : 'text-indigo-600'}>
                        {session.currentEnrollments}/{session.maxStudents}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${fillPct >= 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}
                        style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>

                  {/* Action */}
                  {!booking ? (
                    isFull ? (
                      <div className="w-full py-3.5 bg-slate-100 text-slate-400 font-black rounded-2xl text-center text-sm">Session Full</div>
                    ) : (
                      <button onClick={() => setEnrollModal(session)}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center justify-center group/btn">
                        Book Now <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )
                  ) : booking.status === 'approved' ? (
                    <button onClick={() => navigate(`/watch-session/${booking._id}`)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-sm flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 mr-2" /> Watch Now
                    </button>
                  ) : booking.status === 'rejected' ? (
                    <div className="w-full py-3.5 bg-rose-50 text-rose-500 font-black rounded-2xl text-center text-sm border border-rose-200">Application Declined</div>
                  ) : (
                    <div className="w-full py-3.5 bg-amber-50 text-amber-600 font-black rounded-2xl text-center text-sm border border-amber-200 animate-pulse">⏳ Awaiting Approval</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── TAB: ENROLLED ───────────────────────────────────────────────────────
  const renderEnrolled = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-bl-full"></div>
        <h3 className="text-4xl font-black mb-2 relative z-10">My Sessions</h3>
        <p className="text-indigo-200 font-medium relative z-10">All your bookings — pending, approved and completed.</p>
      </div>

      {myBookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
          <BookMarked className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-slate-900 mb-2">No bookings yet</h3>
          <p className="text-slate-500 font-medium mb-6">Browse available sessions and submit your first booking.</p>
          <button onClick={() => setActiveTab('dashboard')} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Browse Sessions →</button>
        </div>
      ) : (
        <div className="space-y-5">
          {myBookings.map((booking) => {
            const s = booking.sessionId; if (!s) return null;
            const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={booking._id} className={`bg-white rounded-[2rem] shadow-sm border-2 p-7 transition-all ${
                booking.status === 'approved' ? 'border-emerald-200' : booking.status === 'rejected' ? 'border-rose-200 opacity-75' : 'border-amber-200'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg uppercase">{s.subject}</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-full border ${statusStyle(booking.status)}`}>{statusLabel(booking.status)}</span>
                      {booking.isCompleted && <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">✅ Completed</span>}
                      {booking.feedback?.rating && <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">⭐ Reviewed</span>}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">{s.title}</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mt-2">
                      {s.lecturerName && <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />{s.lecturerName}</span>}
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />{dateStr}{s.time && ` · ${s.time}`}</span>
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />{fmtDuration(s.durationMinutes)}</span>
                    </div>
                    {booking.lecturerNote && (
                      <p className="mt-3 text-sm text-slate-500 italic bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">💬 {booking.lecturerNote}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'approved' && !booking.isCompleted && (
                      <>
                        {s.sessionLink ? (
                          <button onClick={() => navigate(`/watch-session/${booking._id}`)}
                            className="flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg text-sm">
                            <PlayCircle className="w-4 h-4 mr-2" /> Watch Now
                          </button>
                        ) : (
                          <div className="flex items-center px-5 py-3 bg-indigo-50 text-indigo-700 font-black rounded-2xl border border-indigo-200 text-sm">
                            Video link pending
                          </div>
                        )}
                        <button onClick={() => handleMarkComplete(booking._id)}
                          className="flex items-center px-5 py-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-black rounded-2xl border border-emerald-200 transition-all text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                        </button>
                      </>
                    )}
                    {booking.status === 'approved' && booking.isCompleted && (
                      <>
                        <button onClick={() => navigate(`/watch-session/${booking._id}`)}
                          className="flex items-center px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-sm">
                          <PlayCircle className="w-4 h-4 mr-2" /> Rewatch
                        </button>
                        {!booking.feedback?.rating && (
                          <button onClick={() => navigate(`/feedback/${booking._id}`)}
                            className="flex items-center px-5 py-3 bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 font-black rounded-2xl border border-amber-200 text-sm">
                            <Star className="w-4 h-4 mr-2" /> Leave Feedback
                          </button>
                        )}
                      </>
                    )}
                    {booking.status === 'pending' && (
                      <>
                        <div className="relative">
                          <button disabled className="flex items-center px-5 py-3 bg-indigo-600 text-white font-black rounded-2xl text-sm opacity-30 cursor-not-allowed blur-[1.5px]">
                            <PlayCircle className="w-4 h-4 mr-2" /> Watch Now
                          </button>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">Pending</span>
                          </div>
                        </div>
                        <button onClick={() => setEditModal(booking)}
                          className="flex items-center px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl border border-slate-200 text-sm">
                          <Edit3 className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center px-5 py-3 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 font-black rounded-2xl border border-rose-200 text-sm">
                          <Trash2 className="w-4 h-4 mr-2" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── TAB: CALENDAR ───────────────────────────────────────────────────────
  const renderCalendar = () => {
    const upcoming = myBookings
      .filter((b) => {
        const d = new Date(b.sessionId?.date);
        return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
      })
      .sort((a, b) => new Date(a.sessionId?.date) - new Date(b.sessionId?.date))
      .slice(0, 5);

    return (
      <div className="space-y-7 animate-in fade-in duration-500">

        {/* ── Top stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'This Month',  value: monthBookings.length, emoji: '📅', from: '#6366f1', to: '#818cf8' },
            { label: 'Approved',    value: monthApproved,        emoji: '✅', from: '#10b981', to: '#34d399' },
            { label: 'Pending',     value: monthPending,         emoji: '⏳', from: '#f59e0b', to: '#fbbf24' },
            { label: 'Completed',   value: monthCompleted,       emoji: '🎓', from: '#3b82f6', to: '#60a5fa' },
          ].map((s) => (
            <div key={s.label} className="relative rounded-3xl p-5 text-white overflow-hidden shadow-lg"
              style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
              <div className="absolute -bottom-3 -right-3 text-5xl opacity-20 select-none">{s.emoji}</div>
              <p className="text-3xl font-black leading-none mb-1">{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Calendar card ── */}
        <div className="rounded-[2rem] overflow-hidden shadow-xl border border-indigo-100/60"
          style={{ background: 'linear-gradient(160deg,#f8f7ff 0%,#ffffff 60%,#f0f4ff 100%)' }}>

          {/* Calendar nav header */}
          <div className="px-7 pt-7 pb-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewDate(new Date(calYear, calMonth - 1, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center px-3">
                <p className="text-xl font-black text-slate-800 leading-none">
                  {MONTHS[calMonth]}
                </p>
                <p className="text-xs font-bold text-indigo-400 mt-0.5">{calYear}</p>
              </div>
              <button onClick={() => setViewDate(new Date(calYear, calMonth + 1, 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-5 py-2 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
              ✦ Today
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 px-3 pt-4 pb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-black uppercase tracking-widest text-indigo-300">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-5">
            {calCells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;

              const key        = `${calYear}-${calMonth}-${day}`;
              const dayBkgs    = bookingsByDate[key] || [];
              const isToday    = today.getDate() === day && today.getMonth() === calMonth && today.getFullYear() === calYear;
              const isSelected = selectedCalDay &&
                selectedCalDay.getDate() === day &&
                selectedCalDay.getMonth() === calMonth &&
                selectedCalDay.getFullYear() === calYear;
              const hasBooking = dayBkgs.length > 0;

              // pick dominant status colour for background tint
              const hasPending  = dayBkgs.some((b) => b.status === 'pending');
              const hasApproved = dayBkgs.some((b) => b.status === 'approved');
              const tintStyle   = !isSelected && hasBooking
                ? hasApproved
                  ? 'bg-emerald-50 border-emerald-200'
                  : hasPending
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
                : '';

              return (
                <div key={day}
                  onClick={() => setSelectedCalDay(new Date(calYear, calMonth, day))}
                  className={`
                    relative flex flex-col items-center justify-start pt-2 pb-1.5 rounded-2xl border cursor-pointer
                    transition-all duration-200 min-h-[56px] group select-none
                    ${isSelected
                      ? 'border-transparent text-white shadow-lg scale-105'
                      : isToday
                      ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                      : hasBooking
                      ? `${tintStyle} hover:scale-105 hover:shadow-md`
                      : 'border-transparent bg-transparent hover:bg-slate-50'
                    }
                  `}
                  style={isSelected ? { background: 'linear-gradient(135deg,#6366f1,#818cf8)' } : {}}
                >
                  <span className={`text-sm font-black leading-none
                    ${isSelected ? 'text-white' : isToday ? 'text-indigo-600' : hasBooking ? 'text-slate-800' : 'text-slate-400'}`}>
                    {day}
                  </span>

                  {/* Dot row */}
                  {hasBooking && (
                    <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center max-w-[36px]">
                      {dayBkgs.slice(0, 3).map((b, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                          ${b.status === 'approved' ? 'bg-emerald-400' : b.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}
                          ${isSelected ? 'opacity-70' : ''}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Extra count pill */}
                  {dayBkgs.length > 3 && (
                    <span className={`text-[8px] font-black mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}>
                      +{dayBkgs.length - 3}
                    </span>
                  )}

                  {/* Hover tooltip count */}
                  {hasBooking && !isSelected && (
                    <div className="absolute -top-2 -right-1 w-5 h-5 rounded-full text-white text-[9px] font-black
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                      {dayBkgs.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend inside card */}
          <div className="flex items-center justify-center gap-6 pb-5 flex-wrap">
            {[
              { color: 'bg-emerald-400', label: 'Approved' },
              { color: 'bg-amber-400',   label: 'Pending'  },
              { color: 'bg-rose-400',    label: 'Rejected' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-[11px] font-bold text-slate-400">{l.label}</span>
              </div>
            ))}
            <span className="text-[11px] text-slate-300 font-medium">· tap a day to view</span>
          </div>
        </div>

        {/* ── Upcoming sessions ── */}
        {upcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Upcoming Sessions</h3>
            </div>

            <div className="space-y-3">
              {upcoming.map((booking, i) => {
                const s = booking.sessionId; if (!s) return null;
                const d = new Date(s.date);
                const statusColors = {
                  approved: { pill: 'bg-emerald-100 text-emerald-700', left: '#10b981' },
                  rejected: { pill: 'bg-rose-100 text-rose-600',       left: '#f43f5e' },
                  pending:  { pill: 'bg-amber-100 text-amber-700',     left: '#f59e0b' },
                };
                const sc = statusColors[booking.status] || statusColors.pending;

                return (
                  <div key={booking._id}
                    className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex items-center gap-4 px-5 py-4 group">
                    {/* left accent line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: sc.left }} />

                    {/* Date block */}
                    <div className="shrink-0 w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-white shadow-md"
                      style={{ background: `linear-gradient(135deg,#6366f1,#818cf8)` }}>
                      <span className="text-[8px] font-black uppercase tracking-wider leading-none opacity-80">
                        {d.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black leading-tight">{d.getDate()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm leading-snug truncate">{s.title}</p>
                      <div className="flex gap-3 mt-1 text-[11px] font-semibold text-slate-400 flex-wrap">
                        {s.time        && <span>🕐 {s.time}</span>}
                        {s.lecturerName && <span>👤 {s.lecturerName}</span>}
                        <span>⏱ {fmtDuration(s.durationMinutes)}</span>
                      </div>
                    </div>

                    <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${sc.pill}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day modal */}
        {selectedCalDay && (
          <DayModal
            date={selectedCalDay}
            bookings={selectedDayBookings}
            onClose={() => setSelectedCalDay(null)}
          />
        )}
      </div>
    );
  };

  // ─── TAB: PROFILE ────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-[#0f172a] to-indigo-900 rounded-[2.5rem] p-10 text-white flex items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-full"></div>
        <div className="w-20 h-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center mr-6 border border-white/20">
          <User className="w-10 h-10 text-indigo-300" />
        </div>
        <div>
          <h3 className="text-3xl font-black mb-1">My Profile</h3>
          <p className="text-indigo-200 font-medium">Manage your account details.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-10">
        <div className="flex items-center gap-6 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-4xl font-black shadow-lg overflow-hidden border-4 border-white">
              {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 p-2 bg-white text-indigo-600 rounded-xl shadow-md border border-slate-100 hover:bg-indigo-50 transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900">{user.name}</h4>
            <p className="text-slate-500 font-bold">{user.email}</p>
            <span className="mt-2 inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100">Student</span>
          </div>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({ name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 outline-none text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email (read-only)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input readOnly value={user.email} className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-transparent rounded-2xl font-bold text-slate-400 cursor-not-allowed text-sm" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSaving} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg text-sm disabled:opacity-70 flex items-center">
              {isSaving ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4 ml-2" />
            </button>
            {/* DELETE BUTTON ADDED HERE */}
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="bg-red-500 text-white px-4 py-4 rounded-2xl hover:bg-red-600 font-bold flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Sessions Booked', value: myBookings.length, icon: BookOpen,    color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Completed',       value: completed.length,  icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending',         value: pending.length,    icon: Clock,       color: 'bg-amber-50 text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-3`}><s.icon className="w-6 h-6" /></div>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col font-sans text-slate-800">
      <div className="w-full z-[200] relative"><Navbar /></div>

      <div className="flex flex-1 w-full relative">
        {/* Sidebar */}
        <aside className="fixed top-[84px] left-0 h-[calc(100vh-100px)] w-[260px] ml-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] hidden md:flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-40 border border-white py-6">
          <div className="flex flex-col w-full px-5 gap-2 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
              { id: 'enrolled',  label: 'My Sessions', icon: BookMarked },
              { id: 'calendar',  label: 'Calendar',    icon: Calendar },
              { id: 'profile',   label: 'My Profile',  icon: User },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ backgroundColor: activeTab === id ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === id ? '!text-white shadow-md' : '!text-slate-500 hover:bg-indigo-50 hover:!text-indigo-600'}`}>
                <Icon className="w-5 h-5 mr-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
                {id === 'enrolled' && pending.length > 0 && (
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${activeTab === id ? 'bg-white text-indigo-800' : 'bg-amber-500 text-white animate-pulse'}`}>
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="p-6 w-full mt-auto">
            <button onClick={handleLogout} style={{ backgroundColor: '#f8fafc' }}
              className="flex items-center justify-center w-full px-5 py-4 text-sm !text-slate-500 hover:!text-rose-600 rounded-2xl font-bold transition-all border border-transparent outline-none">
              <LogOut className="w-5 h-5 mr-3 shrink-0" /> <span className="whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:pl-[290px] flex flex-col w-full relative z-10 min-h-screen">
          <header className="h-24 flex items-center justify-between px-8 bg-[#F4F7FE] border-b border-white/50 shadow-sm">
            <div className="hidden md:flex items-center bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-slate-100">
              <GraduationCap className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-black text-slate-700">Student Portal</span>
            </div>
            <div className="ml-auto flex items-center p-2 pr-5 bg-white rounded-[1.5rem] shadow-sm border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg mr-3 overflow-hidden shadow-inner">
                {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 leading-tight">{user.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Student</p>
              </div>
            </div>
          </header>

          <div className="p-8 pt-6 max-w-7xl mx-auto w-full pb-20">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'enrolled'  && renderEnrolled()}
            {activeTab === 'calendar'  && renderCalendar()}
            {activeTab === 'profile'   && renderProfile()}
          </div>
        </main>
      </div>

      <div className="w-full relative z-[200]"><Footer /></div>

      {enrollModal && <EnrollModal session={enrollModal} user={user} onClose={() => setEnrollModal(null)} onSuccess={refreshAll} />}
      {editModal   && <EditBookingModal booking={editModal} onClose={() => setEditModal(null)} onSuccess={refreshAll} />}
    </div>
  );
};

export default StudentDashboard;
