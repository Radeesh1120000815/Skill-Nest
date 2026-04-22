// @refresh reset

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const T = {
  // App shell — Kuppi cool blue-gray background
  appBg:          '#ECEEF5',
  surface:        '#FFFFFF',
  surfaceHover:   '#F4F6FB',
  border:         '#E2E6F0',
  borderMed:      '#C8CFDF',

  // Hero gradient — deeper navy like Kuppi
  heroFrom:       '#0D0B2B',
  heroTo:         '#2D2B8F',
  heroPill:       'rgba(255,255,255,0.12)',

  // Primary brand — Kuppi indigo blue
  primary:        '#4F6EF7',
  primaryLight:   '#EEF1FE',
  primaryHover:   '#3B57E8',
  primaryGlow:    'rgba(79,110,247,0.20)',

  // Cyan accent — gradient text highlight like Kuppi
  cyan:           '#38BDF8',
  cyanLight:      '#E0F5FE',

  // Secondary — richer purple
  secondary:      '#7C5CFC',
  secondaryLight: '#EDE9FE',

  // Text
  textPrimary:    '#0F172A',
  textSecondary:  '#4B5675',
  textMuted:      '#8896B3',

  // Status accents
  green:          '#10B981',
  greenLight:     '#ECFDF5',
  yellow:         '#F59E0B',
  yellowLight:    '#FFFBEB',
  orange:         '#F97316',
  orangeLight:    '#FFF7ED',
  red:            '#EF4444',
  redLight:       '#FEF2F2',

  // Shadows — deeper and more dramatic
  shadowSm:   '0 1px 4px rgba(15,23,42,0.07)',
  shadowMd:   '0 4px 16px rgba(15,23,42,0.10)',
  shadowLg:   '0 8px 30px rgba(15,23,42,0.13)',
  shadowBlue: '0 4px 18px rgba(79,110,247,0.28)',
  shadowGlass:'0 8px 32px rgba(79,110,247,0.12)',
};

// ── Helper: role badge style ──────────────────────────────────────────────────
export const roleStyle = (role) => ({
  ADMIN:    { bg:'#FEF2F2', color:'#DC2626', border:'#FECACA'  },
  LECTURER: { bg:'#EDE9FE', color:'#7C5CFC', border:'#DDD6FE'  },
  STUDENT:  { bg:'#EEF1FE', color:'#4F6EF7', border:'#C7D2FD'  },
}[role] || { bg:'#F4F6FB', color:'#4B5675', border:'#C8CFDF' });

// ── Helper: approval status style ────────────────────────────────────────────
export const statusStyle = (status) => ({
  APPROVED: { bg:'#ECFDF5', color:'#059669', border:'#A7F3D0', label:'✅ Approved' },
  PENDING:  { bg:'#FFFBEB', color:'#D97706', border:'#FDE68A', label:'⏳ Pending'  },
  REJECTED: { bg:'#FEF2F2', color:'#DC2626', border:'#FECACA', label:'❌ Rejected' },
}[status] || { bg:'#F4F6FB', color:'#4B5675', border:'#C8CFDF', label: status });

// ── Helper: resource type style ───────────────────────────────────────────────
export const typeStyle = (type) => ({
  NOTES:      { bg:'#EEF1FE', color:'#4F6EF7', border:'#C7D2FD', icon:'📝', label:'Notes',      light:'#EEF1FE' },
  SLIDES:     { bg:'#EDE9FE', color:'#7C5CFC', border:'#DDD6FE', icon:'📊', label:'Slides',     light:'#EDE9FE' },
  PAST_PAPER: { bg:'#FFFBEB', color:'#D97706', border:'#FDE68A', icon:'📄', label:'Past Paper', light:'#FFFBEB' },
  LINK:       { bg:'#E0F5FE', color:'#0284C7', border:'#BAE6FD', icon:'🔗', label:'Link',       light:'#E0F5FE' },
  OTHER:      { bg:'#F4F6FB', color:'#4B5675', border:'#C8CFDF', icon:'📁', label:'Other',      light:'#F4F6FB' },
}[type] || { bg:'#F4F6FB', color:'#4B5675', border:'#C8CFDF', icon:'📁', label: type, light:'#F4F6FB' });

// ── Reusable SVG icon ─────────────────────────────────────────────────────────
export const Icon = ({ path, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// ── Shared CSS — inject with <style>{sharedStyles}</style> ────────────────────
export const sharedStyles = `
  * { box-sizing: border-box; }

  @keyframes snFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes snFadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes snPulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.7} }
  @keyframes snFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes snShimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes snSlide   { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

  .sn-page { font-family:'Inter',sans-serif; background:#ECEEF5; }
  .sn-head { font-family:'Plus Jakarta Sans',sans-serif; }

  /* Primary button */
  .sn-btn {
    background: #4F6EF7; color:#fff; border:none; border-radius:10px;
    font-family:'Inter',sans-serif; font-weight:600; cursor:pointer;
    display:inline-flex; align-items:center; gap:7px;
    transition:all .18s ease;
    box-shadow: 0 4px 18px rgba(79,110,247,0.28);
    text-decoration:none;
  }
  .sn-btn:hover {
    background: #3B57E8;
    transform:translateY(-2px);
    box-shadow: 0 6px 22px rgba(79,110,247,0.38);
  }
  .sn-btn:active { transform:scale(0.97); }

  /* Ghost button */
  .sn-btn-ghost {
    background:transparent; border:1.5px solid #E2E6F0; color:#4B5675;
    border-radius:9px; font-family:'Inter',sans-serif; font-weight:500;
    cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:6px;
    text-decoration:none;
  }
  .sn-btn-ghost:hover { border-color:#4F6EF7; color:#4F6EF7; background:#EEF1FE; }

  /* Danger button */
  .sn-btn-danger {
    background:#FEF2F2; border:1px solid #FECACA; color:#EF4444;
    border-radius:9px; font-family:'Inter',sans-serif; font-weight:500;
    cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:6px;
  }
  .sn-btn-danger:hover { background:#FEE2E2; }

  /* Success button */
  .sn-btn-success {
    background:#ECFDF5; border:1px solid #A7F3D0; color:#059669;
    border-radius:9px; font-family:'Inter',sans-serif; font-weight:600;
    cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:6px;
  }
  .sn-btn-success:hover { background:#D1FAE5; }

  /* Form input */
  .sn-input {
    width:100%; background:#FFFFFF; border:1.5px solid #E2E6F0; border-radius:10px;
    padding:10px 14px; font-size:14px; color:#0F172A;
    font-family:'Inter',sans-serif; transition:border-color .15s, box-shadow .15s; outline:none;
  }
  .sn-input:focus {
    border-color: rgba(79,110,247,0.55);
    box-shadow: 0 0 0 3px rgba(79,110,247,0.12);
  }
  .sn-input::placeholder { color:#8896B3; }

  /* Glassmorphism card */
  .sn-glass {
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.60);
    border-radius: 18px;
    box-shadow: 0 8px 32px rgba(79,110,247,0.10);
  }

  /* Standard card */
  .sn-card {
    background:#FFFFFF; border:1px solid #E2E6F0; border-radius:18px;
    box-shadow: 0 2px 10px rgba(15,23,42,0.07);
    overflow:hidden;
    transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s, border-color .18s;
  }
  .sn-card:hover {
    transform:translateY(-5px);
    box-shadow: 0 16px 40px rgba(79,110,247,0.16);
    border-color: rgba(79,110,247,0.30);
  }

  /* Badge */
  .sn-badge {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600;
    font-family:'Inter',sans-serif; border:1px solid transparent;
  }

  /* Search zone input overrides */
  .sn-search-zone input,
  .sn-search-zone select {
    background:#FFFFFF !important;
    border-color:#E2E6F0 !important;
    color:#0F172A !important;
    caret-color:#4F6EF7 !important;
    font-family:'Inter',sans-serif !important;
    border-radius:10px !important;
  }
  .sn-search-zone input::placeholder { color:#8896B3 !important; }
  .sn-search-zone input:focus,
  .sn-search-zone select:focus {
    border-color: rgba(79,110,247,0.55) !important;
    box-shadow: 0 0 0 3px rgba(79,110,247,0.12) !important;
    color:#0F172A !important; outline:none !important;
  }
  .sn-search-zone select option { background:#FFFFFF; color:#0F172A; }

  /* Staggered grid entrance animation */
  .sn-grid > * { animation: snFadeUp .36s ease both; }
  .sn-grid > *:nth-child(1)  { animation-delay:.03s }
  .sn-grid > *:nth-child(2)  { animation-delay:.07s }
  .sn-grid > *:nth-child(3)  { animation-delay:.11s }
  .sn-grid > *:nth-child(4)  { animation-delay:.15s }
  .sn-grid > *:nth-child(5)  { animation-delay:.19s }
  .sn-grid > *:nth-child(6)  { animation-delay:.23s }
  .sn-grid > *:nth-child(7)  { animation-delay:.27s }
  .sn-grid > *:nth-child(8)  { animation-delay:.31s }
  .sn-grid > *:nth-child(9)  { animation-delay:.35s }

  /* Scrollbar */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#ECEEF5; }
  ::-webkit-scrollbar-thumb { background:#C8CFDF; border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:#4F6EF7; }

  /* Sidebar link */
  .sn-side-link { transition:all .18s ease; }
  .sn-side-link:hover { background:#EEF1FE !important; color:#4F6EF7 !important; }

  /* Sidebar tooltip */
  .sn-tip {
    position:absolute; left:calc(100% + 10px); top:50%; transform:translateY(-50%);
    background:#0F172A; color:#fff; border-radius:7px;
    padding:5px 10px; font-size:12px; white-space:nowrap;
    pointer-events:none; opacity:0; transition:opacity .12s;
    font-family:'Inter',sans-serif; z-index:200;
    box-shadow: 0 4px 14px rgba(15,23,42,0.18);
  }
  .sn-side-link:hover .sn-tip { opacity:1; }
`;
