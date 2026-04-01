import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState('junior'); 
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 🔴 අලුතින් එකතු කළා: Password එක පෙන්වනවද නැද්ද කියලා තීරණය කරන්න
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading සහ Error පෙන්වීමට States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // 🛠️ Backend Base URL
  const API_URL = 'http://localhost:5001/api/auth';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setLoading(true); 

    try {
      let response;
      
      if (isLogin) {
        response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        });
      } else {
        response = await axios.post(`${API_URL}/register`, {
          name,
          email,
          password,
          role,
        });
      }

      localStorage.setItem('userInfo', JSON.stringify(response.data));

      const userRole = response.data.role?.toLowerCase();

      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'lecturer') {
        navigate('/lecturer-dashboard');
      } else if (userRole === 'senior' || userRole === 'mentor' || userRole === 'both') {
        navigate('/senior-dashboard');
      } else {
        navigate('/junior-dashboard');
      }

    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Connection error. Make sure backend is running on port 5001.'
      );
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Left Side - Graphic & Welcome Text */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Welcome to<br/>Kuppi Platform
            </h2>
            <p className="text-indigo-100 text-lg font-medium leading-relaxed">
              Empowering students and professionals globally through peer-to-peer mentorship and collaborative learning.
            </p>
          </div>
        </div>

        {/* Right Side - Two-Way Login/Signup Form */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign In' : 'Create an Account'}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join the platform as a mentor or learner.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Toggle Switch - (Only show when Sign Up) */}
            {!isLogin && (
              <div className="mb-4">
                <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setRole('junior')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'junior' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🎓 Register as Learner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('senior')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'senior' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    👨‍🏫 Register as Mentor
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>
                    Registering as:{' '}
                    <span className="font-semibold text-indigo-600 capitalize">{role}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`font-semibold ${role === 'admin' ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'}`}
                  >
                    👑 Register as Admin
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 animate-fade-in-down">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="animate-fade-in-down">
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                <input type="text" placeholder={role === 'senior' ? 'e.g. John Doe' : 'e.g. Jane Smith'} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all text-gray-900 shadow-sm" value={name} onChange={(e) => setName(e.target.value)} required={!isLogin} />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
              <input type="email" placeholder={isLogin ? 'user@example.com' : (role === 'senior' ? 'mentor@example.com' : 'learner@example.com')} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all text-gray-900 shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* 🔴 Password Field with Show/Hide Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full px-5 py-3.5 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all text-gray-900 shadow-sm" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    // Hide Icon (Eye Slash)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    // Show Icon (Eye)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password සහ Remember me */}
            {isLogin && (
              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full mt-4 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5 active:scale-95'} ${!isLogin && role === 'senior' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              {isLogin ? 'Sign Up here' : 'Sign In here'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;