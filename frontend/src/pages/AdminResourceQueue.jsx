import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';


const TYPE_ICONS = { NOTES:'📝', SLIDES:'📊', PAST_PAPER:'📄', LINK:'🔗', OTHER:'📁' };

const NAV = [
  { label:'Dashboard',    to:'/admin',          icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'Review Queue', to:'/admin/resources', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label:'Resource Hub', to:'/resources',       icon:'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
];

export default function AdminResourceQueue() {
  
  const {
    pendingQueue, fetchPendingQueue,
    approveResource, rejectResource,
    adminStats, fetchAdminStats,
    loading,
  } = useResource();

  const [rejectModal,  setRejectModal]  = useState({ open:false, id:null, title:'' });
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toastMsg,     setToastMsg]     = useState({ type:'', text:'' });

  useEffect(() => {
    document.title = 'Admin Resource Queue — Skill Nest';
  }, []);

  useEffect(() => {
    fetchPendingQueue();
    fetchAdminStats();
  }, []);

  const showToast = (type, text) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg({ type:'', text:'' }), 3500);
  };

  const handleApprove = async (id, title) => {
    setProcessingId(id);
    const res = await approveResource(id);
    showToast(res.success ? 'success' : 'error', res.message);
    setProcessingId(null);
  };

  const openRejectModal = (id, title) => {
    setRejectModal({ open:true, id, title });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessingId(rejectModal.id);
    const res = await rejectResource(rejectModal.id, rejectReason.trim());
    showToast(res.success ? 'success' : 'error', res.message);
    setRejectModal({ open:false, id:null, title:'' });
    setRejectReason('');
    setProcessingId(null);
  };
 
  const location    = useLocation();
  const navigate    = useNavigate();
  const user        = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        ${sharedStyles}
        @keyframes snFadeUp    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snSlideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snPulse     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
        @keyframes snShimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin        { to{transform:rotate(360deg)} }

        .aq-card {
          background:#FFFFFF; border:1px solid ${T.border}; border-radius:20px;
          padding:24px; display:flex; gap:18px; align-items:flex-start;
          transition:all .22s ease; animation:snFadeUp .35s ease both;
          box-shadow:0 2px 10px rgba(15,23,42,0.07);
          position:relative; overflow:hidden;
        }
        .aq-card::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
          background:linear-gradient(180deg,${T.yellow},${T.orange});
        }
        .aq-card:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(79,110,247,0.12); border-color:rgba(79,110,247,0.20); }

        .aq-approve { display:flex; align-items:center; gap:7px; padding:11px 20px; border-radius:12px; border:none; background:${T.green}; color:white; font-family:'Inter',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .18s; box-shadow:0 3px 12px rgba(16,185,129,0.28); white-space:nowrap; }
        .aq-approve:hover { background:#059669; transform:translateY(-1px); box-shadow:0 6px 18px rgba(16,185,129,0.36); }
        .aq-approve:disabled { opacity:.5; cursor:not-allowed; transform:none; }

        .aq-reject { display:flex; align-items:center; gap:7px; padding:11px 20px; border-radius:12px; background:${T.redLight}; color:${T.red}; border:1.5px solid #FECACA; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; white-space:nowrap; }
        .aq-reject:hover { background:#FEE2E2; }
        .aq-reject:disabled { opacity:.5; cursor:not-allowed; }

        .aq-view { display:flex; align-items:center; justify-content:center; gap:6px; padding:11px 18px; border-radius:12px; background:${T.surfaceHover}; color:${T.textSecondary}; border:1px solid ${T.border}; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; text-decoration:none; transition:all .15s; white-space:nowrap; }
        .aq-view:hover { background:${T.primaryLight}; color:${T.primary}; border-color:${T.primary}40; }

        .aq-toast { position:fixed; top:24px; right:24px; z-index:300; padding:14px 22px; border-radius:14px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:600; display:flex; align-items:center; gap:10px; animation:snSlideDown .3s ease; box-shadow:0 8px 28px rgba(0,0,0,0.15); }

        .aq-textarea { width:100%; padding:12px 14px; font-size:14px; border:1.5px solid ${T.border}; border-radius:12px; font-family:'Inter',sans-serif; color:${T.textPrimary}; background:white; outline:none; resize:none; transition:border-color .15s, box-shadow .15s; }
        .aq-textarea:focus { border-color:${T.red}80; box-shadow:0 0 0 3px rgba(239,68,68,0.10); }
        .aq-textarea::placeholder { color:${T.textMuted}; }

        .sn-side-link { transition:all .18s ease; }
        .sn-side-link:hover { background:${T.primaryLight} !important; color:${T.primary} !important; }
        .sn-tip { position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%); background:${T.textPrimary}; color:#fff; border-radius:8px; padding:6px 12px; font-size:12px; white-space:nowrap; pointer-events:none; opacity:0; transition:opacity .12s; font-family:'Inter',sans-serif; z-index:200; box-shadow:${T.shadowMd}; }
        .sn-side-link:hover .sn-tip { opacity:1; }

        .aq-card:nth-child(1){animation-delay:.04s} .aq-card:nth-child(2){animation-delay:.08s} .aq-card:nth-child(3){animation-delay:.12s} .aq-card:nth-child(4){animation-delay:.16s} .aq-card:nth-child(5){animation-delay:.20s}
      `}</style>

      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        <Navbar />

        {/* Toast */}
        {toastMsg.text && (
          <div className="aq-toast" style={{ background:toastMsg.type==='success'?T.green:T.red, color:'white' }}>
            {toastMsg.type==='success'?'✅':'❌'} {toastMsg.text}
          </div>
        )}

        <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

          {/*  Sidebar  */}
          <aside style={{ width:sidebarOpen?'220px':'68px', flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`, transition:'width .22s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'4px 0 20px rgba(15,23,42,0.07)', zIndex:40 }}>
            <div style={{ width:'220px', display:'flex', flexDirection:'column', height:'100%' }}>

              {/* Admin card */}
              <div style={{ padding:'20px 14px 8px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 13px', background:`linear-gradient(135deg,${T.heroFrom},${T.heroTo})`, borderRadius:'13px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>🛡️</div>
                  <div>
                    <div style={{ fontSize:'12.5px', fontWeight:700, color:'white', fontFamily:'Plus Jakarta Sans,sans-serif' }}>{user?.name || 'Admin'}</div>
                    <div style={{ fontSize:'10.5px', color:'rgba(255,255,255,0.55)', fontFamily:'Inter,sans-serif' }}>Administrator</div>
                  </div>
                </div>
              </div>

              <div style={{ height:'1px', background:T.border, margin:'8px 14px', flexShrink:0 }}/>

              <div style={{ padding:'4px 8px', flex:1 }}>
                {NAV.map(n => {
                  const active = location.pathname === n.to;
                  return (
                    <Link key={n.label} to={n.to} className="sn-side-link" style={{ position:'relative', display:'flex', alignItems:'center', gap:'11px', padding:sidebarOpen?'11px 14px':'12px 0', justifyContent:sidebarOpen?'flex-start':'center', margin:'2px 4px', borderRadius:'11px', textDecoration:'none', color:active?T.primary:T.textSecondary, background:active?T.primaryLight:'transparent', borderLeft:active?`3px solid ${T.primary}`:'3px solid transparent', fontWeight:active?600:400 }}>
                      <Icon path={n.icon} size={20} color={active?T.primary:T.textSecondary}/>
                      {sidebarOpen && <span style={{ fontSize:'13px', whiteSpace:'nowrap', fontFamily:'Inter,sans-serif' }}>{n.label}</span>}
                      {!sidebarOpen && <span className="sn-tip">{n.label}</span>}
                    </Link>
                  );
                })}
              </div>

              <div style={{ padding:'12px 8px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
                <button onClick={handleLogout} className="sn-side-link" style={{ position:'relative', display:'flex', alignItems:'center', gap:'11px', padding:sidebarOpen?'11px 14px':'12px 0', justifyContent:sidebarOpen?'flex-start':'center', margin:'0 4px', borderRadius:'11px', background:'transparent', border:'none', color:T.red, cursor:'pointer', width:'calc(100% - 8px)', transition:'all .18s' }}
                  onMouseEnter={e => e.currentTarget.style.background=T.redLight}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={20} color={T.red}/>
                  {sidebarOpen && <span style={{ fontSize:'13px', fontFamily:'Inter,sans-serif', fontWeight:500 }}>Logout</span>}
                  {!sidebarOpen && <span className="sn-tip">Logout</span>}
                </button>
              </div>
            </div>
          </aside>

          {/*  Main  */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            {/* Top bar */}
            <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'14px 28px', display:'flex', alignItems:'center', gap:'14px', flexShrink:0, boxShadow:T.shadowSm }}>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:'transparent', border:'none', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex' }}
                onMouseEnter={e => e.currentTarget.style.background=T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <Icon path="M4 6h16M4 12h16M4 18h16" size={20} color={T.textSecondary}/>
              </button>
              <div style={{ flex:1 }}>
                <h1 className="sn-head" style={{ fontSize:'18px', fontWeight:800, color:T.textPrimary, lineHeight:1 }}>Resource Review Queue</h1>
                <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginTop:'2px' }}>Review and moderate student-uploaded resources</p>
              </div>
              <Link to="/resources" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'13px', color:T.primary, fontWeight:600, fontFamily:'Inter,sans-serif', textDecoration:'none', padding:'8px 16px', borderRadius:'10px', background:T.primaryLight, border:`1px solid ${T.primary}25`, transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#C7D2FD'}
                onMouseLeave={e => e.currentTarget.style.background=T.primaryLight}>
                View Public Hub
                <Icon path="M14 5l7 7m0 0l-7 7m7-7H3" size={13} color={T.primary}/>
              </Link>
            </div>

            {/* Hero banner */}
            <div style={{ position:'relative', overflow:'hidden', background:`linear-gradient(135deg,${T.heroFrom},${T.heroTo})`, padding:'28px 32px 24px', flexShrink:0 }}>
              <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', top:'-20px', right:'80px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.22) 0%,transparent 65%)', filter:'blur(22px)', pointerEvents:'none' }}/>
              <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'99px', padding:'4px 14px', marginBottom:'10px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:T.yellow, boxShadow:`0 0 6px ${T.yellow}`, animation:'snPulse 2s ease-in-out infinite' }}/>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.85)', fontFamily:'Inter,sans-serif', fontWeight:500 }}>
                      {pendingQueue.length} pending review
                    </span>
                  </div>
                  <h2 className="sn-head" style={{ fontSize:'clamp(20px,2.5vw,28px)', fontWeight:900, color:'white', letterSpacing:'-0.02em', marginBottom:'6px' }}>
                    Resource{' '}
                    <span style={{ background:'linear-gradient(90deg,#FCD34D,#FB923C)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      Moderation
                    </span>
                  </h2>
                  <p style={{ fontSize:'13.5px', color:'rgba(255,255,255,0.55)', fontFamily:'Inter,sans-serif' }}>
                    Approve or reject student submissions before they go live.
                  </p>
                </div>

                {/* Stat pills in hero */}
                {adminStats && (
                  <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                    {[
                      { label:'Pending',   value:adminStats.pendingCount,   color:'#FCD34D', bg:'rgba(252,211,77,0.14)',  border:'rgba(252,211,77,0.28)' },
                      { label:'Approved',  value:adminStats.approvedCount,  color:'#34D399', bg:'rgba(52,211,153,0.14)',  border:'rgba(52,211,153,0.28)' },
                      { label:'Rejected',  value:adminStats.rejectedCount,  color:'#F87171', bg:'rgba(248,113,113,0.14)', border:'rgba(248,113,113,0.28)' },
                      { label:'Downloads', value:adminStats.totalDownloads, color:'#93C5FD', bg:'rgba(147,197,253,0.14)', border:'rgba(147,197,253,0.28)' },
                    ].map(s => (
                      <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:'14px', padding:'14px 18px', minWidth:'76px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                        <div className="sn-head" style={{ fontSize:'24px', fontWeight:900, color:s.color, lineHeight:1 }}>{s.value ?? '—'}</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.60)', fontFamily:'Inter,sans-serif', marginTop:'4px', fontWeight:500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex:1, maxWidth:'1100px', margin:'0 auto', width:'100%', padding:'28px 28px 56px' }}>

              {/* Section header */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:T.yellowLight, border:'1px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={18} color={T.yellow}/>
                </div>
                <h2 className="sn-head" style={{ fontSize:'16px', fontWeight:800, color:T.textPrimary }}>Pending Review</h2>
                {pendingQueue.length > 0 && (
                  <span style={{ background:T.yellow, color:'white', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', fontFamily:'Inter,sans-serif' }}>
                    {pendingQueue.length} awaiting
                  </span>
                )}
              </div>

              {/* Loading */}
              {loading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ background:'#FFFFFF', border:`1px solid ${T.border}`, borderRadius:'20px', padding:'22px', height:'120px', position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(79,110,247,0.04),transparent)', backgroundSize:'400px 100%', animation:'snShimmer 1.5s ease-in-out infinite' }}/>
                    </div>
                  ))}
                </div>

              ) : pendingQueue.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center', animation:'snFadeUp .4s ease' }}>
                  <div style={{ width:'80px', height:'80px', borderRadius:'24px', background:T.greenLight, border:'1px solid #A7F3D0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'38px', marginBottom:'20px', boxShadow:T.shadowMd }}>
                    🎉
                  </div>
                  <h3 className="sn-head" style={{ fontSize:'22px', fontWeight:800, color:T.textPrimary, marginBottom:'8px' }}>All clear!</h3>
                  <p style={{ color:T.textSecondary, fontSize:'14px', fontFamily:'Inter,sans-serif', maxWidth:'280px', lineHeight:1.65 }}>
                    No resources pending review right now. Great work!
                  </p>
                </div>

              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  {pendingQueue.map((resource) => (
                    <div key={resource._id} className="aq-card">

                      {/* Type icon */}
                      <div style={{ width:'50px', height:'50px', borderRadius:'14px', background:T.yellowLight, border:'1px solid #FDE68A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>
                        {TYPE_ICONS[resource.type] || '📁'}
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                          <h3 className="sn-head" style={{ fontSize:'15px', fontWeight:800, color:T.textPrimary }}>{resource.title}</h3>
                          <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'99px', background:T.yellowLight, color:T.yellow, border:'1px solid #FDE68A', fontFamily:'Inter,sans-serif' }}>⏳ Pending</span>
                          <span style={{ fontSize:'11px', fontWeight:500, padding:'3px 10px', borderRadius:'99px', background:T.surfaceHover, color:T.textSecondary, border:`1px solid ${T.border}`, fontFamily:'Inter,sans-serif' }}>{resource.type?.replace('_',' ')}</span>
                        </div>

                        {resource.description && (
                          <p style={{ fontSize:'13.5px', color:T.textSecondary, fontFamily:'Inter,sans-serif', lineHeight:1.6, marginBottom:'10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {resource.description}
                          </p>
                        )}

                        <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', marginBottom:'10px' }}>
                          {[
                            { label:'Module', value:`${resource.moduleCode} – ${resource.moduleName}` },
                            { label:'Year',   value:resource.academicYear },
                            { label:'Sem',    value:resource.semester?.replace('_',' ') },
                          ].map(m => m.value && (
                            <span key={m.label} style={{ fontSize:'11.5px', fontFamily:'Inter,sans-serif', color:T.textSecondary }}>
                              <span style={{ color:T.textMuted, fontWeight:500 }}>{m.label}: </span>
                              <span style={{ color:T.textPrimary, fontWeight:600 }}>{m.value}</span>
                            </span>
                          ))}
                        </div>

                        {/* Uploader row */}
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', paddingTop:'10px', borderTop:`1px solid ${T.border}` }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`linear-gradient(135deg,${T.primary},${T.secondary})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:800, color:'white', flexShrink:0 }}>
                            {resource.createdBy?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize:'12px', fontFamily:'Inter,sans-serif', color:T.textSecondary, flex:1 }}>
                            <span style={{ color:T.textPrimary, fontWeight:600 }}>{resource.createdBy?.name}</span>
                            {resource.createdBy?.email && <span style={{ color:T.textMuted }}> · {resource.createdBy?.email}</span>}
                          </span>
                          <span style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif', flexShrink:0 }}>
                            {new Date(resource.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                          </span>
                        </div>

                        {/* File/link preview */}
                        {resource.latestVersionId?.storageType==='FILE' && resource.latestVersionId?.fileUrl && (
                          <a href={resource.latestVersionId.fileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'8px', fontSize:'12px', color:T.primary, fontFamily:'Inter,sans-serif', fontWeight:500, textDecoration:'none' }}>
                            📄 Preview file <Icon path="M14 5l7 7m0 0l-7 7m7-7H3" size={11} color={T.primary}/>
                          </a>
                        )}
                        {resource.latestVersionId?.storageType==='LINK' && resource.latestVersionId?.externalUrl && (
                          <a href={resource.latestVersionId.externalUrl} target="_blank" rel="noopener noreferrer"
                            style={{ display:'inline-flex', alignItems:'center', gap:'5px', marginTop:'8px', fontSize:'12px', color:T.primary, fontFamily:'Inter,sans-serif', fontWeight:500, textDecoration:'none' }}>
                            🔗 Open link <Icon path="M14 5l7 7m0 0l-7 7m7-7H3" size={11} color={T.primary}/>
                          </a>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px', flexShrink:0 }}>
                        <button onClick={() => handleApprove(resource._id, resource.title)} disabled={processingId===resource._id} className="aq-approve">
                          {processingId===resource._id
                            ? <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'white', animation:'spin .7s linear infinite' }}/>
                            : <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={15} color="white"/>
                          }
                          Approve
                        </button>
                        <button onClick={() => openRejectModal(resource._id, resource.title)} disabled={processingId===resource._id} className="aq-reject">
                          <Icon path="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" size={15} color={T.red}/>
                          Reject
                        </button>
                        <Link to={`/resources/${resource._id}`} className="aq-view">
                          <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={13} color="currentColor"/>
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Footer />
          </div>
        </div>
      </div>

      {/*  Reject Modal  */}
      {rejectModal.open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.60)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(6px)', animation:'snFadeUp .2s ease' }}>
          <div style={{ background:'#FFFFFF', borderRadius:'24px', boxShadow:'0 32px 80px rgba(15,23,42,0.22)', width:'100%', maxWidth:'440px', padding:'32px', border:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:T.redLight, border:'1px solid #FECACA', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon path="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" size={20} color={T.red}/>
              </div>
              <div>
                <h3 className="sn-head" style={{ fontSize:'18px', fontWeight:900, color:T.textPrimary, lineHeight:1 }}>Reject Resource</h3>
                <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginTop:'2px' }}>The uploader will see your reason</p>
              </div>
            </div>
            <p style={{ fontSize:'13.5px', color:T.textSecondary, fontFamily:'Inter,sans-serif', marginBottom:'16px', lineHeight:1.6 }}>
              Rejecting <strong style={{ color:T.textPrimary }}>"{rejectModal.title}"</strong>. Provide a clear reason to help the student improve and resubmit.
            </p>
            <textarea rows={4} placeholder="e.g. Content is inaccurate in Chapter 3. Please verify the formulas and resubmit..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="aq-textarea" maxLength={500}/>
            <p style={{ fontSize:'11.5px', color:T.textMuted, fontFamily:'Inter,sans-serif', textAlign:'right', marginTop:'4px', marginBottom:'20px' }}>{rejectReason.length}/500</p>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setRejectModal({ open:false, id:null, title:'' })}
                style={{ flex:1, padding:'13px', borderRadius:'14px', border:`1.5px solid ${T.border}`, color:T.textSecondary, background:T.surface, fontFamily:'Inter,sans-serif', fontWeight:600, fontSize:'14px', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background=T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background=T.surface}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim()||processingId}
                style={{ flex:1, padding:'13px', borderRadius:'14px', background:T.red, color:'white', border:'none', fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity:!rejectReason.trim()||processingId?0.5:1, boxShadow:'0 4px 14px rgba(239,68,68,0.28)', transition:'all .15s' }}>
                {processingId ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
