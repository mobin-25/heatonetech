import React, { useState } from 'react';
import { X, KeyRound, Mail, Lock, ShieldCheck, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string }, rememberMe: boolean) => void;
  theme?: 'light' | 'dark';
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, theme = 'dark' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Registration OTP phase states
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, rememberMe);
        onClose();
      } else {
        setError(data.detail || "Authentication failed. Check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        setSuccessMsg("Verification OTP sent to your email.");
        if (data.demo_otp) {
          setDemoOtp(data.demo_otp);
        }
      } else {
        setError(data.detail || "Registration failed. Account may already exist.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection error during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError("Please key in a valid 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/verify-register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        // Log in immediately
        onLoginSuccess(data.user, rememberMe);
        onClose();
      } else {
        setError(data.detail || "Incorrect OTP code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("OTP verification server communication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-md border rounded-xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0c0f] border-orange-500/15'
        }`}
        id="user-auth-modal"
      >
        {/* Glow */}
        <div className="absolute -right-24 -top-24 w-52 h-52 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-5 ${theme === 'light' ? 'border-slate-200' : 'border-zinc-900'}`}>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500" />
            <h3 className={`text-base font-display font-medium uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              {step === 'otp' ? 'Email Validation' : 'Customer Account'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Errors & Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-start gap-1.5 leading-snug"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400 flex items-start gap-1.5 leading-snug"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 'form' ? (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-zinc-900 mb-6 font-mono text-xs uppercase select-none">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 font-semibold text-center transition-all ${
                  activeTab === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 pb-3 font-semibold text-center transition-all ${
                  activeTab === 'register' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Authentication Forms */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-3 text-xs md:text-sm text-white font-mono placeholder:font-sans placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-xs md:text-sm text-white font-mono placeholder:font-sans placeholder:text-zinc-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 cursor-pointer select-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-orange-500 cursor-pointer h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-850"
                  />
                  <label htmlFor="remember-me" className="text-[10.5px] font-mono text-zinc-400 uppercase select-none cursor-pointer">
                    Remember Session credentials
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to Account'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type="email"
                      required
                      placeholder="e.g., procurement@industries.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-3 text-xs md:text-sm text-white font-mono placeholder:font-sans placeholder:text-zinc-650"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Password (Min 6 chars)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Choose account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-xs md:text-sm text-white font-mono placeholder:font-sans placeholder:text-zinc-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 cursor-pointer select-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat account password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-10 text-xs md:text-sm text-white font-mono placeholder:font-sans placeholder:text-zinc-650"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 cursor-pointer select-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember-me-reg"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-orange-500 cursor-pointer h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-850"
                  />
                  <label htmlFor="remember-me-reg" className="text-[10.5px] font-mono text-zinc-400 uppercase select-none cursor-pointer">
                    Remember Session credentials
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Sign Up Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleOtpVerifySubmit} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              We have sent a security OTP verification code directly to your email <strong className="text-zinc-200">{email}</strong>. Enter it below to activate your account:
            </p>
            <div className="text-xs md:text-sm text-zinc-500 font-mono leading-relaxed italic mt-1.5">
              *(<strong className="font-bold text-zinc-300">Please check your spam or junk folder</strong> if the code doesn&apos;t arrive)*
            </div>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-center text-lg tracking-[0.5em] text-white font-mono placeholder:tracking-normal placeholder:text-zinc-700"
              />
            </div>

            {demoOtp && (
              <div className="p-2.5 bg-emerald-950/25 border border-emerald-500/20 rounded-lg text-center text-[10px] text-emerald-400 leading-relaxed font-mono">
                <div className="font-sans font-bold uppercase tracking-wider text-[8px] text-emerald-500 mb-0.5">HOTT Local Dev Helper</div>
                Verification OTP code: <span className="font-extrabold select-all underline bg-emerald-900/30 px-1 rounded text-white">{demoOtp}</span> (Email also sent)
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Verify & Login'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full text-center text-[10px] text-zinc-500 hover:text-white uppercase font-mono mt-1 cursor-pointer select-none"
            >
              ← Back to Signup Form
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
