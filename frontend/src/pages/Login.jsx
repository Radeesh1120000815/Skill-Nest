import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState('junior'); 
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  
  const navigate = useNavigate();

  // Pre-fill from main system login
  useEffect(() => {
    const mainUser = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (mainUser?.email) {
      setEmail(mainUser.email);
      setName(mainUser.name || '');
      setIsLogin(false); // Switch to register tab automatically
    }
  }, []);

  const API_URL = 'http://localhost:5001/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setLoading(true); 

    try {
      let response;
      if (isLogin) {
        response = await axios.post(`${API_URL}/login`, { email, password });
      } else {
        response = await axios.post(`${API_URL}/register`, { name, email, password, role });
      }

      localStorage.setItem('userInfo', JSON.stringify(response.data));
      const userRole = response.data.role?.toLowerCase();
      
      if (userRole === 'senior' || userRole === 'mentor' || userRole === 'both') {
        navigate('/senior-dashboard');
      } else {
        navigate('/junior-dashboard');
      }

    } catch (err) {
      const msg = err.response?.data?.message || 'Connection error.';
        if (!isLogin && msg === 'User already exists') {
        try {
          const updateRes = await axios.put(`${API_URL}/update-kuppi-role`, { email, role });
          localStorage.setItem('userInfo', JSON.stringify(updateRes.data));
          if (role === 'senior') {
            navigate('/senior-dashboard');
          } else {
            navigate('/junior-dashboard');
          }
        } catch (updateErr) {
          setError('Could not update role. Please try again.');
        }
      } else {
        setError(msg);
      }
  } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-[#F8FAFC]">
      
      {/* Global Navbar */}
      <div className="w-full z-50 relative">
        <Navbar />
      </div>

      {/* Main Content Area - Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 mt-[84px]">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row transition-all duration-300">
          
          {/* Left Side - 🌙 Dark Purple to Dark Blue Gradient */}
          <div className="md:w-1/2 relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E3A8A] text-white p-12 flex flex-col justify-center overflow-hidden">
            
            {/* Subtle glowing orbs in the background */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-blue-500 opacity-20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500 opacity-20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight text-white">
                Welcome to<br/>
                <span className="text-blue-300">Kuppi Platform</span>
              </h2>
              <p className="text-indigo-100/80 text-base font-normal leading-relaxed">
                Empowering students and professionals globally through peer-to-peer mentorship and collaborative learning.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isLogin ? 'Sign In' : 'Create an Account'}
              </h3>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                {isLogin ? 'Welcome back! Please enter your details.' : 'Join the platform as a mentor or learner.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5">
              
              {/* Role Toggle Switch */}
              {!isLogin && (
                <div className="flex bg-slate-100/80 p-1.5 rounded-xl mb-5 shadow-inner">
                  <button 
                    type="button" 
                    onClick={() => setRole('junior')} 
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${role === 'junior' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    🎓 Learner
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('senior')} 
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${role === 'senior' ? 'bg-white text-[#312E81] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    👨‍🏫 Mentor
                  </button>
                </div>
              )}

              {/* Error Message Box */}
              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm font-medium border border-red-100 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Full Name</label>
                    <input 
                      type="text" 
                      placeholder={role === 'senior' ? 'e.g. John Doe' : 'e.g. Jane Smith'} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-slate-50 hover:bg-white focus:bg-white transition-all text-slate-800 placeholder-slate-400" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required={!isLogin} 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Email Address</label>
                  <input 
                    type="email" 
                    placeholder={isLogin ? 'user@example.com' : (role === 'senior' ? 'mentor@example.com' : 'learner@example.com')} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-slate-50 hover:bg-white focus:bg-white transition-all text-slate-800 placeholder-slate-400" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-0.5">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 bg-slate-50 hover:bg-white focus:bg-white transition-all text-slate-800 placeholder-slate-400" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm mt-3 pt-2">
                  <label className="flex items-center text-slate-600 cursor-pointer group">
                    <input type="checkbox" className="mr-2.5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]/30 transition-shadow" />
                    <span className="group-hover:text-slate-800 transition-colors">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[#312E81] font-semibold hover:text-[#1E3A8A] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* 🎨 Dark Theme Button */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full mt-6 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5 active:scale-95'} 
                  bg-gradient-to-r from-[#1E1B4B] to-[#1E3A8A] hover:opacity-95`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center text-sm text-slate-500 font-medium">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                className="text-[#312E81] font-bold hover:text-[#1E3A8A] transition-colors ml-1"
              >
                {isLogin ? 'Sign Up here' : 'Sign In'}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Global Footer */}
      <div className="w-full relative z-50">
        <Footer />
      </div>

    </div>
  );
};

export default Login;