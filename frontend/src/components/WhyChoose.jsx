import { Link } from 'react-router-dom';

function WhyChoose() {
  return (
    <section className="why">
      <div className="sec-head">
        <p className="sec-tag">why skill nest</p>
        <h2 className="sec-h2">The Smarter Choice for Campus Learning</h2>
        <p className="sec-sub">
          See how Skill Nest compares to traditional tutoring methods and generic video platforms — built specifically for campus needs.
        </p>
      </div>
      <div className="compare-wrap">
        <table className="compare-table" style={{ borderRadius: 16, overflow: 'hidden', border: '1.5px solid #e8edf3', boxShadow: '0 2px 16px 0 rgba(30,64,175,0.04)', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f6fafd' }}>
              <th style={{ textAlign: 'left', color: '#b0b9c9', fontWeight: 700, fontSize: '1rem', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit', padding: '18px 18px' }}>Feature</th>
              <th style={{ background: '#1746b0', color: '#fff', position: 'relative', fontWeight: 700, fontSize: '1rem', textAlign: 'center', minWidth: 160, textTransform: 'uppercase', fontFamily: 'inherit', padding: '18px 18px' }}>
                skill nest
                <span style={{ display: 'block', marginTop: 6 }}>
                  <span style={{ background: '#f5a623', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem', borderRadius: 12, padding: '2px 12px', marginLeft: 4, letterSpacing: 0.5, textTransform: 'none' }}>★ best choice</span>
                </span>
              </th>
              <th style={{ background: '#f6fafd', color: '#b0b9c9', fontWeight: 700, fontSize: '1rem', textAlign: 'center', minWidth: 120, textTransform: 'uppercase', fontFamily: 'inherit', padding: '18px 18px' }}>traditional</th>
              <th style={{ background: '#f6fafd', color: '#b0b9c9', fontWeight: 700, fontSize: '1rem', textAlign: 'center', minWidth: 120, textTransform: 'uppercase', fontFamily: 'inherit', padding: '18px 18px' }}>video calls</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 1 */}
            <tr style={{ background: '#fafdff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><path d="M12 7L17 9.5L12 12L7 9.5L12 7Z" fill="#b0b9c9" /><path d="M7 9.5V14.5C7 16.1569 9.68629 17.5 13 17.5C16.3137 17.5 19 16.1569 19 14.5V9.5" stroke="#b0b9c9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 12V17.5" stroke="#b0b9c9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Session Scheduling</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fff7e6" /><text x="14" y="19" textAnchor="middle" fontSize="20" fill="#f5a623">~</text></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
            </tr>
            {/* Row 2 */}
            <tr style={{ background: '#fff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><path d="M7 13l3 3 7-7" stroke="#6ea8fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Booking Approval</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
            </tr>
            {/* Row 3 */}
            <tr style={{ background: '#fff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><path d="M12 8v4l3 3" stroke="#6ea8fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="9" stroke="#b0b9c9" strokeWidth="1.5" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Secure Meeting Links</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fff7e6" /><text x="14" y="19" textAnchor="middle" fontSize="20" fill="#f5a623">~</text></svg>
              </td>
            </tr>
            {/* Row 4 */}
            <tr style={{ background: '#fff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><path d="M7 17h10M7 13h10M7 9h10" stroke="#6ea8fe" strokeWidth="2" strokeLinecap="round" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Seat Capacity Control</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
            </tr>
            {/* Row 5 */}
            <tr style={{ background: '#fff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><circle cx="12" cy="12" r="6" stroke="#6ea8fe" strokeWidth="2" /><path d="M12 8v4l3 3" stroke="#6ea8fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Session Discovery</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
            </tr>
            {/* Row 6 */}
            <tr style={{ background: '#fff' }}>
              <td style={{ border: 'none', borderBottom: '1px solid #e8edf3', padding: '0 18px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: 'middle' }} xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="#eaf2fa" /><path d="M12 17c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="#f5a623" /><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41 1.41M6.34 6.34L4.93 4.93" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  <span style={{ fontWeight: 500, fontSize: '1.05rem', color: '#1e293b' }}>Free for Students</span>
                </div>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#eaf2fa" /><path d="M8 14l4 4 8-8" stroke="#6ea8fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fbeaea" /><path d="M9 9l10 10M19 9L9 19" stroke="#f36c6c" strokeWidth="2.5" strokeLinecap="round" /></svg>
              </td>
              <td style={{ textAlign: 'center', border: 'none', borderBottom: '1px solid #e8edf3', padding: '18px 18px' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#fff7e6" /><text x="14" y="19" textAnchor="middle" fontSize="20" fill="#f5a623">~</text></svg>
              </td>
            </tr>
            {/* Footer row */}
            <tr style={{ background: '#f6fafd' }}>
              <td colSpan={1} style={{ color: '#b0b9c9', fontWeight: 500, fontSize: '1rem', border: 'none', borderBottom: 'none', paddingTop: 18, textTransform: 'none', paddingLeft: 18 }}>Ready to get started?</td>
              <td colSpan={1} style={{ textAlign: 'center', border: 'none', borderBottom: 'none', paddingTop: 10 }}>
                <Link to="/signin" style={{ background: '#1746b0', color: '#fff', fontWeight: 700, borderRadius: 10, padding: '10px 32px', fontSize: '1.05rem', textDecoration: 'none', display: 'inline-block', boxShadow: '0 2px 8px 0 #1746b033' }}>
                  Join Free <span style={{ fontSize: '1.1em', marginLeft: 6 }}>&rarr;</span>
                </Link>
              </td>
              <td colSpan={2} style={{ border: 'none', borderBottom: 'none' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default WhyChoose;