import React, { useState, useEffect } from 'react';
import { X, KeyRound, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getApiUrl } from '../utils/api';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: OtpVerificationModalProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend code countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setIsSending(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/otp/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('verify');
        setResendTimer(30);
        setDemoOtp(data.demo_otp || null);
      } else {
        setError(data.detail || "Failed to transmit verification code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please verify backend state.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please key in a valid 6-digit code.");
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/otp/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        // Verification success!
        onSuccess();
        onClose();
      } else {
        setError(data.detail || "Incorrect verification code. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed. Server connection error.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm bg-[#0b0c0f] border border-orange-500/15 rounded-xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
        id="otp-verification-modal"
      >
        {/* Glow accent */}
        <div className="absolute -right-24 -top-24 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500 animate-pulse" />
            <h3 className="text-base font-display font-medium text-white uppercase tracking-wider">Email Verification</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        {step === 'send' ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              We require verification before submitting quotes. We will send a security OTP passcode to your email address:
            </p>
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-center font-mono text-xs text-orange-400 font-bold select-all truncate">
              {email}
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-start gap-1.5 leading-snug">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSending ? 'Sending Passcode...' : 'Send Verification Email'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter the 6-digit verification code sent to <strong className="text-zinc-200">{email}</strong> below:
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

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-start gap-1.5 leading-snug">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <span>{isVerifying ? 'Authenticating...' : 'Confirm & Verify'}</span>
            </button>

            <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
              <span>Code didn&apos;t arrive?</span>
              {resendTimer > 0 ? (
                <span>Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="text-orange-500 hover:text-orange-400 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
