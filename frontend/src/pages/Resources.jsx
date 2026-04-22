import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const studentResources = [
  {
    icon: '📖',
    title: 'Student Guide',
    desc: 'How to create your account, browse sessions and book your first class.'
  },
  {
    icon: '🗓️',
    title: 'How to Book',
    desc: 'Step-by-step guide to finding and booking tutoring sessions.'
  },
  {
    icon: '🎥',
    title: 'Joining Sessions',
    desc: 'How to join your approved session using your secure meeting link.'
  }
];

const lecturerResources = [
  {
    icon: '📚',
    title: 'Lecturer Handbook',
    desc: 'Creating sessions, managing bookings and sharing meeting links.'
  },
  {
    icon: '✅',
    title: 'Managing Approvals',
    desc: 'How to review and approve or decline student booking requests.'
  },
  {
    icon: '❓',
    title: 'FAQ',
    desc: 'Common questions from students and lecturers answered.'
  }
];

function ResourceCard({ icon, title, desc }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 28, minWidth: 260, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px 0 #1e293b0a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{title}</span>
      </div>
      <div style={{ fontSize: '.95rem', color: '#64748b', marginBottom: 16 }}>{desc}</div>
      <span style={{ display: 'inline-block', fontSize: '.85rem', fontWeight: 600, color: '#2563eb', background: '#f1f5fd', padding: '4px 16px', borderRadius: 8, width: 'fit-content' }}>Coming Soon</span>
    </div>
  );
}

export default function Resources() {
  useEffect(() => {
    document.title = 'Resources — Skill Nest';
  }, []);
  return (
    <div style={{ background: '#f7f9fb', minHeight: '100vh', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <section style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 100%)', padding: '64px 0 48px 0', textAlign: 'center', marginBottom: 0 }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-1px' }}>
          Learning <span style={{ color: '#f5a623' }}>Resources</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '1.1rem', maxWidth: 540, margin: '0 auto' }}>
          Guides and materials to help students and lecturers get the most out of Skill Nest.
        </p>
      </section>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 0', flex: 1 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: 2, color: '#2563eb', textTransform: 'uppercase', marginBottom: 18 }}>For Students</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 28 }}>
            {studentResources.map((r, i) => <ResourceCard key={i} {...r} />)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: 2, color: '#2563eb', textTransform: 'uppercase', marginBottom: 18 }}>For Lecturers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 28 }}>
            {lecturerResources.map((r, i) => <ResourceCard key={i} {...r} />)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
