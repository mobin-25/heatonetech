import React, { useState, useEffect, useRef } from 'react';
import { COMPANY_FACTS, OTHER_FACTS } from '../data';
import { CompanyFact, Product } from '../types';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users, 
  Factory, 
  Warehouse, 
  Truck, 
  ReceiptText, 
  CreditCard,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  Mail,
  Phone,
  Building2
} from 'lucide-react';

// Dark mode banner (industrial glowing furnace)
import bannerImg from '../assets/images/glowing_heater_banner_1780912353211.png';

// Light mode rotating product banners (white-background studio shots)
import lightBanner0 from '../assets/images/finned_heater_light_banner_1781276936810.jpg';
import lightBanner1 from '../assets/images/ceramic_band_ref_1780920035217.png';
import lightBanner2 from '../assets/images/finned_air_ref_1780920106330.png';
import lightBanner3 from '../assets/images/immersion_cluster_ref_1780920087508.png';
import lightBanner4 from '../assets/images/multi_immersion_ref_1780920071201.png';
import lightBanner5 from '../assets/images/standard_band_ref_1780920054390.png';
import lightBanner6 from '../assets/images/bobbin_ref_1780921683173.png';
import lightBanner7 from '../assets/images/ceramic_ir_ref_1780921664369.png';

const LIGHT_BANNERS = [
  { src: lightBanner0, label: 'Thermal Systems' },
  { src: lightBanner1, label: 'Ceramic Band Heaters' },
  { src: lightBanner2, label: 'Finned Air Heaters' },
  { src: lightBanner3, label: 'Immersion Heaters' },
  { src: lightBanner4, label: 'Multi Immersion' },
  { src: lightBanner5, label: 'Standard Band Heaters' },
  { src: lightBanner6, label: 'Bobbin Heaters' },
  { src: lightBanner7, label: 'Ceramic IR Heaters' },
];

interface HomeViewProps {
  theme?: 'light' | 'dark';
  onNavigateToProduct?: (productId: string) => void;
  products?: Product[];
}

// Priority order: most-sold products come first (by product id)
const PRIORITY_PRODUCT_IDS = [
  'brochure-shortwave-ir',   // Short Wave IR — #1 bestseller
  'brochure-mw-modules',     // Medium Wave IR — #2 bestseller
  'brochure-ceramic-ir',     // Ceramic IR — #3 bestseller
];

// Short pill labels for each product id
const PILL_LABELS: Record<string, string> = {
  'brochure-mica-band':         'Mica Band Heaters',
  'brochure-ceramic-band':      'Ceramic Band Heaters',
  'brochure-cartridge-heaters': 'Cartridge Heaters',
  'brochure-ceramic-strip':     'Immersion Heaters',
  'brochure-tubular-immersion': 'Tubular & Immersion',
  'brochure-tubular-fins':      'Finned Air Heaters',
  'brochure-shortwave-ir':      'Short Wave IR',
  'brochure-ceramic-ir':        'Ceramic IR',
  'brochure-sw-modules':        'IR Modules',
  'brochure-mw-modules':        'Medium Wave IR',
  'brochure-bobbin':            'Bobbin Heaters',
  'brochure-micro-tubular':     'Micro Tubular',
  'brochure-quartz-tubes':      'Quartz Glass Tubes',
};

export default function HomeView({ theme = 'dark', onNavigateToProduct, products = [] }: HomeViewProps) {
  const [activeFactSet, setActiveFactSet] = useState<'primary' | 'operational'>('primary');
  const [selectedFact, setSelectedFact] = useState<CompanyFact | null>(COMPANY_FACTS[1]);

  // Auto-rotating banner slideshow — slower interval, CSS-only fade
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (theme !== 'light') return;
    const interval = setInterval(() => {
      setBannerVisible(false);
      setTimeout(() => {
        setBannerIdx(prev => (prev + 1) % LIGHT_BANNERS.length);
        setBannerVisible(true);
      }, 500);
    }, 5000); // Slower rotation = less work
    return () => clearInterval(interval);
  }, [theme]);

  const getCurrentFacts = () => {
    return activeFactSet === 'primary' ? COMPANY_FACTS : [COMPANY_FACTS[0], COMPANY_FACTS[1], OTHER_FACTS[1], COMPANY_FACTS[3], OTHER_FACTS[0], OTHER_FACTS[2]];
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-orange-500" />;
      case 'MapPin': return <MapPin className="w-6 h-6 text-orange-500" />;
      case 'Calendar': return <Calendar className="w-6 h-6 text-orange-500" />;
      case 'Users': return <Users className="w-6 h-6 text-orange-500" />;
      case 'Factory': return <Factory className="w-6 h-6 text-orange-500" />;
      case 'Warehouse': return <Warehouse className="w-6 h-6 text-orange-500" />;
      case 'Truck': return <Truck className="w-6 h-6 text-orange-500" />;
      case 'ReceiptText': return <ReceiptText className="w-6 h-6 text-orange-500" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6 text-orange-500" />;
      default: return <Briefcase className="w-6 h-6 text-orange-500" />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen overflow-x-hidden animate-fadeIn ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#060608] text-white'
    }`} id="home-container">

      {/* 1. HERO BANNER */}
      <div
        className={`relative w-full min-h-[520px] md:min-h-[660px] py-12 md:py-20 flex items-center justify-center overflow-hidden border-b border-orange-500/20 ${
          theme === 'light' ? 'bg-slate-100' : 'bg-[#060608]'
        }`}
        id="hero-banner-wrap"
      >
        {/* Overlays — dark mode */}
        {theme === 'dark' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/25 via-red-950/35 to-orange-600/25 mix-blend-color-burn z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-black/55 z-10" />
          </>
        )}
        {/* Overlay — light mode */}
        {theme === 'light' && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-200/60 via-transparent to-white/20 z-10 pointer-events-none" />
        )}

        {/* Banner image — CSS transition only (no JS animation) */}
        {theme === 'light' ? (
          <img
            src={LIGHT_BANNERS[bannerIdx].src}
            alt={LIGHT_BANNERS[bannerIdx].label}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: bannerVisible ? 1 : 0,
              transition: 'opacity 0.5s ease',
              willChange: 'opacity',
            }}
            loading="eager"
            decoding="async"
            id="hero-banner-image"
          />
        ) : (
          <img
            src={bannerImg}
            alt="Heat One Glowing Thermal Elements"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            style={{ willChange: 'auto' }}
            loading="eager"
            decoding="async"
            id="hero-banner-image"
          />
        )}

        {/* Glow bars — dark mode, no blur on mobile */}
        {theme === 'dark' && (
          <div className="absolute inset-0 flex flex-col justify-center gap-12 px-12 opacity-30 select-none pointer-events-none">
            <div className="w-full h-3 bg-orange-500 rounded-full opacity-80" />
            <div className="w-full h-3 bg-orange-500 rounded-full opacity-60" />
          </div>
        )}

        {/* Hero text — staggered entry */}
        <div className="relative z-20 text-center px-4 w-full max-w-4xl" id="banner-text-overlay">
          <div
            className="flex items-center justify-center gap-5 md:gap-7 select-none"
            role="heading"
            aria-level={1}
            id="banner-title"
          >
            {/* Logo — white logo for light mode, dark logo for dark mode */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="h-16 w-16 md:h-28 md:w-28 shrink-0 flex items-center justify-center bg-transparent"
            >
              <img
                src={theme === 'light' ? '/images/logo-light.png' : '/images/logo.png'}
                alt="Heat One Technology Logo"
                className="w-full h-full object-contain scale-[1.18]"
                style={{
                  filter: theme === 'light'
                    ? 'drop-shadow(0 2px 8px rgba(234,88,12,0.25))'
                    : 'drop-shadow(0 0 14px rgba(234,88,12,0.55))'
                }}
                draggable={false}
                loading="eager"
              />
            </motion.div>

            {/* HEAT ONE / TECHNOLOGY text */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
                className={`flex items-center gap-x-3 text-4xl md:text-7xl font-display font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]' : 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]'
                }`}
              >
                <span className={`inline-block whitespace-nowrap ${theme === 'light' ? 'text-[#0f172a]' : 'text-white'}`}>
                  HEAT
                </span>
                <span className="inline-block whitespace-nowrap text-orange-500">
                  ONE
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
                className={`text-lg md:text-4xl font-display uppercase tracking-[0.35em] md:tracking-[0.5em] font-semibold mt-0.5 ${
                  theme === 'light'
                    ? 'text-slate-800 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]'
                    : 'text-[#8C827A]'
                }`}
              >
                TECHNOLOGY
              </motion.div>
            </div>
          </div>

          {/* Underline bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
            className="h-1 bg-orange-500 mx-auto mt-4 rounded-full shadow-[0_0_8px_#ea580c]"
            id="banner-underline"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.42, ease: "easeOut" }}
            className="text-orange-500 font-mono text-xs uppercase tracking-[0.25em] mt-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Industrial Heating Solutions Products</span>
          </motion.p>

          {/* Product pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-3xl mx-auto mt-6 px-4"
            id="banner-products-pills"
          >
            {(() => {
              const priorityProds = PRIORITY_PRODUCT_IDS
                .map(pid => products.find(p => p.id === pid))
                .filter(Boolean) as Product[];
              const otherProds = products.filter(p => !PRIORITY_PRODUCT_IDS.includes(p.id));
              const orderedProds = [...priorityProds, ...otherProds];

              return orderedProds.map((prod, idx) => (
                <button
                  key={prod.id}
                  onClick={() => onNavigateToProduct && onNavigateToProduct(prod.id)}
                  className={`text-[9px] md:text-[11px] font-mono font-medium border px-2.5 py-1 rounded-full hover:border-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1 ${
                    idx < PRIORITY_PRODUCT_IDS.length
                      ? theme === 'light'
                        ? 'border-orange-400/70 bg-orange-50 text-orange-700 font-semibold'
                        : 'border-orange-400/60 bg-orange-500/10 text-orange-300 font-semibold'
                      : theme === 'light'
                        ? 'border-slate-400/50 bg-white/80 text-slate-700'
                        : 'border-orange-500/30 bg-black/50 text-orange-300'
                  }`}
                  id={`pill-${prod.id}`}
                  title={prod.name}
                >
                  {idx < PRIORITY_PRODUCT_IDS.length && (
                    <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                  )}
                  {PILL_LABELS[prod.id] || prod.name}
                </button>
              ));
            })()}
          </motion.div>
        </div>
      </div>

      {/* 2. ADVANCED HEATING SOLUTIONS INTRO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20" id="solutions-section">
        <div className="mb-8" id="solutions-intro-header">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Market Leaders in Heaters</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl md:text-3xl font-display font-medium text-orange-500 mt-2 uppercase tracking-wider"
            id="solutions-subheading"
          >
            Advanced Heating Solutions for Industry
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className={`border rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl ${
            theme === 'light'
              ? 'bg-white border-slate-200'
              : 'bg-[#0b0c10] border-zinc-800/80'
          }`}
          id="company-credentials-box"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500" />

          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-zinc-800/60 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Heat One Certified Corporate Registry
            </span>
            <span className="text-orange-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              STATUS: Active Registrant
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-base md:text-lg text-zinc-100 leading-relaxed font-sans text-justify">
                <strong>Heat One Technology</strong> is a leading manufacturer and supplier of industrial heating solutions based in <strong className="text-orange-500 font-bold">Thane, Maharashtra</strong>. Since <span className="text-orange-400 font-medium font-mono">2013</span>, we have been delivering innovative, energy-efficient, and high-performance products, including Infrared Heaters, Mica Band Heaters, Quartz Glass Tubes, Immersion Heaters, and Cartridge Heaters.
              </p>

              <p className="text-sm md:text-base text-zinc-350 leading-relaxed font-sans text-justify border-l-2 border-orange-500/40 pl-4">
                With a strong focus on quality, reliability, and customer satisfaction, we combine advanced manufacturing processes with technical expertise to provide tailored heating solutions for industries across India. Our commitment to innovation and excellence has earned us the trust of clients who rely on us for consistent performance and dependable support.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-5 text-white flex flex-col justify-center relative overflow-hidden border border-orange-400/20"
                id="image-2-gst-block"
              >
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,rgba(0,0,0,0.15)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.15)_75%,transparent_75%,transparent)] bg-[length:24px_24px]" />
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#fbd5c0] block mb-1">
                  OFFICIAL GOODS &amp; SERVICES TAX REGISTRATION
                </span>
                <div className="flex items-center justify-between text-2xl md:text-3xl font-extrabold uppercase tracking-wider font-mono text-white select-all">
                  <span>GST : 27ASDPK7527M1ZA</span>
                </div>
                <div className="mt-2 text-[10px] md:text-xs font-mono text-[#fbd5c0] flex items-center justify-between">
                  <span>REGISTRY ZONE: THANE, MAHARASHTRA</span>
                  <span className="underline decoration-dotted text-white">Verified GSTIN</span>
                </div>
              </div>

              <div className="bg-[#111216] border border-zinc-800 rounded-lg p-5 text-zinc-400 space-y-4 text-xs md:text-sm font-sans">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Factory Address:</strong>
                    <p className="mt-1 text-zinc-300 font-mono leading-relaxed text-[11px] md:text-xs text-wrap break-words">
                      HEAT ONE TECHNOLOGY, BUS DEPO, PLOT NO A-342, Rd Number 26, CP Talav, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-zinc-800/60">
                  <Building2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-semibold">Branch Office:</strong>
                    <p className="mt-1 text-zinc-300 font-mono leading-relaxed text-[11px] md:text-xs">
                      Flat No. 2301, 2B, A-wing, Dew Highland Haven, Balkum, Thane (W) 400608.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-800/60 text-[11px] md:text-xs">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="font-mono text-zinc-300">heatonetechnology@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>+91-9221783525, +91-8767655745</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. KEY FACTS GRID */}
      <section className={`border-t py-16 md:py-24 px-4 md:px-8 ${
        theme === 'light'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-gradient-to-b from-[#09090C] to-[#040405] border-zinc-950'
      }`} id="facts-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6" id="facts-header-row">
            <div>
              <h2 className={`text-3xl md:text-4xl font-display font-medium tracking-wide text-center md:text-left ${
                theme === 'light' ? 'text-slate-800' : 'text-zinc-100'
              }`} id="facts-title">
                KEY FACTS
              </h2>
              <div className="h-1 w-16 bg-orange-500 mt-3 hidden md:block" />
            </div>

            <div className={`flex items-center justify-center p-1 rounded-lg self-center md:self-end border ${
              theme === 'light' ? 'bg-white border-slate-300' : 'bg-zinc-900/80 border-zinc-800'
            }`} id="facts-toggle-container">
              <button
                onClick={() => { setActiveFactSet('primary'); setSelectedFact(COMPANY_FACTS[1]); }}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors duration-200 ${
                  activeFactSet === 'primary'
                    ? 'bg-orange-500 text-white'
                    : (theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white')
                }`}
                id="toggle-primary-facts"
              >
                Structure facts
              </button>
              <button
                onClick={() => { setActiveFactSet('operational'); setSelectedFact(OTHER_FACTS[1]); }}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors duration-200 ${
                  activeFactSet === 'operational'
                    ? 'bg-orange-500 text-white'
                    : (theme === 'light' ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-white')
                }`}
                id="toggle-logistics-facts"
              >
                Logistics &amp; Finance
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            id="facts-interactive-interface"
          >
            {/* Grid Cards — animated on hover */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" id="facts-grid-cards">
              {getCurrentFacts().map((fact, index) => {
                const isSelected = selectedFact?.id === fact.id;
                return (
                  <motion.div
                    key={`${fact.id}-${index}`}
                    onClick={() => {
                      setSelectedFact(fact);
                      if (fact.id === 'location') {
                        window.open("https://www.google.com/maps/search/?api=1&query=HEAT+ONE+TECHNOLOGY+1+Modern+Sheet+Metal+Work+Road+No+26+Thane+Maharashtra+400604", "_blank", "noopener,noreferrer");
                      }
                    }}
                    whileHover={{ scale: 1.02, y: -3 }}
                    transition={{ type: "tween", duration: 0.2 }}
                    className={`cursor-pointer group relative p-6 rounded-xl border flex flex-col items-center text-center justify-center min-h-[160px] overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-tr from-orange-950/40 via-[#120e0a]/80 to-[#1e140d]/80 border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.25)]'
                        : 'bg-[#0b0c0e] hover:bg-zinc-900 border-zinc-800 hover:border-orange-500/40'
                    }`}
                    id={`fact-card-${fact.id}`}
                  >
                    {/* Maps indicator on top-right for location fact */}
                    {fact.id === 'location' && (
                      <span className="absolute top-2 right-2 text-[8px] font-mono bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-colors px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                        Maps ↗
                      </span>
                    )}

                    {/* Glowing highlight ring for selected state */}
                    {isSelected && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_-4px_16px_#f97316]" />
                    )}

                    <div className="mb-4 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 group-hover:border-orange-500/30 group-hover:scale-110 transition-all duration-300 shadow-inner">
                      {getIcon(fact.icon)}
                    </div>

                    <span className="text-[10px] md:text-xs font-mono tracking-widest text-[#9ca3af]/80 uppercase mb-1 block group-hover:text-amber-200 transition-colors duration-200">
                      {fact.title}
                    </span>

                    <span className={`text-sm md:text-base font-semibold group-hover:text-white transition-colors duration-200 uppercase ${
                      isSelected ? 'text-orange-500' : 'text-zinc-300'
                    }`}>
                      {fact.value}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="lg:col-span-4" id="facts-detail-panel">
              <motion.div
                key={selectedFact?.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-[#0b0c0e] border border-orange-500/10 rounded-xl p-6 md:p-8 shrink-0 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[340px]"
                id="facts-detail-card"
              >
                <div className="absolute -right-16 -top-16 w-36 h-36 bg-orange-600/8 rounded-full pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        {selectedFact ? getIcon(selectedFact.icon) : <Info className="text-orange-500" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">Verified Detail</span>
                        <h4 className="text-lg font-display font-medium text-white uppercase">{selectedFact?.title}</h4>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-orange-500/70 border border-orange-500/20 bg-orange-950/20 px-2 py-0.5 rounded-full">
                      ID: HE1-{selectedFact?.id.toUpperCase()}
                    </span>
                  </div>

                  <div className="my-5 border-y border-zinc-800/40 py-4">
                    <h5 className="text-2xl md:text-3xl font-display font-bold text-orange-400 mb-1">{selectedFact?.value}</h5>
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wide">{selectedFact?.label}</p>
                  </div>

                  <p className="text-zinc-300 text-xs md:text-sm leading-relaxed mb-6 font-sans">
                    {selectedFact?.hoverDetail}
                  </p>
                </div>

                {selectedFact?.id === 'location' ? (
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=HEAT+ONE+TECHNOLOGY+1+Modern+Sheet+Metal+Work+Road+No+26+Thane+Maharashtra+400604"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-[#111215] hover:bg-zinc-900 border border-orange-500/30 hover:border-orange-500 rounded-lg flex items-center justify-between group/metric cursor-pointer transition-colors duration-200"
                    id="facts-detail-metric-location"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-orange-500 block">Exact Location Link</span>
                      <span className="text-xs uppercase font-medium text-zinc-100 group-hover/metric:text-orange-400 font-sans transition-colors duration-200">Open in Google Maps ↗</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className="text-sm md:text-base font-semibold font-mono text-orange-400 group-hover/metric:text-orange-500 transition-colors duration-200">1 Modern Road No 26</span>
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </div>
                  </a>
                ) : (
                  <div className="p-4 bg-[#111215] border border-zinc-800/60 rounded-lg flex items-center justify-between" id="facts-detail-metric">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 block">Key Performance Metric</span>
                      <span className="text-xs uppercase font-medium text-zinc-200">{selectedFact?.metricLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className="text-sm md:text-base font-semibold font-mono text-orange-500">{selectedFact?.metricValue}</span>
                      <ChevronRight className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. TECHNICAL VALUES */}
      <section className="bg-black py-16 md:py-24 px-4 md:px-8 border-t border-zinc-900" id="values-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          id="values-grid"
        >
          <div className="flex gap-4" id="value-quality">
            <div className="text-4xl font-extrabold font-mono text-orange-600/30">01</div>
            <div>
              <h4 className="text-lg font-semibold tracking-wide text-white mb-2 uppercase">Precision Winding</h4>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Using fully micro-controlled coil winders, we guarantee perfect pitch throughout the heating tube length, eliminating local hot points and ensuring absolute thermal uniformity.
              </p>
            </div>
          </div>

          <div className="flex gap-4" id="value-purity">
            <div className="text-4xl font-extrabold font-mono text-orange-600/30">02</div>
            <div>
              <h4 className="text-lg font-semibold tracking-wide text-white mb-2 uppercase">Fused Quartz Purity</h4>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Our silica bodies reach up to 99.98% SiO2 purity ratings, conveying ultra-high resistance to corrosive moisture, industrial chemicals, and swift hot-cold thermal shocks.
              </p>
            </div>
          </div>

          <div className="flex gap-4" id="value-testing">
            <div className="text-4xl font-extrabold font-mono text-orange-600/30">03</div>
            <div>
              <h4 className="text-lg font-semibold tracking-wide text-white mb-2 uppercase">100% Thermal Testing</h4>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Prior to vacuum gas sealing, each resistor element undergoes high-load cycle burning tests monitoring dielectric properties to ensure complete fail-safe delivery.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
