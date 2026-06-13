import React, { useState, useEffect } from 'react';
import { 
  X, Save, Focus, Image as ImageIcon, Plus, Trash2, ShieldCheck, 
  Target, Info, RefreshCw, Upload, Eye, EyeOff, LayoutTemplate, 
  Wrench, Activity, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductSpec } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface ProductEditPanelProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => void;
}

type EditTab = 'info' | 'photos' | 'specs' | 'lists';

export default function ProductEditPanel({ product, isOpen, onClose, onSave }: ProductEditPanelProps) {
  const [activeTab, setActiveTab] = useState<EditTab>('info');
  
  // Local states for Form
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'quartz-tubes' | 'infrared' | 'ceramic' | 'ovens' | 'tubular-heaters'>('infrared');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  
  // Specifications states
  const [power, setPower] = useState('');
  const [voltage, setVoltage] = useState('');
  const [diameter, setDiameter] = useState('');
  const [heatedLength, setHeatedLength] = useState('');
  const [maxTemperature, setMaxTemperature] = useState('');
  const [wavelength, setWavelength] = useState('');
  const [material, setMaterial] = useState('');

  // Lists state
  const [features, setFeatures] = useState<string[]>([]);
  const [applications, setApplications] = useState<string[]>([]);
  
  // Images states
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Helpers for lists
  const [newFeature, setNewFeature] = useState('');
  const [newApp, setNewApp] = useState('');

  // Sync state whenever product changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSubtitle(product.subtitle || '');
      setCategory(product.category || 'infrared');
      setDescription(product.description || '');
      setLongDescription(product.longDescription || '');
      
      const spec = product.specifications || {
        power: '',
        voltage: '',
        diameter: '',
        heatedLength: '',
        maxTemperature: '',
        wavelength: '',
        material: ''
      };
      setPower(spec.power || '');
      setVoltage(spec.voltage || '');
      setDiameter(spec.diameter || '');
      setHeatedLength(spec.heatedLength || '');
      setMaxTemperature(spec.maxTemperature || '');
      setWavelength(spec.wavelength || '');
      setMaterial(spec.material || '');

      setFeatures(product.features || []);
      setApplications(product.applications || []);
      setImageUrl(product.imageUrl || '');
      setAdditionalImages(product.additionalImages || []);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: Product = {
      ...product,
      name,
      subtitle,
      category,
      description,
      longDescription,
      specifications: {
        power,
        voltage,
        diameter,
        heatedLength,
        maxTemperature,
        wavelength: wavelength || undefined,
        material: material || undefined
      },
      features,
      applications,
      imageUrl,
      additionalImages
    };
    onSave(updated);
    onClose();
  };

  // Handle local picture uploads via standard FileReader object URL mapping
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
    if (isPrimary) {
      const file = e.target.files?.[0];
      if (file) {
        compressImage(file, 550, 550, 0.55)
          .then(compressedUrl => {
            setImageUrl(compressedUrl);
          })
          .catch(err => {
            console.error("Error compressing primary image", err);
          });
      }
    } else {
      const files = e.target.files;
      if (files && files.length > 0) {
        const compressionPromises = Array.from(files).map((file: any) => {
          return compressImage(file, 550, 550, 0.55);
        });

        Promise.all(compressionPromises)
          .then(compressedUrls => {
            setAdditionalImages(prev => [...prev, ...compressedUrls]);
          })
          .catch(err => {
            console.error("Error compressing extra images", err);
          });
      }
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleAddApp = () => {
    if (newApp.trim()) {
      setApplications([...applications, newApp.trim()]);
      setNewApp('');
    }
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const removeApp = (idx: number) => {
    setApplications(applications.filter((_, i) => i !== idx));
  };

  const removeAdditionalImage = (idx: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== idx));
  };

  const handleAddAdditionalImageUrl = (url: string) => {
    if (url.trim()) {
      setAdditionalImages([...additionalImages, url.trim()]);
    }
  };

  // Presets of highly detailed premium industrial heater reference images
  const PRESET_MOCK_IMAGES = [
    { name: 'Standard Quartz Ring', url: 'https://images.unsplash.com/photo-1617634171676-cda12b99e238?auto=format&fit=crop&q=80&w=400' },
    { name: 'Ceramic Core Band', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400' },
    { name: 'Heavy Alloy Emitter', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400' },
    { name: 'PID Industrial Console', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=400' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans" id="product-workspace-overlay">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        id="workspace-backdrop"
      />

      {/* Slideout Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-2xl bg-[#0a0b0e] border-l border-zinc-900 h-full flex flex-col shadow-2xl z-10"
        id="workspace-drawer"
      >
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />

        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between" id="drawer-header-pane">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-orange-500/10 border border-orange-500/20 rounded-md text-orange-500">
                <Wrench className="w-4 h-4 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">ELEMENT CUSTOMIZATION HUB</span>
            </div>
            <h2 className="text-lg md:text-xl font-display font-medium text-white uppercase tracking-tight mt-1.5 line-clamp-1">
              Configure Spec File: {product.name}
            </h2>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-500 transition-colors cursor-pointer select-none"
            title="Cancel"
            id="close-drawer-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controllers */}
        <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 gap-1" id="workspace-tabs-menu">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded ${
              activeTab === 'info'
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            📋 Core Info
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded ${
              activeTab === 'photos'
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🖼️ Photo Manager ({1 + additionalImages.length})
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded ${
              activeTab === 'specs'
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            📐 Tech Specs
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex-1 py-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded ${
              activeTab === 'lists'
                ? 'bg-zinc-900 text-orange-400 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🛠️ Checklists
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent text-sm text-zinc-350" id="workspace-forms-container">
          
          {/* TAB 1: CORE DETAILS */}
          {activeTab === 'info' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
              id="tab-info-fields"
            >
              <div className="bg-[#0e0f14] border border-orange-500/10 p-4 rounded-xl text-xs flex gap-3 text-orange-300 mb-2">
                <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Update file names, taglines, category structures, and descriptive overviews. Product modifications will automatically lock to your local cache.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Product Name / Title</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ultra High Temperature Band Element"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 transition-colors font-sans"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Subheading / Brief Tagline</label>
                <input 
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Wrapped inside SS sheathing block"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 transition-colors"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Active Category Division</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-3 text-xs text-white transition-colors cursor-pointer"
                >
                  <option value="infrared">Infrared Halogen Lamps</option>
                  <option value="quartz-tubes">Quartz Glass Envelopes</option>
                  <option value="ceramic">Ceramic Panel Blocks</option>
                  <option value="ovens">Conveyor & Batch Ovens</option>
                  <option value="tubular-heaters">Industrial Tubular Heaters</option>
                </select>
              </div>

              {/* Brief summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Catalog Brief Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a tight 1-2 sentence overview for catalog grids..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 transition-colors font-sans resize-none"
                />
              </div>

              {/* Long detailed description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">All Product Information & Core Design</label>
                <textarea
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  placeholder="Detail the materials used, internal design assemblies, nickel-chrome windings coverage, physical behaviors..."
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 transition-colors font-sans resize-y leading-relaxed"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 2: PHOTOS & IMAGES */}
          {activeTab === 'photos' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              id="tab-photos-fields"
            >
              {/* PRIMARY PHOTO UPLOAD / LINK */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <span className="text-xs font-mono uppercase text-orange-400 font-bold">Standard Primary Photo Asset</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-4 aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center relative">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt="Primary Preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-zinc-700 flex flex-col items-center gap-1">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[10px] font-mono">No Asset Set</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">Provide Online Image URL</span>
                      <input 
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste URL link e.g. https://...png"
                        className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-800 transition-colors font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[10px] font-mono text-zinc-500">OR UPLOAD LOCAL PICTURE FILE:</span>
                      <label className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono uppercase text-orange-400 border border-zinc-800 hover:border-orange-500/50 rounded-md transition-all cursor-pointer flex items-center gap-1.5 select-none shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select File</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleLocalImageUpload(e, true)}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL IMAGES / GALLERY */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-xs font-mono uppercase text-orange-400 font-bold">Related Extra Gallery Photos (Additional)</span>
                  <span className="text-[10px] font-mono text-zinc-500">{additionalImages.length} custom files added</span>
                </div>

                {/* Submitting custom URLs to gallery */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Link extra photos or upload below</span>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Paste additional element image link..."
                      id="input-additional-url"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          handleAddAdditionalImageUrl(target.value);
                          target.value = '';
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-800 transition-colors font-mono"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('input-additional-url') as HTMLInputElement;
                        if (el && el.value.trim()) {
                          handleAddAdditionalImageUrl(el.value);
                          el.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">ADD DUAL VIEW PHOTO FROM MACHINE:</span>
                  <label className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono uppercase text-orange-400 border border-zinc-800 hover:border-orange-500/50 rounded-md transition-all cursor-pointer flex items-center gap-1.5 select-none">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Extra Photo(s)</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={(e) => handleLocalImageUpload(e, false)}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Grid layout preview of all active additional images */}
                {additionalImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3" id="additional-preview-grid">
                    {additionalImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800/70 group"
                        id={`additional-img-frame-${idx}`}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery preview ${idx}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-500 text-white rounded-md transition-all opacity-100 md:opacity-0 group-hover:opacity-100 shadow-lg cursor-pointer"
                          title="Remove Photograph"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 py-1 text-[9px] font-mono text-center text-zinc-400 truncate px-1">
                          Photo #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg text-zinc-650 font-mono text-xs" id="no-additional-photos">
                    No supplementary design photographs attached. Upload files or paste image links.
                  </div>
                )}
              </div>

              {/* CHOOSE PRESETS */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono uppercase text-zinc-400 block">Preset Professional Emitters References (Fast Populate)</span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_MOCK_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAdditionalImages([...additionalImages, preset.url])}
                      className="px-3 py-2 bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900 rounded-lg text-left text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-between select-none"
                    >
                      <span>{preset.name}</span>
                      <Sparkles className="w-3 h-3 text-orange-500 animate-pulse shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CALIBRATION TECHNICAL SPECS */}
          {activeTab === 'specs' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              id="tab-specs-fields"
            >
              <div className="sm:col-span-2 bg-[#0e0f14] border border-orange-500/10 p-4 rounded-xl text-xs flex gap-3 text-orange-300">
                <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  These numeric parameters populate directly into the Thane CAD datasheet frame, defining structural properties, power bounds, and peak tolerances.
                </p>
              </div>

              {/* Power Output */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Electric Power Output</label>
                <input 
                  type="text"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="e.g. 1000W - 6000W per lamp"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Voltage */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Input Voltage Range</label>
                <input 
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="e.g. 110V / 230V / 415V"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Diameter */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Outer Dia / Cross-section</label>
                <input 
                  type="text"
                  value={diameter}
                  onChange={(e) => setDiameter(e.target.value)}
                  placeholder="e.g. 10mm / 12mm / Custom"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Heated Length */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Heated Active Length</label>
                <input 
                  type="text"
                  value={heatedLength}
                  onChange={(e) => setHeatedLength(e.target.value)}
                  placeholder="e.g. 200mm - 1200mm"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Peak temperature */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Maximum Temperature Tolerance</label>
                <input 
                  type="text"
                  value={maxTemperature}
                  onChange={(e) => setMaxTemperature(e.target.value)}
                  placeholder="e.g. 1100°C"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Wavelength */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Wavelength (Optional)</label>
                <input 
                  type="text"
                  value={wavelength}
                  onChange={(e) => setWavelength(e.target.value)}
                  placeholder="e.g. 0.8 - 1.4 µm (Shortwave)"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>

              {/* Sheathing Material */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Sheathing Body Material (Optional)</label>
                <input 
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="e.g. Clear Fused Quartz with Gold back-plating"
                  className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 px-4 text-xs text-white"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 4: CHECKLISTS & ARRAYS */}
          {activeTab === 'lists' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              id="tab-lists-fields"
            >
              {/* ADVANTAGES & KEY FEATURES */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono uppercase text-orange-400 font-bold block mb-1">Key Features / Advantages Checklist</span>
                
                {/* Add Feature input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Enter new element advantage..."
                    className="flex-1 bg-zinc-950 border border-zinc-800/85 focus:border-orange-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-800 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500 hover:bg-zinc-850 text-zinc-300 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer select-none"
                  >
                    Add
                  </button>
                </div>

                {/* Features List rendering */}
                {features.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1 mt-2">
                    {features.map((feat, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between gap-3 p-2 bg-zinc-950/80 border border-zinc-900 rounded-md text-xs text-zinc-300 group"
                      >
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-950/10 transition-colors shrink-0 cursor-pointer"
                          title="Delete Feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-zinc-600 italic">No features recorded. Type an items above.</p>
                )}
              </div>

              {/* INDUSTRIAL USAGES & APPLICATIONS */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono uppercase text-orange-400 font-bold block mb-1">Key Industrial Usages & System Applications</span>
                
                {/* Add App input */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newApp}
                    onChange={(e) => setNewApp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddApp();
                      }
                    }}
                    placeholder="Enter industry application standard..."
                    className="flex-1 bg-zinc-950 border border-zinc-800/85 focus:border-orange-500 focus:outline-none rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-800 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddApp}
                    className="px-3 bg-zinc-900 border border-zinc-800 hover:border-orange-500 hover:bg-zinc-850 text-zinc-300 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer select-none"
                  >
                    Add
                  </button>
                </div>

                {/* Applications List rendering */}
                {applications.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-1 mt-2">
                    {applications.map((app, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between gap-3 p-2 bg-zinc-950/80 border border-zinc-900 rounded-md text-xs text-zinc-300 group"
                      >
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{app}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeApp(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-950/10 transition-colors shrink-0 cursor-pointer"
                          title="Delete App"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-zinc-600 italic">No applications recorded. Type an items above.</p>
                )}
              </div>
            </motion.div>
          )}

        </div>

        {/* Drawer Action Bar */}
        <div className="p-6 border-t border-zinc-900 bg-zinc-950/70 flex gap-3" id="drawer-action-controls">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer select-none border border-zinc-800"
          >
            Discard
          </button>
          
          <button
            onClick={handleSave}
            className="flex-2 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-xs font-bold text-white uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none inline-flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Apply Specifications Update</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
