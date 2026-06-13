import React, { useState, useEffect } from 'react';
import { Product, Inquiry } from '../types';
import { MapPin, Mail, Phone, Clock, FileText, User, Building2, Send, History, Compass, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OtpVerificationModal from './OtpVerificationModal';
import { getApiUrl } from '../utils/api';

export const COUNTRIES = [
  { name: 'India', code: 'IN', dial: '+91' },
  { name: 'United States', code: 'US', dial: '+1' },
  { name: 'United Kingdom', code: 'GB', dial: '+44' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966' },
  { name: 'Oman', code: 'OM', dial: '+968' },
  { name: 'Kuwait', code: 'KW', dial: '+965' },
  { name: 'Qatar', code: 'QA', dial: '+974' },
  { name: 'Bahrain', code: 'BH', dial: '+973' },
  { name: 'Singapore', code: 'SG', dial: '+65' },
  { name: 'Germany', code: 'DE', dial: '+49' },
  { name: 'Canada', code: 'CA', dial: '+1' },
  { name: 'Australia', code: 'AU', dial: '+61' },
  { name: 'France', code: 'FR', dial: '+33' },
  { name: 'Italy', code: 'IT', dial: '+39' },
  { name: 'Japan', code: 'JP', dial: '+81' },
  { name: 'South Korea', code: 'KR', dial: '+82' },
  { name: 'Russia', code: 'RU', dial: '+7' },
  { name: 'China', code: 'CN', dial: '+86' },
  { name: 'South Africa', code: 'ZA', dial: '+27' },
  { name: 'Brazil', code: 'BR', dial: '+55' },
  { name: 'Turkey', code: 'TR', dial: '+90' },
  { name: 'Nepal', code: 'NP', dial: '+977' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94' },
  { name: 'Bangladesh', code: 'BD', dial: '+880' },
];

interface ContactViewProps {
  quoteCart: Product[];
  onClearQuoteCart: () => void;
  customCalculations: string | null;
  onClearCustomCalculations: () => void;
  currentUser?: { email: string } | null;
}

export default function ContactView({
  quoteCart,
  onClearQuoteCart,
  customCalculations,
  onClearCustomCalculations,
  currentUser = null,
}: ContactViewProps) {
  // Input fields state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');

  // Load email if currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    } else {
      setEmail('');
    }
  }, [currentUser]);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Country select dropdown state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to India (+91)
  const [customDialCode, setCustomDialCode] = useState('');

  // OTP Verification state
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    try {
      return sessionStorage.getItem('heat_one_phone_verified') === 'true';
    } catch {
      return false;
    }
  });
  const [verifiedEmail, setVerifiedEmail] = useState(() => {
    try {
      return sessionStorage.getItem('heat_one_verified_email') || '';
    } catch {
      return '';
    }
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'submit' | 'whatsapp' | null>(null);
  
  // Message submits state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiries, setSubmittedInquiries] = useState<Inquiry[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Thane map simulation zoom state
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Load inquiries history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('heat_one_inquiries');
      if (stored) {
        setSubmittedInquiries(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error fetching localStorage inquiries', e);
    }
  }, []);

  // Click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#country-dropdown-wrapper')) {
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

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check verification status first (bypass if logged in)
    const isVerified = !!currentUser || (isPhoneVerified && email === verifiedEmail);
    if (!isVerified) {
      setPendingAction('submit');
      setIsOtpModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    const dialCode = selectedCountry.code === 'CUSTOM' ? customDialCode : selectedCountry.dial;
    const fullPhoneNumber = dialCode + ' ' + phone;

    const newInquiry: Inquiry = {
      id: 'INQ-' + Date.now().toString().substring(7),
      name,
      company,
      email,
      phone: fullPhoneNumber,
      message: message + (customCalculations ? `\n\n[Thermal System Dimension Requirements]:\n${customCalculations}` : ''),
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      products: quoteCart.map(p => p.name)
    };

    try {
      // Send to FastAPI / MongoDB backend
      await fetch(getApiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      });

      const updated = [newInquiry, ...submittedInquiries];
      setSubmittedInquiries(updated);
      localStorage.setItem('heat_one_inquiries', JSON.stringify(updated));

      // Show success message immediately, reset form after 10 seconds delay
      setSubmitSuccess(true);
      setTimeout(() => {
        setName('');
        setCompany('');
        setEmail(currentUser?.email || '');
        setPhone('');
        setMessage('');
        onClearQuoteCart();
        onClearCustomCalculations();
        setSubmitSuccess(false);
      }, 10000);
    } catch (err) {
      console.error('Error submitting inquiry to database', err);
      alert('Failed to transmit inquiry to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSubmit = async (targetPhoneNum: string) => {
    // Validate form fields natively using the form element
    const form = document.getElementById('inquiry-form') as HTMLFormElement;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const dialCode = selectedCountry.code === 'CUSTOM' ? customDialCode : selectedCountry.dial;
    const fullPhoneNumber = dialCode + ' ' + phone;

    // Prepare content for WhatsApp chat pre-fill
    const attachedProducts = quoteCart.map(p => `• ${p.name}`).join('\n');
    const calculationPart = customCalculations ? `\n\n[Thermal System Dimensions]:\n${customCalculations}` : '';

    const textMsg = `Dear Heat One Technology Team,\n\nI came across your website and would like to learn more about your industrial heating solutions. Below are my requirement details:\n\n*Name:* ${name}\n*Company:* ${company || 'Not provided'}\n*Email:* ${email}\n*Phone:* ${fullPhoneNumber}\n\n${attachedProducts ? `*Attached Products for Quote Inquiry:*\n${attachedProducts}` : '*General Inquiry: Product Range Details*'}\n\n*Project Notes / Specifications:*\n${message}${calculationPart}\n\nI look forward to your response.`;

    const encodedText = encodeURIComponent(textMsg);
    const whatsappUrl = `https://wa.me/${targetPhoneNum}?text=${encodedText}`;

    const newInquiry: Inquiry = {
      id: 'INQ-WA-' + Date.now().toString().substring(7),
      name,
      company,
      email,
      phone: fullPhoneNumber,
      message: message + (customCalculations ? `\n\n[Thermal System Dimension Requirements]:\n${customCalculations}` : ''),
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isWhatsApp: true,
      products: quoteCart.map(p => p.name)
    };

    try {
      // Open WhatsApp URL synchronously to avoid popup blocking
      const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Log the WhatsApp inquiry asynchronously (don't await, to keep UX fast)
      fetch(getApiUrl("/api/inquiries"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInquiry),
      }).then(() => {
        const updated = [newInquiry, ...submittedInquiries];
        setSubmittedInquiries(updated);
        localStorage.setItem('heat_one_inquiries', JSON.stringify(updated));
      }).catch((err) => {
        console.error('Error submitting WhatsApp log to database', err);
      });

      // If window failed to open (popup blocked or environment), fallback to navigating current window
      if (!win) {
        window.location.href = whatsappUrl;
      }

      // Reset forms after 10 seconds delay
      setTimeout(() => {
        setName('');
        setCompany('');
        setEmail(currentUser?.email || '');
        setPhone('');
        setMessage('');
        onClearQuoteCart();
        onClearCustomCalculations();
      }, 10000);
    } catch (err) {
      console.error('Error preparing WhatsApp submission', err);
      // Attempt to open WhatsApp even if logging/setup fails
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOtpSuccess = () => {
    setIsPhoneVerified(true);
    setVerifiedEmail(email);
    try {
      sessionStorage.setItem('heat_one_phone_verified', 'true');
      sessionStorage.setItem('heat_one_verified_email', email);
    } catch (e) {}

    // Trigger the actual form submission or WhatsApp click logic
    if (pendingAction === 'submit') {
      handleFormSubmit();
    } else if (pendingAction === 'whatsapp') {
      handleWhatsAppSubmit('919221783525');
    }
    setPendingAction(null);
  };

  const handleClearInquiryHistory = () => {
    setSubmittedInquiries([]);
    try {
      localStorage.removeItem('heat_one_inquiries');
    } catch(e) {}
  };

  return (
    <div className="bg-[#060608] min-h-screen text-zinc-100 py-16 px-4 md:px-8" id="contact-view-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="mb-12" id="contact-header">
          <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-orange-500" />
            <span>Thane Manufacturing Division</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-medium text-white uppercase tracking-tight">
            Contact & Quote Desks
          </h1>
          <div className="h-0.5 w-16 bg-orange-500 mt-3" />
        </div>

        {/* Contact Page Grid split into Detail info card + locator map + Form inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16" id="contact-main-grid">
          
          {/* LEFT: Contact Card Info + Simulated Map */}
          <div className="lg:col-span-5 space-y-6" id="contact-info-col">
            
            {/* Core Details Address Box */}
            <div className="p-6 md:p-8 bg-[#0b0c0f] border border-zinc-900 rounded-xl" id="contact-details-box">
              <h2 className="text-xl font-display font-medium text-white uppercase mb-5 tracking-wide">
                Main Headquarters
              </h2>
              
              <ul className="space-y-4 text-xs md:text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Factory Address</span>
                    <strong className="text-zinc-200">HEAT ONE TECHNOLOGY</strong>
                    <p className="text-zinc-400 mt-0.5 leading-relaxed text-xs">BUS DEPO, PLOT NO A-342, Rd Number 26, CP Talav, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Registered Email</span>
                    <a href="mailto:heatonetechnology@gmail.com" className="hover:text-orange-400 text-zinc-200 font-medium font-mono">heatonetechnology@gmail.com</a>
                    <p className="text-zinc-500 text-[11px]">Sales inquiries receive technical estimates within 4 hours.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Phone Support</span>
                    <a href="tel:+919221783525" className="hover:text-orange-400 text-zinc-200 block font-mono font-medium">+91 92217 83525</a>
                    <a href="tel:+918767655745" className="hover:text-orange-400 text-zinc-300 block font-mono text-xs mt-1">+91 87676 55745</a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Operating Hours</span>
                    <strong className="text-zinc-300">09:30 AM - 06:30 PM (IST)</strong>
                    <p className="text-zinc-500 text-[11px]">Monday through Saturday. Closed on National Gas/Power Grid holidays.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Interactive Vector Map Locator Component */}
            <div className="p-6 bg-[#0b0c0f] border border-zinc-900 rounded-xl relative overflow-hidden flex flex-col justify-between" id="coordinates-interactive-map">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold uppercase text-zinc-300 block">Thane Grid Locator</h3>
                  <span className="text-[10px] font-mono text-orange-500">ZOOM: {mapZoom}x</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal mb-4">
                  BUS DEPO, PLOT NO A-342, Rd Number 26, CP Talav, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604 — Lat: 19.1944° N, Lon: 72.9515° E.
                </p>
              </div>

              {/* Dynamic SVG / Styled HTML Map Grid */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=HEAT+ONE+TECHNOLOGY+BUS+DEPO+PLOT+NO+A-342+Rd+Number+26+CP+Talav+Wagle+Industrial+Estate+Thane+West+Thane+Maharashtra+400604"
                target="_blank"
                rel="noopener noreferrer"
                className="h-44 bg-[#07080a] border border-zinc-800 rounded-lg relative overflow-hidden flex items-center justify-center cursor-pointer select-none group/map block hover:border-orange-500/40 transition-colors" 
                id="svg-map-frame"
                title="Open in Google Maps"
              >
                {/* Simulated Road Lines Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                {/* Major Highway Route representation */}
                <div className="absolute w-full h-[6px] bg-zinc-900/80 border-y border-zinc-700/30 rotate-[12deg]" />
                <div className="absolute w-[8px] h-full bg-zinc-900/80 border-x border-zinc-700/30 left-1/3" />

                {/* Metro blue line route representation */}
                <div className="absolute w-full h-[3px] bg-blue-500/10 border-y border-blue-500/20 bottom-1/4" />

                {/* Animated Pulsing Pointer target */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="relative flex h-5 w-5 justify-center items-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600 shadow-[0_0_8px_#ea580c]"></span>
                  </span>
                  
                  {/* Label overlay popup on hover */}
                  <div className="bg-zinc-950 border border-orange-500/30 px-2 py-1 rounded text-[8px] font-mono mt-1 text-orange-400 uppercase tracking-wider block">
                    HEAT ONE PLANT 1
                  </div>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="bg-zinc-950/90 border border-orange-500/40 px-3 py-1.5 rounded-lg text-[10px] font-mono text-orange-400 uppercase tracking-wider block shadow-xl">
                    Open Google Maps ↗
                  </span>
                </div>

                {/* Grid coordinates */}
                <span className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-600 select-none">
                  19°11&apos;40&quot;N 72°57&apos;05&quot;E
                </span>
                
                <span className="absolute top-1 left-2 text-[8px] font-mono text-zinc-600 select-none bg-zinc-950/60 px-1 rounded">
                  Grid Ref Thane-W-12
                </span>
              </a>

              {/* Map Zoom Controllers */}
              <div className="flex gap-2 mt-4" id="map-controls">
                <button
                  type="button"
                  onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                  className="flex-1 text-center py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  Increase Detail (+)
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoom(Math.max(10, mapZoom - 1))}
                  className="flex-1 text-center py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  Broader View (-)
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT: Inquiries Formulation */}
          <div className="lg:col-span-7 bg-[#0b0c0f] border border-orange-500/10 p-6 md:p-8 rounded-xl relative shadow-2xl" id="contact-form-col">
            <h2 className="text-xl font-display font-medium text-white uppercase mb-5 tracking-wide">
              Estimate Configuration Forms Desk
            </h2>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs md:text-sm flex items-start gap-2.5 animate-fadeIn" id="success-bar">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Inquiry Dispatched Successfully!</strong>
                  <p className="text-xs text-emerald-300/80 mt-1">Our thermal engineering office has received your technical specifications. A digital quote estimate is compiled and will hit your inbox shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4" id="inquiry-form">
              
              {/* Dynamic Notification of cart items */}
              {quoteCart.length > 0 && (
                <div className="p-4 bg-orange-950/15 border border-orange-500/20 rounded-lg text-xs" id="connected-items-banner">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold mb-1 uppercase tracking-wide">
                    <FileText className="w-4 h-4" />
                    <span>Attached Products to this Inquiry</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1 mt-2">
                    {quoteCart.map(item => (
                      <li key={item.id} className="truncate">{item.name} ({item.subtitle})</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={onClearQuoteCart}
                    className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase mt-2 select-none"
                  >
                    [Dismount All Selected Items]
                  </button>
                </div>
              )}

              {/* Dynamic Notification of system dimensions */}
              {customCalculations && (
                <div className="p-4 bg-orange-950/15 border border-orange-500/20 rounded-lg text-xs" id="connected-calc-banner">
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold mb-1 uppercase tracking-wide">
                    <History className="w-4 h-4" />
                    <span>Conjoined Custom Chamber Calculation</span>
                  </div>
                  <p className="text-zinc-400 mt-1 pl-1 italic font-mono text-[11px] leading-relaxed">
                    {customCalculations}
                  </p>
                  <button
                    type="button"
                    onClick={onClearCustomCalculations}
                    className="text-[10px] text-red-400 hover:text-red-300 font-mono uppercase mt-2 select-none block"
                  >
                    [Remove Conjoined Chamber Estimate Data]
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase text-[#9ca3af] tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-500" />
                    <span>Full Contact Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Rajesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs md:text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase text-[#9ca3af] tracking-wide flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Apex Glass Mills Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs md:text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono uppercase text-[#9ca3af] tracking-wide">Corporate Email</label>
                    {currentUser && (
                      <span className="text-[9px] font-mono text-orange-400 uppercase tracking-wider flex items-center gap-1 select-none">
                        <Lock className="w-3 h-3 text-orange-500 shrink-0" />
                        <span>Account Tied</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    disabled={!!currentUser}
                    placeholder="e.g., purchasing@apexmill.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-zinc-900 border focus:outline-none rounded-lg p-3 text-xs md:text-sm text-white font-mono transition-all duration-300 ${
                      currentUser
                        ? 'border-zinc-800/80 text-zinc-400 bg-zinc-950/40 cursor-not-allowed'
                        : 'border-zinc-800 focus:border-orange-500'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase text-[#9ca3af] tracking-wide">Direct Phone Number</label>
                  <div className="flex gap-2">
                    {/* Country Code Selector dropdown */}
                    <div className="relative shrink-0 flex gap-1" id="country-dropdown-wrapper">
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
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-[#9ca3af] tracking-wide">Project Application Notes / Specifications</label>
                <textarea
                  rows={4}
                  placeholder="Detail your operating temperatures, physical dimension shapes, voltage, or quantity required here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-3 text-xs md:text-sm text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(234,88,12,0.3)] disabled:opacity-50 cursor-pointer"
                id="submit-form-btn"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Transmitting Tech Core...' : 'Transmit Quote inquiry Request'}</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-850"></div>
                <span className="flex-shrink mx-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Or send via WhatsApp</span>
                <div className="flex-grow border-t border-zinc-850"></div>
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => handleWhatsAppSubmit('919221783525')}
                  className="w-full py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba56] text-black font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_12px_rgba(37,211,102,0.15)] hover:shadow-[0_4px_20px_rgba(37,211,102,0.3)] active:scale-[0.98] cursor-pointer"
                  id="submit-whatsapp-btn"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.022-.015-.022-.015-.502-.255-.453-.226-.502-.226-.643-.016-.015.022-.44.555-.54.67-.101.115-.202.13-.502-.015-.3-.15-1.268-.468-2.417-1.493-.892-.796-1.493-1.78-1.67-2.08-.178-.3-.02-.46.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.643-1.547-.88-2.112-.233-.562-.47-.487-.643-.496l-.547-.01c-.19 0-.5.07-.76.357-.26.287-1.0 1.0-1.0 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.437.702.302 1.25.485 1.68.623.704.224 1.344.192 1.85.117.564-.083 1.73-.707 1.977-1.39.248-.684.248-1.272.173-1.39-.075-.118-.27-.18-.501-.3zM12 21.8c-1.8 0-3.56-.47-5.12-1.36l-.37-.22-3.6 1 .98-3.5-.24-.38C2.71 15.82 2.19 14 2 12.1c-.1-5.5 4.3-10 9.8-10.1 2.7.1 5.2 1.1 7.1 3 1.9 1.9 3 4.4 2.9 7.1-.1 5.5-4.6 10-10.2 9.7z M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z" />
                  </svg>
                  <span>Chat us at WhatsApp</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

      {/* Email OTP authentication Modal */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <OtpVerificationModal
            isOpen={isOtpModalOpen}
            onClose={() => {
              setIsOtpModalOpen(false);
              setPendingAction(null);
            }}
            email={email}
            onSuccess={handleOtpSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
