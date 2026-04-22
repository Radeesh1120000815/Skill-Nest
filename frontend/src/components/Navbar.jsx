<<<<<<< HEAD
import { Link } from "react-router-dom";

function Navbar() {
=======
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const notificationsRef = useRef(null);

  let user = null;
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        user = null;
      }
    }
  }

  const isLoggedIn = !!user;
  const isLecturer = String(user?.role || '').toUpperCase() === 'LECTURER';

  useEffect(() => {
    // Lecturer notification badge: pending booking requests count.
    if (!isLecturer || !user?.token) {
      setPendingCount(0);
      return;
    }

    let active = true;
    const backendUrl = 'http://localhost:5001';

    const fetchPendingCount = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/bookings/lecturer`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!active) return;
        const bookings = data?.data || [];
        const pending = bookings.filter((b) => b.status === 'pending').length;
        setPendingCount(pending);
      } catch {
        if (active) setPendingCount(0);
      }
    };

    fetchPendingCount();
    const id = setInterval(fetchPendingCount, 30000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isLecturer, user?.token]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsideClick = (event) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [notificationsOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('userInfo');
    setNotificationsOpen(false);
    navigate('/signin');
  };

>>>>>>> origin/Lecture-Sessions
  return (
    <nav style={{ background: '#0f172a', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
      <Link className="logo" to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minHeight: 68 }}>
        <img src="/favicon.svg" alt="Skill Nest Logo" className="logo-img" style={{ width: 42, height: 42, marginRight: 12, verticalAlign: 'middle' }} />
        <span className="logo-name" style={{ fontWeight: 800, fontSize: "1.28rem", color: "#fff", letterSpacing: 0.2 }}>
          Skill <span style={{ color: "#f5a623" }}>Nest</span>
        </span>
      </Link>
<<<<<<< HEAD
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link className="nav-a" to="/" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Home</Link>
        <Link className="nav-a" to="/resources" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Resources</Link>
        <Link className="nav-a" to="/login" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Kuppi</Link>
        <Link className="nav-a" to="/sessions" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Sessions</Link>
        <Link className="nav-a" to="/help-center" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Help Center</Link>
        <Link className="nav-btn" to="/signin" style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none' }}>Sign In</Link>
=======
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
        {isLecturer ? (
          <>
            <Link className="nav-a" to="/lecturer-dashboard" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Dashboard</Link>
            <Link className="nav-a" to="/lecturer-create-session" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Create Session</Link>
            <Link className="nav-a" to="/lecturer-sessions" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Session</Link>
            <Link className="nav-a" to="/help-center" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Help Center</Link>

            <div ref={notificationsRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <span style={{ width: 34, height: 34, borderRadius: '999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(148,163,184,0.5)', position: 'relative' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {pendingCount > 0 && (
                    <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </span>
              </button>

              {isLecturer && notificationsOpen && (
                <div style={{ position: 'absolute', top: 52, right: -112, width: 280, background: '#0b1220', borderRadius: 16, padding: '14px 16px', boxShadow: '0 18px 45px rgba(15,23,42,0.65)', border: '1px solid rgba(148,163,184,0.45)' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
                    Notifications
                  </p>
                  {pendingCount > 0 ? (
                    <>
                      <p style={{ fontSize: 13, color: '#e5e7eb', marginBottom: 10 }}>
                        You have {pendingCount} pending booking request{pendingCount > 1 ? 's' : ''}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/lecturer-pending-requests');
                        }}
                        style={{ width: '100%', border: 'none', borderRadius: 10, background: '#4f46e5', color: '#fff', fontWeight: 700, fontSize: 12, padding: '10px 12px', cursor: 'pointer' }}
                      >
                        View Pending Requests
                      </button>
                    </>
                  ) : (
                    <p style={{ fontSize: 13, color: '#e5e7eb' }}>You are all caught up. No new notifications yet.</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link className="nav-a" to="/" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Home</Link>
            <Link className="nav-a" to="/resources" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Resources</Link>
            <Link className="nav-a" to="/login" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>KUPPI co.</Link>
            <Link className="nav-a" to="/sessions" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Sessions</Link>
            <Link className="nav-a" to="/help-center" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Help Center</Link>
          </>
        )}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="nav-btn"
            style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none', background: '#fbbf24', color: '#111', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        ) : (
          <Link className="nav-btn" to="/signin" style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none' }}>Sign In</Link>
        )}
>>>>>>> origin/Lecture-Sessions
      </div>
    </nav>
  );
}

export default Navbar;