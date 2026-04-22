
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// SVG icons
const CalendarIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight:4,verticalAlign:'middle'}}><rect x="3" y="5" width="14" height="12" rx="2" fill="#e0e7ef"/><rect x="3" y="5" width="14" height="12" rx="2" stroke="#cbd5e1" strokeWidth="1.2"/><rect x="7" y="2" width="1.5" height="4" rx="0.75" fill="#64748b"/><rect x="11.5" y="2" width="1.5" height="4" rx="0.75" fill="#64748b"/><rect x="3" y="8" width="14" height="1.5" fill="#cbd5e1"/></svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight:4,verticalAlign:'middle'}}><circle cx="10" cy="10" r="8" fill="#e0e7ef"/><circle cx="10" cy="10" r="8" stroke="#cbd5e1" strokeWidth="1.2"/><rect x="9.2" y="5" width="1.6" height="5.5" rx="0.8" fill="#64748b"/><rect x="10.5" y="10.5" width="1.6" height="4" rx="0.8" transform="rotate(90 10.5 10.5)" fill="#64748b"/></svg>
);
const OnlineIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 20 20" style={{marginRight:4,verticalAlign:'middle'}}><rect x="3" y="6" width="14" height="8" rx="2" fill="#e0e7ef"/><rect x="3" y="6" width="14" height="8" rx="2" stroke="#cbd5e1" strokeWidth="1.2"/><rect x="7" y="4" width="6" height="2" rx="1" fill="#cbd5e1"/><circle cx="10" cy="10" r="2.5" fill="#64748b"/></svg>
);
const LockIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 20 20" style={{marginRight:8,verticalAlign:'middle'}}><rect x="4" y="8" width="12" height="8" rx="2" fill="#e0e7ef"/><rect x="4" y="8" width="12" height="8" rx="2" stroke="#cbd5e1" strokeWidth="1.2"/><rect x="7" y="5" width="6" height="4" rx="2" fill="#cbd5e1"/><circle cx="10" cy="13" r="1.5" fill="#64748b"/></svg>
);

const sessions = [
  {
    status: 'LIVE',
    statusColor: '#22c55e',
    statusBg: '#dcfce7',
    title: 'Data Structures & Algorithms',
    lecturer: 'Dr. Kamal Perera',
    dept: 'CS Dept',
    date: 'Today, 2:00 PM',
    duration: '90 min',
    mode: 'Online',
    seats: '18 / 20',
    full: false,
  },
  {
    status: 'UPCOMING',
    statusColor: '#f59e42',
    statusBg: '#fef3dc',
    title: 'Calculus — Integration',
    lecturer: 'Ms. Dilini Wijesinghe',
    dept: 'Maths Dept',
    date: 'Today, 4:00 PM',
    duration: '60 min',
    mode: 'Online',
    seats: '6 / 15',
    full: false,
  },
  {
    status: 'UPCOMING',
    statusColor: '#f59e42',
    statusBg: '#fef3dc',
    title: 'Database Management',
    lecturer: 'Mr. Nuwan Fernando',
    dept: 'IT Dept',
    date: 'Tomorrow, 10:00 AM',
    duration: '120 min',
    mode: 'Online',
    seats: '10 / 25',
    full: false,
  },
  {
    status: 'UPCOMING',
    statusColor: '#f59e42',
    statusBg: '#fef3dc',
    title: 'Circuit Theory & Electronics',
    lecturer: 'Dr. Pradeep Jayawardena',
    dept: 'EE Dept',
    date: '22 Mar, 2:00 PM',
    duration: '90 min',
    mode: 'Online',
    seats: '3 / 20',
    full: false,
  },
  {
    status: 'FULL',
    statusColor: '#ef4444',
    statusBg: '#fee2e2',
    title: 'Operating Systems',
    lecturer: 'Ms. Sachini Rathnayake',
    dept: 'CS Dept',
    date: '23 Mar, 9:00 AM',
    duration: '60 min',
    mode: 'Online',
    seats: '20 / 20',
    full: true,
  },
  {
    status: 'UPCOMING',
    statusColor: '#f59e42',
    statusBg: '#fef3dc',
    title: 'Statistics & Probability',
    lecturer: 'Mr. Lasith Mendis',
    dept: 'Maths Dept',
    date: '24 Mar, 3:00 PM',
    duration: '75 min',
    mode: 'Online',
    seats: '8 / 20',
    full: false,
  },
];

export default function Sessions() {
  useEffect(() => {
    document.title = 'Sessions — Skill Nest';
  }, []);

  return (
    <div style={{ background: '#f7f9fb', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Header Section */}
      <section style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 100%)', padding: '56px 0 36px 0', textAlign: 'center', marginBottom: 0 }}>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-1px' }}>
          Browse <span style={{ color: '#fbbf24' }}>Sessions</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1.18rem', maxWidth: 540, margin: '0 auto' }}>
          Discover available tutoring sessions from campus lecturers and book your seat.
        </p>
      </section>

      {/* Sign In Banner */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '38px 0 0 0', flex: 1, width: '100%' }}>
        <div style={{ background: '#f5f7ff', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', color: '#3730a3', fontWeight: 600, margin: 0 }}>
            <LockIcon /> Sign in to book a session and manage your reservations.
          </span>
          <a href="#" tabIndex={-1} aria-disabled="true" style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '.98rem', fontWeight: 700, padding: '10px 28px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 1px 2px rgba(30,64,175,0.04)', opacity: 0.6, pointerEvents: 'none', cursor: 'not-allowed' }}>Sign In to Book</a>
        </div>

        {/* Sessions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 28 }}>
          {sessions.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px rgba(30,64,175,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ background: s.statusBg, color: s.statusColor, fontWeight: 700, fontSize: '.82rem', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', alignItems: 'center' }}>
                  {s.status === 'LIVE' && <span style={{ display: 'inline-block', width: 8, height: 8, background: s.statusColor, borderRadius: '50%', marginRight: 6 }}></span>}
                  {s.status === 'FULL' && <span style={{ display: 'inline-block', width: 8, height: 8, background: s.statusColor, borderRadius: '50%', marginRight: 6 }}></span>}
                  {s.status === 'UPCOMING' && <span style={{ display: 'inline-block', width: 8, height: 8, background: s.statusColor, borderRadius: '50%', marginRight: 6 }}></span>}
                  {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                </span>
                <span style={{ fontSize: '.98rem', color: '#64748b', fontWeight: 600 }}>{s.seats} seats</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', color: '#0f172a', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '.93rem', color: '#64748b', marginBottom: 8 }}>{s.lecturer} · {s.dept}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14, alignItems: 'center' }}>
                <span style={{ fontSize: '.89rem', color: '#64748b', display: 'flex', alignItems: 'center' }}><CalendarIcon />{s.date}</span>
                <span style={{ fontSize: '.89rem', color: '#64748b', display: 'flex', alignItems: 'center' }}><ClockIcon />{s.duration}</span>
                <span style={{ fontSize: '.89rem', color: '#64748b', display: 'flex', alignItems: 'center' }}><OnlineIcon />{s.mode}</span>
              </div>
              {s.full ? (
                <button disabled style={{ background: '#f3f4f6', color: '#64748b', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 22px', fontSize: '.98rem', cursor: 'not-allowed', boxShadow: '0 1px 2px rgba(30,64,175,0.04)' }}>Full</button>
              ) : (
                <button disabled style={{ background: '#e0e7ff', color: '#b6b6b6', fontWeight: 700, border: 'none', borderRadius: 8, padding: '8px 22px', fontSize: '.98rem', cursor: 'not-allowed', boxShadow: '0 1px 2px rgba(30,64,175,0.04)', opacity: 0.7 }}>Book Now</button>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
