import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useResource } from '../components/context/ResourceContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ResourceBanner from '../components/resources/ResourceBanner.jsx';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';



const SEMESTERS = ['SEMESTER_1', 'SEMESTER_2', 'FULL_YEAR'];
const TYPES     = ['NOTES', 'SLIDES', 'PAST_PAPER', 'LINK', 'OTHER'];
const ALLOWED_FORMATS = 'PDF, DOCX, PPTX, XLSX, TXT, PNG, JPG (max 25 MB)';

//  Sidebar nav 
const NAV = [
  { label:'Back to Hub', to:'/resources',              icon:'M10 19l-7-7m0 0l7-7m-7 7h18', isBack:true },
  { label:'Hub',         to:'/resources',              icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label:'My Uploads',  to:'/resources/my-uploads',   icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { label:'Bookmarks',   to:'/resources/my-bookmarks', icon:'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
  { label:'Upload',      to:'/upload-resource',         icon:'M12 4v16m8-8H4' },
  { label:'Admin Queue', to:'/admin/resources',          icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', adminOnly:true },
];

export default function UploadResource() {
  
  const { createResource, loading } = useResource();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const [form, setForm] = useState({
    title: '', moduleCode: '', moduleName: '', academicYear: '',
    semester: '', type: '', description: '', tags: '',
    storageType: 'FILE', externalUrl: '', changeNote: '',
  });
  const [file,      setFile]      = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [errors,    setErrors]    = useState({});
  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'File size must be under 25 MB' }));
      return;
    }
    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())           errs.title        = 'Title is required';
    //if (!form.moduleCode.trim())      errs.moduleCode   = 'Module code is required';
    //if (!form.moduleName.trim())      errs.moduleName   = 'Module name is required';
    //if (!form.academicYear.trim())    errs.academicYear = 'Academic year is required';
    //if (!form.semester)               errs.semester     = 'Semester is required';
    if (!form.type)                   errs.type         = 'Resource type is required';
    if (form.storageType === 'FILE' && !file)                    errs.file        = 'Please select a file to upload';
    if (form.storageType === 'LINK' && !form.externalUrl.trim()) errs.externalUrl = 'External URL is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => { if (val) formData.append(key, val); });
    if (file) formData.append('file', file);
    const result = await createResource(formData);
    if (result.success) {
      setSubmitMsg({ type: 'success', text: result.message });
      setTimeout(() => navigate('/resources/my-uploads'), 1800);
    } else {
      setSubmitMsg({ type: 'error', text: result.message });
    }
  };

  const isLecturer = user?.role === 'LECTURER' || user?.role === 'ADMIN';
  
  // UI-only
  const location  = useLocation();
  const isAdmin   = user?.role === 'ADMIN';
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

        /*  CSS classes  */
        .ur-submit { position:relative; overflow:hidden; background:${T.primary}; color:white; border:none; border-radius:12px; font-family:'Inter',sans-serif; font-weight:700; font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform .18s, box-shadow .18s; box-shadow:${T.shadowBlue}; }
        .ur-submit::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent); transition:left .45s ease; }
        .ur-submit:hover::before { left:100%; }
        .ur-submit:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(79,110,247,0.38); }
        .ur-submit:active { transform:scale(0.97); }
        .ur-submit:disabled { opacity:.55; cursor:not-allowed; transform:none; }

        .ur-storage-btn { display:flex; align-items:center; gap:8px; padding:10px 22px; border-radius:10px; font-family:'Inter',sans-serif; font-size:13.5px; font-weight:500; cursor:pointer; transition:all .18s; border:2px solid ${T.border}; background:${T.surface}; color:${T.textSecondary}; }
        .ur-storage-btn.active { border-color:${T.primary}; background:${T.primaryLight}; color:${T.primary}; font-weight:600; }
        .ur-storage-btn:hover:not(.active) { border-color:${T.borderMed}; background:${T.surfaceHover}; }

        .ur-drop { border:2px dashed ${T.borderMed}; border-radius:16px; padding:36px 20px; text-align:center; cursor:pointer; transition:all .2s ease; background:${T.surfaceHover}; }
        .ur-drop:hover, .ur-drop.drag { border-color:${T.primary}; background:${T.primaryLight}; }
        .ur-drop.error { border-color:${T.red}; background:#FEF2F2; }

        .ur-card { background:rgba(255,255,255,0.82); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.6); border-radius:18px; padding:28px; box-shadow:${T.shadowMd}; }

        .ur-label { display:block; font-size:11px; font-weight:700; color:${T.textSecondary}; letter-spacing:0.07em; text-transform:uppercase; margin-bottom:6px; font-family:'Inter',sans-serif; }

        .ur-input { width:100%; padding:10px 14px; font-size:14px; border:1.5px solid ${T.border}; border-radius:10px; background:white; color:${T.textPrimary}; font-family:'Inter',sans-serif; transition:border-color .15s, box-shadow .15s; outline:none; }
        .ur-input::placeholder { color:${T.textMuted}; }
        .ur-input:focus { border-color:${T.primary}80; box-shadow:0 0 0 3px rgba(79,110,247,0.10); }
        .ur-input.err { border-color:${T.red}; background:#FEF2F2; }
        .ur-input.err:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.10); }

        .ur-err { font-size:11.5px; color:${T.red}; margin-top:4px; font-family:'Inter',sans-serif; }

        .ur-section-title { font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:700; color:${T.textPrimary}; margin-bottom:20px; display:flex; align-items:center; gap:8px; padding-bottom:12px; border-bottom:1px solid ${T.border}; }
        .ur-section-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:${T.primaryLight}; flex-shrink:0; }

        .ur-back-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:12px 22px; border-radius:12px; border:1.5px solid ${T.border}; color:${T.textSecondary}; background:white; font-family:'Inter',sans-serif; font-weight:600; font-size:14px; text-decoration:none; transition:all .15s; flex:1; }
        .ur-back-btn:hover { border-color:${T.primary}; color:${T.primary}; background:${T.primaryLight}; }

        @keyframes snFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes snPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
        @keyframes spin     { to { transform:rotate(360deg); } }
        .ur-spin { width:18px; height:18px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.35); border-top-color:white; animation:spin .7s linear infinite; }
      `}</style>

      <div className="sn-page" style={{ height:'100vh', background:T.appBg, color:T.textPrimary, display:'flex', flexDirection:'column', overflow: 'hidden' }}>

        <Navbar />

        {/* Body: sidebar + main */}
        <div style={{ display:'flex', flex:1, overflow:'hidden',minHeight: 0 }}>

          {/*  Sidebar */}
          <aside onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}
            className="hidden md:flex"
            style={{ width:sidebarOpen?'210px':'68px', flexShrink:0, flexDirection:'column', alignItems:sidebarOpen?'stretch':'center', paddingTop:'20px', paddingBottom:'20px', gap:'3px', background:T.surface, borderRight:`1px solid ${T.border}`, transition:'width .22s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden',  boxShadow:sidebarOpen?'0 0 0 1px rgba(79,110,247,0.06), 4px 0 24px rgba(15,23,42,0.08)':T.shadowSm, zIndex:40 }}>

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

          {/* Main content — layout/images/cards 100% untouched  */}
          <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

            <ResourceBanner
              title="Upload a Resource"
              subtitle={isLecturer ? 'As a Lecturer, your resource will be published immediately.' : 'Student uploads are reviewed by an admin before going live.'}
            />

            <div style={{ position:'relative', flex:1, backgroundImage:'url(/upload-hero.png)', backgroundSize:'cover', backgroundPosition:'center right', backgroundRepeat:'no-repeat' }}>
              <div style={{ position:'absolute', inset:0, background:'rgba(248,250,252,0.92)', pointerEvents:'none' }}/>

              <div style={{ position:'relative', zIndex:1, maxWidth:'760px', margin:'0 auto', padding:'32px 22px 56px' }}>

                {/* Status message */}
                {submitMsg.text && (
                  <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px', padding:'14px 18px', borderRadius:'12px', fontSize:'14px', fontWeight:500, fontFamily:'Inter,sans-serif', background:submitMsg.type==='success'?T.greenLight:T.redLight, border:`1px solid ${submitMsg.type==='success'?'#A7F3D0':'#FECACA'}`, color:submitMsg.type==='success'?T.green:T.red, animation:'snFadeUp .3s ease' }}>
                    <span style={{ fontSize:'18px' }}>{submitMsg.type==='success'?'✅':'❌'}</span>
                    {submitMsg.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

                  {/* SECTION 1: Resource Information */}
                  <div className="ur-card">
                    <div className="ur-section-title">
                      <div className="ur-section-icon"><Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={15} color={T.primary}/></div>
                      Resource Information
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label className="ur-label">Title *</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Data Structures Mid-Term Notes" className={`ur-input${errors.title?' err':''}`} maxLength={200}/>
                        {errors.title && <p className="ur-err">{errors.title}</p>}
                      </div>
                      <div>
                        <label className="ur-label">Resource Type *</label>
                        <select name="type" value={form.type} onChange={handleChange} className={`ur-input${errors.type?' err':''}`}>
                          <option value="">Select type...</option>
                          {TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                        </select>
                        {errors.type && <p className="ur-err">{errors.type}</p>}
                      </div>
                      <div>
                        <label className="ur-label">Module Code </label>
                        <input name="moduleCode" value={form.moduleCode} onChange={handleChange} placeholder="e.g. CS301" className={`ur-input${errors.moduleCode?' err':''}`} style={{ textTransform:'uppercase' }}/>
                        {errors.moduleCode && <p className="ur-err">{errors.moduleCode}</p>}
                      </div>
                      <div>
                        <label className="ur-label">Module Name </label>
                        <input name="moduleName" value={form.moduleName} onChange={handleChange} placeholder="e.g. Data Structures & Algorithms" className={`ur-input${errors.moduleName?' err':''}`}/>
                        {errors.moduleName && <p className="ur-err">{errors.moduleName}</p>}
                      </div>
                      <div>
                        <label className="ur-label">Academic Year </label>
                        <input name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="e.g. 2023/2024" className={`ur-input${errors.academicYear?' err':''}`}/>
                        {errors.academicYear && <p className="ur-err">{errors.academicYear}</p>}
                      </div>
                      <div>
                        <label className="ur-label">Semester </label>
                        <select name="semester" value={form.semester} onChange={handleChange} className={`ur-input${errors.semester?' err':''}`}>
                          <option value="">Select semester...</option>
                          {SEMESTERS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                        {errors.semester && <p className="ur-err">{errors.semester}</p>}
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label className="ur-label">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief description of what this resource covers..." className="ur-input" maxLength={1000} style={{ resize:'vertical', minHeight:'80px' }}/>
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label className="ur-label">Tags (comma-separated)</label>
                        <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. algorithms, sorting, trees" className="ur-input"/>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: File or Link */}
                  <div className="ur-card">
                    <div className="ur-section-title">
                      <div className="ur-section-icon"><Icon path="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" size={15} color={T.primary}/></div>
                      File or Link
                    </div>
                    <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
                      {['FILE','LINK'].map(st => (
                        <button key={st} type="button" onClick={() => setForm(prev => ({ ...prev, storageType:st }))} className={`ur-storage-btn${form.storageType===st?' active':''}`}>
                          {st==='FILE'
                            ? <Icon path="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" size={15} color={form.storageType==='FILE'?T.primary:T.textMuted}/>
                            : <Icon path="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={15} color={form.storageType==='LINK'?T.primary:T.textMuted}/>
                          }
                          {st==='FILE' ? 'Upload File' : 'External Link'}
                        </button>
                      ))}
                    </div>

                    {form.storageType === 'FILE' ? (
                      <div>
                        <div className={`ur-drop${dragOver?' drag':''}${errors.file?' error':''}`}
                          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                          onClick={() => document.getElementById('fileInput').click()}>
                          <input id="fileInput" type="file" style={{ display:'none' }} onChange={e => handleFileSelect(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"/>
                          {file ? (
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
                              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:T.primaryLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Icon path="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" size={24} color={T.primary}/>
                              </div>
                              <p style={{ fontWeight:700, fontSize:'14px', color:T.textPrimary, fontFamily:'Inter,sans-serif', margin:0 }}>{file.name}</p>
                              <p style={{ fontSize:'12px', color:T.textMuted, fontFamily:'Inter,sans-serif', margin:0 }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} style={{ fontSize:'12px', color:T.red, background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', marginTop:'2px' }}>Remove file ×</button>
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
                        {errors.file && <p className="ur-err" style={{ marginTop:'6px' }}>{errors.file}</p>}
                      </div>
                    ) : (
                      <div>
                        <label className="ur-label">External URL *</label>
                        <input name="externalUrl" value={form.externalUrl} onChange={handleChange} type="url" placeholder="https://drive.google.com/..." className={`ur-input${errors.externalUrl?' err':''}`}/>
                        {errors.externalUrl && <p className="ur-err">{errors.externalUrl}</p>}
                      </div>
                    )}

                    <div style={{ marginTop:'16px' }}>
                      <label className="ur-label">Change Note</label>
                      <input name="changeNote" value={form.changeNote} onChange={handleChange} placeholder="Brief note about this upload (optional)" className="ur-input"/>
                    </div>
                  </div>

                  {/* Submit + Back row */}
                  <div style={{ display:'flex', gap:'12px' }}>
                    <Link to="/resources" className="ur-back-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                      Back to Hub
                    </Link>
                    <button type="submit" disabled={loading} className="ur-submit" style={{ flex:2, padding:'13px 28px' }}>
                      {loading ? <div className="ur-spin"/> : <><Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={16} color="white"/>{isLecturer ? 'Publish Resource' : 'Submit for Review'}</>}
                    </button>
                  </div>

                </form>
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
