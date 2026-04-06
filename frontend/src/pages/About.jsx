import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Inline SVG for favicon (matches the HTML and your screenshot)
const Favicon = () => (
  <svg width="24" height="24" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight:8,verticalAlign:'middle'}}>
    <circle cx="22" cy="22" r="20.5" fill="#1a3d28" stroke="#2e7d52" strokeWidth="1.3"/>
    <path d="M11 17 Q22 13.5 22 13.5 L22 24 Q22 24 11 28 Z" fill="#3da066" opacity=".6"/>
    <path d="M33 17 Q22 13.5 22 13.5 L22 24 Q22 24 33 28 Z" fill="#3da066"/>
    <line x1="22" y1="13.5" x2="22" y2="24" stroke="#2e7d52" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="22" cy="10" r="2.8" fill="#f5a623"/>
    <line x1="22" y1="7.2" x2="22" y2="5" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="20.2" y1="7.8" x2="18.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="23.8" y1="7.8" x2="25.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 30 Q22 34 31 30" stroke="#3da066" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  </svg>
);

const team = [
  { name: 'Radeesha De Silva', role: 'CEO & Co-Founder', avatar: '👨‍💼' },
  { name: 'Prabodha Fernando', role: 'CTO & Lead Dev', avatar: '👩‍💻' },
  { name: 'Yasasmi Wanigathunga', role: 'Head of Design', avatar: '👨‍🎨' },
  { name: 'Dasunika Kumarawansha', role: 'Head of Education', avatar: '👩‍🏫' },
];

export default function About() {
  useEffect(() => {
    document.title = 'About Us — Skill Nest';
  }, []);
  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f 60%,#1e40af)', padding: '52px 6% 32px 6%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>About <em style={{ color: '#f5a623', fontStyle: 'normal' }}>Skill Nest</em></h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.9rem', maxWidth: 460, margin: '0 auto' }}>
          Built by students and educators in Sri Lanka to connect campus learners with expert tutors.
        </p>
      </section>
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 6%', flex: 1 }}>
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 30, marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Our Story</h2>
          <p style={{ fontSize: '.88rem', color: '#64748b', lineHeight: 1.75 }}>
            Skill Nest was founded in 2026 by a group of undergraduates and faculty members at SLIIT, Sri Lanka. We saw a clear gap — students struggled to find quality tutoring, and lecturers had no easy way to manage sessions. So we built Skill Nest: a single platform that handles everything from session creation to booking approvals and secure meeting links.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f5a623' }}>1000</div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Students</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f5a623' }}>500+</div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Lecturers</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f5a623' }}>100+</div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Sessions</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f5a623' }}>95%</div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Satisfaction</div>
          </div>
        </div>
        <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: 2, color: '#1e40af', textTransform: 'uppercase', marginBottom: 14 }}>Our Team</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 28 }}>
          {team.map((member, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#1e40af,#f5a623)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', margin: '0 auto 12px' }}>{member.avatar}</div>
              <h4 style={{ fontSize: '.88rem', fontWeight: 700, color: '#0f172a' }}>{member.name}</h4>
              <p style={{ fontSize: '.76rem', color: '#64748b', marginTop: 3 }}>{member.role}</p>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 14, padding: 28, textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>🌟 Our Mission</h3>
          <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            To make quality campus tutoring accessible to every student in Sri Lanka through a seamless, technology-driven platform.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
