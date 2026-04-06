import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

export default function Contact() {
  useEffect(() => {
    document.title = 'Contact Us — Skill Nest';
  }, []);
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f 60%,#1e40af)', padding: '52px 6% 32px 6%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Contact <em style={{ color: '#f5a623', fontStyle: 'normal' }}>Us</em></h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.9rem', maxWidth: 440, margin: '0 auto' }}>
          Have a question or need support? We&apos;d love to hear from you.
        </p>
      </section>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 6%', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 28, alignItems: 'start' }}>
        <div>
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 14 }}>
            <h4 style={{ fontSize: '.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>📍 Address</h4>
            <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.7 }}>No. 10, Kandy Road<br/>Malabe, Sri Lanka</p>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 14 }}>
            <h4 style={{ fontSize: '.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>📞 Contact</h4>
            <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.7 }}>Phone: +94 11 000 0000<br/>Email: info@skillnest.lk<br/>Support: support@skillnest.lk</p>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24, marginBottom: 14 }}>
            <h4 style={{ fontSize: '.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>🕐 Support Hours</h4>
            <table style={{ width: '100%', fontSize: '.78rem', marginTop: 6 }}>
              <tbody>
                <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Mon – Fri</td><td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>8:00 AM – 6:00 PM</td></tr>
                <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Saturday</td><td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>9:00 AM – 1:00 PM</td></tr>
                <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Sunday</td><td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>Closed</td></tr>
              </tbody>
            </table>
            <p style={{ marginTop: 6, fontSize: '.72rem' }}>Sri Lanka Standard Time (UTC+5:30)</p>
          </div>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 28 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Send a Message</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>First Name</label><input type="text" placeholder="Kamal" disabled style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none' }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>Last Name</label><input type="text" placeholder="Perera" disabled style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none' }} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>Email</label><input type="email" placeholder="kamal@gmail.com" disabled style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none' }} /></div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>Subject</label>
            <select disabled style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none' }}>
              <option value="">Select a topic...</option>
              <option>General Inquiry</option>
              <option>Booking Issue</option>
              <option>Technical Support</option>
              <option>Account Problem</option>
              <option>Feedback</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '.76rem', fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>Message</label><textarea placeholder="Describe your question..." disabled style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: '.85rem', color: '#0f172a', background: '#f8fafc', outline: 'none', resize: 'vertical', minHeight: 90 }} /></div>
          <button style={{ width: '100%', background: 'linear-gradient(135deg,#1e40af,#2563eb)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '.9rem', border: 'none', borderRadius: 9, padding: 12, cursor: 'not-allowed', opacity: 0.5 }}>Send Message →</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
