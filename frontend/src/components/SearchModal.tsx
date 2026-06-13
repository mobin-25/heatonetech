import React, { useState, useEffect, useRef } from 'react';
import { COMPANY_FACTS } from '../data';
import { Product, CompanyFact, TabType } from '../types';
import { X, Search, FileText, Settings, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedProductById?: (id: string) => void;
  products: Product[];
}

export default function SearchModal({
  isOpen,
  onClose,
  setActiveTab,
  setSelectedProductById,
  products = [],
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const searchableProductsList = products;

  // Search filter
  const matchedFacts = query === '' ? [] : COMPANY_FACTS.filter(f =>
    f.title.toLowerCase().includes(query.toLowerCase()) ||
    f.value.toLowerCase().includes(query.toLowerCase()) ||
    f.hoverDetail.toLowerCase().includes(query.toLowerCase())
  );

  const matchedProducts = query === '' ? [] : searchableProductsList.filter(p =>
    (p.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.subtitle || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.features || []).some(f => f.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: -15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.98 }}
        className="relative w-full max-w-2xl bg-[#0b0c0f] border border-orange-500/20 rounded-xl shadow-2xl overflow-hidden z-10"
        id="search-overlay-box"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-orange-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search catalog, materials, business facts, Thane plant..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-zinc-500 font-sans"
            />
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results scroll container */}
        <div className="max-h-[380px] overflow-y-auto p-4 content-start" id="search-results-panel">
          {query === '' ? (
            <div className="text-center py-12" id="search-placeholder-state">
              <Settings className="w-8 h-8 text-zinc-700 mx-auto mb-3 animate-spin duration-3000" />
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Type query keywords to perform lookup</p>
              <div className="flex justify-center gap-2 mt-4 flex-wrap max-w-sm mx-auto">
                <button onClick={() => setQuery('Thane')} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-white">Thane</button>
                <button onClick={() => setQuery('Infrared')} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-white">Infrared</button>
                <button onClick={() => setQuery('Quartz')} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-white">Quartz</button>
                <button onClick={() => setQuery('2013')} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400 hover:text-white">2013</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6" id="matched-results-wrap">
              
              {/* Product Match */}
              {matchedProducts.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2">Matched Thermal Products</h4>
                  <div className="space-y-2">
                    {matchedProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (setSelectedProductById) setSelectedProductById(p.id);
                          setActiveTab('products');
                          onClose();
                        }}
                        className="p-3 bg-zinc-900/50 border border-zinc-800/80 hover:border-orange-500/30 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <span className="text-white font-medium text-xs block">{p.name}</span>
                          <span className="text-[10px] font-mono text-orange-500/80">{p.subtitle}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fact Match */}
              {matchedFacts.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider mb-2">Matched Company Facts</h4>
                  <div className="space-y-2">
                    {matchedFacts.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setActiveTab('home');
                          onClose();
                        }}
                        className="p-3 bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/30 rounded-lg cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <span className="text-white font-medium text-xs block uppercase">{f.title}: {f.value}</span>
                          <span className="text-[10px] text-zinc-400 line-clamp-1">{f.hoverDetail}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* None match */}
              {matchedProducts.length === 0 && matchedFacts.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No products or verified statistics matching <span className="text-orange-500 font-mono font-semibold">&quot;{query}&quot;</span>.
                </div>
              )}

            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
