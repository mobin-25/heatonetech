import React, { useState, useEffect } from 'react';
import { X, PhoneCall, CheckCircle, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTRIES } from './ContactView';
import { getApiUrl } from '../utils/api';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallModal({ isOpen, onClose }: CallModalProps) {
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Immediate (Under 30 mins)');
  const [topic, setTopic] = useState('Custom Product Quotation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Country selector states
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to India (+91)
  const [customDialCode, setCustomDialCode] = useState('');

  // Click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#modal-country-dropdown-wrapper')) {
        setIsCountryDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const filteredCountries = countrySearch.trim() === ''
    ? COUNTRIES
    : COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dial.includes(countrySearch)
      );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dialCode = selectedCountry.code === 'CUSTOM' ? customDialCode : selectedCountry.dial;
    const fullPhoneNumber = dialCode + ' ' + phone;

    const newInquiry = {
      id: 'INQ-CB-' + Date.now().toString().substring(7),
      name: 'Callback Request',
      company: 'N/A',
      email: 'N/A',
      phone: fullPhoneNumber,
      message: `Preferred Contact Window: ${preferredTime}\nCall Target Topic: ${topic}`,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isCallback: true,
      preferredTime,
      topic,
      products: []
    };

    try {
      await fetch(getApiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      });

      // Keep local list sync
      try {
        const stored = localStorage.getItem('heat_one_inquiries');
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem('heat_one_inquiries', JSON.stringify([newInquiry, ...list]));
      } catch (e) {}

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPhone('');
        onClose();
      }, 3500);
    } catch (err) {
      console.error('Error submitting callback request', err);
      alert('Failed to submit callback request. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        className="relative w-full max-w-md bg-[#0b0c0f] border border-orange-500/15 rounded-xl shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
        id="call-request-modal"
      >
        {/* Background gradient spot */}
        <div className="absolute -right-24 -top-24 w-44 h-44 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-orange-500 animate-bounce" />
            <h3 className="text-base md:text-lg font-display font-medium text-white uppercase tracking-wider">Callback Desk</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 animate-fadeIn" id="call-success">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/35 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            
            <h4 className="text-lg font-semibold text-white">Callback Scheduled!</h4>
            <div className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Our regional technical desk will ring you on <strong className="text-zinc-200">{phone}</strong> under your preference:
              <br />
              <strong className="text-orange-400 font-mono mt-1 block">{preferredTime}</strong>
            </div>

            <p className="text-[10px] text-zinc-600 font-mono">This panel will close shortly...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="call-form">
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Enter your mobile/landline number below. An expert corporate technical assessor will call you back to evaluate furnace heating targets.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400">Direct Phone Number</label>
              <div className="flex gap-2">
                {/* Country Code Selector dropdown */}
                <div className="relative shrink-0 flex gap-1" id="modal-country-dropdown-wrapper">
                  {selectedCountry.code === 'CUSTOM' ? (
                    <div className="flex gap-1 h-full items-stretch">
                      <input
                        type="text"
                        placeholder="+XXX"
                        required
                        value={customDialCode}
                        onChange={(e) => setCustomDialCode(e.target.value)}
                        className="w-20 bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg px-3 text-xs text-white font-mono text-center"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCountry(COUNTRIES[0]);
                          setCustomDialCode('');
                        }}
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3 text-xs text-zinc-400 hover:text-white transition-colors"
                        title="Reset to standard list"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className="h-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3.5 text-xs text-white font-mono flex items-center gap-1.5 focus:outline-none transition-colors"
                    >
                      <span className="text-xs uppercase font-bold text-zinc-400 mr-0.5">{selectedCountry.code}</span>
                      <span>{selectedCountry.dial}</span>
                      <span className="text-[9px] text-zinc-500">▼</span>
                    </button>
                  )}

                  {isCountryDropdownOpen && selectedCountry.code !== 'CUSTOM' && (
                    <div className="absolute left-0 mt-1.5 w-60 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 space-y-2">
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-sans"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="max-h-40 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {filteredCountries.map(c => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                              setCountrySearch('');
                            }}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-900 text-xs flex items-center justify-between group transition-colors"
                          >
                            <span className="truncate text-zinc-350 group-hover:text-white font-sans flex items-center gap-2">
                              <span className="inline-block w-6 text-zinc-500 font-mono text-[10px] font-bold uppercase shrink-0">{c.code}</span>
                              <span>{c.name}</span>
                            </span>
                            <span className="font-mono text-[10px] text-orange-400 font-bold">{c.dial}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="text-[10px] text-zinc-600 text-center py-2 font-mono">No countries found</div>
                        )}
                        <div className="border-t border-zinc-850 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCountry({ name: 'Custom Code', code: 'CUSTOM', dial: '' });
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                            setCustomDialCode('+');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-900 text-xs flex items-center justify-between group transition-colors text-orange-500 hover:text-orange-400 font-medium font-mono"
                        >
                          <span>CUSTOM / OTHER...</span>
                          <span className="text-[10px] text-zinc-500 font-sans">edit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  required
                  placeholder="e.g., 98765-43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs md:text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                <span>Preferred Contact Window</span>
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs text-white"
              >
                <option value="Immediate (Under 30 mins)">Immediate (Under 30 mins)</option>
                <option value="During Corporate Shift (09:30 AM to 06:30 PM)">During Corporate Shift (09:30 AM - 06:30 PM)</option>
                <option value="Next Business Working Morning (09:30 AM)">Next Business Working Morning (09:30 AM)</option>
                <option value="Weekend Special Window (Saturday morning)">Weekend Special Window (Saturday morning)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>Call Target Topic</span>
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs text-white"
              >
                <option value="Custom Product Quotation">Custom Product Quotation</option>
                <option value="Replacement Tube Specifications">Replacement Tube Specifications</option>
                <option value="Large-scale Oven Heat Loss Advice">Large-scale Oven Heat Loss Advice</option>
                <option value="Logistics Shipping Packaging queries">Logistics Shipping Packaging queries</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Reserving Callback Shift...' : 'Request Assessor Callback'}</span>
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
}
