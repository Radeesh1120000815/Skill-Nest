function HowItWorks() {
  return (
    <section id="howitworks" className="how" style={{ background: '#fff', padding: '70px 0' }}>
      <div className="sec-head" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px' }}>
        <p className="sec-tag" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>how it works</p>
        <h2 className="sec-h2" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', marginBottom: 10 }}>Simple Steps to Get Started</h2>
        <p className="sec-sub" style={{ fontSize: '1.08rem', color: '#94a3b8', margin: 0 }}>
          Whether you're a lecturer or a student, getting started with Skill Nest takes less than two minutes.
        </p>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', marginTop: 48 }}>
          {/* Dashed line */}
          <div style={{ position: 'absolute', top: 36, left: 0, right: 0, height: 0, borderTop: '2px dashed #e2e8f0', zIndex: 0 }}></div>
          {/* Steps */}
          {[
            {
              num: 1,
              title: 'Create an Account',
              desc: 'Sign up with your campus email as a lecturer or student — verified instantly.'
            },
            {
              num: 2,
              title: 'Browse or Post Sessions',
              desc: 'Lecturers publish sessions; students explore and filter by subject or time.'
            },
            {
              num: 3,
              title: 'Book & Get Approved',
              desc: 'Request a seat — the lecturer reviews and approves your booking.'
            },
            {
              num: 4,
              title: 'Join the Session',
              desc: 'Receive your secure meeting link and attend the session seamlessly.'
            }
          ].map((step, i) => (
            <div key={step.num} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f6fafd', border: '2px solid #e2e8f0', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#2563eb' }}>{step.num}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.08rem', color: '#1e293b', margin: 0, marginBottom: 10 }}>{step.title}</h3>
              <p style={{ color: '#64748b', fontSize: '1.01rem', margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;