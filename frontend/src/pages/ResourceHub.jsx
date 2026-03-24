// Path: Frontend/src/pages/resources/ResourceHub.jsx
// ─── THEME: Kuppi Space–inspired light palette ────────────────────────────────
// White app bg · dark hero gradient · vibrant blue + soft purple accents
// ALL filtering / searching / sorting / pagination logic is 100% UNCHANGED.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import ResourceCard from '../components/resources/ResourceCard.jsx';
import SearchFilterBar from '../components/resources/SearchFilterBar.jsx';

// ── Font injection ────────────────────────────────────────────────────────────
if (!document.getElementById('sn-fonts')) {
  const l = document.createElement('link');
  l.id = 'sn-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
  document.head.appendChild(l);
}

// ── Design tokens (Kuppi Space palette) ──────────────────────────────────────
const T = {
  // App shell
  appBg:        '#F8FAFC',   // very light cool gray — main background
  surface:      '#FFFFFF',   // cards, sidebar, navbar
  surfaceHover: '#F1F5F9',   // hover state on surface
  border:       '#E2E8F0',   // subtle borders
  borderMed:    '#CBD5E1',   // medium borders

  // Hero gradient (dark, like the Kuppi hero card)
  heroFrom:     '#161633',   // deep navy
  heroTo:       '#3730A3',   // rich indigo
  heroPill:     'rgba(67,56,202,0.55)', // muted indigo pill bg

  // Primary brand
  primary:      '#2563EB',   // vibrant blue
  primaryLight: '#DBEAFE',   // blue tint bg
  primaryHover: '#1D4ED8',
  primaryGlow:  'rgba(37,99,235,0.18)',

  // Secondary
  secondary:    '#8B5CF6',   // soft purple
  secondaryLight:'#EDE9FE',

  // Text
  textPrimary:  '#1E293B',   // dark slate
  textSecondary:'#64748B',   // medium gray
  textMuted:    '#94A3B8',   // muted
  textOnDark:   '#FFFFFF',
  textOnDarkSub:'rgba(255,255,255,0.75)',

  // Accents
  orange:       '#F97316',
  orangeLight:  '#FFF7ED',
  green:        '#10B981',
  greenLight:   '#ECFDF5',
  yellow:       '#F59E0B',
  yellowLight:  '#FFFBEB',

  // Shadows
  shadowSm:     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:     '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
  shadowLg:     '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)',
  shadowBlue:   '0 4px 16px rgba(37,99,235,0.22)',
};

// ── Sidebar items ─────────────────────────────────────────────────────────────
const NAV = [
  { label:'Hub',         to:'/resources',             icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

const Icon = ({ path, size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={path}/>
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:'14px', padding:'20px', boxShadow:T.shadowSm, overflow:'hidden', position:'relative' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(37,99,235,0.04),transparent)', backgroundSize:'400px 100%', animation:'snShimmer 1.5s ease-in-out infinite' }}/>
    {[35,80,55,100,65].map((w,i) => (
      <div key={i} style={{ height: i===1?'15px':'11px', background:'#F1F5F9', borderRadius:'5px', width:`${w}%`, marginBottom: i===4?0:'10px' }}/>
    ))}
  </div>
);

// ── Quick type filters ────────────────────────────────────────────────────────
const QUICK_TYPES = [
  { val:'NOTES',      label:'Notes',       icon:'📝', color:T.primary,    bg:T.primaryLight  },
  { val:'SLIDES',     label:'Slides',      icon:'📊', color:T.secondary,  bg:T.secondaryLight},
  { val:'PAST_PAPER', label:'Past Papers', icon:'📄', color:T.yellow,     bg:T.yellowLight   },
  { val:'LINK',       label:'Links',       icon:'🔗', color:'#0891B2',    bg:'#ECFEFF'       },
];

// ── Role badge config ─────────────────────────────────────────────────────────
const ROLE_STYLE = {
  ADMIN:    { bg:'#FEF2F2', color:'#DC2626', border:'#FECACA' },
  LECTURER: { bg:T.secondaryLight, color:T.secondary, border:'#DDD6FE' },
  STUDENT:  { bg:T.primaryLight,   color:T.primary,   border:'#BFDBFE' },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ResourceHub() {
  // ════ ALL ORIGINAL LOGIC — UNTOUCHED ═════════════════════════════════════
  const { resources, pagination, loading, fetchResources } = useResource();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('user') || 'null');

  const [filters, setFilters] = useState({
    search:'', moduleCode:'', academicYear:'', semester:'', type:'', sort:'newest',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const loadResources = useCallback(() => {
    fetchResources({ ...filters, page: currentPage, limit: 12 });
  }, [filters, currentPage, fetchResources]);

  useEffect(() => { loadResources(); }, [loadResources]);

  const handleFilterChange = (f) => { setFilters(f); setCurrentPage(1); };
  const handleClearFilters = () => {
    setFilters({ search:'', moduleCode:'', academicYear:'', semester:'', type:'', sort:'newest' });
    setCurrentPage(1);
  };
  const activeFilterCount = Object.entries(filters)
    .filter(([k,v]) => v && k !== 'sort' && k !== 'search').length;
  // ════ END ORIGINAL LOGIC ═════════════════════════════════════════════════

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNav,   setMobileNav]   = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* ── Global styles ───────────────────────────────────────────── */}
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }

        @keyframes snShimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes snFadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes snFadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes snPulse {
          0%,100% { transform:scale(1);   opacity:1; }
          50%     { transform:scale(1.15);opacity:.7; }
        }
        @keyframes snFloat {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-5px); }
        }

        .sn-page { font-family:'Inter',sans-serif; }
        .sn-head { font-family:'Plus Jakarta Sans',sans-serif; }

        /* ── Nav link hover ── */
        .sn-topnav-link { transition: color .15s, background .15s; }
        .sn-topnav-link:hover { color: ${T.primary} !important; background: ${T.primaryLight} !important; }

        /* ── Sidebar link hover ── */
        .sn-side-link { transition: all .18s ease; }
        .sn-side-link:hover {
          background: ${T.primaryLight} !important;
          color: ${T.primary} !important;
        }

        /* ── Primary button ── */
        .sn-btn {
          background: ${T.primary};
          color: #fff; border:none; border-radius:10px;
          font-family:'Inter',sans-serif; font-weight:600;
          cursor:pointer; display:inline-flex; align-items:center; gap:7px;
          transition: all .18s ease;
          box-shadow: ${T.shadowBlue};
        }
        .sn-btn:hover { background:${T.primaryHover}; transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.30); }
        .sn-btn:active { transform:scale(0.97); }

        /* ── Ghost button ── */
        .sn-btn-ghost {
          background:transparent; border:1px solid ${T.border};
          color:${T.textSecondary}; border-radius:9px;
          font-family:'Inter',sans-serif; font-weight:500;
          cursor:pointer; transition:all .15s;
        }
        .sn-btn-ghost:hover { border-color:${T.primary}; color:${T.primary}; background:${T.primaryLight}; }

        /* ── Card hover ── */
        .sn-card {
          transition: transform .22s cubic-bezier(.34,1.56,.64,1),
                      box-shadow .22s ease, border-color .18s ease;
        }
        .sn-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.14) !important;
          border-color: ${T.primary}40 !important;
        }

        /* ── Quick type pill ── */
        .sn-pill {
          border-radius:999px; font-size:12.5px; font-weight:500;
          font-family:'Inter',sans-serif; cursor:pointer;
          transition:all .18s ease;
          display:inline-flex; align-items:center; gap:5px;
          border:1px solid transparent;
        }
        .sn-pill:hover { transform:translateY(-1px); }

        /* ── Search area overrides ── */
        .sn-search-zone input,
        .sn-search-zone select {
          background: ${T.surface}  !important;
          border-color: ${T.border} !important;
          color: ${T.textPrimary}   !important;
          caret-color: ${T.primary} !important;
          font-family:'Inter',sans-serif !important;
          border-radius:10px !important;
        }
        .sn-search-zone input::placeholder { color:${T.textMuted} !important; }
        .sn-search-zone input:focus,
        .sn-search-zone select:focus {
          border-color: ${T.primary}80 !important;
          box-shadow: 0 0 0 3px ${T.primaryGlow} !important;
          outline:none !important;
          color:${T.textPrimary} !important;
        }
        .sn-search-zone select option { background:${T.surface}; color:${T.textPrimary}; }

        /* ── Pagination button ── */
        .sn-pg {
          height:36px; border-radius:8px; font-size:13px; font-weight:500;
          font-family:'Inter',sans-serif; cursor:pointer; padding:0 14px;
          border:1px solid ${T.border}; background:${T.surface};
          color:${T.textSecondary}; transition:all .15s; box-shadow:${T.shadowSm};
        }
        .sn-pg:hover:not(:disabled) {
          border-color:${T.primary}; color:${T.primary};
          background:${T.primaryLight}; box-shadow:${T.shadowBlue};
        }
        .sn-pg.active {
          background:${T.primary} !important; color:#fff !important;
          border-color:${T.primary} !important;
          box-shadow:${T.shadowBlue} !important;
        }
        .sn-pg:disabled { opacity:.35; cursor:not-allowed; }

        /* ── Staggered card entrance ── */
        .sn-grid > * { animation: snFadeUp .35s ease both; }
        .sn-grid > *:nth-child(1)  { animation-delay:.03s }
        .sn-grid > *:nth-child(2)  { animation-delay:.07s }
        .sn-grid > *:nth-child(3)  { animation-delay:.11s }
        .sn-grid > *:nth-child(4)  { animation-delay:.15s }
        .sn-grid > *:nth-child(5)  { animation-delay:.19s }
        .sn-grid > *:nth-child(6)  { animation-delay:.23s }
        .sn-grid > *:nth-child(7)  { animation-delay:.27s }
        .sn-grid > *:nth-child(8)  { animation-delay:.31s }
        .sn-grid > *:nth-child(9)  { animation-delay:.35s }
        .sn-grid > *:nth-child(10) { animation-delay:.39s }
        .sn-grid > *:nth-child(11) { animation-delay:.43s }
        .sn-grid > *:nth-child(12) { animation-delay:.47s }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:${T.appBg}; }
        ::-webkit-scrollbar-thumb { background:${T.borderMed}; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:${T.primary}; }

        /* ── Sidebar tooltip ── */
        .sn-tip {
          position:absolute; left:calc(100% + 10px); top:50%; transform:translateY(-50%);
          background:${T.textPrimary}; color:#fff;
          border-radius:7px; padding:5px 10px; font-size:12px; white-space:nowrap;
          pointer-events:none; opacity:0; transition:opacity .12s;
          font-family:'Inter',sans-serif; z-index:200;
          box-shadow:${T.shadowMd};
        }
        .sn-side-link:hover .sn-tip { opacity:1; }
      `}</style>

      {/* ── Page shell ──────────────────────────────────────────────── */}
      <div className="sn-page" style={{ minHeight:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column' }}>

        {/* ══ NAVBAR ════════════════════════════════════════════════ */}
        <nav style={{
          position:'sticky', top:0, zIndex:50,
          background:T.surface, borderBottom:`1px solid ${T.border}`,
          height:'60px', padding:'0 24px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          boxShadow:T.shadowSm, flexShrink:0,
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'9px' }}>
            <div style={{
              width:'34px', height:'34px', borderRadius:'9px',
              background:`linear-gradient(135deg,${T.primary},${T.secondary})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:T.shadowBlue, flexShrink:0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <div className="sn-head" style={{ fontWeight:800, fontSize:'15px', color:T.textPrimary, lineHeight:1.1 }}>SkillNest</div>
              <div style={{ fontSize:'10px', color:T.textMuted, fontWeight:500 }}>Resource Hub</div>
            </div>
          </Link>

          {/* Centre links */}
          <div className="hidden md:flex" style={{ alignItems:'center', gap:'2px' }}>
            {[{l:'Home',t:'/'},{l:'Resources',t:'/resources'},{l:'Sessions',t:'/sessions'},{l:'Help Center',t:'/help'}].map(({l,t}) => {
              const active = location.pathname === t;
              return (
                <Link key={l} to={t} className="sn-topnav-link" style={{
                  padding:'6px 13px', borderRadius:'8px', fontSize:'13.5px',
                  fontWeight: active ? 600 : 400,
                  color:  active ? T.primary : T.textSecondary,
                  background: active ? T.primaryLight : 'transparent',
                  textDecoration:'none',
                }}>{l}</Link>
              );
            })}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%',
                  background:`linear-gradient(135deg,${T.secondary},${T.primary})`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'13px', fontWeight:700, color:'white',
                  border:`2px solid ${T.primaryLight}`, flexShrink:0,
                  boxShadow:T.shadowSm,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div style={{ fontSize:'13px', fontWeight:600, color:T.textPrimary, lineHeight:1.2 }}>{user.name?.split(' ')[0]}</div>
                  <div style={{ fontSize:'10px', color:T.textMuted }}>{user.role}</div>
                </div>
                {(() => {
                  const rs = ROLE_STYLE[user.role] || ROLE_STYLE.STUDENT;
                  return (
                    <span className="hidden md:block" style={{ fontSize:'10px', fontWeight:600, padding:'3px 8px', borderRadius:'99px', background:rs.bg, color:rs.color, border:`1px solid ${rs.border}` }}>
                      {user.role}
                    </span>
                  );
                })()}
              </div>
            ) : (
              <Link to="/login" className="sn-btn" style={{ padding:'8px 18px', fontSize:'13px', textDecoration:'none' }}>
                Sign In
              </Link>
            )}
            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden"
              style={{ background:'none', border:'none', color:T.textSecondary, cursor:'pointer', padding:'4px' }}>
              <Icon path={mobileNav?"M6 18L18 6M6 6l12 12":"M4 6h16M4 12h16M4 18h16"} size={20}/>
            </button>
          </div>
        </nav>

        {/* Mobile nav */}
        {mobileNav && (
          <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'10px 20px', zIndex:49, animation:'snFadeIn .15s ease', boxShadow:T.shadowMd }}>
            {[{l:'Home',t:'/'},{l:'Resources',t:'/resources'},{l:'Sessions',t:'/sessions'},{l:'Help Center',t:'/help'}].map(({l,t}) => (
              <Link key={l} to={t} onClick={() => setMobileNav(false)}
                style={{ display:'block', padding:'10px 0', color:T.textSecondary, textDecoration:'none', fontSize:'14px', borderBottom:`1px solid ${T.border}` }}>{l}</Link>
            ))}
          </div>
        )}

        {/* ══ BODY ══════════════════════════════════════════════════ */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{
              width: sidebarOpen ? '200px' : '60px',
              flexShrink:0, flexDirection:'column',
              alignItems: sidebarOpen ? 'stretch' : 'center',
              paddingTop:'16px', paddingBottom:'20px', gap:'2px',
              background:T.surface, borderRight:`1px solid ${T.border}`,
              transition:'width .22s cubic-bezier(0.4,0,0.2,1)',
              overflow:'hidden', position:'sticky', top:'60px',
              height:'calc(100vh - 60px)', boxShadow: sidebarOpen ? T.shadowMd : 'none',
            }}
          >
            {/* Section label */}
            {sidebarOpen && (
              <div style={{ padding:'0 14px 8px', fontSize:'10px', fontWeight:700, color:T.textMuted, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                Resources
              </div>
            )}

            {NAV.filter(n => !n.adminOnly || isAdmin).map(n => {
              const active = location.pathname === n.to;
              return (
                <Link key={n.label} to={n.to} className="sn-side-link" style={{
                  position:'relative', display:'flex', alignItems:'center', gap:'10px',
                  padding: sidebarOpen ? '10px 14px' : '10px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  margin:'1px 8px', borderRadius:'10px', textDecoration:'none',
                  color:  active ? T.primary : T.textSecondary,
                  background: active ? T.primaryLight : 'transparent',
                  borderLeft: active ? `3px solid ${T.primary}` : '3px solid transparent',
                  fontWeight: active ? 600 : 400,
                }}>
                  <Icon path={n.icon} size={17} color={active ? T.primary : T.textSecondary}/>
                  {sidebarOpen && (
                    <span style={{ fontSize:'13px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif' }}>{n.label}</span>
                  )}
                  {!sidebarOpen && <span className="sn-tip">{n.label}</span>}
                </Link>
              );
            })}

            {/* Bottom — divider + version dot */}
            <div style={{ marginTop:'auto', borderTop:`1px solid ${T.border}`, paddingTop:'14px', display:'flex', justifyContent:'center', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:T.green, boxShadow:`0 0 6px ${T.green}60`, animation:'snPulse 2.5s ease-in-out infinite' }}/>
              {sidebarOpen && <span style={{ fontSize:'11px', color:T.textMuted }}>Live</span>}
            </div>
          </aside>

          {/* ── Main ───────────────────────────────────────────── */}
          <main style={{ flex:1, overflowY:'auto', minWidth:0 }}>

            {/* ── HERO — dark gradient like Kuppi hero card ──── */}
            <div style={{
              position:'relative', overflow:'hidden',
              background:`linear-gradient(135deg, ${T.heroFrom} 0%, ${T.heroTo} 100%)`,
              padding:'44px 28px 40px',
              borderBottom:`1px solid ${T.border}`,
            }}>
              {/* Radial glow overlays */}
              <div style={{ position:'absolute', top:'-40px', right:'-30px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 65%)', filter:'blur(30px)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:'-30px', left:'5%', width:'240px', height:'240px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)', filter:'blur(24px)', pointerEvents:'none' }}/>
              {/* Subtle dot grid */}
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>

              <div style={{ position:'relative', zIndex:2, maxWidth:'940px', margin:'0 auto' }}>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:'24px' }}>

                  <div style={{ animation:'snFadeUp .45s ease both' }}>
                    {/* Live badge */}
                    <div style={{
                      display:'inline-flex', alignItems:'center', gap:'7px',
                      background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)',
                      borderRadius:'999px', padding:'5px 14px', marginBottom:'16px',
                      backdropFilter:'blur(8px)',
                    }}>
                      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:T.green, boxShadow:`0 0 8px ${T.green}`, animation:'snPulse 2s ease-in-out infinite', flexShrink:0 }}/>
                      <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', fontWeight:500, fontFamily:'Inter,sans-serif' }}>
                        {pagination.total || 0} resources available
                      </span>
                    </div>

                    <h1 className="sn-head" style={{
                      fontWeight:800, fontSize:'clamp(26px,4.5vw,46px)',
                      lineHeight:1.08, marginBottom:'10px', letterSpacing:'-0.02em', color:'#FFFFFF',
                    }}>
                      Resource{' '}
                      <span style={{ background:`linear-gradient(90deg, #60A5FA, #A78BFA)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                        Hub.
                      </span>
                    </h1>

                    <p style={{ color:'rgba(255,255,255,0.60)', fontSize:'14.5px', maxWidth:'450px', lineHeight:1.65, fontFamily:'Inter,sans-serif' }}>
                      Discover lecture notes, slides, past papers and more — curated by your lecturers and peers.
                    </p>

                    {/* Quick-type filter pills */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'22px' }}>
                      {QUICK_TYPES.map(({val,label,icon,color,bg}) => {
                        const active = filters.type === val;
                        return (
                          <button key={val}
                            onClick={() => handleFilterChange({...filters, type: active ? '' : val})}
                            className="sn-pill"
                            style={{
                              padding:'6px 14px',
                              background: active ? color : T.heroPill,
                              border: `1px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
                              color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                              boxShadow: active ? `0 2px 10px ${color}40` : 'none',
                            }}>
                            <span style={{ fontSize:'13px' }}>{icon}</span> {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload CTA */}
                  {user && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px', animation:'snFadeUp .45s .08s ease both' }}>
                      <Link to="/upload-resource" className="sn-btn"
                        style={{ padding:'12px 24px', fontSize:'14px', textDecoration:'none', background:'#FFFFFF', color:T.primary, boxShadow:T.shadowLg }}>
                        <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={15} color={T.primary}/>
                        Upload Resource
                      </Link>
                      {/* Stats row */}
                      <div style={{ display:'flex', gap:'12px' }}>
                        {[
                          { val:T.green,  label:`${resources.filter(r=>r.type==='NOTES').length} Notes` },
                          { val:T.yellow, label:`${resources.filter(r=>r.type==='PAST_PAPER').length} Papers` },
                          { val:'#60A5FA',label:`${resources.filter(r=>r.type==='SLIDES').length} Slides` },
                        ].map(s => (
                          <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:s.val }}/>
                            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', fontFamily:'Inter,sans-serif' }}>{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Search + Grid ─────────────────────────────────── */}
            <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px 22px 56px' }}>

              {/* SearchFilterBar */}
              <div className="sn-search-zone" style={{ animation:'snFadeUp .4s ease both' }}>
                <SearchFilterBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={handleClearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>

              {/* Results bar */}
              {!loading && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'16px 0 14px', animation:'snFadeIn .3s ease' }}>
                  <p style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif' }}>
                    Showing{' '}
                    <span style={{ color:T.textPrimary, fontWeight:600 }}>{resources.length}</span>
                    {' '}of{' '}
                    <span style={{ color:T.textPrimary, fontWeight:600 }}>{pagination.total||0}</span>
                    {' '}resources
                    {filters.search && <span style={{ color:T.primary }}> for "{filters.search}"</span>}
                  </p>
                  {activeFilterCount > 0 && (
                    <button onClick={handleClearFilters} style={{
                      fontSize:'12px', color:'#EF4444', background:'#FEF2F2',
                      border:'1px solid #FECACA', borderRadius:'7px',
                      cursor:'pointer', display:'flex', alignItems:'center', gap:'4px',
                      padding:'4px 10px', fontFamily:'Inter,sans-serif', transition:'all .15s',
                    }}>
                      <Icon path="M6 18L18 6M6 6l12 12" size={11} color="#EF4444"/>
                      Clear {activeFilterCount} filter{activeFilterCount>1?'s':''}
                    </button>
                  )}
                </div>
              )}

              {/* ── Grid — ALL LOGIC UNCHANGED ──────────────────── */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({length:8}).map((_,i) => <SkeletonCard key={i}/>)}
                </div>
              ) : resources.length > 0 ? (
                <div className="sn-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {resources.map(r => (
                    <div key={r._id} className="sn-card" style={{
                      border:`1px solid ${T.border}`, borderRadius:'14px',
                      overflow:'hidden', background:T.surface,
                      boxShadow:T.shadowSm,
                    }}>
                      <ResourceCard resource={r}/>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center', animation:'snFadeUp .4s ease' }}>
                  <div style={{
                    width:'72px', height:'72px', borderRadius:'20px',
                    background:T.primaryLight, border:`1px solid ${T.border}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginBottom:'18px', animation:'snFloat 4s ease-in-out infinite',
                    boxShadow:T.shadowSm,
                  }}>
                    <Icon path="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" size={32} color={T.primary}/>
                  </div>
                  <h3 className="sn-head" style={{ fontSize:'20px', fontWeight:700, color:T.textPrimary, marginBottom:'8px' }}>
                    No resources found
                  </h3>
                  <p style={{ color:T.textSecondary, fontSize:'14px', maxWidth:'300px', lineHeight:1.65, fontFamily:'Inter,sans-serif', marginBottom:'20px' }}>
                    {filters.search||activeFilterCount>0
                      ? 'Try adjusting your search or clearing the active filters.'
                      : 'Be the first to share a resource with your peers.'}
                  </p>
                  {(filters.search||activeFilterCount>0) && (
                    <button onClick={handleClearFilters} className="sn-btn" style={{ padding:'10px 22px', fontSize:'13px' }}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {/* ── Pagination — ALL LOGIC UNCHANGED ────────────── */}
              {pagination.pages > 1 && !loading && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'40px', animation:'snFadeIn .3s ease' }}>
                  <button className="sn-pg"
                    onClick={() => setCurrentPage(p => Math.max(1,p-1))}
                    disabled={currentPage===1}>
                    ← Prev
                  </button>

                  <div style={{ display:'flex', gap:'4px' }}>
                    {Array.from({length:Math.min(pagination.pages,7)}).map((_,i) => {
                      const pg = i+1;
                      return (
                        <button key={pg}
                          className={`sn-pg${currentPage===pg?' active':''}`}
                          onClick={() => setCurrentPage(pg)}
                          style={{ width:'36px', padding:'0' }}>
                          {pg}
                        </button>
                      );
                    })}
                    {pagination.pages > 7 && (
                      <span style={{ color:T.textMuted, display:'flex', alignItems:'center', padding:'0 4px', fontSize:'13px' }}>…</span>
                    )}
                  </div>

                  <button className="sn-pg"
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages,p+1))}
                    disabled={currentPage===pagination.pages}>
                    Next →
                  </button>
                </div>
              )}

              {pagination.pages > 1 && !loading && (
                <p style={{ textAlign:'center', marginTop:'10px', fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>
                  Page {currentPage} of {pagination.pages}
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
