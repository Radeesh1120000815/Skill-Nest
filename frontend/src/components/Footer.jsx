import { Link, useNavigate } from 'react-router-dom';

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <footer style={{ background: '#10182b', color: '#7b8794', padding: '64px 0 36px' }}>
      <div className="foot-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, maxWidth: 1200, margin: '0 auto 48px' }}>
        <div className="foot-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <img src="/favicon.svg" alt="Skill Nest Logo" style={{ width: 38, height: 38, marginRight: 12 }} />
            <span className="logo-name" style={{ fontWeight: 800, fontSize: '1.22rem', color: '#fff' }}>
              Skill <span style={{ color: '#f5a623' }}>Nest</span>
            </span>
          </div>
          <p style={{ color: '#b0b9c9', fontSize: '1.08rem', margin: 0, maxWidth: 380, lineHeight: 1.6 }}>
            Connecting lecturers and students through a streamlined session management platform — from booking to meeting, all in one place.
          </p>
        </div>
        <div className="foot-col">
          <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 18, letterSpacing: 1 }}>QUICK LINKS</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link to="/sessions" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>Sessions</Link></li>
            <li><Link to="/about" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>About Us</Link></li>
            <li><Link to="/contact" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>Contact</Link></li>
            <li><Link to="/help-center" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block' }} onClick={scrollToTop}>Support</Link></li>
          </ul>
        </div>
        <div className="foot-col">
          <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 18, letterSpacing: 1 }}>RESOURCES</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><Link to="/help-center" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>Help Center</Link></li>
            <li><Link to="/resources" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>Student Guide</Link></li>
            <li><Link to="/resources" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }} onClick={scrollToTop}>Lecturer Portal</Link></li>
            <li><Link to="/resources" className="footer-link" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block' }} onClick={scrollToTop}>FAQ</Link></li>
          </ul>
        </div>
        <div className="foot-col">
          <h5 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 18, letterSpacing: 1 }}>CONNECT</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><a href="#" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }}>Twitter</a></li>
            <li><a href="#" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }}>LinkedIn</a></li>
            <li><a href="#" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block', marginBottom: 10 }}>Facebook</a></li>
            <li><a href="#" style={{ color: '#b0b9c9', textDecoration: 'none', display: 'block' }}>Instagram</a></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #232c3d', margin: '32px 0 0', paddingTop: 18, textAlign: 'center', color: '#7b8794', fontSize: '1rem' }}>
        © 2026 Skill Nest. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;