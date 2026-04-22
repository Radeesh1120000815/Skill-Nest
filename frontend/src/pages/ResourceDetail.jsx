import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import StarRatingInput from '../components/resources/StarRatingInput.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { T, Icon, sharedStyles, typeStyle, statusStyle, roleStyle } from '../components/resources/theme.jsx';
import ResourceAssistant from '../components/ResourceAssistant.jsx';

// Constants
const INTENT_OPTIONS = [
  { value:'EXAM',         label:'📝 Exam Revision',         desc:'Prep for exams' },
  { value:'CONCEPT',      label:'💡 Concept Clarification',  desc:'Understand topics' },
  { value:'ASSIGNMENT',   label:'📋 Assignment Preparation', desc:'Work on assignments' },
  { value:'QUICK_REVIEW', label:'⚡ Quick Review',           desc:'Fast reference' },
];

// Sidebar nav 
const NAV = [
  { label:'Back to Hub', to:'/resources', icon:'M10 19l-7-7m0 0l7-7m-7 7h18', isBack:true },
  { label:'Hub',        to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads', to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',  to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',     to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue',to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

export default function ResourceDetail() {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchResourceById, downloadResource,
    rateResource, bookmarkResource, removeBookmark, deleteResource,
  } = useResource();

  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const [detail,            setDetail]            = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [versionExpanded,   setVersionExpanded]   = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedIntent,    setSelectedIntent]    = useState('');
  const [ratingStars,       setRatingStars]       = useState(0);
  const [ratingComment,     setRatingComment]     = useState('');
  const [ratingLoading,     setRatingLoading]     = useState(false);
  const [actionMsg,         setActionMsg]         = useState({ type:'', text:'' });
  const [downloading,       setDownloading]       = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchResourceById(id);
      if (data) {
        setDetail(data);
        setRatingStars(data.userRating?.stars || 0);
        setRatingComment(data.userRating?.comment || '');
      } else {
        navigate('/resources');
      }
      setLoading(false);
    })();
  }, [id]);

  const showMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({ type:'', text:'' }), 4000);
  };

  const handleDownload = async () => {
    if (!user) return navigate('/signin');
    setDownloading(true);
    const res = await downloadResource(id);
    if (res.downloadUrl) {
      window.open(res.downloadUrl, '_blank');
      setDetail(prev => ({ ...prev, resource:{ ...prev.resource, downloadCount: res.downloadCount } }));
      showMsg('success', '⬇️ Download started!');
    } else {
      showMsg('error', res.message || 'Download failed');
    }
    setDownloading(false);
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/signin');
    if (detail.isBookmarked) {
      const res = await removeBookmark(id);
      if (res.success) {
        setDetail(prev => ({ ...prev, isBookmarked:false, bookmarkIntent:null }));
        showMsg('success', '🗑️ Bookmark removed!');
      }
    } else {
      setShowBookmarkModal(true);
    }
  };

  const submitBookmark = async () => {
    if (!selectedIntent) return;
    const res = await bookmarkResource(id, selectedIntent);
    if (res.success) {
      setDetail(prev => ({ ...prev, isBookmarked:true, bookmarkIntent:selectedIntent }));
      setShowBookmarkModal(false);
      showMsg('success', res.message);
    } else {
      showMsg('error', res.message);
    }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/signin');
    if (!ratingStars) return showMsg('error', 'Please select a star rating');
    setRatingLoading(true);
    const res = await rateResource(id, ratingStars, ratingComment);
    if (res.success) {
      setDetail(prev => ({
        ...prev,
        userRating: res.data,
        ratingStats: { avg:res.data.stars, count:(prev.ratingStats?.count||0)+(prev.userRating?0:1) },
      }));
      showMsg('success', '⭐ Rating submitted!');
    } else {
      showMsg('error', res.message);
    }
    setRatingLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource? This cannot be undone.')) return;
    const res = await deleteResource(id);
    if (res.success) navigate('/resources');
  };
  

  const location    = useLocation();
  const isAdmin     = user?.role === 'ADMIN';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //  Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/signin');
  };


  if (loading) {
    return (
      <>
        <style>{`${sharedStyles} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="sn-page" style={{ minHeight:'100vh', background:T.appBg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <Navbar/>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', border:`4px solid ${T.primaryLight}`, borderTopColor:T.primary, animation:'spin .8s linear infinite' }}/>
            <p style={{ color:T.textSecondary, fontSize:'14px', fontFamily:'Inter,sans-serif', fontWeight:500 }}>Loading resource...</p>
          </div>
          <Footer/>
        </div>
      </>
    );
  }

  if (!detail) return null;

  const { resource, versions, ratings, ratingStats, userRating, isBookmarked, bookmarkIntent } = detail;
  const isOwner = user && resource.createdBy?._id === user._id;
  const ts      = typeStyle(resource.type);
  const ss      = statusStyle(resource.approvalStatus);

  return (
    <>
      <style>{`
        ${sharedStyles}
        @keyframes snShimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes snFadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snFadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes snPulse     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
        @keyframes snSlideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        .rd-card { background:#FFFFFF; border:1px solid ${T.border}; border-radius:20px; box-shadow:0 2px 12px rgba(15,23,42,0.07); transition:box-shadow .22s ease,border-color .22s ease; animation:snFadeUp .4s ease both; }
        .rd-card:hover { box-shadow:0 8px 32px rgba(79,110,247,0.12); border-color:rgba(79,110,247,0.22); }
        .rd-toast { position:fixed; top:24px; right:24px; z-index:200; padding:14px 22px; border-radius:14px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600; display:flex; align-items:center; gap:10px; animation:snSlideDown .3s ease; box-shadow:0 8px 28px rgba(0,0,0,0.15); }
        .rd-download-btn { position:relative; overflow:hidden; width:100%; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px; border-radius:14px; border:none; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:15px; cursor:pointer; transition:all .18s ease; background:linear-gradient(135deg,${T.primary},${T.secondary}); color:white; box-shadow:0 4px 20px rgba(79,110,247,0.35); letter-spacing:-0.01em; }
        .rd-download-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left .45s ease; }
        .rd-download-btn:hover::before { left:100%; }
        .rd-download-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(79,110,247,0.42); }
        .rd-download-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .rd-bookmark-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:13px; border-radius:14px; font-family:'Inter',sans-serif; font-weight:600; font-size:14px; cursor:pointer; transition:all .18s ease; }
        .rd-version-item { display:flex; align-items:flex-start; gap:14px; padding:16px; border-radius:14px; transition:all .18s ease; animation:snFadeUp .3s ease both; }
        .rd-version-item:hover { transform:translateX(3px); }
        .rd-rating-row { display:flex; gap:14px; padding:16px; background:${T.surfaceHover}; border-radius:14px; border:1px solid ${T.border}; animation:snFadeUp .3s ease both; transition:box-shadow .2s,border-color .2s; }
        .rd-rating-row:hover { box-shadow:0 4px 16px rgba(79,110,247,0.09); border-color:rgba(79,110,247,0.18); }
        .rd-textarea { width:100%; padding:11px 14px; font-size:14px; border:1.5px solid ${T.border}; border-radius:12px; font-family:'Inter',sans-serif; color:#0F172A !important; background:white; outline:none; resize:none; transition:border-color .15s,box-shadow .15s; }
        .rd-textarea::placeholder { color:${T.textMuted}; }
        .rd-textarea:focus { border-color:${T.primary}80; box-shadow:0 0 0 3px rgba(79,110,247,0.10); }
        .rd-meta-card { background:${T.surfaceHover}; border:1px solid ${T.border}; border-radius:14px; padding:14px 16px; transition:all .2s; }
        .rd-meta-card:hover { border-color:${T.primary}40; background:${T.primaryLight}; transform:translateY(-2px); box-shadow:0 4px 14px rgba(79,110,247,0.09); }
        .rd-stat-row { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:12px; background:${T.surfaceHover}; border:1px solid ${T.border}; transition:all .15s; }
        .rd-stat-row:hover { border-color:${T.primary}30; background:${T.primaryLight}; }
        .rd-intent-opt { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-radius:14px; border:2px solid ${T.border}; cursor:pointer; transition:all .18s ease; }
        .rd-intent-opt:hover { border-color:${T.primary}60; background:${T.primaryLight}; }
        .rd-intent-opt.selected { border-color:${T.primary}; background:${T.primaryLight}; }
        .rd-card:nth-child(1){animation-delay:.04s} .rd-card:nth-child(2){animation-delay:.09s} .rd-card:nth-child(3){animation-delay:.14s} .rd-card:nth-child(4){animation-delay:.19s}
      `}</style>

      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column' }}>
        {actionMsg.text && (
          <div className="rd-toast" style={{ background:actionMsg.type==='success'?T.green:T.red, color:'white' }}>{actionMsg.text}</div>
        )}
        <Navbar />
        <div style={{ display:'flex', flex:1, overflow:'hidden' , minHeight:0}}>

          {/* Sidebar  */}
          <aside onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{ width:sidebarOpen?'210px':'68px', flexShrink:0, flexDirection:'column', alignItems:sidebarOpen?'stretch':'center', paddingTop:'20px', paddingBottom:'20px', gap:'3px', background:T.surface, borderRight:`1px solid ${T.border}`, transition:'width .22s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden', boxShadow:sidebarOpen?'0 0 0 1px rgba(79,110,247,0.06), 4px 0 24px rgba(15,23,42,0.08)':T.shadowSm, zIndex:40 }}>
            {sidebarOpen && <div style={{ padding:'0 16px 12px', fontSize:'10px', fontWeight:700, color:T.textMuted, letterSpacing:'0.10em', textTransform:'uppercase', fontFamily:'Inter,sans-serif' }}>Resources</div>}

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
                  <div style={{width:'30px', height:'30px', borderRadius:'8px',background: T.primary, display:'flex',alignItems:'center', justifyContent:'center',color:'white', fontSize:'13px', fontWeight:700,flexShrink:0,}}>
                    {user.name?.charAt(0).toUpperCase()} </div>
                    <div style={{ overflow:'hidden' }}>
                      <p style={{ fontSize:'12px', fontWeight:700, color: T.textPrimary, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>
                        {user.name?.split(' ')[0]}
                        </p>
                        <p style={{ fontSize:'10px', color: T.textMuted, fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>
                          {user.role}
                          </p>
                          </div>
                          </div>)}
              <button onClick={handleLogout} className="sn-side-link" style={{ position:'relative', display:'flex', alignItems:'center', gap:'12px', padding:sidebarOpen?'12px 16px':'13px 0', justifyContent:sidebarOpen?'flex-start':'center', margin:'2px 8px', borderRadius:'12px', background:'transparent', border:'none', color:T.red, cursor:'pointer', transition:'all .18s ease', width:'calc(100% - 16px)' }}
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

          {/*  Main area  */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'url(/upload-bg.png)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.04, pointerEvents:'none', zIndex:0 }}/>
            <div style={{ position:'relative', zIndex:1 }}>

              {/* Content grid */}
              <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'28px 24px 64px', display:'grid', gridTemplateColumns:'1fr 330px', gap:'22px', alignItems:'start' }}>

                {/* LEFT COLUMN */}
                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

                  {/* Resource header */}
                  <div className="rd-card" style={{ padding:'32px' }}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'18px' }}>
                      <span style={{ fontSize:'12px', fontWeight:700, padding:'5px 14px', borderRadius:'99px', background:ts.bg, color:ts.color, border:`1px solid ${ts.border}`, fontFamily:'Inter,sans-serif' }}>{ts.icon} {resource.type?.replace('_',' ')}</span>
                      <span style={{ fontSize:'12px', fontWeight:600, padding:'5px 14px', borderRadius:'99px', background:ss.bg, color:ss.color, border:`1px solid ${ss.border}`, fontFamily:'Inter,sans-serif' }}>{ss.label}</span>
                      {resource.approvalStatus==='REJECTED' && resource.rejectionReason && <span style={{ fontSize:'11px', color:T.red, fontStyle:'italic', fontFamily:'Inter,sans-serif', alignSelf:'center' }}>"{resource.rejectionReason}"</span>}
                    </div>
                    <h1 className="sn-head" style={{ fontSize:'clamp(24px,3.5vw,36px)', fontWeight:900, color:T.textPrimary, marginBottom:'12px', lineHeight:1.1, letterSpacing:'-0.03em' }}>{resource.title}</h1>
                    {resource.description && <p style={{ color:T.textSecondary, fontSize:'15px', lineHeight:1.75, marginBottom:'24px', fontFamily:'Inter,sans-serif' }}>{resource.description}</p>}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                      {[
                        { icon:'📦', label:'Module',    value:`${resource.moduleCode} – ${resource.moduleName}` },
                        { icon:'📅', label:'Year',      value:resource.academicYear },
                        { icon:'📚', label:'Semester',  value:resource.semester?.replace('_',' ') },
                        { icon:'⬇️', label:'Downloads', value:resource.downloadCount || 0 },
                      ].map(item => (
                        <div key={item.label} className="rd-meta-card">
                          <div style={{ fontSize:'10px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginBottom:'6px', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize:'13px', fontWeight:800, color:T.textPrimary, fontFamily:'Plus Jakarta Sans,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    {resource.tags?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'20px' }}>
                        {resource.tags.map(tag => <span key={tag} style={{ fontSize:'11.5px', background:T.primaryLight, color:T.primary, padding:'4px 12px', borderRadius:'99px', fontFamily:'Inter,sans-serif', fontWeight:600, border:`1px solid ${T.primary}25` }}>#{tag}</span>)}
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', paddingTop:'18px', borderTop:`1px solid ${T.border}` }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:`linear-gradient(135deg,${T.primary},${T.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:800, color:'white', flexShrink:0, boxShadow:T.shadowBlue }}>{resource.createdBy?.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize:'14px', fontWeight:700, color:T.textPrimary, fontFamily:'Plus Jakarta Sans,sans-serif' }}>{resource.createdBy?.name}</div>
                        <div style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif', textTransform:'capitalize' }}>{resource.createdBy?.role?.toLowerCase()}</div>
                      </div>
                      {resource.approvedBy && <div style={{ marginLeft:'auto', fontSize:'12px', color:T.green, background:T.greenLight, padding:'5px 12px', borderRadius:'99px', fontFamily:'Inter,sans-serif', fontWeight:600, border:`1px solid #A7F3D0` }}>✅ Approved by {resource.approvedBy?.name}</div>}
                    </div>
                  </div>

                  {/* Version History */}
                  <div className="rd-card" style={{ overflow:'hidden' }}>
                    <button onClick={() => setVersionExpanded(!versionExpanded)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 26px', background:'transparent', border:'none', cursor:'pointer', transition:'background .15s' }} onMouseEnter={e => e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={18} color={T.primary}/></div>
                        <span className="sn-head" style={{ fontWeight:800, fontSize:'16px', color:T.textPrimary }}>Version History</span>
                        <span style={{ fontSize:'11.5px', background:T.primaryLight, color:T.primary, padding:'3px 12px', borderRadius:'99px', fontWeight:700, fontFamily:'Inter,sans-serif', border:`1px solid ${T.primary}25` }}>{versions.length} version{versions.length!==1?'s':''}</span>
                      </div>
                      <div style={{ transform:versionExpanded?'rotate(180deg)':'rotate(0deg)', transition:'transform .22s' }}><Icon path="M19 9l-7 7-7-7" size={18} color={T.textMuted}/></div>
                    </button>
                    {versionExpanded && (
                      <div style={{ padding:'0 26px 22px', display:'flex', flexDirection:'column', gap:'10px', animation:'snFadeIn .2s ease' }}>
                        {versions.map((v) => (
                          <div key={v._id} className="rd-version-item" style={{ background:v.isLatest?T.primaryLight:T.surfaceHover, border:`1px solid ${v.isLatest?T.primary+'30':T.border}` }}>
                            <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:v.isLatest?`linear-gradient(135deg,${T.primary},${T.secondary})`:T.borderMed, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800, color:'white', flexShrink:0, boxShadow:v.isLatest?T.shadowBlue:'none' }}>v{v.versionNumber}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', flexWrap:'wrap' }}>
                                {v.isLatest && <span style={{ fontSize:'9.5px', background:T.primary, color:'white', padding:'2px 8px', borderRadius:'5px', fontWeight:800, fontFamily:'Inter,sans-serif', letterSpacing:'0.06em' }}>LATEST</span>}
                                <span style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{new Date(v.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                                <span style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>by {v.uploadedBy?.name}</span>
                              </div>
                              <p style={{ fontSize:'13.5px', color:T.textPrimary, fontFamily:'Inter,sans-serif', margin:'0 0 5px', fontWeight:500 }}>{v.changeNote}</p>
                              <div style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{v.storageType==='FILE'?`📄 ${v.fileName||'File'}`:'🔗 External Link'}{v.fileSize&&` · ${(v.fileSize/1024/1024).toFixed(2)} MB`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ratings & Reviews */}
                  <div className="rd-card" style={{ padding:'28px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'22px' }}>
                      <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:T.yellowLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill={T.yellow}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      </div>
                      <span className="sn-head" style={{ fontWeight:800, fontSize:'16px', color:T.textPrimary }}>Ratings & Reviews</span>
                      {ratingStats.count>0 && <span style={{ fontSize:'15px', fontWeight:800, color:T.yellow, fontFamily:'Plus Jakarta Sans,sans-serif' }}>{ratingStats.avg.toFixed(1)}/5</span>}
                      <span style={{ fontSize:'12.5px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>({ratingStats.count} review{ratingStats.count!==1?'s':''})</span>
                    </div>
                    {user ? (
                      <form onSubmit={handleRating} style={{ background:`linear-gradient(135deg,${T.primaryLight},#F0EEFF)`, border:`1px solid ${T.primary}25`, borderRadius:'16px', padding:'20px', marginBottom:'20px' }}>
                        <p style={{ fontSize:'14px', fontWeight:700, color:T.textPrimary, marginBottom:'14px', fontFamily:'Plus Jakarta Sans,sans-serif' }}>{userRating?'Update your rating':'Leave a rating'}</p>
                        <StarRatingInput value={ratingStars} onChange={setRatingStars}/>
                        <textarea rows={2} placeholder="Add an optional comment..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} className="rd-textarea" style={{ marginTop:'14px' }} maxLength={1000}/>
                        <button type="submit" disabled={ratingLoading||!ratingStars} className="sn-btn" style={{ marginTop:'12px', padding:'10px 22px', fontSize:'13.5px', opacity:ratingLoading||!ratingStars?.5:1 }}>
                          {ratingLoading?'Submitting...':userRating?'Update Rating':'Submit Rating'}
                        </button>
                      </form>
                    ) : (
                      <div style={{ background:T.surfaceHover, border:`1px solid ${T.border}`, borderRadius:'14px', padding:'18px', marginBottom:'20px', textAlign:'center' }}>
                        <p style={{ fontSize:'14px', color:T.textSecondary, fontFamily:'Inter,sans-serif' }}><Link to="/signin" style={{ color:T.primary, fontWeight:600, textDecoration:'none' }}>Sign in</Link>{' '}to leave a rating</p>
                      </div>
                    )}
                    {ratings.length>0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {ratings.map((r,idx) => (
                          <div key={r._id} className="rd-rating-row" style={{ animationDelay:`${idx*0.05}s` }}>
                            <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:`linear-gradient(135deg,${T.primary},${T.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:800, color:'white', flexShrink:0 }}>{r.userId?.name?.charAt(0).toUpperCase()}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                                <span style={{ fontSize:'13.5px', fontWeight:700, color:T.textPrimary, fontFamily:'Inter,sans-serif' }}>{r.userId?.name}</span>
                                <div style={{ display:'flex', gap:'2px' }}>{[1,2,3,4,5].map(n => <svg key={n} width="13" height="13" viewBox="0 0 20 20" fill={n<=r.stars?T.yellow:'#E2E6F0'}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}</div>
                                <span style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif' }}>{new Date(r.updatedAt).toLocaleDateString()}</span>
                              </div>
                              {r.comment && <p style={{ fontSize:'13.5px', color:T.textPrimary, fontFamily:'Inter,sans-serif', lineHeight:1.65, margin:0 }}>{r.comment}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize:'14px', color:T.textMuted, textAlign:'center', padding:'24px 0', fontFamily:'Inter,sans-serif' }}>No reviews yet. Be the first!</p>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display:'flex', flexDirection:'column', gap:'18px', position:'sticky', top:'64px' }}>
                  <div className="rd-card" style={{ padding:'22px', display:'flex', flexDirection:'column', gap:'12px' }}>
                    <button onClick={handleDownload} disabled={downloading||resource.approvalStatus!=='APPROVED'} className="rd-download-btn">
                      {downloading ? <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'white', animation:'spin .7s linear infinite' }}/> : <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={18} color="white"/>}
                      {downloading?'Opening...':'Download / Open'}
                    </button>
                    <button onClick={handleBookmark} className="rd-bookmark-btn" style={{ background:isBookmarked?T.yellowLight:T.surfaceHover, color:isBookmarked?T.yellow:T.textSecondary, border:`1.5px solid ${isBookmarked?'#FDE68A':T.border}`, fontWeight:600 }} onMouseEnter={e => e.currentTarget.style.opacity='.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      <span style={{ fontSize:'16px' }}>{isBookmarked?'🔖':'☆'}</span>
                      {isBookmarked?`Bookmarked (${bookmarkIntent?.replace('_',' ')})` :'Bookmark'}
                    </button>
                    {isOwner && (
                      <Link to={`/resources/${id}/new-version`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'13px', borderRadius:'14px', border:`1.5px solid ${T.border}`, color:T.textSecondary, background:T.surface, textDecoration:'none', fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:'14px', transition:'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; e.currentTarget.style.background=T.primaryLight; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textSecondary; e.currentTarget.style.background=T.surface; }}>
                        <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={15} color="currentColor"/>
                        Upload New Version
                      </Link>
                    )}
                    {/* Edit/Delete for owner/admin */}
                    {(isOwner||isAdmin) && (
                      <div style={{ display:'flex', gap:'8px', paddingTop:'8px', borderTop:`1px solid ${T.border}` }}>
                        <Link to={`/resources/${id}/edit`} style={{ flex:1, textAlign:'center', padding:'10px', borderRadius:'10px', fontSize:'12.5px', fontWeight:500, background:T.surfaceHover, color:T.textSecondary, border:`1px solid ${T.border}`, textDecoration:'none', transition:'all .15s', fontFamily:'Inter,sans-serif' }}
                          onMouseEnter={e => { e.currentTarget.style.background=T.primaryLight; e.currentTarget.style.color=T.primary; }}
                          onMouseLeave={e => { e.currentTarget.style.background=T.surfaceHover; e.currentTarget.style.color=T.textSecondary; }}>Edit</Link>
                        <button onClick={handleDelete} style={{ flex:1, padding:'10px', borderRadius:'10px', fontSize:'12.5px', fontWeight:500, background:T.redLight, color:T.red, border:`1px solid #FECACA`, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'all .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='#FEE2E2'}
                          onMouseLeave={e => e.currentTarget.style.background=T.redLight}>Delete</button>
                      </div>
                    )}
                  </div>
                  <div className="rd-card" style={{ padding:'22px' }}>
                    <h4 className="sn-head" style={{ fontSize:'15px', fontWeight:800, color:T.textPrimary, marginBottom:'16px' }}>Resource Stats</h4>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {[
                        { icon:'⬇️', label:'Downloads', value:resource.downloadCount||0,                   color:T.primary   },
                        { icon:'⭐', label:'Avg Rating', value:ratingStats.avg?`${ratingStats.avg}/5`:'—', color:T.yellow    },
                        { icon:'💬', label:'Reviews',    value:ratingStats.count,                           color:T.secondary },
                        { icon:'📋', label:'Versions',   value:versions.length,                             color:T.green     },
                      ].map(s => (
                        <div key={s.label} className="rd-stat-row">
                          <span style={{ fontSize:'13px', color:T.textSecondary, fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:'8px' }}><span style={{ fontSize:'15px' }}>{s.icon}</span>{s.label}</span>
                          <span style={{ fontSize:'16px', fontWeight:800, color:s.color, fontFamily:'Plus Jakarta Sans,sans-serif' }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>

      {/* Bookmark Modal */}
      {showBookmarkModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.60)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(6px)', animation:'snFadeIn .2s ease' }}>
          <div style={{ background:'#FFFFFF', borderRadius:'24px', boxShadow:'0 32px 80px rgba(15,23,42,0.22)', width:'100%', maxWidth:'440px', padding:'32px', animation:'snFadeUp .25s ease', border:`1px solid ${T.border}` }}>
            <h3 className="sn-head" style={{ fontSize:'20px', fontWeight:900, color:T.textPrimary, marginBottom:'8px' }}>Save to Bookmarks</h3>
            <p style={{ fontSize:'14px', color:T.textSecondary, fontFamily:'Inter,sans-serif', marginBottom:'22px', lineHeight:1.6 }}>Select your study intent for "<strong style={{ color:T.textPrimary }}>{resource.title}</strong>"</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'24px' }}>
              {INTENT_OPTIONS.map(opt => (
                <label key={opt.value} className={`rd-intent-opt${selectedIntent===opt.value?' selected':''}`} onClick={() => setSelectedIntent(opt.value)}>
                  <input type="radio" name="intent" value={opt.value} checked={selectedIntent===opt.value} onChange={() => setSelectedIntent(opt.value)} style={{ accentColor:T.primary, marginTop:'2px' }}/>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:T.textPrimary, fontFamily:'Inter,sans-serif' }}>{opt.label}</div>
                    <div style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginTop:'2px' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setShowBookmarkModal(false); setSelectedIntent(''); }} style={{ flex:1, padding:'13px', borderRadius:'14px', border:`1.5px solid ${T.border}`, color:T.textSecondary, background:T.surface, fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:'14px', cursor:'pointer', transition:'all .15s' }} onMouseEnter={e => e.currentTarget.style.background=T.surfaceHover} onMouseLeave={e => e.currentTarget.style.background=T.surface}>Cancel</button>
              <button onClick={submitBookmark} disabled={!selectedIntent} className="sn-btn" style={{ flex:1, padding:'13px', fontSize:'14px', opacity:selectedIntent?1:.5, justifyContent:'center' }}>Save Bookmark</button>
            </div>
          </div>
        </div>
      )}
      <ResourceAssistant />
    </>
  );
}
