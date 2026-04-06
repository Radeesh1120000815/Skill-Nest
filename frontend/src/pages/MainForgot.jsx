import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const MainForgot = () => {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		document.title = 'Forgot Password — Skill Nest';
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		if (!email) {
			setError('Email address is required.');
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		setSuccess(true);
	};

	return (
		<>
			<Navbar />
			<main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: 'linear-gradient(135deg,#f5f7ff 0%,#f7f8fd 100%)' }}>
				<div style={{ background: '#fff', borderRadius: 28, padding: '48px 44px', width: '100%', maxWidth: 440, boxShadow: '0 8px 40px 0 rgba(30,64,175,0.10),0 2px 8px 0 rgba(0,0,0,0.06)' }}>
					{/* Logo and Name */}
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
							<img src="/favicon.svg" alt="Skill Nest Logo" style={{ width: 42, height: 42 }} />
							<span style={{ fontSize: '1.18rem', fontWeight: 800, color: '#181c32', letterSpacing: '-.3px' }}>
								Skill <span style={{ color: '#f5a623' }}>Nest</span>
							</span>
						</div>
						{/* Blue lock icon */}
						<div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eaf1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
								<circle cx="16" cy="16" r="16" fill="#eaf1ff" />
								<g>
									<rect x="9" y="15" width="14" height="10" rx="2" fill="#2563eb" fillOpacity="0.12" />
									<rect x="9" y="15" width="14" height="10" rx="2" stroke="#2563eb" strokeWidth="1.5" />
									<path d="M12 15v-3a4 4 0 0 1 8 0v3" stroke="#2563eb" strokeWidth="1.5" fill="none" />
									<circle cx="16" cy="20" r="1.5" fill="#2563eb" />
								</g>
							</svg>
						</div>
						<h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#181c32', textAlign: 'center', marginBottom: 8 }}>Forgot Password?</h1>
						<p style={{ fontSize: '1.05rem', color: '#7b8794', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>No worries! Enter your registered email and we'll send you a link to reset your password.</p>
					</div>
					{!success ? (
						<form onSubmit={handleSubmit}>
							<div style={{ marginBottom: 18 }}>
								<label style={{ display: 'block', fontSize: '.98rem', fontWeight: 700, color: '#181c32', marginBottom: 8 }}>Email Address</label>
								<input type="email" placeholder="you@gmail.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} style={{ width: '100%', padding: '16px 18px', border: `1.5px solid ${error ? '#dc2626' : '#e5e7eb'}`, borderRadius: 14, fontFamily: 'inherit', fontSize: '1.08rem', color: '#181c32', background: '#f8fafc', outline: 'none', transition: 'border-color .2s,box-shadow .2s', boxShadow: error ? '0 0 0 3px #fee2e2' : '0 1px 4px #e5e7eb22' }} />
								<span style={{ display: 'block', fontSize: '.85rem', color: '#dc2626', marginTop: 6, minHeight: 18 }}>{error}</span>
							</div>
							<button type="submit" style={{ width: '100%', background: 'linear-gradient(90deg,#2563eb 0%,#7c3aed 100%)', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: '1.18rem', border: 'none', borderRadius: 14, padding: '16px 0', marginBottom: 18, marginTop: 8, boxShadow: '0 4px 18px #7c3aed22', cursor: 'pointer', transition: 'all .2s' }}>Send Reset Link</button>
							<div style={{ textAlign: 'center', marginTop: 10 }}>
								<Link to="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7c3aed', fontWeight: 600, fontSize: '1.08rem', textDecoration: 'none', transition: 'color .2s' }}>
									<svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', marginRight: 2 }} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
									Back to Sign In
								</Link>
							</div>
						</form>
					) : (
						<div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14, padding: 28, textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
							<div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
								<svg viewBox="0 0 24 24" style={{ width: 26, height: 26, stroke: '#16a34a', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}><polyline points="20 6 9 17 4 12"/></svg>
							</div>
							<h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Check your email!</h3>
							<p style={{ fontSize: '.98rem', color: '#166534', lineHeight: 1.65 }}>We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.</p>
							<div style={{ textAlign: 'center', marginTop: 18 }}>
								<Link to="/signin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7c3aed', fontWeight: 600, fontSize: '1.08rem', textDecoration: 'none', transition: 'color .2s' }}>
									<svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', marginRight: 2 }} viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
									Back to Sign In
								</Link>
							</div>
						</div>
					)}
				</div>
			</main>
			<Footer />
		</>
	);
};

export default MainForgot;
