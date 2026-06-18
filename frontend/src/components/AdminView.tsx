import React, { useState, useEffect, useRef } from 'react';
import { Product, Inquiry } from '../types';
import { 
  Database, Users, Flame, Settings, Trash2, Edit3, PlusCircle, CheckCircle, Upload, 
  Clock, ClipboardList, RefreshCw, FileText, Search, Plus, X, ChevronRight, ChevronUp, ChevronDown, 
  Image as ImageIcon, Zap, Check, AlertTriangle, ArrowRight, ShieldCheck, Filter, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS } from '../data';
import { BROCHURE_PRODUCTS } from './ProductsView';
import { compressImage } from '../utils/imageCompressor';
import { getApiUrl } from '../utils/api';

interface AdminViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onLogout: () => void;
  onUpdateProductDetail?: (productId: string, updatedProduct: Product) => void;
  onReorderProducts?: (productIds: string[]) => Promise<void>;
  storageError?: string | null;
  onClearStorageError?: () => void;
  adminUsername?: string;
}

type AdminTabType = 'queries' | 'products' | 'users';

// Available pre-generated images for easier setup
const PRESET_IMAGES = [
  { label: 'Ceramic Infrared Emitter', value: '/src/assets/images/ceramic_ir_ref_1780921664369.png' },
  { label: 'Ceramic Bobbin Heater', value: '/src/assets/images/bobbin_ref_1780921683173.png' },
  { label: 'Ceramic Band Heater', value: '/src/assets/images/ceramic_band_ref_1780920035217.png' },
  { label: 'Tubular Finned Heater', value: '/src/assets/images/finned_air_ref_1780920106330.png' },
  { label: 'Immersion Heater Cluster', value: '/src/assets/images/immersion_cluster_ref_1780920087508.png' },
  { label: 'Cartridge Heating Pencil', value: '/src/assets/images/cartridge_heater_1780916136779.png' },
  { label: 'Generic Metallic Quartz', value: '/src/assets/images/infrared_quartz_heater_1780916164777.png' },
];

export default function AdminView({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onLogout,
  onUpdateProductDetail,
  onReorderProducts,
  storageError = null,
  onClearStorageError,
  adminUsername,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>('queries');
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderList, setReorderList] = useState<Product[]>([]);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  const startReordering = () => {
    setIsReorderMode(true);
    setReorderList([...products]);
  };

  const cancelReordering = () => {
    setIsReorderMode(false);
  };

  const saveReordering = async () => {
    if (onReorderProducts) {
      setIsSavingReorder(true);
      try {
        await onReorderProducts(reorderList.map(p => p.id));
      } catch (err) {
        console.error("Reorder failed", err);
      } finally {
        setIsSavingReorder(false);
      }
    }
    setIsReorderMode(false);
  };

  const moveProductUp = (index: number) => {
    if (index === 0) return;
    const newList = [...reorderList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setReorderList(newList);
  };

  const moveProductDown = (index: number) => {
    if (index === reorderList.length - 1) return;
    const newList = [...reorderList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setReorderList(newList);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 550, 550, 0.55)
        .then(compressedUrl => {
          setProdImgUrl(compressedUrl);
        })
        .catch(err => {
          console.error("Error compressing primary image", err);
        });
    }
  };

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const compressionPromises = Array.from(files).map((file: any) => {
        return compressImage(file, 550, 550, 0.55);
      });

      Promise.all(compressionPromises)
        .then(compressedUrls => {
          setProdAdditionalImages(prev => [...prev, ...compressedUrls]);
        })
        .catch(err => {
          console.error("Error compressing gallery images", err);
        });
    }
  };

  // --- QUERY / INQUIRY STATES ---
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [querySearch, setQuerySearch] = useState('');
  const [queryFilterStatus, setQueryFilterStatus] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // --- CUSTOM STATE-DRIVEN CONFIRMATION MODAL CONFIG ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      isDestructive: options?.isDestructive ?? true,
    });
  };

  // Load inquiries from database
  const loadInquiries = async () => {
    try {
      const res = await fetch(getApiUrl("/api/inquiries"));
      const data = await res.json();
      if (data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (e) {
      console.error('Error fetching inquiries from backend API', e);
    }
  };

  // Load registered users from database
  const loadUsers = async () => {
    try {
      const res = await fetch(getApiUrl("/api/users"));
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Error fetching registered users from API', e);
    }
  };

  useEffect(() => {
    loadInquiries();
    loadUsers();
  }, []);

  const combinedUsers = React.useMemo(() => {
    const map = new Map<string, {
      email: string;
      isRegistered: boolean;
      inquiryCount: number;
      name: string;
      company: string;
      phone: string;
      createdAt: string;
    }>();

    // 1. Populate registered users
    users.forEach(u => {
      if (u.email) {
        const emailLower = u.email.toLowerCase().trim();
        map.set(emailLower, {
          email: u.email,
          isRegistered: true,
          inquiryCount: 0,
          name: '',
          company: '',
          phone: '',
          createdAt: u.createdAt || '',
        });
      }
    });

    // 2. Populate inquiry senders
    inquiries.forEach(inq => {
      if (inq.email) {
        const emailLower = inq.email.toLowerCase().trim();
        const existing = map.get(emailLower);
        if (existing) {
          existing.inquiryCount += 1;
          if (!existing.name) existing.name = inq.name;
          if (!existing.company) existing.company = inq.company;
          if (!existing.phone) existing.phone = inq.phone;
        } else {
          map.set(emailLower, {
            email: inq.email,
            isRegistered: false,
            inquiryCount: 1,
            name: inq.name,
            company: inq.company,
            phone: inq.phone,
            createdAt: inq.createdAt || '',
          });
        }
      }
    });

    return Array.from(map.values());
  }, [users, inquiries]);

  const filteredUsers = React.useMemo(() => {
    if (!userSearch) return combinedUsers;
    const query = userSearch.toLowerCase().trim();
    return combinedUsers.filter(u => 
      u.email.toLowerCase().includes(query) ||
      u.name.toLowerCase().includes(query) ||
      u.company.toLowerCase().includes(query) ||
      u.phone.toLowerCase().includes(query)
    );
  }, [combinedUsers, userSearch]);

  // Update or delete an inquiry (ledger changes)
  const handleDeleteInquiry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      'Delete Inquiry Log',
      `Are you sure you want to permanently delete the inquiry record ${id}? This action is irreversible.`,
      async () => {
        try {
          const res = await fetch(getApiUrl(`/api/inquiries/${id}`), {
            method: "DELETE",
          });
          if (res.ok) {
            await loadInquiries();
            if (selectedInquiry?.id === id) {
              setSelectedInquiry(null);
            }
          } else {
            alert("Failed to delete inquiry from server.");
          }
        } catch (err) {
          console.error("Error deleting inquiry:", err);
          alert("Database connection error.");
        }
      },
      { confirmText: 'Yes, Delete', isDestructive: true }
    );
  };

  const handleClearAllInquiries = () => {
    showConfirm(
      'CRITICAL: Purge All Inquiry Records',
      'Are you absolutely sure you want to permanently delete all inquiry ledger records from this database? This is irreversible.',
      async () => {
        try {
          const res = await fetch(getApiUrl("/api/inquiries"), {
            method: "DELETE",
          });
          if (res.ok) {
            await loadInquiries();
            setSelectedInquiry(null);
          } else {
            alert("Failed to clear inquiries from server.");
          }
        } catch (err) {
          console.error("Error clearing inquiries:", err);
          alert("Database connection error.");
        }
      },
      { confirmText: 'Purge All Records', isDestructive: true }
    );
  };

  // --- PRODUCT FORM STATES ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form input bindings
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'quartz-tubes' | 'infrared' | 'ceramic' | 'ovens' | 'tubular-heaters'>('infrared');
  const [prodDesc, setProdDesc] = useState('');
  const [prodLongDesc, setProdLongDesc] = useState('');
  
  // Specs
  const [specPower, setSpecPower] = useState('1000W - 3000W');
  const [specVoltage, setSpecVoltage] = useState('230V');
  const [specDiameter, setSpecDiameter] = useState('Standard Size');
  const [specHeatedLength, setSpecHeatedLength] = useState('300 mm');
  const [specMaxTemp, setSpecMaxTemp] = useState('650°C');
  const [specWavelength, setSpecWavelength] = useState('Medium wave');
  const [specMaterial, setSpecMaterial] = useState('Stainless sheathing / Premium alloy');

  // Multi lists
  const [prodFeatures, setProdFeatures] = useState<string>(
    'Uniform surface temperature emission\nHigh corrosion resistance protective layer\nDigital PID thermal monitor compatible'
  );
  const [prodApplications, setProdApplications] = useState<string>(
    'Thermoforming processing sheets\nHigh speed paper packaging sealer lines\nTextile preheating systems'
  );
  const [prodImgUrl, setProdImgUrl] = useState(PRESET_IMAGES[2].value);
  const [prodAdditionalImages, setProdAdditionalImages] = useState<string[]>([]);

  // Utility to auto fill form when editing
  const openFormForEdit = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name || '');
    setProdSubtitle(p.subtitle || '');
    setProdCategory(p.category || 'infrared');
    setProdDesc(p.description || '');
    setProdLongDesc(p.longDescription || '');
    
    const specs = p.specifications || {
      power: '',
      voltage: '',
      diameter: '',
      heatedLength: '',
      maxTemperature: '',
      wavelength: '',
      material: ''
    };
    setSpecPower(specs.power || '');
    setSpecVoltage(specs.voltage || '');
    setSpecDiameter(specs.diameter || '');
    setSpecHeatedLength(specs.heatedLength || '');
    setSpecMaxTemp(specs.maxTemperature || '');
    setSpecWavelength(specs.wavelength || '');
    setSpecMaterial(specs.material || '');
    
    setProdFeatures((p.features || []).join('\n'));
    setProdApplications((p.applications || []).join('\n'));
    setProdImgUrl(p.imageUrl || PRESET_IMAGES[0].value);
    setProdAdditionalImages(p.additionalImages || []);
    setIsFormOpen(true);
  };

  const openFormForNew = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSubtitle('High-Performance Process Heater');
    setProdCategory('infrared');
    setProdDesc('Heavy-duty industrial resistance element built for high-demand processing tunnels.');
    setProdLongDesc('This element utilizes premium electric heating coils backed by high-quality sheathing systems to generate safe, targeted, and persistent heat flow. Fully integrated for commercial production lines.');
    setSpecPower('1200W - 4000W');
    setSpecVoltage('230V / 415V');
    setSpecDiameter('20mm / custom');
    setSpecHeatedLength('500 mm');
    setSpecMaxTemp('750°C');
    setSpecWavelength('Medium Wave (2.5 µm)');
    setSpecMaterial('High alumina ceramic with stainless terminal block');
    setProdFeatures('Excellent thermodynamic properties\nCorrosion-resistant exterior structure\nLong operative life index');
    setProdApplications('Plastic packaging thermoforming\nOven curing modules\nShrink wrap lines');
    setProdImgUrl(PRESET_IMAGES[0].value);
    setProdAdditionalImages([]);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const preparedProduct: Product = {
      id: editingProduct ? editingProduct.id : `custom-${Date.now()}`,
      name: prodName,
      subtitle: prodSubtitle,
      category: prodCategory,
      description: prodDesc,
      longDescription: prodLongDesc,
      specifications: {
        power: specPower,
        voltage: specVoltage,
        diameter: specDiameter,
        heatedLength: specHeatedLength,
        maxTemperature: specMaxTemp,
        wavelength: specWavelength || undefined,
        material: specMaterial || undefined,
      },
      features: prodFeatures.split('\n').map(x => x.trim()).filter(Boolean),
      applications: prodApplications.split('\n').map(x => x.trim()).filter(Boolean),
      imageUrl: prodImgUrl,
      additionalImages: prodAdditionalImages
    };

    if (editingProduct) {
      if ((editingProduct as any).isStatic) {
        if (onUpdateProductDetail) {
          onUpdateProductDetail(editingProduct.id, preparedProduct);
        }
      } else {
        onUpdateProduct(preparedProduct);
      }
    } else {
      onAddProduct(preparedProduct);
    }

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProductClick = (id: string, name: string) => {
    showConfirm(
      'Delete Product',
      `Are you sure you want to permanently delete "${name}" from your active heating catalog? This action is irreversible.`,
      () => {
        onDeleteProduct(id);
      },
      { confirmText: 'Yes, Delete', isDestructive: true }
    );
  };

  // Combine default and custom lists for visualization list in Admin Tab B
  const combinedListForAdmin = (isReorderMode ? reorderList : products).map(p => {
    const isStatic = p.id.startsWith('brochure-') || ['shortwave-ir', 'quartz-tubes', 'twin-tube-ir', 'ceramic-panels', 'industrial-ovens'].includes(p.id);
    return { ...p, isStatic };
  });

  // Filter queries matching criteria
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.name.toLowerCase().includes(querySearch.toLowerCase()) ||
      inq.company.toLowerCase().includes(querySearch.toLowerCase()) ||
      inq.email.toLowerCase().includes(querySearch.toLowerCase()) ||
      inq.id.toLowerCase().includes(querySearch.toLowerCase()) ||
      inq.message.toLowerCase().includes(querySearch.toLowerCase());
    
    if (!matchesSearch) return false;

    const isWhatsApp = !!inq.isWhatsApp || inq.id.startsWith('INQ-WA-');
    if (queryFilterStatus === 'portal') {
      return !isWhatsApp;
    }
    if (queryFilterStatus === 'whatsapp') {
      return isWhatsApp;
    }
    
    return true;
  });

  return (
    <div className="bg-[#060608] min-h-screen text-zinc-100 py-16 px-4 md:px-8" id="admin-panel-container">
      <div className="max-w-7xl mx-auto">

        {storageError && (
          <div className="mb-8 p-5 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-start gap-4 shadow-2xl relative overflow-hidden" id="storage-error-alert-banner">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-500 animate-pulse" />
            <div className="shrink-0 p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-bold text-red-400 font-mono uppercase tracking-wider">Browser Storage Limit Exceeded</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-4xl">
                {storageError}
              </p>
              <button 
                onClick={onClearStorageError} 
                className="mt-3 px-3 py-1.5 bg-red-950/45 hover:bg-red-900/35 border border-red-900/50 hover:border-red-700/60 text-[10px] text-red-400 font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Clear Warning
              </button>
            </div>
            <button
              onClick={onClearStorageError}
              className="text-zinc-600 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-900/50 transition-colors shrink-0 cursor-pointer"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* LANDING HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12" id="admin-header">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-wider mb-2">
              <Settings className="w-4 h-4 text-orange-500" />
              <span>DASHBOARD CONTROLLER (SECURE MODE)</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-medium text-white uppercase tracking-tight">
              Heat One Admin Console {adminUsername ? `(${adminUsername})` : ''}
            </h1>
            <div className="h-0.5 w-16 bg-orange-500 mt-3" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadInquiries}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fetch Live Feed</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-950/45 border border-red-500/20 text-xs font-mono text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Console</span>
            </button>
            <span className="text-[10px] uppercase font-mono bg-[#007954]/10 border border-[#007954]/30 px-3 py-1.5 rounded-lg text-emerald-400">
              ● ADMIN RE-SYNC LIVE
            </span>
          </div>
        </div>

        {/* METRICS ROW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10" id="admin-stats-row">
          <div className="bg-[#0b0c0f] border border-zinc-900 p-6 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase">Interactive Queries</span>
              <h3 className="text-3xl font-display font-medium text-orange-500 mt-2 font-mono">{inquiries.length}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Submitted via quote desks</p>
            </div>
            <div className="p-3 bg-orange-600/10 rounded-lg text-orange-500">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0b0c0f] border border-zinc-900 p-6 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase">Catalog Elements</span>
              <h3 className="text-3xl font-display font-medium text-white mt-2 font-mono">{combinedListForAdmin.length}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                {combinedListForAdmin.filter(p => p.isStatic).length} default + {combinedListForAdmin.filter(p => !p.isStatic).length} custom
              </p>
            </div>
            <div className="p-3 bg-orange-600/10 rounded-lg text-orange-500">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#0b0c0f] border border-zinc-900 p-6 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-500 uppercase">Live MongoDB Synced</span>
              <h3 className="text-3xl font-display font-medium text-emerald-400 mt-2 font-mono">Active</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Connected to heat_one_db</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* MODULE SELECTOR TABS */}
        <div className="flex border-b border-zinc-900 mb-8" id="admin-subtabs">
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-5 py-4 text-xs md:text-sm font-mono uppercase tracking-wider font-semibold transition-all relative border-r border-zinc-900/60 ${
              activeTab === 'queries'
                ? 'text-orange-500 bg-[#0b0c0f]/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              <span>Inquiries Ledger ({inquiries.length})</span>
            </span>
            {activeTab === 'queries' && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-4 text-xs md:text-sm font-mono uppercase tracking-wider font-semibold transition-all relative border-r border-zinc-900/60 ${
              activeTab === 'products'
                ? 'text-orange-500 bg-[#0b0c0f]/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Product Catalog ({combinedListForAdmin.length})</span>
            </span>
            {activeTab === 'products' && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-4 text-xs md:text-sm font-mono uppercase tracking-wider font-semibold transition-all relative border-r border-zinc-900/60 ${
              activeTab === 'users'
                ? 'text-orange-500 bg-[#0b0c0f]/60'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Users ({combinedUsers.length})</span>
            </span>
            {activeTab === 'users' && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-orange-500 shadow-[0_0_8px_#ea580c]" />
            )}
          </button>
        </div>

        {/* --- MAIN MODULE SWITCH --- */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: INQUIRIES LEDGER PANEL */}
          {activeTab === 'queries' && (
            <motion.div
              key="panel-queries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0b0d] p-4 border border-zinc-900 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:max-w-3xl">
                  {/* Search Input */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={querySearch}
                      onChange={(e) => setQuerySearch(e.target.value)}
                      placeholder="Search inquiries..."
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-xs text-white"
                    />
                  </div>
                  
                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
                    <button
                      onClick={() => setQueryFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        queryFilterStatus === 'all'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      All ({inquiries.length})
                    </button>
                    <button
                      onClick={() => setQueryFilterStatus('portal')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        queryFilterStatus === 'portal'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      Web Portal ({inquiries.filter(i => !i.isWhatsApp && !i.id.startsWith('INQ-WA-')).length})
                    </button>
                    <button
                      onClick={() => setQueryFilterStatus('whatsapp')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                        queryFilterStatus === 'whatsapp'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                          : 'text-zinc-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      WhatsApp ({inquiries.filter(i => i.isWhatsApp || i.id.startsWith('INQ-WA-')).length})
                    </button>
                  </div>
                </div>

                {inquiries.length > 0 && (
                  <button
                    onClick={handleClearAllInquiries}
                    className="shrink-0 flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg border border-red-500/20 bg-red-950/10 text-xs font-mono font-bold text-red-400 hover:bg-red-950/30 transition-all cursor-pointer select-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge All Records</span>
                  </button>
                )}
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="text-center py-24 bg-[#0b0c0f] border border-zinc-900 rounded-xl space-y-3">
                  <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto animate-pulse" />
                  <h3 className="text-base font-semibold text-zinc-400">No submission records found</h3>
                  <p className="text-xs text-zinc-650 max-w-md mx-auto">
                    When visitors submit the form in the Contact & Quote desptab, they will write to localStorage instantly and appear on this panel in high detail.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Sidebar query list items */}
                  <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredInquiries.map((inq) => {
                      const isSelected = selectedInquiry?.id === inq.id;
                      return (
                        <div
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className={`p-4 rounded-lg border cursor-pointer text-left transition-all duration-300 relative ${
                            isSelected 
                              ? 'bg-[#121318] border-orange-500/50 shadow-[0_4px_12px_rgba(234,88,12,0.06)]' 
                              : 'bg-[#0b0c0f] border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                inq.isWhatsApp || inq.id.startsWith('INQ-WA-')
                                  ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/10'
                                  : 'text-orange-500 bg-orange-950/20 border-orange-500/10'
                              }`}>
                                {inq.id}
                              </span>
                              {(inq.isWhatsApp || inq.id.startsWith('INQ-WA-')) && (
                                <span className="text-[8px] font-mono uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded font-extrabold tracking-wide select-none">
                                  WhatsApp
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">{inq.createdAt}</span>
                          </div>

                          <h4 className="text-xs font-bold text-white truncate">{inq.name}</h4>
                          <p className="text-[11px] text-zinc-400 truncate">{inq.company}</p>
                          
                          {inq.products && inq.products.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 rounded text-zinc-500 uppercase font-mono">
                                {inq.products.length} element{inq.products.length > 1 ? 's' : ''} attached
                              </span>
                            </div>
                          )}

                          <div className="absolute top-4 right-3 flex items-center gap-1">
                            <button
                              onClick={(e) => handleDeleteInquiry(inq.id, e)}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-zinc-500 p-1 rounded hover:bg-zinc-850 transition-all"
                              title="Delete this query log"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right View display metadata detail card */}
                  <div className="lg:col-span-7">
                    {selectedInquiry ? (
                      <div className="bg-[#0b0c0f] border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-orange-400 uppercase">TECHNICAL DISPATCH SLIP</span>
                              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-extrabold ${
                                selectedInquiry.isWhatsApp || selectedInquiry.id.startsWith('INQ-WA-')
                                  ? 'bg-[#25D366] text-black'
                                  : 'bg-zinc-800 text-zinc-350'
                              }`}>
                                {selectedInquiry.isWhatsApp || selectedInquiry.id.startsWith('INQ-WA-') ? 'WhatsApp Query' : 'Web Portal'}
                              </span>
                            </div>
                            <h3 className="text-lg font-display font-medium text-white uppercase mt-1">{selectedInquiry.id}</h3>
                          </div>
                          <button
                            onClick={(e) => handleDeleteInquiry(selectedInquiry.id, e)}
                            className="bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 p-2 rounded text-red-400 transition-colors cursor-pointer"
                            title="Delete query"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Customer profile card */}
                        <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">CUSTOMER CONTACT NAME</span>
                            <span className="text-sm font-semibold text-white">{selectedInquiry.name}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">ENTERPRISE COMPANY NAME</span>
                            <span className="text-sm font-semibold text-zinc-300">{selectedInquiry.company}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">EMAIL ADDRESS</span>
                            <a href={`mailto:${selectedInquiry.email}`} className="text-xs font-mono text-orange-400 font-medium hover:underline block">{selectedInquiry.email}</a>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">PHONE CONTACT NO</span>
                            <div className="flex items-center gap-2">
                              <a href={`tel:${selectedInquiry.phone}`} className="text-xs font-mono text-zinc-300 font-medium hover:underline block">{selectedInquiry.phone}</a>
                              {(selectedInquiry.isWhatsApp || selectedInquiry.id.startsWith('INQ-WA-')) && (
                                <a 
                                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#25D366]/15 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-[#25D366] text-[9px] font-mono font-extrabold leading-none transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <span>Chat ↗</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Attached items */}
                        {selectedInquiry.products && selectedInquiry.products.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block">ATTACHED HEAT SPECIFICATION INQUIRIES</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedInquiry.products.map((p, idx) => {
                                const matchedProduct = products.find(prod => prod.name === p || prod.id === p);
                                return (
                                  <span key={idx} className="bg-orange-950/20 border border-orange-500/20 text-orange-400 px-3 py-1 rounded text-xs font-medium font-sans flex items-center gap-2">
                                    {matchedProduct?.imageUrl ? (
                                      <img src={matchedProduct.imageUrl} alt={p} className="w-5 h-5 object-cover rounded" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span>🔥</span>
                                    )}
                                    <span>{p}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Message body logs text */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase block">SPECIFICATION REQS / NOTES DIALOGUE</span>
                          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-lg">
                            <p className="text-zinc-300 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed">
                              {selectedInquiry.message}
                            </p>
                          </div>
                        </div>

                        {/* Status marking elements */}
                        <div className="pt-4 border-t border-zinc-900 flex flex-wrap gap-3 items-center justify-between">
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Received {selectedInquiry.createdAt}</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(selectedInquiry.isWhatsApp || selectedInquiry.id.startsWith('INQ-WA-')) ? (
                              <>
                                <a
                                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${selectedInquiry.name},\n\nThis is the Heat One Technology team responding to your WhatsApp quote inquiry. We are reviewing your specifications. Let's discuss details here.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba56] text-black text-xs font-extrabold uppercase tracking-widest rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <span>Reply on WhatsApp</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`mailto:${selectedInquiry.email}?subject=Heat One Technology - Response to Quote Inquiry ${selectedInquiry.id}`}
                                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-350 uppercase tracking-wider rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <span>Email</span>
                                </a>
                              </>
                            ) : (
                              <a
                                href={`mailto:${selectedInquiry.email}?subject=Heat One Technology - Response to Quote Inquiry ${selectedInquiry.id}`}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white uppercase tracking-wider rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <span>Send Fast Email Solution</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-full bg-[#0b0c0f]/40 border border-zinc-900/60 rounded-xl flex flex-col items-center justify-center p-12 text-center text-zinc-600 space-y-2">
                        <FileText className="w-10 h-10 text-zinc-850" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">No technical slip selected</span>
                        <p className="text-xs text-zinc-500 select-none max-w-xs">
                          Click any inquiry block on the left panel grid to render their full spec sheet details and client metrics.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: PRODUCT CATALOG MANAGEMENT PANEL */}
          {activeTab === 'products' && (
            <motion.div
              key="panel-products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0b0d] p-4 border border-zinc-900 rounded-lg">
                {isReorderMode ? (
                  <div className="text-left">
                    <h3 className="text-xs font-mono font-bold text-orange-400 uppercase flex items-center gap-1.5 animate-pulse">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>ARRANGE PRODUCT PORTFOLIO ORDER</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-mono">Use Up/Down buttons on the right of each product row to arrange sequence, then save.</p>
                  </div>
                ) : (
                  <div className="text-left">
                    <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase">MANAGE HEATING SOLUTIONS CATALOG</h3>
                    <p className="text-[11px] text-zinc-650">Verify core factory-loaded models or insert dynamic ones instantly.</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {isReorderMode ? (
                    <>
                      <button
                        type="button"
                        onClick={cancelReordering}
                        disabled={isSavingReorder}
                        className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveReordering}
                        disabled={isSavingReorder}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-550 text-xs font-bold text-white uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                      >
                        {isSavingReorder ? 'Saving...' : 'Save Arrangement'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          showConfirm(
                            'Reset Catalog to Presets',
                            'Are you sure you want to reset your active heating catalog? This will delete all current products and restore the original 18 default catalog elements.',
                            () => {
                              onResetProducts();
                            },
                            { confirmText: 'Yes, Reset', isDestructive: true }
                          );
                        }}
                        className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        Reset Catalog to Presets
                      </button>
                      <button
                        type="button"
                        onClick={startReordering}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-orange-500" />
                        <span>Arrange Catalog</span>
                      </button>
                      <button
                        type="button"
                        onClick={openFormForNew}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Product</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Products Catalog table (full-width) */}
              <div className="bg-[#0b0c0f] border border-zinc-900 rounded-xl overflow-hidden self-start" id="products-catalog-ledger-layout">
                <div className="grid grid-cols-12 bg-zinc-950 border-b border-zinc-900 p-4 text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
                  <div className="col-span-6 md:col-span-5 text-left">Element Details</div>
                  <div className="col-span-3 md:col-span-2 text-left">Category</div>
                  <div className="col-span-3 md:col-span-2 text-left font-mono">Max Temp / Power</div>
                  <div className="hidden md:block col-span-2 text-left">Status Indicator</div>
                  <div className="col-span-3 md:col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-zinc-900">
                  {combinedListForAdmin.map((prod, index) => (
                    <div
                      key={prod.id}
                      onClick={() => !isReorderMode && openFormForEdit(prod)}
                      className={`grid grid-cols-12 p-4 items-center gap-4 text-left border-l border-transparent transition-all group ${
                        isReorderMode 
                          ? 'cursor-default select-none' 
                          : 'hover:bg-zinc-900/20 hover:border-orange-500/10 hover:border-orange-500 cursor-pointer'
                      }`}
                    >
                      {/* DETAILS */}
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                        <div className="w-12 h-10 bg-zinc-950 rounded border border-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-zinc-750" />
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className={`text-xs font-bold transition-colors truncate ${isReorderMode ? 'text-white' : 'text-white group-hover:text-orange-500'}`}>{prod.name}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono block truncate">{prod.subtitle}</span>
                        </div>
                      </div>

                      {/* CATEGORY */}
                      <div className="col-span-3 md:col-span-2 text-xs text-zinc-400 capitalize">
                        {prod.category?.replace('-', ' ') || ''}
                      </div>

                      {/* SPEC SUMMARY */}
                      <div className="col-span-3 md:col-span-2 text-xs font-mono space-y-0.5">
                        <div className="text-orange-400 font-bold">{prod.specifications?.maxTemperature || ''}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{prod.specifications?.power || ''}</div>
                      </div>

                      {/* STATUS ATTACHMENT */}
                      <div className="hidden md:block col-span-2 text-xs">
                        {prod.isStatic ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-900 px-2.5 py-1 rounded">
                            <ShieldCheck className="w-3 h-3 text-zinc-500" />
                            <span>STATIC SYSTEM</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded animate-pulse">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>ACTIVE LIVE</span>
                          </span>
                        )}
                      </div>

                      {/* ACTIONS ELEMENT */}
                      <div className="col-span-3 md:col-span-1 text-right flex items-center justify-end gap-1">
                        {isReorderMode ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveProductUp(index);
                              }}
                              className="p-1.5 text-zinc-450 hover:text-orange-500 hover:bg-orange-950/20 border border-zinc-800 hover:border-orange-500/30 rounded transition-all cursor-pointer disabled:opacity-20 disabled:hover:text-zinc-450 disabled:hover:bg-transparent disabled:hover:border-zinc-800 disabled:cursor-not-allowed"
                              title="Move Product Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={index === combinedListForAdmin.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                moveProductDown(index);
                              }}
                              className="p-1.5 text-zinc-450 hover:text-orange-500 hover:bg-orange-950/20 border border-zinc-800 hover:border-orange-500/30 rounded transition-all cursor-pointer disabled:opacity-20 disabled:hover:text-zinc-450 disabled:hover:bg-transparent disabled:hover:border-zinc-800 disabled:cursor-not-allowed"
                              title="Move Product Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openFormForEdit(prod);
                              }}
                              className="p-2 text-orange-400 hover:text-white hover:bg-orange-950/20 border border-orange-500/20 hover:border-orange-500 rounded transition-all cursor-pointer"
                              title="Edit product info, specs, & photos"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProductClick(prod.id, prod.name);
                              }}
                              className="p-2 text-red-500 hover:text-red-400 hover:bg-red-950/10 border border-red-900/30 rounded transition-all cursor-pointer"
                              title="Delete from catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: USERS & LEADS LEDGER PANEL */}
          {activeTab === 'users' && (
            <motion.div
              key="panel-users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0b0d] p-4 border border-zinc-900 rounded-lg">
                <div className="text-left">
                  <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase">USERS & LEADS LEDGER</h3>
                  <p className="text-[11px] text-zinc-650">Verify registered accounts or contact leads captured via inquiry forms.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Filter by name, email, company, phone..."
                      className="w-full bg-zinc-950 border border-zinc-900 focus:border-orange-500 focus:outline-none rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-600 font-sans"
                    />
                  </div>
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="admin-users-grid-layout">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-[#0b0c0f] border border-zinc-900 rounded-xl">
                    <Users className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                    <span className="text-sm font-mono text-zinc-500 uppercase">No users or leads detected</span>
                  </div>
                ) : (
                  filteredUsers.map((u, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#0b0c0f] border border-zinc-900 hover:border-orange-500/30 rounded-xl p-6 flex flex-col justify-between min-h-[190px] shadow-lg relative overflow-hidden group/usercard"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-2xl group-hover/usercard:bg-orange-600/10 transition-colors" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="max-w-[70%] text-left">
                            {u.name ? (
                              <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">{u.name}</h4>
                            ) : (
                              <h4 className="text-sm font-mono text-zinc-500 italic">Unnamed Contact</h4>
                            )}
                            <span className="text-xs font-mono text-orange-400 block mt-1 break-all select-all font-semibold leading-normal">
                              {u.email}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5 items-end shrink-0">
                            {u.isRegistered ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Registered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                                Lead Only
                              </span>
                            )}
                            {u.inquiryCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-orange-400 bg-orange-950/30 border border-orange-500/35 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                                {u.inquiryCount} {u.inquiryCount === 1 ? 'Inquiry' : 'Inquiries'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metadata fields */}
                        <div className="space-y-1.5 text-xs text-zinc-400 font-sans text-left">
                          {u.company && (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-600 font-mono text-[10px] w-12 shrink-0">Company:</span>
                              <span className="text-zinc-300 font-medium truncate">{u.company}</span>
                            </div>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-600 font-mono text-[10px] w-12 shrink-0">Phone:</span>
                              <a href={`tel:${u.phone}`} className="text-zinc-350 hover:text-orange-400 transition-colors font-mono">
                                {u.phone}
                              </a>
                            </div>
                          )}
                          {u.createdAt && (
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-650 font-mono text-[10px] w-12 shrink-0">Added:</span>
                              <span className="text-zinc-500 font-mono text-[11px]">
                                {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card actions */}
                      <div className="flex items-center justify-end gap-2 border-t border-zinc-900/60 pt-4 mt-4 shrink-0">
                        {u.inquiryCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuerySearch(u.email);
                              setActiveTab('queries');
                            }}
                            className="px-3 py-1.5 bg-orange-950/20 hover:bg-orange-600 border border-orange-500/30 hover:border-orange-500 text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer"
                            title="Filter submissions of this email"
                          >
                            Inquiries
                          </button>
                        )}
                        <a
                          href={`mailto:${u.email}`}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all"
                        >
                          Email Contact
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* --- ADD / EDIT PRODUCT INTERACTIVE DIALOG MODAL --- */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              {/* Back backdrop */}
              <div 
                onClick={() => setIsFormOpen(false)} 
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />

              {/* Form Container body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0d0e12] border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                id="product-form-modal"
              >
                {/* Header aspect */}
                <div className="flex justify-between items-center bg-[#07080a] border-b border-zinc-800 p-5 shrink-0">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                    <div>
                      <h3 className="text-base font-display font-medium text-white">
                        {editingProduct ? 'EDIT CONFIGURATION SPEC SHEET' : 'BUILD NEW INDUSTRIAL ELEMENT'}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">
                        {editingProduct ? `PRODUCT UNIQUE ID: ${editingProduct.id}` : 'CREATES AND MERGES WITH RUNTIME COMPILER'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form contents body scroll space */}
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6" id="productspecform">
                  
                  {/* Preset images showcase */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 tracking-wide block">Select Catalog Reference Photography</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLocalImageUpload} 
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_IMAGES.map((imgDef, idx) => {
                        const isSelected = prodImgUrl === imgDef.value;
                        return (
                          <div
                            key={idx}
                            onClick={() => setProdImgUrl(imgDef.value)}
                            className={`p-2 bg-zinc-950 border rounded-lg cursor-pointer transition-all flex flex-col items-center gap-1 hover:border-zinc-700 ${
                              isSelected ? 'border-orange-500 bg-orange-950/10' : 'border-zinc-900'
                            }`}
                          >
                            <div className="w-full aspect-video rounded bg-zinc-900 overflow-hidden relative border border-zinc-900">
                              <img src={imgDef.value} alt={imgDef.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-orange-600 rounded-full p-0.5 text-white">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </div>
                            <span className="text-[8px] font-mono text-center text-zinc-400 truncate w-full">{imgDef.label}</span>
                          </div>
                        );
                      })}

                      {/* Custom Upload Card */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 bg-zinc-950 border rounded-lg cursor-pointer transition-all flex flex-col items-center gap-1 hover:border-orange-500/30 group/upload ${
                          prodImgUrl.startsWith('data:') ? 'border-orange-500 bg-orange-950/10' : 'border-dashed border-zinc-800 bg-[#0a0a0d]'
                        }`}
                      >
                        <div className="w-full aspect-video rounded bg-zinc-900/60 overflow-hidden relative border border-zinc-900 flex items-center justify-center">
                          {prodImgUrl.startsWith('data:') ? (
                            <>
                              <img src={prodImgUrl} alt="Custom User Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute top-1 right-1 bg-orange-600 rounded-full p-0.5 text-white">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-zinc-500 group-hover/upload:text-orange-400 transition-colors">
                              <Upload className="w-4 h-4" />
                              <span className="text-[8px] font-mono">Upload from PC</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] font-mono text-center text-zinc-400 truncate w-full">
                          {prodImgUrl.startsWith('data:') ? 'Custom Photo Loaded' : 'Select local photo from PC'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Photo Upload and Gallery block */}
                  <div className="space-y-3 bg-[#090a0d] border border-zinc-900 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-xs font-mono uppercase text-zinc-300 tracking-wide block flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                          Multi-Photo Gallery
                        </label>
                        <p className="text-[10px] text-zinc-500 font-mono">Upload multiple photos of this product for a complete 360° representation.</p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => multiFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Select Multi-Files
                      </button>
                    </div>

                    <input 
                      type="file" 
                      ref={multiFileInputRef} 
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      onChange={handleMultipleImagesUpload} 
                    />

                    {prodAdditionalImages.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-zinc-800 rounded-lg bg-[#07080a] text-zinc-500 select-none">
                        <ImageIcon className="w-5 h-5 mx-auto mb-1.5 opacity-30" />
                        <p className="text-[10px] font-mono">No supplementary photos uploaded. Only the primary display image will be active.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {prodAdditionalImages.map((imgUrl, index) => (
                          <div 
                            key={index}
                            className="aspect-square bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden relative group/additional"
                          >
                            <img src={imgUrl} alt={`Supplementary ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Hover overlay with Delete button */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/additional:opacity-100 flex items-center justify-center transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setProdAdditionalImages(prev => prev.filter((_, idx) => idx !== index));
                                }}
                                className="p-1 px-2 bg-red-600 hover:bg-red-500 text-white text-[9px] font-mono font-bold rounded flex items-center gap-1 transition-transform scale-95 group-hover/additional:scale-100 cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dual Grid block parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400">Heating Element Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Heavy-Duty Mica Flat Ribbon Band"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400">Subtitle Spec Highlight *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Fast thermal response mica insulator sheaths"
                        value={prodSubtitle}
                        onChange={(e) => setProdSubtitle(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400">System Product Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-zinc-300"
                      >
                        <option value="infrared">Infrared Radiation</option>
                        <option value="quartz-tubes">Milky / Clear Quartz Glass Tubes</option>
                        <option value="ceramic">Refractory Ceramic Emitters</option>
                        <option value="ovens">Ovens & Chambers Assemblies</option>
                        <option value="tubular-heaters">Industrial Tubular Heaters</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400 font-bold text-orange-400">Live MongoDB Synced Status</label>
                      <input
                        type="text"
                        disabled
                        value="LIVE DATABASE PERSISTED VIA CLIENT BROWSWER STORAGE"
                        className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-2.5 text-[10px] font-mono text-zinc-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Long descriptions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase text-zinc-400">Brief Overview Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="One line marketing highlight text used inside list views."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono uppercase text-zinc-400">In-Depth Thermal Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain physical engineering logic, operating materials, sheathing composition, wire gauge, and precise response characteristics."
                      value={prodLongDesc}
                      onChange={(e) => setProdLongDesc(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none"
                    />
                  </div>

                  {/* Technical Specifications Blocks */}
                  <div className="bg-[#07080a] p-4 rounded-xl border border-zinc-900 space-y-4">
                    <h4 className="text-xs font-mono uppercase text-orange-400 font-bold border-b border-zinc-900 pb-2">SPECIFICATIONS SHEET PROFILE</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Power Range</span>
                        <input
                          type="text"
                          required
                          value={specPower}
                          onChange={(e) => setSpecPower(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Operating Voltage</span>
                        <input
                          type="text"
                          required
                          value={specVoltage}
                          onChange={(e) => setSpecVoltage(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Form Factor / Diameter</span>
                        <input
                          type="text"
                          required
                          value={specDiameter}
                          onChange={(e) => setSpecDiameter(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Length Spectrum</span>
                        <input
                          type="text"
                          required
                          value={specHeatedLength}
                          onChange={(e) => setSpecHeatedLength(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Peak Heat Limit (°C)</span>
                        <input
                          type="text"
                          required
                          value={specMaxTemp}
                          onChange={(e) => setSpecMaxTemp(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Radiation Wavelength</span>
                        <input
                          type="text"
                          placeholder="e.g., Short Wave (1.2 µm) / Convective"
                          value={specWavelength}
                          onChange={(e) => setSpecWavelength(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Insulating Component Material</span>
                        <input
                          type="text"
                          placeholder="e.g., Pure fused silica / Refractory block"
                          value={specMaterial}
                          onChange={(e) => setSpecMaterial(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded p-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Extra Multi Rows Line-By-Line Textareas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400">Design Features (One Per Line) *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Insert key features, one on each line."
                        value={prodFeatures}
                        onChange={(e) => setProdFeatures(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono uppercase text-zinc-400">Applications / Usages (One Per Line) *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Insert industrial fields, one on each line."
                        value={prodApplications}
                        onChange={(e) => setProdApplications(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg p-2.5 text-xs text-white resize-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Actions buttons footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white uppercase tracking-widest rounded-lg shadow-lg transition-all cursor-pointer"
                    >
                      {editingProduct ? 'Save Calibration' : 'Inject Dynamic Element'}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* State-driven Confirmation Dialog Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              {/* Box */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0b0c0f] border border-zinc-800 rounded-xl p-6 max-w-md w-full relative z-10 shadow-2xl space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-950/40 border border-red-900/30 rounded-lg text-red-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{confirmModal.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{confirmModal.message}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 rounded uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {confirmModal.cancelText || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className={`px-4 py-2 text-xs font-mono font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                      confirmModal.isDestructive
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/20'
                        : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                    }`}
                  >
                    {confirmModal.confirmText || 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
