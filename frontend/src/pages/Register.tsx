import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, User, Phone, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [valError, setValError] = useState('');

  const { register, isLoading, error: apiError } = useAuthStore();
  const navigate = useNavigate();

  const handleValidation = () => {
    setValError('');
    if (!name) {
      setValError('Full name is required');
      return false;
    }
    if (!email) {
      setValError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValError('Please enter a valid email address');
      return false;
    }
    if (!phone) {
      setValError('Phone number is required');
      return false;
    }
    if (!password) {
      setValError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setValError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setValError('Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      setValError('You must agree to the Terms & Conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;

    const success = await register(email, password, name, phone);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between select-none pb-8">
      {/* Top Header Background Banner */}
      <div className="relative h-48 w-full overflow-hidden flex items-end">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-60 filter brightness-90" 
          src="https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/background/auth_bg.jpg" 
          alt="auth_bg" 
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        
        <div className="relative z-10 px-6 pb-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">Create Account</h2>
          <p className="text-slate-300 text-sm mt-1">Sign up to explore premium furniture</p>
        </div>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="px-6 flex-grow flex flex-col justify-center mt-4">
        {/* Error Banners */}
        {(valError || apiError) && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs py-3 px-4 rounded-xl">
            {valError || apiError}
          </div>
        )}

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter Your Name"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Email input */}
        <div className="mb-4">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">Email ID</label>
          <div className="relative">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter Your Email"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Phone input */}
        <div className="mb-4">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">Phone Number</label>
          <div className="relative">
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Enter Phone Number"
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password input */}
        <div className="mb-4">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Create Password"
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

        {/* Confirm Password input */}
        <div className="mb-5">
          <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2.5">Confirm Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-card-dark border border-primary-light rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
              placeholder="Confirm Password"
            />
            <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Agree terms */}
        <div className="flex items-center text-xs mb-6">
          <button 
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="flex items-center gap-2 text-slate-300 select-none hover:text-white text-left"
          >
            {agreeTerms ? <CheckSquare size={16} className="text-accent flex-shrink-0" /> : <Square size={16} className="flex-shrink-0" />}
            <span>I agree to all Terms and Privacy Policy</span>
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-accent/25 transition-all active:scale-98 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Footer login prompt */}
      <div className="text-center text-xs mt-6">
        <span className="text-slate-400">Already have an account? </span>
        <Link to="/login" className="text-accent hover:underline font-semibold ml-1">Sign in</Link>
      </div>
    </div>
  );
}
