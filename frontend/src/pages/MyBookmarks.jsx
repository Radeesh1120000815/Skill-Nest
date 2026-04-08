import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ResourceBanner from '../components/resources/ResourceBanner.jsx';
import { T, Icon, sharedStyles, typeStyle } from '../components/resources/theme.jsx';

//  Intent config 
const INTENT_CONFIG = {
  EXAM:         { label:'Exam Revision',        icon:'📝', color:'#EF4444', light:'#FEF2F2', border:'#FECACA' },
  CONCEPT:      { label:'Concept Clarification', icon:'💡', color:T.primary, light:T.primaryLight, border:'#BFDBFE' },
  ASSIGNMENT:   { label:'Assignment Prep',        icon:'📋', color:T.secondary, light:T.secondaryLight, border:'#DDD6FE' },
  QUICK_REVIEW: { label:'Quick Review',           icon:'⚡', color:T.yellow, light:T.yellowLight, border:'#FDE68A' },
};

const TYPE_ICONS = { NOTES:'📝', SLIDES:'📊', PAST_PAPER:'📄', LINK:'🔗', OTHER:'📁' };
const PAGE_SIZE  = 9;

// Sidebar NAV 
const NAV = [
  { label:'Back to Hub', to:'/resources',              icon:'M10 19l-7-7m0 0l7-7m-7 7h18', isBack:true },
  { label:'Hub',         to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

// Skeleton 
const SkeletonCard = () => (
  <div style={{ background:'#FFFFFF', border:`1px solid ${T.border}`, borderRadius:'18px', padding:'20px', overflow:'hidden', position:'relative', minHeight:'180px' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(79,110,247,0.04),transparent)', backgroundSize:'400px 100%', animation:'snShimmer 1.5s ease-in-out infinite' }}/>
    <div style={{ height:'10px', background:'#EEF2FF', borderRadius:'5px', width:'45%', marginBottom:'14px' }}/>
    <div style={{ height:'14px', background:'#EEF2FF', borderRadius:'5px', width:'80%', marginBottom:'8px' }}/>
    <div style={{ height:'10px', background:'#F1F5F9', borderRadius:'5px', width:'55%', marginBottom:'16px' }}/>
    <div style={{ display:'flex', gap:'6px' }}>
      {[50,60,55].map((w,i) => <div key={i} style={{ height:'20px', background:'#F1F5F9', borderRadius:'5px', width:`${w}px` }}/>)}
    </div>
  </div>
);

// 
export default function MyBookmarks() {
  
  const { myBookmarks, fetchMyBookmarks, removeBookmark, loading } = useResource();
  const [activeIntent, setActiveIntent] = useState('');
  const [removing,     setRemoving]     = useState(null);

  useEffect(() => { fetchMyBookmarks(activeIntent); }, [activeIntent]);

  const handleRemove = async (resourceId, title) => {
    if (!window.confirm(`Remove "${title}" from bookmarks?`)) return;
    setRemoving(resourceId);
    await removeBookmark(resourceId);
    setRemoving(null);
  };

  const counts = Object.keys(INTENT_CONFIG).reduce((acc, key) => {
    acc[key] = myBookmarks.filter((b) => b.intent === key).length;
    return acc;
  }, {});

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(myBookmarks.length / PAGE_SIZE);
  const paginated  = myBookmarks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleIntentChange = (key) => {
    setActiveIntent(key);
    setCurrentPage(1);
  };
  
  // UI-only
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isAdmin     = user?.role === 'ADMIN';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        ${sharedStyles}

        @keyframes snShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes snFadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes snPulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }

        .mb-intent-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 14px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all .2s ease;
          border: 1.5px solid transparent;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          white-space: nowrap;
        }
        .mb-intent-tab:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.10); }

        .mb-card {
          background: #FFFFFF;
          border: 1px solid ${T.border};
          border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease, border-color .18s;
          animation: snFadeUp .35s ease both;
          box-shadow: 0 2px 10px rgba(15,23,42,0.07);
        }
        .mb-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 36px rgba(79,110,247,0.15);
          border-color: rgba(79,110,247,0.28);
        }

        .mb-action {
          flex: 1; text-align: center; padding: 9px 14px;
          border-radius: 10px; border: none;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .15s; text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }

        .mb-pg {
          height: 36px; min-width: 36px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer; padding: 0 12px;
          border: 1px solid ${T.border}; background: white;
          color: ${T.textSecondary}; transition: all .15s;
        }
        .mb-pg:hover:not(:disabled) { border-color: ${T.primary}; color: ${T.primary}; background: ${T.primaryLight}; }
        .mb-pg.active { background: ${T.primary} !important; color: white !important; border-color: ${T.primary} !important; box-shadow: ${T.shadowBlue}; }
        .mb-pg:disabled { opacity: .35; cursor: not-allowed; }

        .mb-grid > .mb-card:nth-child(1) { animation-delay:.03s }
        .mb-grid > .mb-card:nth-child(2) { animation-delay:.08s }
        .mb-grid > .mb-card:nth-child(3) { animation-delay:.13s }
        .mb-grid > .mb-card:nth-child(4) { animation-delay:.18s }
        .mb-grid > .mb-card:nth-child(5) { animation-delay:.23s }
        .mb-grid > .mb-card:nth-child(6) { animation-delay:.28s }
        .mb-grid > .mb-card:nth-child(7) { animation-delay:.33s }
        .mb-grid > .mb-card:nth-child(8) { animation-delay:.38s }
        .mb-grid > .mb-card:nth-child(9) { animation-delay:.43s }
      `}</style>

      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        <Navbar />

        {/*  Body  */}
        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* Sidebar */}
          <aside
            onMouseEnter={() => setSidebarOpen(true)}
            onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{
              width: sidebarOpen ? '210px' : '68px',
              flexShrink:0, flexDirection:'column',
              alignItems: sidebarOpen ? 'stretch' : 'center',
              paddingTop:'20px', paddingBottom:'20px', gap:'3px',
              background:T.surface, borderRight:`1px solid ${T.border}`,
              transition:'width .22s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: sidebarOpen ? '0 0 0 1px rgba(79,110,247,0.06), 4px 0 24px rgba(15,23,42,0.08)' : T.shadowSm,
              zIndex:40,
            }}
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
                  <Link to={n.to} className="sn-side-link" style={{
                    position:'relative', display:'flex', alignItems:'center', gap:'12px',
                    padding: sidebarOpen ? '12px 16px' : '13px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    margin:'2px 8px', borderRadius:'12px', textDecoration:'none',
                    color:  n.isBack ? T.textMuted : active ? T.primary : T.textSecondary,
                    background: active ? T.primaryLight : 'transparent',
                    borderLeft: active ? `3px solid ${T.primary}` : '3px solid transparent',
                    fontWeight: active ? 600 : 400,
                  }}>
                    <Icon path={n.icon} size={n.isBack ? 18 : 22} color={n.isBack ? T.textMuted : active ? T.primary : T.textSecondary}/>
                    {sidebarOpen && (
                      <span style={{ fontSize: n.isBack ? '12px' : '13.5px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif' }}>
                        {n.label}
                      </span>
                    )}
                    {!sidebarOpen && <span className="sn-tip">{n.label}</span>}
                  </Link>
                  {n.isBack && <div style={{ margin:'6px 16px', borderTop:`1px solid ${T.border}` }}/>}
                </React.Fragment>
              );
            })}

            {/* Bottom: logout + live */}
            <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:'6px' }}>
              {sidebarOpen && user && (<div style={{margin:'0 8px', padding:'10px 14px',borderRadius:'12px', background: T.primaryLight,border:`1px solid ${T.border}`,display:'flex', alignItems:'center', gap:'10px',}}>
                <div style={{width:'30px', height:'30px', borderRadius:'8px',background: T.primary, display:'flex',alignItems:'center', justifyContent:'center',color:'white', fontSize:'13px', fontWeight:700,flexShrink:0,}}>
                  {user.name?.charAt(0).toUpperCase()} 
                </div>
                <div style={{ overflow:'hidden' }}>
                  <p style={{ fontSize:'12px', fontWeight:700, color: T.textPrimary, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>
                    {user.name?.split(' ')[0]}</p>
                    <p style={{ fontSize:'10px', color: T.textMuted, fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>
                      {user.role}</p>
                      </div>
                </div>)}

              {/* Logout */}
              <button onClick={handleLogout} className="sn-side-link" style={{
                position:'relative', display:'flex', alignItems:'center', gap:'12px',
                padding: sidebarOpen ? '12px 16px' : '13px 0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                margin:'2px 8px', borderRadius:'12px',
                background:'transparent', border:'none',
                color: T.red, cursor:'pointer',
                transition:'all .18s ease', width:'calc(100% - 16px)',
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.redLight}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={22} color={T.red}/>
                {sidebarOpen && (
                  <span style={{ fontSize:'13.5px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif', fontWeight:500 }}>
                    Logout
                  </span>
                )}
                {!sidebarOpen && <span className="sn-tip">Logout</span>}
              </button>

              {/* Live dot */}
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:'14px', display:'flex', justifyContent:'center', alignItems:'center', gap:'7px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:T.green, boxShadow:`0 0 8px ${T.green}90`, animation:'snPulse 2.5s ease-in-out infinite' }}/>
                {sidebarOpen && <span style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif', fontWeight:500 }}>Live</span>}
              </div>
            </div>
          </aside>

          {/*Main */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            <ResourceBanner
              title="My Bookmarks"
              subtitle="Your personal study resource collection, organised by intent."
            />

            <main style={{ flex:1, position:'relative', }}>

              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/upload-bg.png)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.06, pointerEvents:'none', zIndex:0 }}/>

              <div style={{ position:'relative', zIndex:1, maxWidth:'1100px', margin:'0 auto', padding:'28px 22px 56px' }}>

                {/* Intent filter tabs */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'28px' }}>
                  <button className="mb-intent-tab" onClick={() => handleIntentChange('')}
                    style={{ background: activeIntent==='' ? T.primary : T.surface, color: activeIntent==='' ? 'white' : T.textSecondary, borderColor: activeIntent==='' ? T.primary : T.border, fontWeight: activeIntent==='' ? 700 : 500 }}>
                    <span style={{ fontSize:'15px' }}>📚</span>
                    All
                    <span style={{ minWidth:'22px', height:'22px', borderRadius:'99px', padding:'0 6px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, background: activeIntent==='' ? 'rgba(255,255,255,0.22)' : T.primaryLight, color: activeIntent==='' ? 'white' : T.primary }}>
                      {myBookmarks.length}
                    </span>
                  </button>

                  {Object.entries(INTENT_CONFIG).map(([key, cfg]) => (
                    <button key={key} className="mb-intent-tab" onClick={() => handleIntentChange(key)}
                      style={{ background: activeIntent===key ? cfg.color : cfg.light, color: activeIntent===key ? 'white' : cfg.color, borderColor: activeIntent===key ? cfg.color : cfg.border, fontWeight: activeIntent===key ? 700 : 500 }}>
                      <span style={{ fontSize:'15px' }}>{cfg.icon}</span>
                      {cfg.label}
                      <span style={{ minWidth:'22px', height:'22px', borderRadius:'99px', padding:'0 6px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, background: activeIntent===key ? 'rgba(255,255,255,0.22)' : `${cfg.color}18`, color: activeIntent===key ? 'white' : cfg.color }}>
                        {counts[key]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Results count */}
                {!loading && myBookmarks.length > 0 && (
                  <p style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif', marginBottom:'16px' }}>
                    <span style={{ color:T.textPrimary, fontWeight:600 }}>{myBookmarks.length}</span>{' '}
                    bookmark{myBookmarks.length !== 1 ? 's' : ''}
                    {activeIntent && <span style={{ color:T.primary }}> · {INTENT_CONFIG[activeIntent]?.label}</span>}
                  </p>
                )}

                {/* Loading */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1,2,3,4,5,6].map(i => <SkeletonCard key={i}/>)}
                  </div>

                ) : myBookmarks.length === 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center', animation:'snFadeUp .4s ease' }}>
                    <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'rgba(255,255,255,0.90)', border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', marginBottom:'20px', boxShadow:T.shadowMd, animation:'snFloat 4s ease-in-out infinite' }}>
                      🔖
                    </div>
                    <h3 className="sn-head" style={{ fontSize:'22px', fontWeight:800, color:T.textPrimary, marginBottom:'8px' }}>
                      {activeIntent ? `No ${INTENT_CONFIG[activeIntent]?.label} bookmarks` : 'No bookmarks yet'}
                    </h3>
                    <p style={{ color:T.textSecondary, fontSize:'14px', maxWidth:'320px', lineHeight:1.65, fontFamily:'Inter,sans-serif', marginBottom:'24px' }}>
                      {activeIntent ? 'Try a different study intent filter.' : 'Browse resources and bookmark them with a study intent to organise your learning.'}
                    </p>
                    <Link to="/resources" className="sn-btn" style={{ padding:'11px 24px', fontSize:'14px' }}>
                      Browse Resources
                    </Link>
                  </div>

                ) : (
                  <>
                    <div className="mb-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {paginated.map((bookmark) => {
                        const r = bookmark.resourceId;
                        if (!r) return null;
                        const intent = INTENT_CONFIG[bookmark.intent];
                        const ts     = typeStyle(r.type);

                        return (
                          <div key={bookmark._id} className="mb-card">
                            <div style={{ height:'4px', background:`linear-gradient(90deg, ${intent?.color}, ${intent?.color}88)` }}/>
                            <div style={{ padding:'10px 16px 8px', display:'flex', alignItems:'center', gap:'6px', borderBottom:`1px solid ${intent?.border || T.border}`, background: intent?.light || T.surfaceHover }}>
                              <span style={{ fontSize:'13px' }}>{intent?.icon}</span>
                              <span style={{ fontSize:'11.5px', fontWeight:700, color:intent?.color, fontFamily:'Inter,sans-serif', letterSpacing:'0.01em' }}>{intent?.label}</span>
                            </div>
                            <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column', gap:'10px' }}>
                              <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:ts.light, border:`1px solid ${ts.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>
                                  {ts.icon}
                                </div>
                                <Link to={`/resources/${r._id}`} style={{ fontFamily:'Plus Jakarta Sans, sans-serif', fontWeight:700, fontSize:'13.5px', color:T.textPrimary, textDecoration:'none', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', transition:'color .15s' }}
                                  onMouseEnter={e => e.target.style.color = T.primary}
                                  onMouseLeave={e => e.target.style.color = T.textPrimary}
                                >
                                  {r.title}
                                </Link>
                              </div>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                                <span style={{ fontSize:'10px', fontFamily:'monospace', background:T.primaryLight, color:T.primary, padding:'2px 7px', borderRadius:'5px', fontWeight:700 }}>{r.moduleCode}</span>
                                <span style={{ fontSize:'10px', color:T.textMuted, background:T.surfaceHover, border:`1px solid ${T.border}`, padding:'2px 7px', borderRadius:'5px', fontFamily:'Inter,sans-serif' }}>{r.academicYear}</span>
                                <span style={{ fontSize:'10px', color:T.textMuted, background:T.surfaceHover, border:`1px solid ${T.border}`, padding:'2px 7px', borderRadius:'5px', fontFamily:'Inter,sans-serif' }}>{r.semester?.replace('_',' ')}</span>
                              </div>
                              <div style={{ marginTop:'auto', paddingTop:'10px', borderTop:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:'5px' }}>
                                <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={11} color={T.textMuted}/>
                                <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.createdBy?.name}</span>
                                <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif', flexShrink:0 }}>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div style={{ padding:'0 14px 14px', display:'flex', gap:'8px' }}>
                              <Link to={`/resources/${r._id}`} className="mb-action"
                                style={{ background:T.primaryLight, color:T.primary }}
                                onMouseEnter={e => e.currentTarget.style.background='#C7D2FD'}
                                onMouseLeave={e => e.currentTarget.style.background=T.primaryLight}
                              >
                                <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={12} color={T.primary}/>
                                Open
                              </Link>
                              <button onClick={() => handleRemove(r._id, r.title)} disabled={removing===r._id} className="mb-action"
                                style={{ background:T.redLight, color:T.red, border:'none', opacity: removing===r._id ? 0.5 : 1, flex:'0 0 auto', padding:'9px 14px' }}
                                onMouseEnter={e => { if(removing!==r._id) e.currentTarget.style.background='#FEE2E2'; }}
                                onMouseLeave={e => e.currentTarget.style.background=T.redLight}
                              >
                                {removing===r._id ? '...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'36px' }}>
                        <button className="mb-pg" onClick={() => setCurrentPage(p => Math.max(1,p-1))} disabled={currentPage===1}>← Prev</button>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {Array.from({ length: Math.min(totalPages, 7) }).map((_,i) => {
                            const pg = i+1;
                            return (
                              <button key={pg} className={`mb-pg${currentPage===pg?' active':''}`} onClick={() => setCurrentPage(pg)} style={{ width:'36px', padding:'0' }}>{pg}</button>
                            );
                          })}
                          {totalPages > 7 && <span style={{ color:T.textMuted, display:'flex', alignItems:'center', padding:'0 4px', fontSize:'13px' }}>…</span>}
                        </div>
                        <button className="mb-pg" onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Next →</button>
                      </div>
                    )}

                    {totalPages > 1 && (
                      <p style={{ textAlign:'center', marginTop:'10px', fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>
                        Page {currentPage} of {totalPages}
                      </p>
                    )}
                  </>
                )}
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
