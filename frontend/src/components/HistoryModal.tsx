import React, { useState, useEffect } from 'react';
import { X, History, Mail, Calendar, Info, MessageSquare, PhoneCall, ExternalLink, LogOut, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/api';

interface Inquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  isWhatsApp?: boolean;
  isCallback?: boolean;
  preferredTime?: string;
  topic?: string;
  products?: string[];
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
}

export default function HistoryModal({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLogout,
  theme = 'dark'
}: HistoryModalProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory();
    }
  }, [isOpen, user]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/api/inquiries?email=${encodeURIComponent(user!.email)}`));
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries || []);
      } else {
        setError("Failed to retrieve inquiry timeline.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full max-w-md border-l h-full shadow-2xl flex flex-col z-10 p-6 overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#070709] border-zinc-900'
        }`}
        id="user-history-sidebar"
      >
        {/* Glow */}
        <div className="absolute -left-20 -top-20 w-44 h-44 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Drawer Header */}
        <div className={`flex items-center justify-between border-b pb-4 mb-5 shrink-0 ${theme === 'light' ? 'border-slate-200' : 'border-zinc-900'}`}>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500 animate-pulse" />
            <h3 className={`text-base font-display font-medium uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              Inquiry Timeline
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 px-1.5 rounded cursor-pointer transition-colors ${
              theme === 'light' ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-zinc-800 text-zinc-500 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-2 scrollbar-thin select-none">
          {!user ? (
            /* Lock / Anonymous state */
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full animate-bounce">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className={`text-sm font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-zinc-200'}`}>
                  Account Sign In Required
                </h4>
                <p className={`text-xs leading-relaxed max-w-xs ${theme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Create a free customer account or log in to keep track of your past operating specifications, conjoined quote carts, and WhatsApp submissions.
                </p>
              </div>

              <div className="w-full space-y-3 pt-4 max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] cursor-pointer"
                >
                  <span>Register / Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Ledger Timeline */
            <div className="space-y-5">
              {/* Account header card */}
              <div className={`border rounded-xl p-4 flex items-center justify-between shrink-0 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-900'
              }`}>
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold font-mono">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className={`text-[10px] font-mono uppercase block leading-none ${theme === 'light' ? 'text-slate-400' : 'text-zinc-450'}`}>Active Account</span>
                    <span className={`text-xs font-mono font-bold block truncate mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-zinc-200'}`} title={user.email}>{user.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className={`p-2 border border-transparent rounded-lg flex items-center justify-center transition-colors cursor-pointer select-none ${
                    theme === 'light' ? 'hover:bg-red-50 hover:border-red-100 text-red-500' : 'hover:bg-zinc-900 hover:border-zinc-800 text-red-400 hover:text-red-300'
                  }`}
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {isLoading ? (
                /* Loading */
                <div className="py-20 text-center text-xs text-zinc-500 font-mono animate-pulse uppercase tracking-widest">
                  Loading timeline records...
                </div>
              ) : error ? (
                /* Error */
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-center text-xs text-red-400 leading-relaxed font-mono">
                  {error}
                </div>
              ) : inquiries.length === 0 ? (
                /* Empty */
                <div className="py-20 text-center space-y-3">
                  <History className="w-8 h-8 text-zinc-700 mx-auto" />
                  <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                    No timeline logs matching your email. Submit an inquiry or callback to see it logged here.
                  </p>
                </div>
              ) : (
                /* Timeline Items list */
                <div className="space-y-4">
                  <div className="text-[10px] font-mono text-zinc-450 uppercase tracking-wider mb-2 pl-1 select-none">
                    Inquiry List Logs ({inquiries.length})
                  </div>
                  {inquiries.map((inq) => {
                    const isCb = inq.isCallback;
                    const isWa = inq.isWhatsApp;
                    
                    let badgeColor = "bg-orange-500/10 border-orange-500/20 text-orange-400";
                    let badgeLabel = "Web Portal Quote";
                    if (isCb) {
                      badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                      badgeLabel = "Callback Request";
                    } else if (isWa) {
                      badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                      badgeLabel = "WhatsApp Chat";
                    }

                    return (
                      <div
                        key={inq.id}
                        className={`border rounded-xl p-4 transition-all space-y-3 text-left font-mono ${
                          theme === 'light' ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-zinc-900/50 border-zinc-850 hover:border-zinc-800'
                        }`}
                      >
                        {/* Meta header */}
                        <div className={`flex items-center justify-between gap-2 border-b pb-2 ${theme === 'light' ? 'border-slate-200' : 'border-zinc-850'}`}>
                          <span className={`text-[8.5px] px-2 py-0.5 rounded-full border font-black uppercase ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                          <span className={`text-[9px] flex items-center gap-1 ${theme === 'light' ? 'text-slate-400' : 'text-zinc-450'}`}>
                            <Calendar className={`w-3 h-3 ${theme === 'light' ? 'text-slate-400' : 'text-zinc-500'}`} />
                            <span>{inq.createdAt.split(',')[0]}</span>
                          </span>
                        </div>

                        {/* Details */}
                        {inq.products && inq.products.length > 0 && (
                          <div className="space-y-1">
                            <span className={`text-[8.5px] uppercase block ${theme === 'light' ? 'text-slate-500' : 'text-zinc-450'}`}>Inquired Products:</span>
                            <div className="flex flex-wrap gap-1">
                              {inq.products.map((p, idx) => (
                                <span key={idx} className={`text-[9.5px] px-2 py-0.5 rounded border truncate max-w-[240px] ${
                                  theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'bg-zinc-950 border-zinc-900 text-zinc-350'
                                }`}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Callback Details */}
                        {isCb && (inq.topic || inq.preferredTime) && (
                          <div className={`p-2 rounded-lg space-y-1 text-[9.5px] ${
                            theme === 'light' ? 'bg-white border border-slate-200' : 'bg-zinc-950/80 border border-zinc-900'
                          }`}>
                            {inq.topic && (
                              <div>
                                <span className={`uppercase ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Topic:</span> 
                                <span className={theme === 'light' ? 'text-slate-700' : 'text-zinc-350'}> {inq.topic}</span>
                              </div>
                            )}
                            {inq.preferredTime && (
                              <div>
                                <span className={`uppercase ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>Preferred Time:</span> 
                                <span className={theme === 'light' ? 'text-slate-700' : 'text-zinc-350'}> {inq.preferredTime}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message */}
                        {inq.message && (
                          <div className="space-y-1">
                            <span className={`text-[8.5px] uppercase block ${theme === 'light' ? 'text-slate-500' : 'text-zinc-450'}`}>Message Notes:</span>
                            <p className={`text-[10px] p-2.5 rounded-lg border whitespace-pre-wrap leading-relaxed ${
                              theme === 'light' ? 'bg-white text-slate-600 border-slate-200' : 'text-zinc-400 bg-zinc-950/60 border-zinc-900'
                            }`}>
                              {inq.message}
                            </p>
                          </div>
                        )}

                        {/* Contact details */}
                        <div className={`text-[8.5px] flex items-center justify-between border-t pt-2.5 ${
                          theme === 'light' ? 'text-slate-500 border-slate-200' : 'text-zinc-500 border-zinc-850/60'
                        }`}>
                          <span className="truncate">Name: {inq.name}</span>
                          <span className="truncate">Tel: {inq.phone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
