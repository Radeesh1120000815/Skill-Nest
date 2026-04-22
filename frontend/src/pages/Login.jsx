import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import { Shield, Mail, Lock, User, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 bg-[#f8fafc] dark:bg-[#0f172a]">
      
      {/* Global Navbar */}
      <div className="w-full z-50 relative">
        <Navbar />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 mt-[68px]">
        <div className="max-w-6xl w-full glass-card overflow-hidden flex flex-col md:flex-row min-h-[650px] shadow-2xl">
          
          {/* Left Side - Visual Content */}
          <div className="md:w-5/12 relative bg-indigo-900 text-white p-12 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="/kuppi-login-bg.png" 
                alt="Kuppi Artwork" 
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/40 to-transparent"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-8">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>Secure Access</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tighter">
                Master Your <br/>
                <span className="text-cyan-400">Future</span> at <br/>
                Kuppi Co.
              </h2>
              <p className="text-indigo-100/70 text-lg font-medium leading-relaxed max-w-sm">
                Join thousands of students and mentors in the ultimate peer-to-peer learning experience.
              </p>
            </div>

            <div className="relative z-10 mt-auto pt-10 border-t border-white/10 items-center gap-4 hidden md:flex">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-indigo-200">Joined by 5k+ students this week</p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-slate-900/50">
            <div className="mb-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  {isLogin ? 'Welcome Back' : 'Get Started'}
                </span>
                <span className="text-3xl">👋</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isLogin ? "Enter your credentials to access your dashboard." : "Create your account to start your learning journey."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {!isLogin && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
                  <button 
                    type="button" 
                    onClick={() => setRole('junior')} 
                    className={`flex-1 py-3 text-sm font-bold rounded-[0.9rem] transition-all duration-300 flex items-center justify-center gap-2 ${role === 'junior' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    <User className="w-4 h-4" /> Learner
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('senior')} 
                    className={`flex-1 py-3 text-sm font-bold rounded-[0.9rem] transition-all duration-300 flex items-center justify-center gap-2 ${role === 'senior' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    <Shield className="w-4 h-4" /> Mentor
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-sm font-bold border border-rose-100 dark:border-rose-900/30 animate-shake">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. Alex Johnson" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 dark:bg-slate-800/50 dark:text-white transition-all" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required={!isLogin} 
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="name@university.com" 
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 dark:bg-slate-800/50 dark:text-white transition-all" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50 dark:bg-slate-800/50 dark:text-white transition-all" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                      <CheckCircle className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <Link to="/forgot-password" virtual="true" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-premium py-4 shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isLogin ? 'Sign In to Account' : 'Create My Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isLogin ? "First time here?" : "Already have an account?"}
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setError(null); }} 
                  className="ml-2 font-black text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />

    </div>
  );
};

export default Login;