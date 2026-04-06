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

const faqs = [
  {
    section: 'General',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" on the home page, choose your role (Student, Lecturer, or Admin), fill in your details and click Sign Up.'
      },
      {
        q: 'Is Skill Nest free to use?',
        a: 'Yes! Skill Nest is completely free for all students and lecturers on the campus platform.'
      }
    ]
  },
  {
    section: 'Booking Sessions',
    items: [
      {
        q: 'How do I book a session?',
        a: 'Go to the Sessions page, find a session you like, and click "Book Now". Your request will be sent to the lecturer for approval.'
      },
      {
        q: 'How long does approval take?',
        a: 'Most lecturers respond within a few hours. You\'ll be notified once your booking is approved or declined.'
      },
      {
        q: 'What if a session is full?',
        a: 'The Book Now button will be disabled. Check back later as cancellations may free up seats.'
      }
    ]
  },
  {
    section: 'Joining Sessions',
    items: [
      {
        q: 'How do I join an approved session?',
        a: 'Once approved, you\'ll find your secure meeting link in your dashboard under "My Bookings". Click it at the scheduled time.'
      },
      {
        q: 'What platform are sessions on?',
        a: 'Sessions may be on Zoom, Google Meet, or Microsoft Teams depending on the lecturer\'s preference.'
      }
    ]
  }
];

function FAQSection({ section, items }) {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: 2, color: '#1e40af', textTransform: 'uppercase', marginBottom: 14 }}>{section}</p>
      <div>
        {items.map((item, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 11, marginBottom: 8, overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', cursor: 'pointer', fontSize: '.88rem', fontWeight: 600, color: '#0f172a' }}
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {item.q}
              <span style={{ color: '#64748b', fontSize: '1rem', transition: 'transform .2s', transform: open === idx ? 'rotate(45deg)' : 'none' }}>+</span>
            </div>
            {open === idx && (
              <div style={{ padding: '0 18px 14px', fontSize: '.82rem', color: '#64748b', lineHeight: 1.65 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelpCenter() {
  useEffect(() => {
    document.title = 'Help Center — Skill Nest';
  }, []);
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f 60%,#1e40af)', padding: '52px 6% 32px 6%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}><em style={{ color: '#f5a623', fontStyle: 'normal' }}>Help</em> Center</h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.9rem', maxWidth: 460, margin: '0 auto' }}>
          Find quick answers to common questions about using Skill Nest.
        </p>
      </section>
      {/* Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 6%', flex: 1 }}>
        {faqs.map((faq, i) => (
          <FAQSection key={i} section={faq.section} items={faq.items} />
        ))}
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius: 14, padding: 30, textAlign: 'center', marginTop: 32 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Still need help?</h3>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', marginBottom: 18 }}>Our support team is available Mon–Fri, 8:00 AM – 6:00 PM (SLST).</p>
          <span style={{ display: 'inline-block', background: '#94a3b8', color: '#fff', fontWeight: 700, fontSize: '.85rem', padding: '10px 24px', borderRadius: 9, cursor: 'not-allowed' }}>Contact Support</span>
        </div>
      </main>
      <Footer />
    </div>
  );
}
