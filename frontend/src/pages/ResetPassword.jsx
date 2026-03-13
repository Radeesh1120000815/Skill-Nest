import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match! Please check and try again.');
    }

    setLoading(true);

    try {
      // 🔴 Port 5001 API Call 
      const response = await axios.put(`http://localhost:5001/api/auth/reset-password/${token}`, { 
        password 
      });
      
      setMessage(response.data.message);
      
      // තත්පර 3කින් Login page එකට auto-redirect කරනවා
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Left Side - Security Graphic & Text */}
        <div className="md:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-300 opacity-20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Secure Your<br/>Account
            </h2>
            <p className="text-emerald-50 text-lg font-medium leading-relaxed">
              Create a strong, unique password to protect your Kuppi Platform account and continue your learning journey securely.
            </p>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Create New Password
            </h3>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              You're almost there! Please enter your new password below.
            </p>
          </div>

          {/* Alert Messages */}
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold mb-6 border border-green-100 flex items-center animate-fade-in-down">
              <span className="text-xl mr-2">✅</span> 
              <span>{message} <br/><span className="text-xs font-normal opacity-80">Redirecting to login securely...</span></span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-center animate-fade-in-down">
              <span className="text-xl mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-gray-900 shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-gray-900 shadow-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || message}
              className={`w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 ${loading || message ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Securing Account...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Cancel and return to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;