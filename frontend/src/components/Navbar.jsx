import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ background: '#0f172a', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 200 }}>
      <Link className="logo" to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minHeight: 68 }}>
        <img src="/favicon.svg" alt="Skill Nest Logo" className="logo-img" style={{ width: 42, height: 42, marginRight: 12, verticalAlign: 'middle' }} />
        <span className="logo-name" style={{ fontWeight: 800, fontSize: "1.28rem", color: "#fff", letterSpacing: 0.2 }}>
          Skill <span style={{ color: "#f5a623" }}>Nest</span>
        </span>
      </Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link className="nav-a" to="/" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Home</Link>
        <Link className="nav-a" to="/resources" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Resources</Link>
        <Link className="nav-a" to="/sessions" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Sessions</Link>
        <Link className="nav-a" to="/help-center" style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}>Help Center</Link>
        <Link className="nav-btn" to="/signin" style={{ fontWeight: 700, borderRadius: 10, padding: '10px 28px', textDecoration: 'none', marginLeft: 10, fontSize: '1rem', boxShadow: '0 2px 8px 0 #f5a62333', border: 'none' }}>Sign In</Link>
      </div>
    </nav>
  );
}

export default Navbar;