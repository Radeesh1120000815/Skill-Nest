import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import ResourceCard from '../components/resources/ResourceCard.jsx';
import SearchFilterBar from '../components/resources/SearchFilterBar.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';
import ResourceAssistant from '../components/ResourceAssistant';

// Font injection
if (!document.getElementById('sn-fonts')) {
  const l = document.createElement('link');
  l.id = 'sn-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
  document.head.appendChild(l);
}

// Sidebar nav items
const NAV = [
  { label:'Hub',         to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];


const HERO_SLIDES = [
  { type: 'text' },
  {
    type: 'image',
    src: '/hero-students.jpg',
    title: 'Learn Together',
    subtitle: 'Access thousands of peer-shared notes, slides and past papers — curated and reviewed by your community.',
    badge: '🎓 Student Community',
  },
  {
    type: 'image',
    src: '/hero-lecturer.jpg',
    title: 'Share Your Expertise',
    subtitle: 'Upload lecture slides, notes and resources. Track ratings and downloads from your students in real time.',
    badge: '👨‍🏫 Lecturer Portal',
  },
];

// Quick type filters 
const QUICK_TYPES = [
  { val:'NOTES',      label:'Notes',      icon:'📝', color:T.primary,   bg:'rgba(37,99,235,0.15)'    },
  { val:'SLIDES',     label:'Slides',     icon:'📊', color:T.secondary, bg:'rgba(139,92,246,0.15)'   },
  { val:'PAST_PAPER', label:'Past Papers',icon:'📄', color:T.yellow,    bg:'rgba(245,158,11,0.15)'   },
  { val:'LINK',       label:'Links',      icon:'🔗', color:T.cyan,      bg:'rgba(8,145,178,0.15)'    },
];

// Skeleton card 
const SkeletonCard = () => (
  <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(12px)', border:`1px solid ${T.border}`, borderRadius:'16px', padding:'22px', overflow:'hidden', position:'relative', minHeight:'200px' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(37,99,235,0.04),transparent)', backgroundSize:'400px 100%', animation:'snShimmer 1.5s ease-in-out infinite' }}/>
    {[35,80,55,100,65].map((w,i) => (
      <div key={i} style={{ height:i===1?'16px':'11px', background:'#EEF2FF', borderRadius:'5px', width:`${w}%`, marginBottom:i===4?0:'12px' }}/>
    ))}
  </div>
);


// MAIN COMPONENT

export default function ResourceHub() {
  const { resources, pagination, loading, fetchResources } = useResource();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem('userInfo') || 'null');

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
    .filter(([k, v]) => v && k !== 'sort' && k !== 'search').length;
  

  // UI-only state
  const [heroSlide,   setHeroSlide]   = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  // Auto-advance hero carousel every 5s
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  
    const navigate = useNavigate();
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/signin');   // 
    };

  // Stats for the glassmorphism cards above search
  const STATS = [
    { label:'Notes',      count: resources.filter(r => r.type === 'NOTES').length,      icon:'📝', color:T.primary,   light:T.primaryLight   },
    { label:'Slides',     count: resources.filter(r => r.type === 'SLIDES').length,     icon:'📊', color:T.secondary, light:T.secondaryLight },
    { label:'Past Papers',count: resources.filter(r => r.type === 'PAST_PAPER').length, icon:'📄', color:T.yellow,    light:T.yellowLight    },
    { label:'Links',      count: resources.filter(r => r.type === 'LINK').length,       icon:'🔗', color:T.cyan,      light:T.cyanLight      },
  ];

  return (
    <>
      {/* Injected styles */}
      <style>{`
        ${sharedStyles}

        /* Carousel slide */
        .sn-slide { animation: snSlide .4s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes snSlide {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }

        /*  Dot indicator */
        .sn-dot {
          width:8px; height:8px; border-radius:99px;
          cursor:pointer; transition:all .3s ease;
          border:none; padding:0;
        }
        .sn-dot.active { width:24px; background:white !important; }
        .sn-dot:not(.active) { background:rgba(255,255,255,0.35); }

        /*  Glassmorphism stat card hover */
        .sn-stat-card {
          transition: transform .2s ease, box-shadow .2s ease;
          cursor:default;
        }
        .sn-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(37,99,235,0.14) !important;
        }

        /* Resource card glassmorphism wrapper */
        .sn-res-card {
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s, border-color .18s;
        }
        .sn-res-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(37,99,235,0.16) !important;
          border-color: rgba(37,99,235,0.35) !important;
        }

        /* Quick type pill */
        .sn-pill {
          border-radius:999px; font-size:12.5px; font-weight:500;
          font-family:'Inter',sans-serif; cursor:pointer;
          transition:all .18s ease;
          display:inline-flex; align-items:center; gap:5px;
          padding:7px 16px;
        }
        .sn-pill:hover { transform:translateY(-1px); }

        /* Pagination  */
        .sn-pg {
          height:36px; border-radius:8px; font-size:13px; font-weight:500;
          font-family:'Inter',sans-serif; cursor:pointer; padding:0 14px;
          border:1px solid ${T.border}; background:${T.surface};
          color:${T.textSecondary}; transition:all .15s;
          box-shadow:0 1px 3px rgba(0,0,0,0.06);
        }
        .sn-pg:hover:not(:disabled) {
          border-color:${T.primary}; color:${T.primary};
          background:${T.primaryLight};
        }
        .sn-pg.active {
          background:${T.primary} !important; color:#fff !important;
          border-color:${T.primary} !important;
          box-shadow:${T.shadowBlue} !important;
        }
        .sn-pg:disabled { opacity:.35; cursor:not-allowed; }

        /* Staggered 3-col grid  */
        .sn-grid > * { animation: snFadeUp .36s ease both; }
        .sn-grid > *:nth-child(1)  { animation-delay:.03s }
        .sn-grid > *:nth-child(2)  { animation-delay:.08s }
        .sn-grid > *:nth-child(3)  { animation-delay:.13s }
        .sn-grid > *:nth-child(4)  { animation-delay:.18s }
        .sn-grid > *:nth-child(5)  { animation-delay:.23s }
        .sn-grid > *:nth-child(6)  { animation-delay:.28s }
        .sn-grid > *:nth-child(7)  { animation-delay:.33s }
        .sn-grid > *:nth-child(8)  { animation-delay:.38s }
        .sn-grid > *:nth-child(9)  { animation-delay:.43s }
      `}</style>

      {/* Page root  */}
      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column' , overflow: 'hidden'}}>

        
        <Navbar />

        {/* BODY (below Navbar)  */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight: 0 }}>

          {/*  Sidebar */}
          <aside
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{ width:sidebarOpen?'210px':'68px', flexShrink:0, flexDirection:'column', alignItems:sidebarOpen?'stretch':'center', paddingTop:'20px', paddingBottom:'20px', gap:'3px', background:T.surface, borderRight:`1px solid ${T.border}`, transition:'width .22s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden', boxShadow:sidebarOpen?'0 0 0 1px rgba(79,110,247,0.06), 4px 0 24px rgba(15,23,42,0.08)':T.shadowSm, zIndex:40 }}
          >
            {sidebarOpen && (
              <div style={{ padding:'0 16px 12px', fontSize:'10px', fontWeight:700, color:T.textMuted, letterSpacing:'0.10em', textTransform:'uppercase', fontFamily:'Inter,sans-serif' }}>
                Resources
              </div>
            )}
          
            {NAV.filter(n => !n.adminOnly || isAdmin).map(n => {
              const active = location.pathname === n.to && !n.isBack;
              return (
                <React.Fragment key={n.label}>
                  <Link to={n.to} className="sn-side-link" style={{ position:'relative', display:'flex', alignItems:'center', gap:'12px', padding:sidebarOpen?'12px 16px':'13px 0', justifyContent:sidebarOpen?'flex-start':'center', margin:'2px 8px', borderRadius:'12px', textDecoration:'none', color:n.isBack?T.textMuted:active?T.primary:T.textSecondary, background:active?T.primaryLight:'transparent', borderLeft:active?`3px solid ${T.primary}`:'3px solid transparent', fontWeight:active?600:400 }}>
                    <Icon path={n.icon} size={n.isBack?18:22} color={n.isBack?T.textMuted:active?T.primary:T.textSecondary}/>
                    {sidebarOpen && <span style={{ fontSize:n.isBack?'12px':'13.5px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif' }}>{n.label}</span>}
                    {!sidebarOpen && <span className="sn-tip">{n.label}</span>}
                  </Link>
                  {n.isBack && <div style={{ margin:'6px 16px', borderTop:`1px solid ${T.border}` }}/>}
                </React.Fragment>
              );
            })}
          
            {/* Logout + Live dot */}
            <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:'6px' }}>
              {sidebarOpen && user && (<div style={{margin:'0 8px', padding:'10px 14px',borderRadius:'12px', background: T.primaryLight,
              border:`1px solid ${T.border}`,display:'flex', alignItems:'center', gap:'10px',}}>
                <div style={{width:'30px', height:'30px', borderRadius:'8px',background: T.primary, display:'flex',alignItems:'center', justifyContent:'center',
                color:'white', fontSize:'13px', fontWeight:700,flexShrink:0,}}>
                  {user.name?.charAt(0).toUpperCase()} </div>
                  <div style={{ overflow:'hidden' }}>
                    <p style={{ fontSize:'12px', fontWeight:700, color: T.textPrimary, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>
                      {user.name?.split(' ')[0]}
                       </p>
                       <p style={{ fontSize:'10px', color: T.textMuted, fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>
                        {user.role}
                        </p>
                        </div>
                        </div>
                      )}
              <button onClick={handleLogout} className="sn-side-link"
                style={{ position:'relative', display:'flex', alignItems:'center', gap:'12px', padding:sidebarOpen?'12px 16px':'13px 0', justifyContent:sidebarOpen?'flex-start':'center', margin:'2px 8px', borderRadius:'12px', background:'transparent', border:'none', color:T.red, cursor:'pointer', transition:'all .18s ease', width:'calc(100% - 16px)' }}
                onMouseEnter={e => e.currentTarget.style.background=T.redLight}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={22} color={T.red}/>
                {sidebarOpen && <span style={{ fontSize:'13.5px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif', fontWeight:500 }}>Logout</span>}
                {!sidebarOpen && <span className="sn-tip">Logout</span>}
              </button>
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:'14px', display:'flex', justifyContent:'center', alignItems:'center', gap:'7px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:T.green, boxShadow:`0 0 8px ${T.green}90`, animation:'snPulse 2.5s ease-in-out infinite' }}/>
                {sidebarOpen && <span style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif', fontWeight:500 }}>Live</span>}
              </div>
            </div>
          </aside>

          {/*  Main content */}
          <main style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            {/*  HERO CAROUSEL*/}
            <div style={{
              position:'relative', overflow:'hidden', height:'340px',flexShrink:0,
              background:`linear-gradient(135deg, ${T.heroFrom} 0%, ${T.heroTo} 100%)`,
            }}>
              {/* Dot grid texture */}
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none', zIndex:1 }}/>
              {/* Glow orbs */}
              <div style={{ position:'absolute', top:'-60px', right:'-40px', width:'340px', height:'340px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)', filter:'blur(32px)', pointerEvents:'none', zIndex:1 }}/>
              <div style={{ position:'absolute', bottom:'-40px', left:'5%', width:'260px', height:'260px', borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)', filter:'blur(24px)', pointerEvents:'none', zIndex:1 }}/>

              {/*  Slide 0: Text content  */}
              {heroSlide === 0 && (
                <div className="sn-slide" key="slide-0" style={{ position:'absolute', inset:0, zIndex:2, display:'flex', alignItems:'center' }}>
                  <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 28px', width:'100%' }}>
                    {/* Live badge */}
                    <div style={{
                      display:'inline-flex', alignItems:'center', gap:'7px',
                      background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)',
                      borderRadius:'999px', padding:'5px 14px', marginBottom:'14px',
                      backdropFilter:'blur(8px)',
                    }}>
                      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:T.green, boxShadow:`0 0 8px ${T.green}`, animation:'snPulse 2s ease-in-out infinite', flexShrink:0 }}/>
                      <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', fontWeight:500, fontFamily:'Inter,sans-serif' }}>
                        {pagination.total || 0} resources available
                      </span>
                    </div>

                    {/* Title — no full stop */}
                    <h1 className="sn-head" style={{
                      fontWeight:800, fontSize:'clamp(28px,4.5vw,48px)',
                      lineHeight:1.06, marginBottom:'10px', letterSpacing:'-0.02em', color:'#FFFFFF',
                    }}>
                      Resource{' '}
                      <span style={{ background:'linear-gradient(90deg,#60A5FA,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                        Hub
                      </span>
                    </h1>

                    <p style={{ color:'rgba(255,255,255,0.60)', fontSize:'14.5px', maxWidth:'420px', lineHeight:1.65, fontFamily:'Inter,sans-serif', marginBottom:'20px' }}>
                      Discover lecture notes, slides, past papers and more — curated by your lecturers and peers.
                    </p>

                    {/* Quick-type pills */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {QUICK_TYPES.map(({ val, label, icon, color, bg }) => {
                        const active = filters.type === val;
                        return (
                          <button key={val}
                            onClick={() => handleFilterChange({ ...filters, type: active ? '' : val })}
                            className="sn-pill"
                            style={{
                              background: active ? color : 'rgba(67,56,202,0.45)',
                              border: `1px solid ${active ? color : 'rgba(255,255,255,0.18)'}`,
                              color: active ? '#fff' : 'rgba(255,255,255,0.78)',
                              boxShadow: active ? `0 2px 10px ${color}40` : 'none',
                            }}>
                            <span style={{ fontSize:'13px' }}>{icon}</span>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/*  Full-image slides*/}
              {heroSlide > 0 && (() => {
                const slide = HERO_SLIDES[heroSlide];
                return (
                  <div className="sn-slide" key={`slide-${heroSlide}`} style={{ position:'absolute', inset:0, zIndex:2 }}>
                    {/* Background image */}
                    <div style={{
                      position:'absolute', inset:0,
                      backgroundImage:`url(${slide.src})`,
                      backgroundSize:'cover', backgroundPosition:'center',
                      filter:'brightness(0.42)',
                    }}/>
                    {/* Gradient overlay */}
                    <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, rgba(22,22,51,0.85) 0%, rgba(55,48,163,0.55) 60%, transparent 100%)` }}/>
                    {/* Text overlay */}
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'0 28px' }}>
                      <div style={{ maxWidth:'520px', animation:'snFadeUp .4s ease' }}>
                        <span style={{ display:'inline-block', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:'99px', padding:'4px 14px', fontSize:'12px', color:'rgba(255,255,255,0.85)', fontFamily:'Inter,sans-serif', marginBottom:'14px', backdropFilter:'blur(8px)' }}>
                          {slide.badge}
                        </span>
                        <h2 className="sn-head" style={{ fontWeight:800, fontSize:'clamp(24px,3.5vw,40px)', color:'#fff', lineHeight:1.1, marginBottom:'10px', letterSpacing:'-0.02em' }}>
                          {slide.title}
                        </h2>
                        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px', lineHeight:1.65, fontFamily:'Inter,sans-serif' }}>
                          {slide.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/*  Dot indicators  */}
              <div style={{ position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'8px', zIndex:10 }}>
                {HERO_SLIDES.map((_, i) => (
                  <button key={i}
                    className={`sn-dot${heroSlide === i ? ' active' : ''}`}
                    onClick={() => setHeroSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/*  Prev / Next arrows  */}
              {[
                { dir:'prev', path:'M15 19l-7-7 7-7', action:() => setHeroSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), pos:'left:16px' },
                { dir:'next', path:'M9 5l7 7-7 7',   action:() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length),                       pos:'right:16px' },
              ].map(({ dir, path, action, pos }) => (
                <button key={dir} onClick={action} style={{
                  position:'absolute', top:'50%', transform:'translateY(-50%)',
                  [dir === 'prev' ? 'left' : 'right']: '16px',
                  width:'36px', height:'36px', borderRadius:'50%',
                  background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.22)',
                  backdropFilter:'blur(8px)', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  zIndex:10, transition:'all .18s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                >
                  <Icon path={path} size={16} color="white"/>
                </button>
              ))}
            </div>

            {/*  CONTENT AREA */}
            <div style={{ flex:1 , maxWidth:'1140px', margin:'0 auto', padding:'28px 22px 56px' }}>

              {/*Glassmorphism stats cards — above search */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
                {STATS.map(s => (
                  <div key={s.label} className="sn-stat-card" style={{
                    background:'rgba(255,255,255,0.72)',
                    backdropFilter:'blur(14px)',
                    WebkitBackdropFilter:'blur(14px)',
                    border:'1px solid rgba(255,255,255,0.55)',
                    borderRadius:'16px',
                    padding:'18px 20px',
                    boxShadow:'0 8px 32px rgba(37,99,235,0.08)',
                    backgroundImage:`radial-gradient(circle at 0% 0%, ${s.light} 0%, transparent 60%)`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ fontSize:'20px' }}>{s.icon}</span>
                      <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:s.light, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:'14px' }}>{s.icon}</span>
                      </div>
                    </div>
                    <div className="sn-head" style={{ fontSize:'26px', fontWeight:800, color:s.color, lineHeight:1 }}>
                      {s.count}
                    </div>
                    <div style={{ fontSize:'12px', color:T.textSecondary, fontFamily:'Inter,sans-serif', marginTop:'4px', fontWeight:500 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* SearchFilterBar  */}
              <div className="sn-search-zone" style={{ animation:'snFadeUp .4s ease both' }}>
                <SearchFilterBar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={handleClearFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>

              {/* Results summary */}
              {!loading && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'16px 0 14px' }}>
                  <p style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif' }}>
                    Showing{' '}
                    <span style={{ color:T.textPrimary, fontWeight:600 }}>{resources.length}</span>
                    {' '}of{' '}
                    <span style={{ color:T.textPrimary, fontWeight:600 }}>{pagination.total || 0}</span>
                    {' '}resources
                    {filters.search && <span style={{ color:T.primary }}> for "{filters.search}"</span>}
                  </p>
                  {activeFilterCount > 0 && (
                    <button onClick={handleClearFilters} style={{
                      fontSize:'12px', color:T.red, background:T.redLight,
                      border:'1px solid #FECACA', borderRadius:'7px',
                      cursor:'pointer', display:'flex', alignItems:'center', gap:'4px',
                      padding:'4px 10px', fontFamily:'Inter,sans-serif',
                    }}>
                      <Icon path="M6 18L18 6M6 6l12 12" size={11} color={T.red}/>
                      Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}

              {/* Resource Grid  */}
              {/* Grid is 3 columns. Cards are glassmorphism with light pattern */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : resources.length > 0 ? (
                <div className="sn-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {resources.map(r => (
                    <div key={r._id} className="sn-res-card" style={{
                      // Glassmorphism card container
                      background: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: `1px solid rgba(255,255,255,0.6)`,
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(37,99,235,0.08)',
                      // Light geometric pattern overlay
                      backgroundImage: [
                        'rgba(255,255,255,0.75)',
                        'radial-gradient(circle at 100% 0%, rgba(37,99,235,0.05) 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 100%, rgba(139,92,246,0.04) 0%, transparent 50%)',
                      ].join(', '),
                      position: 'relative',
                    }}>
                      {/* Subtle top accent line */}
                      <div style={{ height:'3px', background:`linear-gradient(90deg, ${T.primary}, ${T.secondary})`, opacity:0.6 }}/>
                      <ResourceCard resource={r} />
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
                    {filters.search || activeFilterCount > 0
                      ? 'Try adjusting your search or clearing the active filters.'
                      : 'Be the first to share a resource with your peers.'}
                  </p>
                  {(filters.search || activeFilterCount > 0) && (
                    <button onClick={handleClearFilters} className="sn-btn" style={{ padding:'10px 22px', fontSize:'13px' }}>
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}

              {/*  Pagination */}
              {pagination.pages > 1 && !loading && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'40px' }}>
                  <button className="sn-pg"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}>
                    ← Prev
                  </button>

                  <div style={{ display:'flex', gap:'4px' }}>
                    {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => {
                      const pg = i + 1;
                      return (
                        <button key={pg}
                          className={`sn-pg${currentPage === pg ? ' active' : ''}`}
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
                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={currentPage === pagination.pages}>
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

            <Footer />
            <ResourceAssistant />
          </main>
        </div>
      </div>
    </>
  );
}
