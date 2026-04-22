function Features() {
  return (
    <section className="features" style={{ background: '#f6fafd', padding: '70px 0' }}>
      <div className="sec-head" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px' }}>
        <p className="sec-tag" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>platform features</p>
        <h2 className="sec-h2" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>Everything You Need to Teach & Learn</h2>
        <p className="sec-sub" style={{ fontSize: '1.08rem', color: '#94a3b8', margin: 0 }}>
          From session creation to live meetings — Skill Nest handles the entire tutoring lifecycle<br />so you can focus on what matters most.
        </p>
      </div>
      <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, maxWidth: 1400, margin: '0 auto' }}>
        {/* Card 1 */}
        <div className="feat-card" style={{ background: '#fff', border: '1.5px solid #e8edf3', borderRadius: 22, padding: '38px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 12px 0 rgba(30,64,175,0.03)' }}>
          <div className="feat-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf2fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="4" fill="#6ea8fe" /><rect x="8" y="12" width="16" height="8" rx="2" fill="#b0b9c9" /><rect x="12" y="16" width="8" height="4" rx="1" fill="#94e0c6" /></svg>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.18rem', color: '#1e293b', margin: 0, marginBottom: 10 }}>Create Sessions</h3>
          <p style={{ color: '#64748b', fontSize: '1.01rem', margin: 0 }}>Lecturers set up tutoring sessions in seconds — define the subject, pick a date and time, set capacity limits, and publish for students to discover.</p>
        </div>
        {/* Card 2 */}
        <div className="feat-card" style={{ background: '#fff', border: '1.5px solid #e8edf3', borderRadius: 22, padding: '38px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 12px 0 rgba(30,64,175,0.03)' }}>
          <div className="feat-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="4" fill="#b0b9c9" /><rect x="8" y="12" width="16" height="8" rx="2" fill="#6ea8fe" /><rect x="12" y="16" width="8" height="4" rx="1" fill="#ffe4a6" /></svg>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.18rem', color: '#1e293b', margin: 0, marginBottom: 10 }}>Smart Booking</h3>
          <p style={{ color: '#64748b', fontSize: '1.01rem', margin: 0 }}>Students browse sessions, filter by subject or lecturer, and request enrollment with a single click — no back-and-forth emails needed.</p>
        </div>
        {/* Card 3 */}
        <div className="feat-card" style={{ background: '#fff', border: '1.5px solid #e8edf3', borderRadius: 22, padding: '38px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 12px 0 rgba(30,64,175,0.03)' }}>
          <div className="feat-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#eafaf2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="4" fill="#b0b9c9" /><rect x="8" y="12" width="16" height="8" rx="2" fill="#94e0c6" /><rect x="12" y="16" width="8" height="4" rx="1" fill="#6ea8fe" /><path d="M10 18l4 4 8-8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.18rem', color: '#1e293b', margin: 0, marginBottom: 10 }}>Approval Workflow</h3>
          <p style={{ color: '#64748b', fontSize: '1.01rem', margin: 0 }}>Lecturers stay in control — review booking requests, approve or decline students, and manage class sizes for quality experiences.</p>
        </div>
        {/* Card 4 */}
        <div className="feat-card" style={{ background: '#fff', border: '1.5px solid #e8edf3', borderRadius: 22, padding: '38px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: '0 2px 12px 0 rgba(30,64,175,0.03)' }}>
          <div className="feat-icon" style={{ width: 48, height: 48, borderRadius: 12, background: '#f6f0fa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="16" rx="4" fill="#b0b9c9" /><rect x="8" y="12" width="16" height="8" rx="2" fill="#c6b4e0" /><rect x="12" y="16" width="8" height="4" rx="1" fill="#6ea8fe" /><path d="M16 12v8" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.18rem', color: '#1e293b', margin: 0, marginBottom: 10 }}>Secure Meeting Links</h3>
          <p style={{ color: '#64748b', fontSize: '1.01rem', margin: 0 }}>Once approved, lecturers share private video meeting links directly with enrolled students — keeping sessions secure and organised.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;