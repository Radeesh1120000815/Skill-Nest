import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ResourceBanner from '../components/resources/ResourceBanner.jsx';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';
import ResourceAssistant from '../components/ResourceAssistant.jsx';

const ALLOWED_FORMATS = 'PDF, DOCX, PPTX, XLSX, TXT, PNG, JPG (max 25 MB)';

// Sidebar nav 
const NAV = [
  { label:'Back to Hub', to:'/resources',              icon:'M10 19l-7-7m0 0l7-7m-7 7h18', isBack:true },
  { label:'Hub',         to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

export default function UploadNewVersion() {
 
  const { id }   = useParams();
  const navigate = useNavigate();
  const { uploadNewVersion, fetchResourceById, loading } = useResource();

  const [resource,    setResource]    = useState(null);
  const [storageType, setStorageType] = useState('FILE');
  const [file,        setFile]        = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [changeNote,  setChangeNote]  = useState('');
  const [errors,      setErrors]      = useState({});
  const [submitMsg,   setSubmitMsg]   = useState({ type:'', text:'' });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await fetchResourceById(id);
      if (data) setResource(data.resource || data);
      setPageLoading(false);
    })();
  }, [id]);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      setErrors(e => ({ ...e, file:'File size must be under 25 MB' }));
      return;
    }
    setFile(selectedFile);
    setErrors(e => ({ ...e, file:'' }));
  };

  const validate = () => {
    const errs = {};
    if (!changeNote.trim())                              errs.changeNote  = 'Please describe what changed in this version';
    if (storageType === 'FILE' && !file)                 errs.file        = 'Please select a file to upload';
    if (storageType === 'LINK' && !externalUrl.trim())   errs.externalUrl = 'External URL is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const formData = new FormData();
    formData.append('storageType', storageType);
    formData.append('changeNote',  changeNote.trim());
    if (storageType === 'FILE' && file)        formData.append('file', file);
    if (storageType === 'LINK' && externalUrl) formData.append('externalUrl', externalUrl.trim());
    const result = await uploadNewVersion(id, formData);
    if (result.success) {
      setSubmitMsg({ type:'success', text:'✅ New version uploaded successfully!' });
      setTimeout(() => navigate(`/resources/${id}`), 1600);
    } else {
      setSubmitMsg({ type:'error', text: result.message || 'Upload failed. Please try again.' });
    }
  };
  

  // UI-only
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const isAdmin   = user?.role === 'ADMIN';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/signin');
  };

  // Loading state
  if (pageLoading) {
    return (
      <>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ minHeight:'100vh', background:T.appBg, display:'flex', flexDirection:'column' }}>
          <Navbar/>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:`4px solid ${T.primaryLight}`, borderTopColor:T.primary, animation:'spin .8s linear infinite' }}/>
          </div>
          <Footer/>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        ${sharedStyles}

        /* CSS classes  */
        .unv-submit {
          position:relative; overflow:hidden;
          background:${T.primary}; color:white;
          border:none; border-radius:12px;
          font-family:'Inter',sans-serif; font-weight:700; font-size:15px;
          cursor:pointer; transition:all .18s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow:${T.shadowBlue};
        }
        .unv-submit::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent); transition:left .45s ease; }
        .unv-submit:hover::before { left:100%; }
        .unv-submit:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,110,247,0.38); }
        .unv-submit:disabled { opacity:.55; cursor:not-allowed; transform:none; }

        .unv-storage-btn { display:flex; align-items:center; gap:8px; padding:10px 22px; border-radius:10px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:500; cursor:pointer; transition:all .18s; border:2px solid ${T.border}; background:${T.surface}; color:${T.textSecondary}; }
        .unv-storage-btn.active { border-color:${T.primary}; background:${T.primaryLight}; color:${T.primary}; font-weight:600; }

        .unv-drop { border:2px dashed ${T.borderMed}; border-radius:16px; padding:36px 20px; text-align:center; cursor:pointer; transition:all .2s; background:${T.surfaceHover}; }
        .unv-drop:hover, .unv-drop.drag { border-color:${T.primary}; background:${T.primaryLight}; }
        .unv-drop.error { border-color:#EF4444; background:#FEF2F2; }

        .unv-card { background:rgba(255,255,255,0.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.6); border-radius:18px; padding:28px; box-shadow:${T.shadowMd}; }

        .unv-label { display:block; font-size:11px; font-weight:700; color:${T.textSecondary}; letter-spacing:0.07em; text-transform:uppercase; margin-bottom:6px; font-family:'Inter',sans-serif; }

        .unv-input { width:100%; padding:10px 14px; font-size:14px; border:1.5px solid ${T.border}; border-radius:10px; background:white; color:${T.textPrimary}; font-family:'Inter',sans-serif; transition:border-color .15s, box-shadow .15s; outline:none; }
        .unv-input:focus { border-color:${T.primary}80; box-shadow:0 0 0 3px rgba(79,110,247,0.10); }
        .unv-input.err { border-color:#EF4444; background:#FEF2F2; }

        .unv-err { font-size:11.5px; color:#EF4444; margin-top:4px; font-family:'Inter',sans-serif; }

        .unv-cancel { flex:1; text-align:center; padding:13px; border-radius:12px; border:1.5px solid ${T.border}; color:${T.textSecondary}; background:white; font-family:'Inter',sans-serif; font-weight:600; font-size:14px; text-decoration:none; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
        .unv-cancel:hover { border-color:${T.primary}; color:${T.primary}; background:${T.primaryLight}; }

        @keyframes snFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
        @keyframes spin     { to { transform:rotate(360deg); } }
        .unv-spin { width:18px; height:18px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.35); border-top-color:white; animation:spin .7s linear infinite; }
      `}</style>

      <div className="sn-page" style={{ minHeight:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column' }}>

        <Navbar/>

        {/* Body: sidebar + main */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/*  Sidebar  */}
          <aside onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{ width:sidebarOpen?'210px':'68px', flexShrink:0, flexDirection:'column', alignItems:sidebarOpen?'stretch':'center', paddingTop:'20px', paddingBottom:'20px', gap:'3px', background:T.surface, borderRight:`1px solid ${T.border}`, transition:'width .22s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden', position:'sticky', top:0, height:'100vh', boxShadow:sidebarOpen?'0 0 0 1px rgba(79,110,247,0.06), 4px 0 24px rgba(15,23,42,0.08)':T.shadowSm, zIndex:40 }}>

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
              {sidebarOpen && user && (<div style={{margin:'0 8px', padding:'10px 14px',borderRadius:'12px', background: T.primaryLight,border:`1px solid ${T.border}`,display:'flex', alignItems:'center', gap:'10px',}}>
                <div style={{width:'30px', height:'30px', borderRadius:'8px',background: T.primary, display:'flex',alignItems:'center', justifyContent:'center',color:'white', fontSize:'13px', fontWeight:700,flexShrink:0,}}>
                  {user.name?.charAt(0).toUpperCase()} </div>
                  <div style={{ overflow:'hidden' }}>
                    <p style={{ fontSize:'12px', fontWeight:700, color: T.textPrimary, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', margin:0 }}>
                      {user.name?.split(' ')[0]}</p>
                      <p style={{ fontSize:'10px', color: T.textMuted, fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>
                        {user.role}</p>
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

          {/*  Main content — layout/images/cards  */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            <ResourceBanner
              title="Upload New Version"
              subtitle={resource ? `Updating: ${resource.title}` : 'Upload a new version of this resource'}
            />

            <div style={{ position:'relative', flex:1, backgroundImage:'url(/upload-hero.png)', backgroundSize:'cover', backgroundPosition:'center right', backgroundRepeat:'no-repeat' }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(248,250,252,0.92)', pointerEvents:'none' }}/>

              <div style={{ position:'relative', zIndex:1, maxWidth:'700px', margin:'0 auto', padding:'32px 22px 56px' }}>

                {/* Parent resource info box */}
                {resource && (
                  <div style={{ marginBottom:'20px', padding:'14px 18px', borderRadius:'12px', background:T.primaryLight, border:`1px solid ${T.primary}25`, display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:T.primary, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" size={18} color="white"/>
                    </div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:700, color:T.textPrimary, fontFamily:'Plus Jakarta Sans,sans-serif' }}>{resource.title}</div>
                      <div style={{ fontSize:'11px', color:T.textSecondary, fontFamily:'Inter,sans-serif' }}>{resource.moduleCode} · Current version: v{resource.latestVersionId?.versionNumber || 1}</div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:'11px', fontWeight:600, color:T.primary, background:'white', padding:'3px 10px', borderRadius:'8px', border:`1px solid ${T.primary}30`, fontFamily:'Inter,sans-serif' }}>
                      Adding v{(resource.latestVersionId?.versionNumber || 1) + 1}
                    </span>
                  </div>
                )}

                {/* Status message */}
                {submitMsg.text && (
                  <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', padding:'14px 18px', borderRadius:'12px', fontSize:'14px', fontWeight:500, fontFamily:'Inter,sans-serif', background:submitMsg.type==='success'?'#ECFDF5':'#FEF2F2', border:`1px solid ${submitMsg.type==='success'?'#A7F3D0':'#FECACA'}`, color:submitMsg.type==='success'?T.green:'#EF4444', animation:'snFadeUp .3s ease' }}>
                    {submitMsg.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

                  {/* File or Link card */}
                  <div className="unv-card">
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', paddingBottom:'14px', borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon path="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" size={15} color={T.primary}/>
                      </div>
                      <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'15px', fontWeight:700, color:T.textPrimary }}>New Version File</span>
                    </div>

                    <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
                      {['FILE','LINK'].map(st => (
                        <button key={st} type="button" onClick={() => setStorageType(st)} className={`unv-storage-btn${storageType===st?' active':''}`}>
                          {st==='FILE'
                            ? <Icon path="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" size={15} color={storageType==='FILE'?T.primary:T.textMuted}/>
                            : <Icon path="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={15} color={storageType==='LINK'?T.primary:T.textMuted}/>
                          }
                          {st==='FILE' ? 'Upload File' : 'External Link'}
                        </button>
                      ))}
                    </div>

                    {storageType === 'FILE' ? (
                      <div>
                        <div className={`unv-drop${dragOver?' drag':''}${errors.file?' error':''}`}
                          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                          onClick={() => document.getElementById('unvFileInput').click()}>
                          <input id="unvFileInput" type="file" style={{ display:'none' }} onChange={e => handleFileSelect(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"/>
                          {file ? (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Icon path="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" size={24} color={T.primary}/>
                              </div>
                              <p style={{ fontWeight:700, fontSize:'14px', color:T.textPrimary, fontFamily:'Inter,sans-serif', margin:0 }}>{file.name}</p>
                              <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', margin:0 }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} style={{ fontSize:'12px', color:'#EF4444', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Remove file ×</button>
                            </div>
                          ) : (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                              <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={26} color={T.primary}/>
                              </div>
                              <div>
                                <p style={{ fontWeight:600, fontSize:'14px', color:T.textPrimary, fontFamily:'Inter,sans-serif', margin:'0 0 4px' }}>Drop your file here, or <span style={{ color:T.primary }}>browse</span></p>
                                <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', margin:0 }}>{ALLOWED_FORMATS}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {errors.file && <p className="unv-err">{errors.file}</p>}
                      </div>
                    ) : (
                      <div>
                        <label className="unv-label">External URL *</label>
                        <input type="url" value={externalUrl} onChange={e => { setExternalUrl(e.target.value); setErrors(err => ({...err, externalUrl:''})); }} placeholder="https://drive.google.com/..." className={`unv-input${errors.externalUrl?' err':''}`}/>
                        {errors.externalUrl && <p className="unv-err">{errors.externalUrl}</p>}
                      </div>
                    )}
                  </div>

                  {/* Change Note card */}
                  <div className="unv-card">
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px', paddingBottom:'12px', borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={15} color={T.primary}/>
                      </div>
                      <span style={{ fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:'15px', fontWeight:700, color:T.textPrimary }}>What changed?</span>
                    </div>
                    <label className="unv-label">Change Note *</label>
                    <textarea value={changeNote} onChange={e => { setChangeNote(e.target.value); setErrors(err => ({...err, changeNote:''})); }} placeholder="Describe what's new or improved in this version..." rows={3} maxLength={500} className={`unv-input${errors.changeNote?' err':''}`} style={{ resize:'vertical', minHeight:'80px' }}/>
                    {errors.changeNote && <p className="unv-err">{errors.changeNote}</p>}
                    <p style={{ fontSize:'11px', color:T.textMuted, fontFamily:'Inter,sans-serif', marginTop:'5px', textAlign:'right' }}>{changeNote.length}/500</p>
                  </div>

                  {/* Submit row */}
                  <div style={{ display:'flex', gap:'12px' }}>
                    <Link to={`/resources/${id}`} className="unv-cancel">
                      <Icon path="M10 19l-7-7m0 0l7-7m-7 7h18" size={15} color="currentColor"/>
                      Back to Resource
                    </Link>
                    <button type="submit" disabled={loading} className="unv-submit" style={{ flex:2, padding:'13px 28px' }}>
                      {loading ? <div className="unv-spin"/> : <><Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={16} color="white"/>Upload New Version</>}
                    </button>
                  </div>

                </form>
              </div>
            </div>

            <Footer/>
          </div>
        </div>
      </div>
      <ResourceAssistant />

    </>
  );
}
