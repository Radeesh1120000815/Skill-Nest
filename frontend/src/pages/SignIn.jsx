import { Link } from 'react-router-dom';
import './SignIn.css';
import React, { useEffect, useState } from 'react';
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

export default function SignIn() {
	useEffect(() => {
		document.title = 'Sign In — Skill Nest';
	}, []);
	// State for account type
	const [accountType, setAccountType] = useState('student');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	return (
		<div style={{ background: 'linear-gradient(135deg,#dde8ff 0%,#eef2ff 40%,#f0e8ff 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Navbar />
			<main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 5%' }}>
				<div style={{ background: '#fff', borderRadius: 28, padding: '48px 44px', maxWidth: 440, width: '100%', boxShadow: '0 8px 40px 0 #1e40af11', margin: '0 auto' }}>
					{/* Logo and Title */}
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
							<svg style={{ width: 36, height: 36 }} viewBox="0 0 44 44" fill="none">
								<circle cx="22" cy="22" r="20.5" fill="#eff6ff" stroke="#1e40af" strokeWidth="1.3"/>
								<path d="M11 17 Q22 13.5 22 13.5 L22 24 Q22 24 11 28 Z" fill="#1e40af" opacity=".4"/>
								<path d="M33 17 Q22 13.5 22 13.5 L22 24 Q22 24 33 28 Z" fill="#1e40af" opacity=".9"/>
								<line x1="22" y1="13.5" x2="22" y2="24" stroke="#1e40af" strokeWidth="1.5" strokeLinecap="round"/>
								<circle cx="22" cy="10" r="2.8" fill="#f5a623"/>
								<line x1="22" y1="7.2" x2="22" y2="5" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round"/>
								<line x1="20.2" y1="7.8" x2="18.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round"/>
								<line x1="23.8" y1="7.8" x2="25.5" y2="6.2" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round"/>
								<path d="M13 30 Q22 34 31 30" stroke="#1e40af" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
							</svg>
							<span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#222' }}>Skill <span style={{ color: '#f5a623' }}>Nest</span></span>
						</div>
						<h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', textAlign: 'center', marginBottom: 0 }}>Sign in to your account</h1>
					</div>
					{/* Account Type Selector */}
					<div style={{ margin: '28px 0 18px 0', textAlign: 'center' }}>
						<div style={{ fontWeight: 600, color: '#222', fontSize: '1rem', marginBottom: 12 }}>Select your account type:</div>
						<div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
							<button type="button" onClick={() => setAccountType('student')} style={{ flex: 1, minWidth: 90, padding: '16px 0', borderRadius: 14, border: accountType === 'student' ? '2px solid #3b5bfe' : '2px solid #e5e7eb', background: accountType === 'student' ? '#f5f8ff' : '#f8fafc', color: accountType === 'student' ? '#3b5bfe' : '#222', fontWeight: 600, fontSize: 16, outline: 'none', boxShadow: accountType === 'student' ? '0 2px 8px #3b5bfe22' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
								<span style={{ fontSize: 24 }}>{/* Student icon */}
									<svg width="28" height="28" fill="none" stroke={accountType === 'student' ? '#3b5bfe' : '#888'} strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 9v6c0 2.21 3.58 4 8 4s8-1.79 8-4V9"/></svg>
								</span>
								Student
							</button>
							<button type="button" onClick={() => setAccountType('lecturer')} style={{ flex: 1, minWidth: 90, padding: '16px 0', borderRadius: 14, border: accountType === 'lecturer' ? '2px solid #3b5bfe' : '2px solid #e5e7eb', background: accountType === 'lecturer' ? '#f5f8ff' : '#f8fafc', color: accountType === 'lecturer' ? '#3b5bfe' : '#222', fontWeight: 600, fontSize: 16, outline: 'none', boxShadow: accountType === 'lecturer' ? '0 2px 8px #3b5bfe22' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
								<span style={{ fontSize: 24 }}>{/* Lecturer icon */}
									<svg width="28" height="28" fill="none" stroke={accountType === 'lecturer' ? '#3b5bfe' : '#888'} strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 9v6c0 2.21 3.58 4 8 4s8-1.79 8-4V9"/><circle cx="12" cy="12" r="3"/></svg>
								</span>
								Lecturer
							</button>
							<button type="button" onClick={() => setAccountType('admin')} style={{ flex: 1, minWidth: 90, padding: '16px 0', borderRadius: 14, border: accountType === 'admin' ? '2px solid #3b5bfe' : '2px solid #e5e7eb', background: accountType === 'admin' ? '#f5f8ff' : '#f8fafc', color: accountType === 'admin' ? '#3b5bfe' : '#222', fontWeight: 600, fontSize: 16, outline: 'none', boxShadow: accountType === 'admin' ? '0 2px 8px #3b5bfe22' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
								<span style={{ fontSize: 24 }}>{/* Admin icon */}
									<svg width="28" height="28" fill="none" stroke={accountType === 'admin' ? '#3b5bfe' : '#888'} strokeWidth="1.7" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9h6v6H9z"/></svg>
								</span>
								Admin
							</button>
						</div>
					</div>
					{/* Divider */}
					<div style={{ display: 'flex', alignItems: 'center', margin: '28px 0 18px 0' }}>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
						<div style={{ margin: '0 16px', color: '#888', fontWeight: 500, fontSize: 14 }}>Or continue with</div>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
					</div>
					{/* Google Sign In Button */}
					<button type="button" style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '14px 0', fontWeight: 600, fontSize: 16, color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18, boxShadow: '0 2px 8px #e5e7eb22', cursor: 'pointer' }}>
						<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22 }} />
						Continue with Google
					</button>
					{/* Divider for email sign in */}
					<div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 18px 0' }}>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
						<div style={{ margin: '0 16px', color: '#888', fontWeight: 500, fontSize: 14 }}>Or sign in with email</div>
						<div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
					</div>
					{/* Email Field */}
					<div style={{ marginBottom: 16 }}>
						<label style={{ display: 'block', fontWeight: 600, color: '#222', marginBottom: 6, fontSize: 15 }}>Email address</label>
						<input
							type="email"
							placeholder={
								accountType === 'lecturer' ? 'lecturer@gmail.com' :
								accountType === 'admin' ? 'admin@gmail.com' :
								'you@gmail.com'
							}
							value={email}
							onChange={e => setEmail(e.target.value)}
							style={{ width: '100%', padding: '14px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 16, color: '#222', background: '#f8fafc', outline: 'none', fontWeight: 500 }}
						/>
					</div>
					{/* Password Field */}
					<div style={{ marginBottom: 10, position: 'relative' }}>
						<label style={{ display: 'block', fontWeight: 600, color: '#222', marginBottom: 6, fontSize: 15 }}>Password</label>
						<input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '14px 44px 14px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 16, color: '#222', background: '#f8fafc', outline: 'none', fontWeight: 500 }} />
						<button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
							{showPassword ? (
								<svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5 0-9.27-3.11-10-7 .73-3.89 5-7 10-7 1.61 0 3.13.31 4.5.86"/><path d="M1 1l22 22"/></svg>
							) : (
								<svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="7"/><circle cx="12" cy="12" r="3"/></svg>
							)}
						</button>
					</div>
					{/* Remember me and Forgot password */}
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
						<label style={{ display: 'flex', alignItems: 'center', fontSize: 15, color: '#222', fontWeight: 500 }}>
							<input type="checkbox" style={{ marginRight: 8, accentColor: '#3b5bfe', width: 16, height: 16 }} />
							Remember me
						</label>
						<Link to="/main-forgot" className="signin-link-underline">Forgot your password?</Link>
					</div>
					{/* Sign In Button */}
					<button type="submit" style={{ width: '100%', background: 'linear-gradient(90deg,#2563eb 0%,#3b5bfe 100%)', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 14, padding: '16px 0', marginBottom: 18, boxShadow: '0 4px 18px #3b5bfe22', cursor: 'pointer', transition: 'all .2s' }}>Sign In</button>
					{/* Create account link */}
					<div style={{ textAlign: 'center', fontSize: 15, color: '#222', fontWeight: 500 }}>
						Don't have an account? <Link to="/register" className="signin-link-underline">Create one free</Link>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}
