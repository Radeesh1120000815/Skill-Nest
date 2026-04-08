import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';

const SIDEBAR_SECTIONS = [
  {
    label: 'Resources',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z',
    links: [
      { label: 'Resource Queue', to: '/admin/resources', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', badge: true },
      { label: 'Resource Hub',   to: '/resources',       icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },

    ],
  },
  {
    label: 'Kuppi',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    links: [
      { label: 'Kuppi Sessions',  to: '/admin/kuppi',           icon: 'M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z', soon:true },
      { label: 'Kuppi Analytics', to: '/admin/kuppi/analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', soon:true },
    ],
  },
  {
    label: 'Sessions',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    links: [
      { label: 'All Sessions',    to: '/admin/sessions',         icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', soon:true },
      { label: 'Session Reports', to: '/admin/sessions/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z', soon:true },
    ],
  },
  {
    label: 'Profile Management',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    links: [
      { label: 'All Users',      to: '/admin/users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', soon:true },
      { label: 'Roles & Access', to: '/admin/roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', soon:true },
    ],
  },
  {
    label: 'Feedback',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    links: [
      { label: 'Comments', to: '/admin/comments', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', soon:true },
      { label: 'Reports',  to: '/admin/feedback', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9', soon:true },
    ],
  },
];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  const [expandedSection, setExpandedSection] = useState('Resources');
  const [stats,           setStats]           = useState({
    totalUsers:'—', totalSessions:'—', kuppiSessions:'—',
    totalResources:'—', pendingResources:'—', approvedResources:'—',
  });

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/resources');
    if (!user) navigate('/login');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/signin');
  };

  const STAT_CARDS = [
    { label:'Total Users',        value:stats.totalUsers,        icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color:T.primary,   trend:'+12%' },
    { label:'Total Sessions',     value:stats.totalSessions,     icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',                         color:T.secondary, trend:'+8%'  },
    { label:'Kuppi Sessions',     value:stats.kuppiSessions,     icon:'M13 10V3L4 14h7v7l9-11h-7z',                                                                                      color:T.cyan,      trend:'+24%' },
    { label:'Total Resources',    value:stats.totalResources,    icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z', color:T.green,     trend:'+5%'  },
    { label:'Pending Review',     value:stats.pendingResources,  icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',                                                                     color:T.yellow,    trend:'',    link:'/admin/resources' },
    { label:'Approved Resources', value:stats.approvedResources, icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',                                                                   color:T.green,     trend:''     },
  ];

  return (
    <>
      <style>{`
        ${sharedStyles}
        @keyframes snFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }

        .ad-stat { background:#FFFFFF; border:1px solid ${T.border}; border-radius:18px; padding:22px; transition:all .22s ease; box-shadow:0 2px 10px rgba(15,23,42,0.07); animation:snFadeUp .4s ease both; text-decoration:none; display:block; }
        .ad-stat:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(79,110,247,0.13); border-color:rgba(79,110,247,0.22); }
        .ad-section-btn { display:flex; align-items:center; justify-content:space-between; width:100%; padding:10px 14px; border:none; border-radius:10px; background:transparent; cursor:pointer; transition:all .15s; font-family:'Inter',sans-serif; }
        .ad-section-btn:hover { background:${T.surfaceHover}; }
        .ad-nav-link { display:flex; align-items:center; gap:10px; padding:9px 14px 9px 36px; border-radius:9px; text-decoration:none; transition:all .15s; font-family:'Inter',sans-serif; font-size:13px; color:${T.textSecondary}; }
        .ad-nav-link:hover { background:${T.primaryLight}; color:${T.primary}; }
        .ad-nav-link.active { background:${T.primaryLight}; color:${T.primary}; font-weight:600; }
        .ad-quick-card { background:#FFFFFF; border:1px solid ${T.border}; border-radius:16px; padding:20px; transition:all .2s; box-shadow:0 2px 8px rgba(15,23,42,0.06); text-decoration:none; display:flex; align-items:center; gap:14px; }
        .ad-quick-card:hover { border-color:${T.primary}40; transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,110,247,0.12); }
      `}</style>

      {/*
        ── KEY LAYOUT PATTERN ──────────────────────────────────────────────────
        height: 100vh  →  page is exactly viewport height
        Navbar takes its natural height (~64px)
        Body row fills the rest with overflow:hidden
        BOTH sidebar and main have overflow-y:auto → each scrolls independently
        Sidebar always fills 100% of the body row height → no short sidebar
        Footer lives inside main's scroll area → appears after content naturally
        ────────────────────────────────────────────────────────────────────────
      */}
      <div className="sn-page" style={{
        height: '100vh',          /* ← full viewport, no overflow on root */
        background: T.appBg,
        color: T.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',       /* ← prevent root from scrolling */
      }}>

        {/* Navbar — fixed height at top */}
        <Navbar />

        {/* Body row — fills remaining height */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',     /* ← children handle their own scroll */
          minHeight: 0,
        }}>

          {/* ── Sidebar ── fills 100% height of body row, scrolls independently */}
          <aside style={{
            width: sidebarOpen ? '240px' : '0px',
            flexShrink: 0,
            background: T.surface,
            borderRight: `1px solid ${T.border}`,
            transition: 'width .25s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 20px rgba(15,23,42,0.07)',
            zIndex: 40,
            /* height is 100% of parent flex row — always full height */
          }}>
            <div style={{ width:'240px', display:'flex', flexDirection:'column', height:'100%', overflowY:'auto' }}>

              {/* Admin card */}
              <div style={{ padding:'20px 16px 8px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:`linear-gradient(135deg,${T.heroFrom},${T.heroTo})`, borderRadius:'14px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🛡️</div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'white', fontFamily:'Plus Jakarta Sans,sans-serif' }}>{user?.name || 'Admin'}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)', fontFamily:'Inter,sans-serif' }}>Administrator</div>
                  </div>
                </div>
              </div>

              {/* Dashboard link */}
              <div style={{ padding:'8px 8px 4px', flexShrink:0 }}>
                <Link to="/admin" style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'10px', textDecoration:'none', background:location.pathname==='/admin'?T.primaryLight:'transparent', color:location.pathname==='/admin'?T.primary:T.textSecondary, fontFamily:'Inter,sans-serif', fontSize:'13.5px', fontWeight:location.pathname==='/admin'?600:400, borderLeft:location.pathname==='/admin'?`3px solid ${T.primary}`:'3px solid transparent', transition:'all .15s' }}>
                  <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" size={18} color={location.pathname==='/admin'?T.primary:T.textSecondary}/>
                  Dashboard
                </Link>
              </div>

              <div style={{ height:'1px', background:T.border, margin:'6px 16px', flexShrink:0 }}/>

              {/* Collapsible sections — scrollable */}
              <div style={{ padding:'4px 8px', flex:1, overflowY:'auto' }}>
                {SIDEBAR_SECTIONS.map(section => (
                  <div key={section.label} style={{ marginBottom:'2px' }}>
                    <button className="ad-section-btn" onClick={() => setExpandedSection(expandedSection===section.label?'':section.label)}>
                      <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                        <Icon path={section.icon} size={17} color={expandedSection===section.label?T.primary:T.textSecondary}/>
                        <span style={{ fontSize:'13px', fontWeight:600, color:expandedSection===section.label?T.primary:T.textSecondary, fontFamily:'Inter,sans-serif' }}>{section.label}</span>
                      </div>
                      <div style={{ transform:expandedSection===section.label?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}>
                        <Icon path="M19 9l-7 7-7-7" size={14} color={T.textMuted}/>
                      </div>
                    </button>
                    {expandedSection===section.label && (
                      <div style={{ marginTop:'2px', animation:'snFadeUp .2s ease' }}>
                        {section.links.map(link => (
                          <Link key={link.label} to={link.soon?'#':link.to}
                            className={`ad-nav-link${location.pathname===link.to?' active':''}`}
                            onClick={e => link.soon&&e.preventDefault()}
                            style={{ opacity:link.soon?0.5:1, cursor:link.soon?'default':'pointer' }}>
                            <Icon path={link.icon} size={14} color="currentColor"/>
                            <span style={{ flex:1 }}>{link.label}</span>
                            {link.soon && <span style={{ fontSize:'9px', fontWeight:700, background:T.borderMed, color:T.textMuted, padding:'2px 6px', borderRadius:'4px', letterSpacing:'0.04em' }}>SOON</span>}
                            {link.badge && <span style={{ fontSize:'9px', fontWeight:700, background:T.yellowLight, color:T.yellow, padding:'2px 6px', borderRadius:'4px' }}>!</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Logout — pinned to bottom */}
              <div style={{ padding:'12px 8px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
                <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 14px', borderRadius:'10px', background:'transparent', border:'none', color:T.red, cursor:'pointer', transition:'all .15s', fontFamily:'Inter,sans-serif', fontSize:'13px' }}
                  onMouseEnter={e => e.currentTarget.style.background=T.redLight}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={18} color={T.red}/>
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main content — scrolls independently, footer at bottom ── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',    /* ← main column scrolls, sidebar stays */
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>

            {/* Top bar */}
            <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'14px 28px', display:'flex', alignItems:'center', gap:'16px', flexShrink:0, boxShadow:T.shadowSm }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:'transparent', border:'none', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex' }}
                onMouseEnter={e => e.currentTarget.style.background=T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <Icon path="M4 6h16M4 12h16M4 18h16" size={20} color={T.textSecondary}/>
              </button>
              <div>
                <h1 className="sn-head" style={{ fontSize:'20px', fontWeight:800, color:T.textPrimary, lineHeight:1 }}>Admin Dashboard</h1>
                <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginTop:'2px' }}>Welcome back, {user?.name}</p>
              </div>
              
            </div>

            {/* Hero banner */}
            <div style={{ position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${T.heroFrom},${T.heroTo})`, padding:'32px 32px 28px', flexShrink:0 }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', top:'-30px', right:'60px', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,92,252,0.25) 0%,transparent 65%)', filter:'blur(24px)', pointerEvents:'none' }}/>
              <div style={{ position:'relative', zIndex:1 }}>

                <h2 className="sn-head" style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:900, color:'white', marginBottom:'6px', letterSpacing:'-0.02em' }}>
                  SkillNest{' '}
                  <span style={{ background:'linear-gradient(90deg,#60A5FA,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Admin</span>
                </h2>
                <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.55)', fontFamily:'Inter,sans-serif' }}>
                  Manage resources, users, sessions and platform activity from one place.
                </p>
              </div>
            </div>

            {/* Page content */}
            <div style={{ flex:1, padding:'28px 32px 56px', maxWidth:'1200px', margin:'0 auto', width:'100%' }}>

              {/* Stats grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'32px' }}>
                {STAT_CARDS.map((s,i) => (
                  s.link ? (
                    <Link key={s.label} to={s.link} className="ad-stat" style={{ animationDelay:`${i*0.06}s` }}>
                      <StatCardInner s={s}/>
                    </Link>
                  ) : (
                    <div key={s.label} className="ad-stat" style={{ animationDelay:`${i*0.06}s` }}>
                      <StatCardInner s={s}/>
                    </div>
                  )
                ))}
              </div>

              {/* Quick actions */}
              <h3 className="sn-head" style={{ fontSize:'16px', fontWeight:800, color:T.textPrimary, marginBottom:'12px' }}>Quick Actions</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'32px' }}>
                {[
                  { label:'Review Queue',  to:'/admin/resources', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color:T.primary,   desc:'Pending resources',   active:true  },
                  { label:'Resource Hub',  to:'/resources',        icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color:T.secondary, desc:'Browse all resources', active:true  },
                  { label:'Manage Users',  to:'#',                 icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',                                        color:T.cyan,      desc:'Users & roles',       active:false },
                  { label:'View Feedback', to:'#',                 icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color:T.yellow,    desc:'Comments & reports', active:false },
                ].map(q => (
                  <Link key={q.label} to={q.to} className="ad-quick-card" onClick={e => !q.active&&e.preventDefault()} style={{ opacity:q.active?1:0.55, cursor:q.active?'pointer':'default' }}>
                    <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:`${q.color}18`, border:`1px solid ${q.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon path={q.icon} size={20} color={q.color}/>
                    </div>
                    <div>
                      <div style={{ fontSize:'13.5px', fontWeight:700, color:T.textPrimary, fontFamily:'Plus Jakarta Sans,sans-serif', marginBottom:'2px' }}>{q.label}</div>
                      <div style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{q.active?q.desc:'Coming soon'}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Module overview */}
              <h3 className="sn-head" style={{ fontSize:'16px', fontWeight:800, color:T.textPrimary, marginBottom:'14px' }}>Module Overview</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
                {SIDEBAR_SECTIONS.map((section,i) => (
                  <div key={section.label} style={{ background:'#FFFFFF', border:`1px solid ${T.border}`, borderRadius:'16px', padding:'20px', boxShadow:T.shadowSm, animation:`snFadeUp .4s ease ${i*0.07}s both` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', paddingBottom:'12px', borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon path={section.icon} size={17} color={T.primary}/>
                      </div>
                      <span className="sn-head" style={{ fontSize:'14px', fontWeight:700, color:T.textPrimary }}>{section.label}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                      {section.links.map(link => (
                        <Link key={link.label} to={link.soon?'#':link.to} onClick={e => link.soon&&e.preventDefault()}
                          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'8px', textDecoration:'none', color:link.soon?T.textMuted:T.textSecondary, background:T.surfaceHover, transition:'all .15s', opacity:link.soon?0.6:1 }}
                          onMouseEnter={e => { if(!link.soon){e.currentTarget.style.background=T.primaryLight; e.currentTarget.style.color=T.primary;}}}
                          onMouseLeave={e => { e.currentTarget.style.background=T.surfaceHover; e.currentTarget.style.color=link.soon?T.textMuted:T.textSecondary; }}>
                          <Icon path={link.icon} size={13} color="currentColor"/>
                          <span style={{ fontSize:'12.5px', fontFamily:'Inter,sans-serif', flex:1 }}>{link.label}</span>
                          {link.soon
                            ? <span style={{ fontSize:'9px', fontWeight:700, background:T.borderMed, color:T.textMuted, padding:'2px 6px', borderRadius:'4px' }}>SOON</span>
                            : <Icon path="M9 5l7 7-7 7" size={12} color="currentColor"/>
                          }
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer — sits naturally after all content */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCardInner({ s }) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:`${s.color}15`, border:`1px solid ${s.color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon path={s.icon} size={20} color={s.color}/>
        </div>
        {s.trend && (
          <span style={{ fontSize:'11.5px', fontWeight:600, color:T.green, background:T.greenLight, padding:'3px 9px', borderRadius:'99px', fontFamily:'Inter,sans-serif' }}>↑ {s.trend}</span>
        )}
      </div>
      <div className="sn-head" style={{ fontSize:'28px', fontWeight:900, color:s.color, lineHeight:1, marginBottom:'4px' }}>{s.value}</div>
      <div style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif', fontWeight:500 }}>{s.label}</div>
    </>
  );
}
