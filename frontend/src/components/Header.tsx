import React from 'react';
import { Search, Phone, ShieldCheck, History, Sun, Moon } from 'lucide-react';
import { TabType } from '../types';

const DISMISS_DURATION = 12 * 60 * 60 * 1000; // 12 hours

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenCall: () => void;
  onOpenHistory: () => void;
  quoteCount: number;
  onOpenQuoteCart: () => void;
  isAdminLoggedIn?: boolean;
  inquiriesCount?: number;
  user?: { email: string } | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenCall,
  onOpenHistory,
  quoteCount,
  onOpenQuoteCart,
  isAdminLoggedIn = false,
  inquiriesCount = 0,
  user = null,
  theme = 'dark',
  onToggleTheme,
}: HeaderProps) {
  const [showAuthPrompt, setShowAuthPrompt] = React.useState(() => {
    try {
      const dismissedAt = localStorage.getItem('heat_one_auth_prompt_dismissed_at');
      if (dismissedAt) {
        const timePassed = Date.now() - parseInt(dismissedAt, 10);
        return timePassed > DISMISS_DURATION;
      }
      return true;
    } catch {
      return true;
    }
  });

  const dismissPrompt = () => {
    setShowAuthPrompt(false);
    try {
      localStorage.setItem('heat_one_auth_prompt_dismissed_at', Date.now().toString());
    } catch (err) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0C]/90 backdrop-blur-md border-b border-orange-500/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-8 py-4">
        {/* Logo and Brand Title & Trusted Seller Badge Group */}
        <div className="flex items-center gap-4 relative">
          
          {/* Dismissible speech box alert on left of branding */}
          {activeTab === 'home' && showAuthPrompt && !user && (
            <div 
              className={`absolute top-14 left-0 z-50 rounded-xl p-3.5 shadow-2xl flex flex-col gap-2 w-48 text-left animate-fadeIn border-l-4 font-sans ${
                theme === 'light'
                  ? 'bg-white/95 border border-slate-200 border-l-slate-400 text-slate-900'
                  : 'bg-[#0b0c10]/95 border border-orange-500/25 border-l-orange-500 text-zinc-200'
              }`}
              id="create-account-floating-prompt"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-500 uppercase text-[9px] tracking-wider">Account Benefit</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissPrompt();
                  }}
                  className={`${theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-500 hover:text-white'} text-[10px] cursor-pointer`}
                >
                  ✕
                </button>
              </div>
              <span className={`text-[10.5px] leading-relaxed block font-medium ${theme === 'light' ? 'text-slate-600' : 'text-zinc-350'}`}>
                Create a free account to automatically save and track your quotes and inquiries!
              </span>
              <button
                type="button"
                onClick={() => {
                  dismissPrompt();
                  onOpenHistory(); // Triggers locked History Sidebar -> AuthModal open CTA
                }}
                className="text-[9.5px] font-bold font-mono text-orange-400 hover:text-orange-300 uppercase mt-1 text-left block"
              >
                [Register Account]
              </button>
            </div>
          )}

          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="header-logo"
          >
            {/* Company Logo */}
            <div
              className="h-11 w-11 shrink-0 transition-all duration-300 group-hover:scale-105 flex items-center justify-center"
            >
              <img
                src={theme === 'light' ? '/images/logo-light.webp' : '/images/logo.webp'}
                alt="Heat One Technology Logo"
                className="w-full h-full object-contain scale-[1.18]"
                style={{
                  filter: theme === 'light'
                    ? 'drop-shadow(0 1px 4px rgba(234,88,12,0.2))'
                    : 'drop-shadow(0 0 8px rgba(234,88,12,0.65))'
                }}
                draggable={false}
              />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold tracking-wider text-white" id="brand-name">
                HEAT <span className="text-orange-500">ONE</span>
              </div>
              <div className="text-[9px] tracking-[0.25em] text-orange-200/60 uppercase font-mono mt-[-2px]">
                Technology
              </div>
            </div>
          </div>

          {/* Trusted Seller Badge directly to the right */}
          <a
            href="https://www.tradeindia.com/truststamp-member/HEAT-ONE-TECHNOLOGY-8118493/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded shadow-sm border border-zinc-200 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none h-fit shrink-0 shrink-none"
            id="header-trusted-seller-badge"
            title="Verified Trusted Seller on TradeIndia"
          >
            <div className="flex items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="w-4 h-4 text-[#007954] shrink-0" />
            </div>
            <div className="flex flex-col text-left leading-[1.1] font-sans select-none">
              <span className="text-[7.5px] tracking-wider text-[#007954] font-black uppercase leading-none">TRUSTED</span>
              <span className="text-[7.5px] tracking-wider text-[#007954] font-black uppercase leading-none">SELLER</span>
            </div>
          </a>
        </div>

        {/* Navigation Actions */}
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6" id="header-navigation">
          <button
            id="nav-home"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide uppercase transition-all duration-300 relative ${
              activeTab === 'home'
                ? 'text-orange-500 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Home
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>

          <button
            id="nav-products"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide uppercase transition-all duration-300 relative ${
              activeTab === 'products'
                ? 'text-orange-500 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Products
            {activeTab === 'products' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>

          <button
            id="nav-contact"
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide uppercase transition-all duration-300 relative ${
              activeTab === 'contact'
                ? 'text-orange-500 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Contact
            {activeTab === 'contact' && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>

          {isAdminLoggedIn && (
            <button
              id="nav-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 text-xs md:text-sm font-medium tracking-wide uppercase transition-all duration-300 relative flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'text-orange-500 font-semibold'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <span>Admin Panel</span>
              {inquiriesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-black font-extrabold tracking-normal">
                  {inquiriesCount}
                </span>
              )}
              {activeTab === 'admin' && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-500 shadow-[0_0_8px_#ea580c]" />
              )}
            </button>
          )}

          <div className="h-4 w-[1px] bg-zinc-800 self-center mx-1 hidden min-[380px]:block" />

          {/* Steel Light / Dark Theme Toggle */}
          {onToggleTheme && (
            <button
              id="nav-theme-toggle"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to Industrial Dark' : 'Switch to Steel White'}
              aria-label="Toggle Theme"
              className="flex items-center justify-center p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all relative group cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 group-hover:text-yellow-300 transition-colors" />
              )}
              <span className="absolute top-11 right-0 bg-zinc-900 border border-zinc-800 px-2 py-1 text-[9px] font-mono rounded tracking-wider shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none select-none z-50 text-white min-w-max">
                {theme === 'light' ? 'INDUSTRIAL DARK' : 'STEEL WHITE'}
              </span>
            </button>
          )}

          {/* Search Button */}
          <button
            id="nav-search"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Callback Call Trigger */}
          <button
            id="nav-call"
            onClick={onOpenCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call</span>
          </button>

          {/* Inquiry History Ledger */}
          <button
            id="nav-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all relative"
          >
            <History className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">History</span>
            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            )}
          </button>

          {/* Active Quote Request Tab Indicator */}
          {quoteCount > 0 && (
            <button
              id="nav-quote-cart"
              onClick={onOpenQuoteCart}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-950/20 text-xs text-orange-400 hover:bg-orange-600/20 transition-all font-semibold"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>Quote Cart ({quoteCount})</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
