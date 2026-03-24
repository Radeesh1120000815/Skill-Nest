import { Link } from 'react-router-dom';

function CTASection() {
  return (
    <section className="cta" style={{ padding: '90px 6% 80px', textAlign: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e40af 100%)' }}>
      <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#fff', marginBottom: 18, lineHeight: 1.1 }}>
        Your Next Great Session<br />
        Starts <em style={{ color: '#f5a623', fontStyle: 'normal' }}>Here</em>
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.18rem', maxWidth: 540, margin: '0 auto 38px' }}>
        Whether you're a lecturer ready to share your expertise or a student looking for the perfect tutor — Skill Nest brings you together.
      </p>
      <Link
        to="/signin"
        className="cta-btn join-skill-nest-btn"
        style={{
          display: 'inline-block',
          fontWeight: 700,
          borderRadius: 14,
          padding: '18px 44px',
          fontSize: '1.18rem',
          textDecoration: 'none',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          border: 'none',
          marginTop: 18,
          transition: 'background 0.2s',
        }}
      >
        Join Skill Nest Now
      </Link>
    </section>
  );
}

export default CTASection;