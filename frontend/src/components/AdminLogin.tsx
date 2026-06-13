import React, { useState } from 'react';
import { ShieldAlert, Lock, User, Eye, EyeOff, Flame, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { getApiUrl } from '../utils/api';

interface AdminLoginProps {
  onLoginSuccess: (username: string) => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        onLoginSuccess(data.username);
      } else {
        const errMsg = data.detail || 'Verification failed. Invalid Tech ID or security Passkey code.';
        setError(errMsg);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Connection error. Failed to reach the authentication server.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#060608] font-sans" id="admin-login-view">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.03),transparent_60%)] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0b0c10] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative"
        id="login-card"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />
        
        <div className="p-8 space-y-6" id="login-container">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 mx-auto">
              <Flame className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-medium text-white tracking-tight uppercase">
                Internal Portal Access
              </h2>
              <p className="text-xs font-mono text-zinc-500 uppercase mt-1 tracking-wider">
                HEAT ONE TECHNOLOGY SYSTEM LEDGER
              </p>
            </div>
          </div>



          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Tech ID / Username</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin ID"
                className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none rounded-xl py-3 px-4 text-xs text-white transition-all font-mono placeholder:text-zinc-700"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Security Passkey</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 focus:outline-none rounded-xl py-3 px-4 text-xs text-white transition-all font-mono placeholder:text-zinc-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2 font-mono"
                id="login-error-message"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Buttons UI */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Sign In To secure Portal'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-xs font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest rounded-xl transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>

          </form>

        </div>
      </motion.div>
    </div>
  );
}
