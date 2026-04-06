import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ResourceBanner from '../components/resources/ResourceBanner.jsx';
import { T, Icon, sharedStyles, statusStyle, typeStyle } from '../components/resources/theme.jsx';

//  Sidebar nav 
const NAV = [
  { label:'Back to Hub', to:'/resources',              icon:'M10 19l-7-7m0 0l7-7m-7 7h18', isBack:true },
  { label:'Hub',         to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

//  Skeleton row 
const SkeletonRow = () => (
  <div style={{ background:'rgba(255,255,255,0.75)', backdropFilter:'blur(12px)', border:`1px solid ${T.border}`, borderRadius:'16px', padding:'20px', display:'flex', gap:'16px', alignItems:'center', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(79,110,247,0.04),transparent)', backgroundSize:'400px 100%', animation:'snShimmer 1.5s ease-in-out infinite' }}/>
    <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#EEF2FF', flexShrink:0 }}/>
    <div style={{ flex:1 }}>
      <div style={{ height:'14px', background:'#EEF2FF', borderRadius:'5px', width:'60%', marginBottom:'10px' }}/>
      <div style={{ height:'11px', background:'#F1F5F9', borderRadius:'5px', width:'40%' }}/>
    </div>
    <div style={{ display:'flex', gap:'8px' }}>
      {[60,80,60].map((w,i) => <div key={i} style={{ width:`${w}px`, height:'30px', background:'#F1F5F9', borderRadius:'8px' }}/>)}
    </div>
  </div>
);

// 
export default function MyUploads() {

  
  const { myUploads, fetchMyUploads, deleteResource, loading } = useResource();
  const [deleting,     setDeleting]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchMyUploads(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await deleteResource(id);
    if (!res.success) alert(res.message);
    setDeleting(null);
  };

  const filtered = filterStatus
    ? myUploads.filter((r) => r.approvalStatus === filterStatus)
    : myUploads;

  const counts = {
    APPROVED: myUploads.filter((r) => r.approvalStatus === 'APPROVED').length,
    PENDING:  myUploads.filter((r) => r.approvalStatus === 'PENDING').length,
    REJECTED: myUploads.filter((r) => r.approvalStatus === 'REJECTED').length,
  };
  

  //UI-only state
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin   = user?.role === 'ADMIN';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const TABS = [
    { key:'',         label:'Total',    count: myUploads.length, color: T.primary, light: T.primaryLight },
    { key:'APPROVED', label:'Approved', count: counts.APPROVED,  color: T.green,   light: T.greenLight   },
    { key:'PENDING',  label:'Pending',  count: counts.PENDING,   color: T.yellow,  light: T.yellowLight  },
    { key:'REJECTED', label:'Rejected', count: counts.REJECTED,  color: T.red,     light: T.redLight     },
  ];
  const activeTabIndex = TABS.findIndex(t => t.key === filterStatus);

  return (
    <>
      <style>{`
        ${sharedStyles}

        @keyframes snShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes snFadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes snPulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }

        .mu-tab-bar { position:relative; display:flex; background:white; border:1px solid ${T.border}; border-radius:14px; padding:5px; gap:3px; width:fit-content; box-shadow:${T.shadowSm}; }
        .mu-tab { position:relative; z-index:2; padding:9px 20px; border-radius:10px; border:none; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:color .2s ease; background:transparent; display:flex; align-items:center; gap:7px; white-space:nowrap; letter-spacing:-0.01em; }
        .mu-tab-slider { position:absolute; top:5px; height:calc(100% - 10px); border-radius:10px; transition:left .28s cubic-bezier(0.4,0,0.2,1), width .28s cubic-bezier(0.4,0,0.2,1); z-index:1; box-shadow:0 2px 8px rgba(79,110,247,0.12); }
        .mu-tab-count { display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; border-radius:99px; font-size:11px; font-weight:700; padding:0 6px; transition:all .2s; }

        .mu-upload-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 22px; border-radius:12px; border:none; font-family:'Inter',sans-serif; font-weight:600; font-size:14px; background:${T.primary}; color:white; cursor:pointer; text-decoration:none; box-shadow:${T.shadowBlue}; position:relative; overflow:hidden; transition:transform .18s ease, box-shadow .18s ease; }
        .mu-upload-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left .4s ease; }
        .mu-upload-btn:hover::before { left:100%; }
        .mu-upload-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,110,247,0.35); }
        .mu-upload-btn:active { transform:scale(0.97); }

        .mu-row { background:#FFFFFF; border:1px solid ${T.border}; border-radius:18px; padding:18px 22px; display:flex; align-items:center; gap:16px; transition:transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, border-color .18s; animation:snFadeUp .35s ease both; position:relative; overflow:hidden; box-shadow:0 2px 10px rgba(15,23,42,0.06); }
        .mu-row::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:3px 0 0 3px; background:linear-gradient(180deg,${T.primary},${T.secondary}); opacity:0; transition:opacity .18s; }
        .mu-row:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(79,110,247,0.13); border-color:rgba(79,110,247,0.25); }
        .mu-row:hover::before { opacity:1; }

        .mu-action { padding:6px 14px; border-radius:8px; border:none; font-family:'Inter',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all .15s; text-decoration:none; display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }

        .mu-type-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; transition:transform .2s ease; }
        .mu-row:hover .mu-type-icon { transform:scale(1.08); }

        .mu-list > .mu-row:nth-child(1){animation-delay:.04s} .mu-list > .mu-row:nth-child(2){animation-delay:.09s} .mu-list > .mu-row:nth-child(3){animation-delay:.14s} .mu-list > .mu-row:nth-child(4){animation-delay:.19s} .mu-list > .mu-row:nth-child(5){animation-delay:.24s} .mu-list > .mu-row:nth-child(6){animation-delay:.29s} .mu-list > .mu-row:nth-child(7){animation-delay:.34s} .mu-list > .mu-row:nth-child(8){animation-delay:.39s}
      `}</style>

      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column',overflow:'hidden' }}>

        <Navbar />

        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/* Sidebar */}
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

          {/* Main  */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            {/* ✅ ResourceBanner — replaces old custom hero, consistent with all pages */}
            <ResourceBanner
              title="My Uploads"
              subtitle="Manage your contributed resources"
              action={
                <Link to="/upload-resource" className="mu-upload-btn">
                  <Icon path="M12 4v16m8-8H4" size={16} color="white"/>
                  Upload New
                </Link>
              }
            />

            <main style={{ flex:1, position:'relative'}}>

              <div style={{ position:'absolute', inset:0, backgroundImage:'url(/my-uploads-bg.png)', backgroundSize:'cover', backgroundPosition:'center', backgroundRepeat:'no-repeat', opacity:0.10, pointerEvents:'none', zIndex:0 }}/>

              <div style={{ position:'relative', zIndex:1, maxWidth:'1100px', margin:'0 auto', padding:'28px 22px 56px' }}>

                {/* Filter tabs */}
                <div style={{ marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                  <div className="mu-tab-bar">
                    <div className="mu-tab-slider" style={{ background:TABS[activeTabIndex]?.light||T.primaryLight, border:`1px solid ${TABS[activeTabIndex]?.color||T.primary}30`, left:`calc(${activeTabIndex} * 25% + 5px)`, width:'calc(25% - 3px)' }}/>
                    {TABS.map((tab) => (
                      <button key={tab.key} className="mu-tab" onClick={() => setFilterStatus(tab.key)}
                        style={{ color:filterStatus===tab.key?tab.color:T.textSecondary, fontWeight:filterStatus===tab.key?600:400, flex:1 }}>
                        {tab.label}
                        <span className="mu-tab-count" style={{ background:filterStatus===tab.key?tab.color:T.border, color:filterStatus===tab.key?'#fff':T.textSecondary }}>{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif' }}>
                    Showing <span style={{ color:T.textPrimary, fontWeight:600 }}>{filtered.length}</span> resource{filtered.length!==1?'s':''}
                  </p>
                </div>

                {/* Loading */}
                {loading ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {[1,2,3].map(i => <SkeletonRow key={i}/>)}
                  </div>

                ) : filtered.length === 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center', animation:'snFadeUp .4s ease' }}>
                    <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:'rgba(255,255,255,0.80)', backdropFilter:'blur(12px)', border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', marginBottom:'20px', boxShadow:T.shadowMd, animation:'snFloat 4s ease-in-out infinite' }}>📭</div>
                    <h3 className="sn-head" style={{ fontSize:'20px', fontWeight:700, color:T.textPrimary, marginBottom:'8px' }}>
                      {filterStatus ? `No ${filterStatus.toLowerCase()} uploads` : 'No uploads yet'}
                    </h3>
                    <p style={{ color:T.textSecondary, fontSize:'14px', maxWidth:'300px', lineHeight:1.65, fontFamily:'Inter,sans-serif', marginBottom:'24px' }}>
                      {filterStatus ? 'Try a different filter to see your other resources.' : 'Share your first resource with your peers!'}
                    </p>
                    {!filterStatus && (
                      <Link to="/upload-resource" className="mu-upload-btn">
                        <Icon path="M12 4v16m8-8H4" size={15} color="white"/>
                        Upload Your First Resource
                      </Link>
                    )}
                  </div>

                ) : (
                  /* Resource list */
                  <div className="mu-list" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {filtered.map((resource) => {
                      const ss = statusStyle(resource.approvalStatus);
                      const ts = typeStyle(resource.type);
                      return (
                        <div key={resource._id} className="mu-row">

                          <div className="mu-type-icon" style={{ background:ts.light, border:`1px solid ${ts.border}` }}>
                            {ts.icon}
                          </div>

                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
                              <Link to={`/resources/${resource._id}`}
                                style={{ fontWeight:700, fontSize:'14px', color:T.textPrimary, textDecoration:'none', transition:'color .15s', fontFamily:'Plus Jakarta Sans,sans-serif' }}
                                onMouseEnter={e => e.target.style.color=T.primary}
                                onMouseLeave={e => e.target.style.color=T.textPrimary}>
                                {resource.title}
                              </Link>
                              <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'99px', fontFamily:'Inter,sans-serif', background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>{ss.label}</span>
                              <span style={{ fontSize:'11px', fontWeight:500, padding:'3px 10px', borderRadius:'99px', fontFamily:'Inter,sans-serif', background:ts.light, color:ts.color, border:`1px solid ${ts.border}` }}>{ts.label}</span>
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', alignItems:'center' }}>
                              <span style={{ fontSize:'11px', background:T.primaryLight, color:T.primary, padding:'2px 8px', borderRadius:'6px', fontWeight:600, fontFamily:'monospace' }}>{resource.moduleCode}</span>
                              <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{resource.academicYear}</span>
                              <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{resource.semester?.replace('_',' ')}</span>
                              <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:'3px' }}>
                                <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={11} color={T.textMuted}/>
                                {resource.downloadCount || 0}
                              </span>
                              {resource.latestVersionId && (
                                <span style={{ fontSize:'10px', fontFamily:'monospace', background:T.secondaryLight, color:T.secondary, padding:'2px 7px', borderRadius:'5px', fontWeight:600 }}>
                                  v{resource.latestVersionId.versionNumber}
                                </span>
                              )}
                            </div>
                            {resource.approvalStatus==='REJECTED' && resource.rejectionReason && (
                              <p style={{ fontSize:'12px', color:T.red, marginTop:'5px', fontStyle:'italic', fontFamily:'Inter,sans-serif' }}>
                                Reason: "{resource.rejectionReason}"
                              </p>
                            )}
                          </div>

                          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0, flexWrap:'wrap' }}>
                            <Link to={`/resources/${resource._id}`} className="mu-action"
                              style={{ background:T.surfaceHover, color:T.textSecondary, border:`1px solid ${T.border}` }}
                              onMouseEnter={e => e.currentTarget.style.background=T.border}
                              onMouseLeave={e => e.currentTarget.style.background=T.surfaceHover}>
                              <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={12} color={T.textSecondary}/>
                              View
                            </Link>
                            <Link to={`/resources/${resource._id}/new-version`} className="mu-action"
                              style={{ background:T.primaryLight, color:T.primary, border:`1px solid ${T.primary}30` }}
                              onMouseEnter={e => e.currentTarget.style.background='#C7D2FD'}
                              onMouseLeave={e => e.currentTarget.style.background=T.primaryLight}>
                              <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={12} color={T.primary}/>
                              New Version
                            </Link>
                            <button
                              onClick={() => handleDelete(resource._id, resource.title)}
                              disabled={deleting===resource._id}
                              className="mu-action"
                              style={{ background:T.redLight, color:T.red, border:`1px solid ${T.red}25`, opacity:deleting===resource._id?0.5:1 }}
                              onMouseEnter={e => { if(deleting!==resource._id) e.currentTarget.style.background='#FEE2E2'; }}
                              onMouseLeave={e => e.currentTarget.style.background=T.redLight}>
                              <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={12} color={T.red}/>
                              {deleting===resource._id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
