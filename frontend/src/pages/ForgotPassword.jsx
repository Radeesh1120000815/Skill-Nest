import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 🔴 Port 5001 API Call
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
      setEmail(''); // Clear input after success
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-indigo-50 via-white to-purple-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Global Navbar */}
      <div className="w-full z-50 relative">
        <Navbar />
      </div>

      {/* Main Content Area - Centered Card */}
      <main className="flex-1 flex items-center justify-center p-6 mt-[84px] relative overflow-hidden">
        
        {/* Background Blur Effects */}
        <div className="absolute top-10 right-10 md:right-32 w-64 h-64 bg-indigo-200 opacity-30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 md:left-32 w-64 h-64 bg-purple-300 opacity-30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white transition-all">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3 hover:rotate-6 transition-transform">
              <span className="text-4xl -rotate-3">🔐</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">Forgot Password?</h2>
            <p className="text-gray-500 mt-3 font-medium text-sm px-2">
              No worries! Enter your registered email and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Success & Error Messages */}
          {message && (
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-sm font-bold mb-6 border border-green-100 animate-fade-in-down flex items-start">
              <span className="mr-2">✅</span> {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 animate-fade-in-down flex items-start">
              <span className="mr-2">❌</span> {error}
            </div>
          )}

          <form onSubmit={handleForgot} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="user@sliit.lk" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Link...
                </>
              ) : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center text-sm text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Sign In
            </Link>
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

export default ForgotPassword;