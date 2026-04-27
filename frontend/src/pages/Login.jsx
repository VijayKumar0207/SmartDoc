import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { authService } from '../services/api';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (isSignUp) {
      try {
        await authService.signup(name, email, password);
        setSuccess('Account created successfully! Please log in.');
        setIsSignUp(false);
        setPassword('');
      } catch (err) {
        setError(err.response?.data?.detail || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="relative group w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Sign up to start verifying documents' : 'Log in to access secure document signing'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 pl-1">
                <label className="block text-slate-300 text-sm font-medium">Password</label>
                {!isSignUp && <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 font-medium hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500 transition-all"
              >
                {isSignUp ? 'Log In' : 'Sign Up Now'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
