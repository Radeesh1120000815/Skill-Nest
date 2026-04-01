import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [signOutHovered, setSignOutHovered] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  // Read logged-in user info (if any)
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
  const isLecturer = user?.role === 'lecturer';

  const handleSignOut = () => {
    localStorage.removeItem('userInfo');
    setNotificationsOpen(false);
    navigate('/');
  };

  return (
    <nav style={{ background: '#0f172a', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
      <Link className="logo" to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minHeight: 68 }}>
        <img src="/favicon.svg" alt="Skill Nest Logo" className="logo-img" style={{ width: 42, height: 42, marginRight: 12, verticalAlign: 'middle' }} />
        <span className="logo-name" style={{ fontWeight: 800, fontSize: "1.28rem", color: "#fff", letterSpacing: 0.2 }}>
          Skill <span style={{ color: "#f5a623" }}>Nest</span>
        </span>
      </Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
        {isLecturer ? (
          <>
            {/* Lecturer-specific nav: Dashboard + Create Session + Sessions */}
            <Link
              className="nav-a"
              to="/lecturer-dashboard"
              style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
            >
              Dashboard
            </Link>
            <Link
              className="nav-a"
              to="/lecturer-create-session"
              style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
            >
              Create Session
            </Link>
            <Link
              className="nav-a"
              to="/lecturer-sessions"
              style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
            >
              Session
            </Link>
            <Link
              className="nav-a"
              to="/help-center"
              style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
            >
              Help Center
            </Link>
            {/* Notification bell for lecturers */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(15,23,42,0.85)',
                  border: '1px solid rgba(148,163,184,0.5)',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
            </button>
          </>
        ) : (
          <>
            {/* Default nav for guests/students */}
            <Link className="nav-a" to="/" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Home</Link>
            <Link className="nav-a" to="/resources" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Resources</Link>
            <Link className="nav-a" to="/sessions" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Sessions</Link>
            <Link className="nav-a" to="/help-center" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Help Center</Link>
          </>
        )}
        {isLecturer && notificationsOpen && (
          <div
            style={{
              position: 'absolute',
              top: 52,
              right: 0,
              width: 260,
              background: '#0b1220',
              borderRadius: 16,
              padding: '14px 16px',
              boxShadow: '0 18px 45px rgba(15,23,42,0.65)',
              border: '1px solid rgba(148,163,184,0.45)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.08, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
              Notifications
            </p>
            <p style={{ fontSize: 13, color: '#e5e7eb' }}>You&apos;re all caught up. No new notifications yet.</p>
          </div>
        )}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleSignOut}
            onMouseEnter={() => setSignOutHovered(true)}
            onMouseLeave={() => setSignOutHovered(false)}
            className="nav-btn"
            style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none', background: signOutHovered ? '#f59e0b' : '#fbbf24', color: '#111', transition: 'background 0.15s ease-in-out' }}
          >
            Sign Out
          </button>
        ) : (
          <Link className="nav-btn" to="/signin" style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none' }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;