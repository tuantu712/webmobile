import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [valError, setValError] = useState('');
  
  const { login, isLoading, error: apiError } = useAuthStore();
  const navigate = useNavigate();

  const handleValidation = () => {
    setValError('');
    if (!email) {
      setValError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValError('Please enter a valid email format');
      return false;
    }
    if (!password) {
      setValError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setValError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;

    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  // Mock OAuth Login for Google/Facebook
  const handleMockOAuth = async (provider: 'Google' | 'Facebook' | 'Apple') => {
    setValError('');
    // Use user@fuzzy.com as the default mock account for easy testing
    const success = await login('user@fuzzy.com', '123456');
    if (success) {
      alert(`Successfully signed in via ${provider} OAuth!`);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between select-none pb-8">
      {/* Top Header Background Banner */}
      <div className="relative h-64 w-full overflow-hidden flex items-end">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-90" 
          src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/background/auth_bg.jpg" 
          alt="auth_bg" 
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        
        <div className="relative z-10 px-6 pb-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">Hello Again!</h2>
          <p className="text-slate-300 text-sm mt-1">Welcome back, You have been missed!</p>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="px-6 flex-grow flex flex-col justify-center mt-6">
        {/* Error Banners */}
        {(valError || apiError) && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl">
            {valError || apiError}
          </div>
        )}

        {/* Email input */}
        <div className="mb-5">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email id</label>
          <div className="relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter Your Email"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password input */}
        <div className="mb-5">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter Your Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <Key className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Option row */}
        <div className="flex justify-between items-center text-xs mb-8">
          <button 
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 text-slate-300 select-none hover:text-white"
          >
            {rememberMe ? <CheckSquare size={16} className="text-accent" /> : <Square size={16} />}
            Remember me
          </button>
          <Link to="/forgot-password" className="text-accent hover:underline font-medium">Forgot password?</Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-accent/25 transition-all active:scale-98 disabled:opacity-50 disabled:scale-100"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Division line */}
        <div className="flex items-center justify-center my-6 gap-3">
          <span className="h-px bg-slate-800 flex-grow" />
          <span className="text-slate-500 text-xs tracking-widest uppercase">OR</span>
          <span className="h-px bg-slate-800 flex-grow" />
        </div>

        {/* Social Media Login */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleMockOAuth('Facebook')}
            className="w-12 h-12 rounded-xl bg-card-dark border border-primary-light flex items-center justify-center hover:bg-primary-light transition-colors"
          >
            <img className="h-6 w-6" src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/svg/facebook.svg" alt="facebook" />
          </button>
          <button
            type="button"
            onClick={() => handleMockOAuth('Google')}
            className="w-12 h-12 rounded-xl bg-card-dark border border-primary-light flex items-center justify-center hover:bg-primary-light transition-colors"
          >
            <img className="h-6 w-6" src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/svg/google.svg" alt="google" />
          </button>
          <button
            type="button"
            onClick={() => handleMockOAuth('Apple')}
            className="w-12 h-12 rounded-xl bg-card-dark border border-primary-light flex items-center justify-center hover:bg-primary-light transition-colors"
          >
            <img className="h-6 w-6" src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/svg/apple.svg" alt="apple" />
          </button>
        </div>
      </form>

      {/* Footer signup prompt */}
      <div className="text-center text-xs mt-auto">
        <span className="text-slate-400">Don’t have an account ? </span>
        <Link to="/register" className="text-accent hover:underline font-semibold ml-1">Sign up</Link>
      </div>
    </div>
  );
}
