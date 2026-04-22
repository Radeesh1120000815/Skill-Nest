import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero" style={{ background: "linear-gradient(120deg, #0f172a 0%, #17407b 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="hero-left" style={{ width: "100%", textAlign: "center" }}>
        <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1.5px solid #334155", borderRadius: 24, padding: "8px 28px", fontWeight: 600, color: "#e0e7ef", fontSize: "1.1rem", marginBottom: 32, boxShadow: "0 1px 8px 0 rgba(0,0,0,0.04)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6, display: 'inline' }} xmlns="http://www.w3.org/2000/svg"><path d="M2 8.5L12 4L22 8.5L12 13L2 8.5Z" fill="#bcd1e7" /><path d="M6 10.5V15.5C6 17.1569 8.68629 18.5 12 18.5C15.3137 18.5 18 17.1569 18 15.5V10.5" stroke="#bcd1e7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 13V18.5" stroke="#bcd1e7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Campus Tutoring Platform
        </div>

        <h1 style={{ fontWeight: 800, fontSize: '4rem', marginBottom: 18, letterSpacing: "-1.5px", color: "#fff" }}>
          Welcome to <span style={{ color: '#f5a623', fontStyle: 'normal', fontWeight: 800 }}>Skill Nest</span>
        </h1>

        <p style={{ fontSize: '1.18rem', color: '#cbd5e1', maxWidth: 700, margin: '0 auto', fontWeight: 400, lineHeight: 1.5, marginBottom: 0 }}>
          The all-in-one platform where lecturers create and manage tutoring sessions, students discover and book classes, and everyone stays connected through a seamless approval and meeting workflow.
        </p>

        <div className="hero-btns" style={{ display: 'flex', gap: 28, marginTop: 38, justifyContent: 'center' }}>
          <Link
            className="btn-getstarted join-free-btn"
            to="/signin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              background: '#f5a623',
              color: '#0f172a',
              borderRadius: '18px',
              fontWeight: 700,
              fontSize: '1.15rem',
              border: 'none',
              padding: '16px 40px',
              textDecoration: 'none',
              transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
            }}
          >
            <span style={{ flex: 1 }}>Get Started</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="10" r="10" fill="#d9901a" />
                <path d="M7 10h6m0 0l-2.5-2.5M13 10l-2.5 2.5" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
          <a className="btn-learnmore learn-more-btn" href="#howitworks" style={{
            background: 'none',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 18,
            padding: '16px 40px',
            fontSize: '1.15rem',
            textDecoration: 'none',
            border: '1.5px solid #fff',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
            onClick={e => {
              e.preventDefault();
              const el = document.getElementById('howitworks');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}><path d="M5 8l5 5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;