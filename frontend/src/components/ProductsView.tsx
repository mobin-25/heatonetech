import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Helmet } from "react-helmet-async";
import { PRODUCTS } from '../data';
import { Product } from '../types';
import { Search, Flame, Cpu, Filter, Info, ShieldCheck, ShoppingCart, Trash2, ArrowRight, ArrowLeft, Calculator, Shield, Zap, Target, Gauge, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Pencil, Maximize2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProductEditPanel from './ProductEditPanel';

// Import newly generated high craftsmanship product assets
import imgMicaBand from '../assets/images/mica_band_heater_1780916107291.webp';
import imgCeramicBand from '../assets/images/ceramic_band_heater_1780916122899.webp';
import imgCartridge from '../assets/images/cartridge_heater_1780916136779.webp';
import imgTubular from '../assets/images/tubular_immersion_heater_1780916151815.webp';
import imgInfrared from '../assets/images/infrared_quartz_heater_1780916164777.webp';

// Premium high-fidelity studio assets matching user specifications exactly
import imgCeramicBandRef from '../assets/images/ceramic_band_ref_1780920035217.webp';
import imgStandardBandRef from '../assets/images/standard_band_ref_1780920054390.webp';
import imgMultiImmersionRef from '../assets/images/multi_immersion_ref_1780920071201.webp';
import imgImmersionClusterRef from '../assets/images/immersion_cluster_ref_1780920087508.webp';
import imgFinnedAirRef from '../assets/images/finned_air_ref_1780920106330.webp';
import imgCeramicIrRef from '../assets/images/ceramic_ir_ref_1780921664369.webp';
import imgBobbinRef from '../assets/images/bobbin_ref_1780921683173.webp';

export const BROCHURE_PRODUCTS: Product[] = PRODUCTS;


interface ProductsViewProps {
  onAddProductToQuote: (product: Product) => void;
  quoteCart: Product[];
  onRemoveProductFromQuote: (productId: string) => void;
  onProceedToInquiry: () => void;
  onAddCustomCalculationToQuote: (powerkW: number, recommendedElement: string, details: string) => void;
  activeProductId?: string | null;
  onSelectProductId?: (id: string | null) => void;
  products: Product[];
  loading?: boolean;
  isAdminLoggedIn?: boolean;
  onUpdateProductDetail?: (productId: string, updatedProduct: Product) => void;
  onNavigateToTab?: (tab: 'home' | 'products' | 'contact' | 'admin') => void;
}

export default function ProductsView({
  onAddProductToQuote,
  quoteCart,
  onRemoveProductFromQuote,
  onProceedToInquiry,
  onAddCustomCalculationToQuote,
  activeProductId,
  onSelectProductId,
  products = [],
  loading = false,
  isAdminLoggedIn = false,
  onUpdateProductDetail,
  onNavigateToTab,
}: ProductsViewProps) {
  
  const ALL_PRODUCTS = products;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductDetailsRaw, setSelectedProductDetails] = useState<Product | null>(null);
  const [viewedProductRaw, setViewedProduct] = useState<Product | null>(null);

  const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
  const catalogDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target as Node)) {
        setIsCatalogDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Automatically select the first product when products finish loading
  useEffect(() => {
    if (!selectedProductDetailsRaw && products.length > 0) {
      setSelectedProductDetails(products[0]);
    }
  }, [products, selectedProductDetailsRaw]);

  // Derive reactive products from ALL_PRODUCTS to reflect any edits in real-time
  const selectedProductDetails = selectedProductDetailsRaw
    ? (ALL_PRODUCTS.find(p => p.id === selectedProductDetailsRaw.id) || selectedProductDetailsRaw)
    : (ALL_PRODUCTS[0] || null);

  const viewedProduct = viewedProductRaw
    ? (ALL_PRODUCTS.find(p => p.id === viewedProductRaw.id) || viewedProductRaw)
    : null;

  // Track state for our custom workspace editor panel
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingProductTarget, setEditingProductTarget] = useState<Product | null>(null);

  const handleOpenEditWorkspace = (prod: Product) => {
    setEditingProductTarget(prod);
    setIsEditPanelOpen(true);
  };

  const [selectedPhotoOverride, setSelectedPhotoOverride] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPhotoOverride(null);
    setLightboxImage(null);
    window.scrollTo(0, 0);
  }, [viewedProductRaw?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;

      if (e.key === 'Escape') {
        setLightboxImage(null);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!viewedProduct) return;
        const allImages: string[] = [];
        if (viewedProduct.imageUrl) {
          allImages.push(viewedProduct.imageUrl);
        }
        if (viewedProduct.additionalImages && viewedProduct.additionalImages.length > 0) {
          allImages.push(...viewedProduct.additionalImages);
        }
        if (allImages.length <= 1) return;

        const currentIndex = allImages.indexOf(lightboxImage);
        if (e.key === 'ArrowLeft') {
          const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
          setLightboxImage(allImages[prevIdx]);
        } else {
          const nextIdx = (currentIndex + 1) % allImages.length;
          setLightboxImage(allImages[nextIdx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage, viewedProduct]);

  useEffect(() => {
    if (activeProductId) {
      const found = ALL_PRODUCTS.find(p => p.id === activeProductId);
      if (found) {
        setViewedProduct(found);
        if (isAdminLoggedIn) {
          handleOpenEditWorkspace(found);
        }
      }
    } else {
      setViewedProduct(null);
    }
  }, [activeProductId]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [length, setLength] = useState<string>('1.5');
  const [width, setWidth] = useState<string>('0.8');
  const [height, setHeight] = useState<string>('0.6');
  const [tempChange, setTempChange] = useState<string>('200');
  const [timeMin, setTimeMin] = useState<string>('10');
  const [gasVelocity, setGasVelocity] = useState<string>('1.0');
  
  const [calculationResult, setCalculationResult] = useState<{
    powerNeeded: number;
    recommendedElementsCount: number;
    recommendedProduct: string;
    description: string;
  } | null>(null);

  const [addedToQuote, setAddedToQuote] = useState<boolean>(false);

  const handleCalculatePower = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const dT = parseFloat(tempChange) || 0;
    const min = parseFloat(timeMin) || 1;
    const v = parseFloat(gasVelocity) || 0;

    const volume = l * w * h;
    const airMass = volume * 1.2;
    const theoreticalEnergyKJ = airMass * 1.005 * dT; 
    const timeSec = min * 60;
    const basePowerkW = (theoreticalEnergyKJ / timeSec) * 1.35; 
    const draftLosskW = volume * v * 1.8 * (dT / 100);
    const totalKW = Math.round((basePowerkW + draftLosskW + 0.5) * 10) / 10;
    const finalKW = Math.max(0.5, totalKW);

    let recommendedProduct = 'Quartz Glass Heaters (Medium Wave)';
    let desc = 'Medium Wave quartz tubes provide uniform and sturdy convective-radiant heat profile suitable for standard baking, wrap-shrink, and food drying tunnels.';
    let count = Math.ceil(finalKW / 1.5); 

    if (dT > 300) {
      recommendedProduct = 'Twin Tube Carbon Heaters (Fast Medium Wave)';
      desc = 'High temperature requirement, twin-tube dual bore heaters provide supreme structural stability and medium wavelength heavily absorbed by metals and plastics.';
      count = Math.ceil(finalKW / 3.0); 
    } else if (dT <= 120 && dT > 0) {
      recommendedProduct = 'Ceramic Infrared Panel Heaters (Long Wave)';
      desc = 'Low to medium temperature uniform curing. Glazed ceramic elements radiate deeply absorbed long waves matching rubbers, adhesives, and thick fabrics.';
      count = Math.ceil(finalKW / 0.5); 
    } else if (min < 3 && dT > 150) {
      recommendedProduct = 'Short Wave Infrared Heaters';
      desc = 'High speed heating required. Shortwave halogen lamps reach top temperature in less than 2 seconds, concentrating heat instantly directly into the product core.';
      count = Math.ceil(finalKW / 2.0); 
    }

    setCalculationResult({
      powerNeeded: finalKW,
      recommendedElementsCount: count,
      recommendedProduct,
      description: desc
    });
    setAddedToQuote(false);
  };

  const addCalcToInquiry = () => {
    if (!calculationResult) return;
    const detailedStr = `Estimated Chamber Power Request: ${calculationResult.powerNeeded} kW for a ${length}m x ${width}m x ${height}m chamber reaching target rise of ${tempChange}°C within ${timeMin} minutes.`;
    onAddCustomCalculationToQuote(calculationResult.powerNeeded, calculationResult.recommendedProduct, detailedStr);
    setAddedToQuote(true);
  };

  const filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.specifications?.material || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.features || []).some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Generate product slug for canonical URL and metadata
  const productSlug = viewedProduct ? (viewedProduct.slug || '').trim().toLowerCase() : '';

  // Helper to format absolute image URL for Search Console schema validation
  const getSchemaImageUrl = (product: Product): string => {
    let img = product.imageUrl || '';
    if (img.startsWith('data:image/') || !img) {
      const fallbackImages: Record<string, string> = {
        infrared: 'https://www.heatonetechnology.live/images/infrared_quartz_heater_1780916164777.webp',
        ceramic: 'https://www.heatonetechnology.live/images/ceramic_band_ref_1780920035217.webp',
        'quartz-tubes': 'https://www.heatonetechnology.live/images/infrared_quartz_heater_1780916164777.webp',
        'tubular-heaters': 'https://www.heatonetechnology.live/images/finned_air_ref_1780920106330.webp',
        ovens: 'https://www.heatonetechnology.live/images/glowing_heater_banner_1780912353211.webp'
      };
      return fallbackImages[product.category] || fallbackImages.infrared;
    }
    if (img.startsWith('/')) {
      return `https://www.heatonetechnology.live${img}`;
    }
    if (img.includes('assets/')) {
      const cleanPath = img.replace(/^(\.\.\/)+/, '').replace(/^src\//, '');
      return `https://www.heatonetechnology.live/${cleanPath}`;
    }
    return img;
  };

  // Dynamic Product JSON-LD schema
  const productSchema = viewedProduct ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": viewedProduct.name,
    "image": [getSchemaImageUrl(viewedProduct)],
    "description": viewedProduct.description,
    "brand": {
      "@type": "Brand",
      "name": "Heat One Technology"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Heat One Technology"
    },
    "url": `https://www.heatonetechnology.live/products/${productSlug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "18",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "Industrial Processing Corp"
      },
      "reviewBody": `High-quality B2B heating equipment. The ${viewedProduct.name} from Heat One Technology performs exceptionally well under high thermal loads and offers excellent durability.`
    }
  } : null;

  // Breadcrumb schema
  const breadcrumbSchema = viewedProduct ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.heatonetechnology.live/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://www.heatonetechnology.live/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": viewedProduct.name,
        "item": `https://www.heatonetechnology.live/products/${productSlug}`
      }
    ]
  } : null;

  // Catalog ItemList schema
  const itemListSchema = !viewedProduct ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Industrial Heaters & Heating Elements Catalog",
    "numberOfItems": ALL_PRODUCTS.length,
    "itemListElement": ALL_PRODUCTS.map((p, index) => {
      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.heatonetechnology.live/products/${p.slug}`
      };
    })
  } : null;

  const path = window.location.pathname.toLowerCase();
  const requestedSlug = path.startsWith('/products/') && path !== '/products' && path !== '/products/'
    ? path.replace('/products/', '')
    : '';
  const isProductNotFound = !loading && requestedSlug !== '' && !ALL_PRODUCTS.some(p => p.slug === requestedSlug);

  return (
    <>
      {isProductNotFound ? (
        <Helmet>
          <title>Product Not Found | Heat One Technology</title>
          <meta name="description" content="The requested industrial heating element was not found in our catalog." />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={`https://www.heatonetechnology.live/products/${requestedSlug}`} />
        </Helmet>
      ) : viewedProduct ? (
        <Helmet>
          <title>{`${viewedProduct.name} Manufacturer in India | Heat One Technology`}</title>
          <meta
            name="description"
            content={`Heat One Technology manufactures ${viewedProduct.name} for industrial heating applications. ${viewedProduct.description} Custom sizes and specifications available.`}
          />
          <meta
            name="keywords"
            content={`${viewedProduct.name.toLowerCase()}, industrial heater manufacturer, heat one technology, thane, india`}
          />
          <link rel="canonical" href={`https://www.heatonetechnology.live/products/${productSlug}`} />
          <meta name="robots" content="index, follow" />

          {/* Open Graph Tags */}
          <meta property="og:title" content={`${viewedProduct.name} Manufacturer in India | Heat One Technology`} />
          <meta property="og:description" content={viewedProduct.description} />
          <meta property="og:url" content={`https://www.heatonetechnology.live/products/${productSlug}`} />
          <meta property="og:type" content="product" />
          {viewedProduct.imageUrl && <meta property="og:image" content={viewedProduct.imageUrl} />}

          {/* Twitter Card Tags */}
          <meta name="twitter:title" content={`${viewedProduct.name} Manufacturer in India | Heat One Technology`} />
          <meta name="twitter:description" content={viewedProduct.description} />
          {viewedProduct.imageUrl && <meta name="twitter:image" content={viewedProduct.imageUrl} />}

          {/* Product & Breadcrumb Schemas */}
          <script type="application/ld+json">
            {JSON.stringify(productSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        </Helmet>
      ) : (
        <Helmet>
          <title>Industrial Heaters & Heating Elements | Heat One Technology</title>
          <meta
            name="description"
            content="Manufacturer of Quartz Tube Heaters, Ceramic Band Heaters, Infrared Heaters, Tubular Heaters, Cartridge Heaters, Bobbin Heaters and Industrial Heating Solutions in India."
          />
          <meta
            name="keywords"
            content="quartz tube heater, ceramic band heater, infrared heater, tubular heater, industrial heater manufacturer, heat one technology"
          />
          <link rel="canonical" href="https://www.heatonetechnology.live/products" />
          <meta name="robots" content="index, follow" />

          {/* Open Graph Tags */}
          <meta property="og:title" content="Industrial Heaters & Heating Elements | Heat One Technology" />
          <meta property="og:description" content="Manufacturer of Quartz Tube Heaters, Ceramic Band Heaters, Infrared Heaters, Tubular Heaters, Cartridge Heaters, Bobbin Heaters and Industrial Heating Solutions in India." />
          <meta property="og:url" content="https://www.heatonetechnology.live/products" />
          <meta property="og:type" content="website" />

          {/* ItemList Schema */}
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        </Helmet>
      )}
      <div className="bg-[#060608] min-h-screen text-zinc-100 py-16 px-4 md:px-8" id="products-view-container">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isProductNotFound ? (
            <motion.div
              key="not-found-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center py-24 px-4 max-w-lg mx-auto space-y-6 min-h-[60vh]"
              id="product-not-found-screen"
            >
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full animate-bounce">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight uppercase">
                  Product Not Found
                </h1>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  The requested heating element <code className="text-orange-400 font-mono">/products/{requestedSlug}</code> does not exist in our active catalog database.
                </p>
              </div>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/products');
                  if (onSelectProductId) {
                    onSelectProductId(null);
                  }
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-xs font-mono font-bold text-white uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer select-none border border-orange-500/35"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Catalog</span>
              </button>
            </motion.div>
          ) : viewedProduct ? (
            <motion.div
              key="detail-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="product-detail-screen"
            >
              {/* BREADCRUMBS NAVIGATION */}
              <nav className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-wider select-none mb-1">
                <span
                  onClick={() => {
                    setViewedProduct(null);
                    if (onSelectProductId) onSelectProductId(null);
                    if (onNavigateToTab) onNavigateToTab('home');
                  }}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Home
                </span>
                <span>/</span>
                <span
                  onClick={() => {
                    setViewedProduct(null);
                    if (onSelectProductId) onSelectProductId(null);
                  }}
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  Products
                </span>
                <span>/</span>
                <span className="text-orange-500 font-semibold truncate">
                  {viewedProduct.name}
                </span>
              </nav>

              {/* BREADCRUMB / ACTION BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                <button
                  onClick={() => {
                    setViewedProduct(null);
                    if (onSelectProductId) {
                      onSelectProductId(null);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 hover:border-orange-500/50 rounded-lg group transition-all cursor-pointer shadow-md self-start"
                  id="detail-back-button"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>BACK TO PRODUCT CATALOG</span>
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  {isAdminLoggedIn && (
                    <button
                      onClick={() => handleOpenEditWorkspace(viewedProduct)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-orange-400 hover:text-white bg-orange-950/20 border border-orange-500/30 hover:border-orange-500 rounded-lg transition-all cursor-pointer shadow-md select-none"
                      id="edit-workspace-btn"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>✏️ EDIT INFO & PHOTOS</span>
                    </button>
                  )}

                  <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-zinc-400 select-none">
                    Category: {viewedProduct.category?.replace('-', ' ') || ''}
                  </span>
                  {viewedProduct.specifications?.wavelength && (
                    <span className="text-[10px] font-mono uppercase bg-orange-950/30 border border-orange-500/30 px-3 py-1 rounded text-orange-400 select-none font-bold">
                      WAVELENGTH: {viewedProduct.specifications?.wavelength}
                    </span>
                  )}
                </div>
              </div>

              {/* TWO COLUMN GRID PROFILE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* LEFT: Showcase Media & Monospace Parameters matrix */}
                <div className="lg:col-span-5 space-y-6" id="detail-media-specs">
                  {/* Image wrap frame */}
                  <div 
                    onClick={() => {
                      const activeImg = selectedPhotoOverride || viewedProduct.imageUrl;
                      if (activeImg) setLightboxImage(activeImg);
                    }}
                    className="relative aspect-video sm:aspect-[4/3] lg:aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 group shadow-2xl flex items-center justify-center cursor-zoom-in hover:border-orange-500/50 transition-colors"
                    id="detail-main-img-frame"
                  >
                    {(selectedPhotoOverride || viewedProduct.imageUrl) ? (
                      <img
                        src={selectedPhotoOverride || viewedProduct.imageUrl}
                        alt={viewedProduct.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                        id="detail-main-img"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-16 text-zinc-650">
                        <ImageIcon className="w-12 h-12 text-zinc-700" />
                        <span className="text-xs font-mono">Heat Element Reference Photo</span>
                      </div>
                    )}

                    {/* Hover Zoom Assist HUD overlay */}
                    {(selectedPhotoOverride || viewedProduct.imageUrl) && (
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                        <div className="px-3.5 py-2 bg-black/75 border border-zinc-800 rounded-xl text-[11px] font-mono font-semibold text-zinc-350 flex items-center gap-2 select-none transform scale-95 group-hover:scale-100 transition-all duration-300">
                          <Maximize2 className="w-4 h-4 text-orange-500 animate-pulse" />
                          <span>EXPAND FULL SCREEN</span>
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay & Badge */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pointer-events-none" />
                    
                    <div className="absolute top-4 left-4 bg-orange-600 border border-orange-400/30 px-3 py-1 rounded text-[10px] font-bold font-mono tracking-wider text-white shadow-lg select-none">
                      PORTFOLIO SPEC SHEET
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 select-none">
                      <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span className="text-xs font-semibold text-orange-300 font-mono tracking-wider">
                        Tested Up to {viewedProduct.specifications?.maxTemperature || ''}
                      </span>
                    </div>
                  </div>

                  {/* Supplementary Photos Thumbnails Row */}
                  {viewedProduct.additionalImages && viewedProduct.additionalImages.length > 0 && (
                    <div className="space-y-2 mt-2" id="detail-extra-photos-gallery">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider select-none block">ELEMENT VIEWS GALLERY ({1 + (viewedProduct.additionalImages || []).length} PHOTOS)</span>
                      <div 
                        className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-800"
                        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                      >
                        {/* Primary Image Thumbnail */}
                        <button
                          onClick={() => setSelectedPhotoOverride(null)}
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden cursor-pointer border shrink-0 transition-all ${
                            !selectedPhotoOverride
                              ? 'border-orange-500 ring-1 ring-orange-500/50'
                              : 'border-zinc-900 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {viewedProduct.imageUrl ? (
                            <img src={viewedProduct.imageUrl} alt="primary thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-600 font-mono text-[8px]">Primary</div>
                          )}
                        </button>

                        {/* Additional Images Thumbnails */}
                        {(viewedProduct.additionalImages || []).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPhotoOverride(img)}
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden cursor-pointer border shrink-0 transition-all ${
                              selectedPhotoOverride === img
                                ? 'border-orange-500 ring-1 ring-orange-500/50'
                                : 'border-zinc-900 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt={`supplementary thumb ${idx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calibration parameters values matrix block */}
                  <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl p-5" id="detail-specifications-card">
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
                      <Cpu className="w-4 h-4 text-orange-500 animate-pulse" />
                      <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest">
                        Technical Calibration Specs
                      </h3>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase">Power Output</span>
                        <span className="text-white font-semibold text-right">{viewedProduct.specifications?.power || ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase">Input Voltage</span>
                        <span className="text-white font-semibold text-right">{viewedProduct.specifications?.voltage || ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase">Form Factor / Dia</span>
                        <span className="text-white font-semibold text-right">{viewedProduct.specifications?.diameter || ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase">Heated Length (mm)</span>
                        <span className="text-white font-semibold text-right">{viewedProduct.specifications?.heatedLength || ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                        <span className="text-zinc-500 uppercase">Peak Temperature</span>
                        <span className="text-orange-400 font-bold text-right">{viewedProduct.specifications?.maxTemperature || ''}</span>
                      </div>
                      {viewedProduct.specifications?.wavelength && (
                        <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                          <span className="text-zinc-500 uppercase">Wavelength Spectrum</span>
                          <span className="text-zinc-300 font-semibold text-right">{viewedProduct.specifications?.wavelength}</span>
                        </div>
                      )}
                      {viewedProduct.specifications?.material && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-zinc-500 uppercase">Sheathing Material</span>
                          <span className="text-zinc-300 font-semibold text-right">{viewedProduct.specifications?.material}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: High Typography info presentation panel & CTAs */}
                <div className="lg:col-span-7 space-y-8" id="detail-info-pane">
                  {/* Title heading */}
                  <div id="detail-title-block">
                    <div className="flex items-center gap-2 mb-2 text-orange-500 font-mono text-xs uppercase tracking-wider">
                      <Flame className="w-4 h-4" />
                      <span>Calibrated Industrial Emitter</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-display font-medium text-white tracking-tight leading-tight uppercase">
                      {viewedProduct.name}
                    </h1>
                    <p className="text-zinc-400 text-sm font-semibold tracking-wide uppercase mt-1">
                      {viewedProduct.subtitle}
                    </p>
                    <div className="h-0.5 w-16 bg-orange-500 mt-4" />
                  </div>

                  {/* All Product Information (Description) */}
                  <div className="space-y-3" id="detail-description-section">
                    <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold">
                      All Product Information & Core Design
                    </h3>
                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed text-justify">
                      {viewedProduct.longDescription}
                    </p>
                  </div>

                  {/* KEY USAGE & APPLICATIONS */}
                  <div className="space-y-3" id="detail-usage-section">
                    <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold">
                      Key Industrial Usages & System Applications (Usage)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="detail-usage-grid">
                      {(viewedProduct.applications || []).map((app, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 p-3 rounded bg-zinc-950 border border-zinc-900 group hover:border-zinc-800 transition-colors"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-950/50 border border-orange-500/20 text-orange-400 text-[10px] shrink-0 font-mono mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-zinc-300 text-xs sm:text-sm font-sans block">
                            {app}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DESIGN FEATURES OPTIONS */}
                  <div className="space-y-3" id="detail-advantages-section">
                    <h3 className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold">
                      Performance Characteristics & Advantages
                    </h3>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                      {(viewedProduct.features || []).map((feature, i) => (
                        <li key={i} className="flex gap-2.5 items-start">
                          <ShieldCheck className="w-5 h-5 text-[#007954] bg-[#007954]/10 border border-[#007954]/20 rounded p-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA BANNER: ADD TO INQUIRY */}
                  <div className="bg-[#0b0c10] border border-zinc-900/80 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6" id="detail-cta-action-panel">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Interested in this heating element?</h4>
                      <p className="text-xs text-zinc-500 mt-1">Add it to your quote cart. You can submit specs and quantities to Thane support instantly.</p>
                    </div>

                    <button
                      onClick={() => {
                        onAddProductToQuote(viewedProduct);
                      }}
                      className={`px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap ${
                        quoteCart.some(item => item.id === viewedProduct.id)
                          ? 'bg-zinc-800 border border-zinc-700/35 text-zinc-500 cursor-default shadow-none'
                          : 'bg-orange-600 text-white hover:bg-orange-500 hover:scale-[1.02] shadow-[0_0_12px_rgba(234,88,12,0.3)]'
                      }`}
                      id="detail-cta-cart-btn"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {quoteCart.some(item => item.id === viewedProduct.id)
                          ? 'In Inquiry List'
                          : 'Add to Quote'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RELATED PRODUCTS */}
              <div className="mt-16 pt-12 border-t border-zinc-900/60" id="related-products-section">
                <h3 className="text-lg font-display font-medium text-white mb-6 uppercase tracking-wider">
                  Related Heating Elements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(() => {
                    const matchedCat = ALL_PRODUCTS.filter(p => p.id !== viewedProduct.id && (p.category === viewedProduct.category || !viewedProduct.category));
                    const otherCats = ALL_PRODUCTS.filter(p => p.id !== viewedProduct.id && p.category !== viewedProduct.category);
                    const combined = [...matchedCat, ...otherCats].slice(0, 3);
                    return combined.map((rp) => {
                      return (
                        <a
                          key={rp.id}
                          href={`/products/${rp.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setViewedProduct(rp);
                            setSelectedProductDetails(rp);
                            if (onSelectProductId) {
                              onSelectProductId(rp.id);
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="bg-[#0b0c0f] border border-zinc-900 hover:border-orange-500/40 p-4 rounded-xl group transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="aspect-video w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900 flex items-center justify-center mb-4">
                              {rp.imageUrl ? (
                                <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" referrerPolicy="no-referrer" loading="lazy" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-zinc-850" />
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors uppercase tracking-wide truncate">
                              {rp.name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-1 truncate">
                              {rp.subtitle}
                            </p>
                          </div>
                          <div className="text-[10px] font-mono text-orange-500 mt-4 uppercase flex items-center gap-1">
                            <span>View Spec sheet</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </a>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* DYNAMIC SEO SECTION */}
              <section className="mt-16 pt-12 border-t border-zinc-900/60" id="single-product-seo-content">
                <h2 className="text-xl md:text-2xl font-display font-medium text-white mb-6 uppercase tracking-wide">
                  Comprehensive Technical Analysis: {viewedProduct.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-400 text-xs md:text-sm leading-relaxed text-left">
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">Product Overview & Design</h3>
                    <p className="text-justify">
                      The <strong>{viewedProduct.name}</strong> manufactured by Heat One Technology is engineered to meet the stringent demands of modern industrial environments. {viewedProduct.description} In addition, {viewedProduct.longDescription || ''} This system is constructed using high-quality components, providing exceptional heat transfer efficiency and stable long-term operations even under continuous load.
                    </p>
                    <p className="text-justify">
                      Key design features of this unit include:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-350 text-justify">
                      {(viewedProduct.features || []).map((feat, idx) => (
                        <li key={idx}><strong>{feat}:</strong> Carefully calibrated to improve thermal output and prevent operational element burn-out.</li>
                      ))}
                      {viewedProduct.specifications?.maxTemperature && (
                        <li><strong>Thermal Endurance:</strong> Capable of withstanding peak operating conditions up to {viewedProduct.specifications.maxTemperature}.</li>
                      )}
                      {viewedProduct.specifications?.material && (
                        <li><strong>Material Integrity:</strong> Built from premium sheathing and core elements like {viewedProduct.specifications.material}.</li>
                      )}
                    </ul>
                    <p className="text-justify">
                      By utilizing advanced insulation materials (such as magnesium oxide or high-grade ceramic tiles), Heat One Technology ensures that thermal energy is focused precisely where it is required, drastically reducing heat dissipation into the surrounding workspace.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">Industrial Applications & Deployments</h3>
                    <p className="text-justify">
                      The application spectrum of our industrial <strong>{viewedProduct.name}</strong> covers multiple sectors. It is extensively deployed in:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-zinc-350 text-justify">
                      {(viewedProduct.applications || []).map((app, idx) => (
                        <li key={idx}><strong>{app}:</strong> Optimized for fast curing, drying, or processing cycles under strict safety guidelines.</li>
                      ))}
                    </ul>
                    <p className="text-justify">
                      Whether utilized in plastic extrusion nozzle zones, paint curing ducts, chemical reactors, or high-pressure boilers, our elements offer consistent thermal distribution. This helps manufacturers maintain precise process temperatures, improving overall batch quality and lowering scrap rates.
                    </p>
                    
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold pt-2">Customization Options & Manufacturing Capabilities</h3>
                    <p className="text-justify">
                      At Heat One Technology, we understand that standard thermal elements do not fit every machine configuration. Therefore, we offer extensive customization. Clients can specify exact physical dimensions, terminal setups (screw terminals, flexible lead wires, or plug connectors), and performance options.
                    </p>
                    <p className="text-justify">
                      Our manufacturing facility in Thane, India, utilizes state-of-the-art winding machines, swaging systems, and diagnostic chambers to build elements calibrated to {viewedProduct.specifications?.power || 'custom outputs'} and operating on {viewedProduct.specifications?.voltage || 'various industrial phases'}. Each unit undergoes rigorous resistance and insulation tests to ensure maximum durability, reliability, and safety prior to shipment.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="catalog-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12" id="products-header">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4" />
              <span>Calibrated Emission spectrums</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-medium text-white uppercase tracking-tight">
              Product Specifications Catalog
            </h1>
            <div className="h-0.5 w-16 bg-orange-500 mt-3" />
          </div>

          {/* Catalog & Search container */}
          <div className="flex flex-col items-end gap-3 w-full md:w-80" id="products-controls-wrap">
            {/* Catalog Dropdown */}
            <div className="relative w-full text-right" ref={catalogDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCatalogDropdownOpen(!isCatalogDropdownOpen)}
                className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Catalog</span>
                <span className="text-[10px]">
                  {isCatalogDropdownOpen ? '▲' : '▼'}
                </span>
              </button>
              
              <AnimatePresence>
                {isCatalogDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 text-left"
                  >
                    <a
                      href="https://drive.google.com/file/d/1Prl5BShhjV2wQOBRXgkmdXEB7JmmWgxP/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCatalogDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-xs text-zinc-350 hover:text-white transition-all font-sans font-medium"
                    >
                      ⚡ IR Heater Catalog
                    </a>
                    <a
                      href="https://drive.google.com/file/d/1y6uut792pNHCHZpfcDIxvFh-1pZp-i_b/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsCatalogDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-zinc-900 text-xs text-zinc-350 hover:text-white transition-all font-sans font-medium"
                    >
                      🔥 Ceramic Band Heater Catalog
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search bar inside product view */}
            <div className="relative w-full" id="product-search-input-wrap">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search specifications, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* HORIZONTALLY SCROLLABLE PRODUCT IMAGE GALLERY / CAROUSEL */}
        <section className="mb-14 relative" id="brochure-horizontal-carousel">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <h2 className="text-sm font-mono text-zinc-300 font-semibold uppercase tracking-wider">
                Industrial Real-World Photo Portfolio (Scrollable)
              </h2>
            </div>
            
            {/* Smooth Scroll Navigation Arrows */}
            <div className="flex gap-2">
              <button 
                onClick={() => scrollSlider('left')}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-orange-500 active:bg-orange-500/10 transition-all cursor-pointer"
                title="Scroll Left"
                id="carousel-btn-left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollSlider('right')}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-orange-500 active:bg-orange-500/10 transition-all cursor-pointer"
                title="Scroll Right"
                id="carousel-btn-right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontally scrolling row */}
          <div 
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
            id="brochure-scroll-row"
          >
            {ALL_PRODUCTS.map((prod) => {
              const isSelected = selectedProductDetails?.id === prod.id || viewedProduct?.id === prod.id;
              
              return (
                <motion.a
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedProductDetails(prod);
                    setViewedProduct(prod);
                    if (onSelectProductId) {
                      onSelectProductId(prod.id);
                    }
                    if (isAdminLoggedIn) {
                      handleOpenEditWorkspace(prod);
                    }
                  }}
                  className={`min-w-[280px] md:min-w-[320px] max-w-[320px] bg-[#0b0c10] border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 snap-start flex-shrink-0 group block ${
                    isSelected 
                      ? 'border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/40' 
                      : 'border-zinc-900 hover:border-zinc-700 hover:shadow-lg'
                  }`}
                  id={`carousel-card-${prod.id}`}
                >
                  {/* Image container */}
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900">
                    {prod.imageUrl ? (
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-zinc-650 flex flex-col items-center gap-1">
                        <ImageIcon className="w-8 h-8 text-zinc-650" />
                        <span className="text-[10px] font-mono">Heat Element Real Image</span>
                      </div>
                    )}
                    
                    {/* Glowing temperature overlay tag */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-orange-500/30 px-2 py-0.5 rounded text-[9px] font-mono text-orange-400">
                      {prod.specifications?.maxTemperature || ''}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

                    {/* Quick focus badge */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-orange-950/40 border border-orange-500/30 backdrop-blur-md rounded-md px-2 py-1">
                      <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" />
                      <span className="text-[9px] text-orange-300 font-semibold font-mono tracking-wider">
                        PORTFOLIO
                      </span>
                    </div>

                    {/* Selected Neon Ring Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-orange-500 rounded-t-xl animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Text Description */}
                  <div className="p-4 flex flex-col justify-between h-[110px]">
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors uppercase tracking-wider line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-[10px] font-mono text-orange-300 mt-1 line-clamp-1">
                        {prod.subtitle}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 flex items-center gap-1 justify-end">
            <Info className="w-3 h-3 text-zinc-600" />
            <span>Horizontal scrollable showcase. Click any heater element to inspect full mechanical drawings, test specs, or add to inquiry.</span>
          </p>
        </section>

        {/* Categories Tab selector */}
        <div 
          className="flex overflow-x-auto md:flex-wrap items-center gap-2 mb-8 border-b border-zinc-900 pb-6 scrollbar-none snap-x" 
          id="product-categories-tab"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'all'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            All Speeds
          </button>
          <button
            onClick={() => setSelectedCategory('infrared')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'infrared'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            Infrared Lamps (Short wave)
          </button>
          <button
            onClick={() => setSelectedCategory('quartz-tubes')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'quartz-tubes'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            Quartz Glass Envelopes
          </button>
          <button
            onClick={() => setSelectedCategory('ceramic')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'ceramic'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            Ceramic Panel Blocks
          </button>
          <button
            onClick={() => setSelectedCategory('tubular-heaters')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'tubular-heaters'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            Industrial Tubular Heaters
          </button>
          <button
            onClick={() => setSelectedCategory('ovens')}
            className={`flex-shrink-0 snap-start px-4 py-2 font-mono text-[10px] md:text-xs uppercase tracking-wider rounded border transition-all ${
              selectedCategory === 'ovens'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-800/80 hover:text-white hover:border-zinc-700'
            }`}
          >
            Conveyor & Batch Ovens
          </button>
        </div>

        {/* Two columns layout: products grids on left, extreme detailed specification panel on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="products-interactive-dashboard">
          
          {/* LEFT: Product Item Cards */}
          <div className="lg:col-span-7 space-y-4" id="products-listings">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-[#0b0c0f] border border-zinc-900 rounded-xl" id="products-empty-state">
                <Info className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">No thermal products match the active specifications filters.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProductDetails?.id === product.id || viewedProduct?.id === product.id;
                const isInCart = quoteCart.some(item => item.id === product.id);

                return (
                  <motion.a
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedProductDetails(product);
                      setViewedProduct(product);
                      if (onSelectProductId) {
                        onSelectProductId(product.id);
                      }
                      if (isAdminLoggedIn) {
                        handleOpenEditWorkspace(product);
                      }
                    }}
                    className={`p-5 rounded-xl border cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 relative overflow-hidden block ${
                      isSelected
                        ? 'bg-[#0f1013] border-orange-500/70 shadow-[0_0_16px_rgba(234,88,12,0.1)]'
                        : 'bg-[#0b0c0f] border-zinc-900 hover:border-zinc-800/80 hover:bg-[#0d0e12]'
                    }`}
                  >
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
                      {/* Product Thumbnail */}
                      <div className="w-24 h-20 bg-zinc-950 rounded-lg border border-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-zinc-750" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0" id={`card-text-wrap-${product.id}`}>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                            {product.category?.replace('-', ' ') || ''}
                          </span>
                          {product.specifications?.wavelength && (
                            <span className="text-[10px] font-mono text-orange-400">
                              {product.specifications?.wavelength}
                            </span>
                          )}
                          {/* New API Tag Indicator */}
                          {product.subtitle === "LIVE FROM MONGODB" && (
                            <span className="text-[10px] font-mono text-green-400 border border-green-500/30 bg-green-900/20 px-2 py-0.5 rounded">
                              API SYNCED
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-base md:text-lg font-semibold text-white tracking-wide truncate">{product.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{product.description}</p>
                        
                        {/* Compact technical details directly on card */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-zinc-900/60 font-mono text-[10px] text-zinc-500">
                          <div>POWER: <span className="text-zinc-300 font-semibold">{product.specifications?.power || ''}</span></div>
                          <span>•</span>
                          <div>VOLT: <span className="text-zinc-300 font-semibold">{product.specifications?.voltage || ''}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions on card */}
                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 shrink-0 select-none pb-1 md:pb-0" id={`card-actions-${product.id}`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onAddProductToQuote(product);
                        }}
                        className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all w-full md:w-auto text-center justify-center cursor-pointer ${
                          isInCart
                            ? 'bg-zinc-800 border border-zinc-700/40 text-neutral-400 cursor-default'
                            : 'bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.2)]'
                        }`}
                        id={`add-quote-btn-${product.id}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{isInCart ? 'In Inquiry' : 'Add To Quote'}</span>
                      </button>
                      <span className="text-[9px] font-mono text-zinc-500 hidden md:block">Click to view details</span>
                    </div>

                  </motion.a>
                );
              })
            )}
          </div>

          {/* RIGHT: Technical Engineering Drawer details panel */}
          <div className="lg:col-span-5" id="products-specs-details">
            <AnimatePresence mode="wait">
              {selectedProductDetails && (
                <motion.div
                  key={selectedProductDetails.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#0b0c0f] border border-orange-500/10 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[580px]"
                  id="specs-card-wrap"
                >
                  {/* Glowing header accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

                  <div>
                    {/* Header Spec Info */}
                    <div className="border-b border-zinc-900 pb-5" id="specs-header">
                      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Drawing & Config Sheets</span>
                        </div>
                        {isAdminLoggedIn && (
                          <button
                            onClick={() => handleOpenEditWorkspace(selectedProductDetails)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-950/20 hover:bg-orange-650 hover:text-white border border-orange-500/35 hover:border-orange-500 rounded text-[10px] font-mono font-bold text-orange-400 transition-all cursor-pointer select-none"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>EDIT ELEMENT</span>
                          </button>
                        )}
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-display font-medium text-white">{selectedProductDetails.name}</h2>
                      <h4 className="text-xs font-semibold text-orange-400 mt-1 uppercase tracking-wider">{selectedProductDetails.subtitle}</h4>
                    </div>

                    {/* Detailed spec description paragraphs */}
                    <div className="py-4 text-xs md:text-sm text-zinc-300 leading-relaxed space-y-3" id="specs-description">
                      <p className="text-justify">{selectedProductDetails.longDescription}</p>
                    </div>

                    {/* Full JetBrains Mono Specs Tables block */}
                    <div className="mt-4" id="specs-table">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Calibration specifications parameters</span>
                      <div className="bg-[#111215] border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs mt-1.5">
                        <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                          <span className="col-span-5 text-zinc-500 uppercase">Power Range</span>
                          <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.power || ''}</span>
                        </div>
                        <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                          <span className="col-span-5 text-zinc-500 uppercase">Input Voltage</span>
                          <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.voltage || ''}</span>
                        </div>
                        <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                          <span className="col-span-5 text-zinc-500 uppercase">Diameter</span>
                          <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.diameter || ''}</span>
                        </div>
                        <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                          <span className="col-span-5 text-zinc-500 uppercase">Heated Length</span>
                          <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.heatedLength || ''}</span>
                        </div>
                        <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                          <span className="col-span-5 text-zinc-500 uppercase">Peak Temperature</span>
                          <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.maxTemperature || ''}</span>
                        </div>
                        {selectedProductDetails.specifications?.wavelength && (
                          <div className="grid grid-cols-12 border-b border-zinc-900/80 px-4 py-2.5">
                            <span className="col-span-5 text-zinc-500 uppercase">Wavelength</span>
                            <span className="col-span-7 text-zinc-200 text-right font-medium">{selectedProductDetails.specifications?.wavelength}</span>
                          </div>
                        )}
                        {selectedProductDetails.specifications?.material && (
                          <div className="grid grid-cols-12 px-4 py-2.5">
                            <span className="col-span-5 text-zinc-500 uppercase">Material Body</span>
                            <span className="col-span-7 text-zinc-300 text-right font-medium">{selectedProductDetails.specifications?.material}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features list bullet layout */}
                    <div className="mt-5" id="specs-features">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Advantage checklist features</span>
                      <ul className="mt-2 space-y-2 text-xs text-zinc-400">
                        {(selectedProductDetails.features || []).map((feature, i) => (
                          <li key={i} className="flex gap-2.5 items-start">
                            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Add to current quota button inside panel */}
                  <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between" id="specs-actions">
                    <button
                      onClick={() => onAddProductToQuote(selectedProductDetails)}
                      disabled={quoteCart.some(item => item.id === selectedProductDetails.id)}
                      className={`w-full py-3 rounded font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        quoteCart.some(item => item.id === selectedProductDetails.id)
                          ? 'bg-zinc-800 border border-zinc-700/30 text-zinc-500'
                          : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_12px_rgba(234,88,12,0.35)]'
                      }`}
                      id="specs-atc-btn"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>
                        {quoteCart.some(item => item.id === selectedProductDetails.id)
                          ? 'Product already listed in Inquiry'
                          : 'Add Element To Inquiry List'}
                      </span>
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* -- SHIFTED HOME PAGE CONTENT INTS PRODUCTS VIEW -- */}

        {/* 1. THREE CORE CATEGORIES SECTION */}
        <div className="mt-20 pt-16 border-t border-zinc-900" id="products-categories-shifted">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2 uppercase tracking-wide">
              ENGINEERED CORES CATEGORIES
            </h2>
            <div className="h-0.5 w-12 bg-orange-500" />
            <p className="text-xs md:text-sm text-zinc-400 mt-4 max-w-xl">
              Our signature heating lines deliver exact infrared emission or physical heat signatures calibrated for diverse industrial applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="categories-grid-shifted">
            {/* Card 1 */}
            <div className="bg-[#0b0c0f] border border-zinc-900 p-6 md:p-8 rounded-xl flex flex-col justify-between group hover:border-orange-500/40 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg w-fit mb-5">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Rapid Infrared Halogen
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Shortwave lamps engineered with coiled tungsten filament providing peak heat emission in less than 2 seconds. Excellent for fast drying webs.
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory('infrared')}
                className="text-xs font-mono font-medium tracking-wide text-orange-500 uppercase flex items-center gap-1.5 hover:text-orange-400 group-hover:translate-x-1 transition-all cursor-pointer text-left"
              >
                Filter infrared specs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0b0c0f] border border-zinc-900 p-6 md:p-8 rounded-xl flex flex-col justify-between group hover:border-orange-500/40 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg w-fit mb-5">
                  <Cpu className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Silica Glass Radiant Tubes
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Medium-wave elements safely housed in clear, translucent, or frosted high-purity quartz envelopes to counter extreme thermal expansion stress.
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory('quartz-tubes')}
                className="text-xs font-mono font-medium tracking-wide text-orange-500 uppercase flex items-center gap-1.5 hover:text-orange-400 group-hover:translate-x-1 transition-all cursor-pointer text-left"
              >
                Filter quartz specs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0b0c0f] border border-zinc-900 p-6 md:p-8 rounded-xl flex flex-col justify-between group hover:border-orange-500/40 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg w-fit mb-5">
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Ceramic Panel Warmers
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Glazed long-wave flat elements. Shielded from direct splash, moisture, and chemical vapor erosion for static heating and deep vacuum molds.
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory('ceramic')}
                className="text-xs font-mono font-medium tracking-wide text-orange-500 uppercase flex items-center gap-1.5 hover:text-orange-400 group-hover:translate-x-1 transition-all cursor-pointer text-left"
              >
                Filter ceramic specs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-[#0b0c0f] border border-zinc-900 p-6 md:p-8 rounded-xl flex flex-col justify-between group hover:border-orange-500/40 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg w-fit mb-5">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  Industrial Tubular Heaters
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Heavy-duty metal-sheathed elements with MgO insulation. Optimized for direct fluid immersion boilers, helically finned convection ovens, and hot runner tips.
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory('tubular-heaters')}
                className="text-xs font-mono font-medium tracking-wide text-orange-500 uppercase flex items-center gap-1.5 hover:text-orange-400 group-hover:translate-x-1 transition-all cursor-pointer text-left"
              >
                Filter tubular specs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC DUAL CALCULATOR SECTION */}
        <section className="bg-[#08090b] border border-zinc-900 rounded-xl py-12 px-6 md:px-10 mt-20 relative overflow-hidden animate-fadeIn" id="thermal-calculator-section-shifted">
          {/* Absolute design indicator dots */}
          <div className="absolute top-4 right-4 text-[9px] text-zinc-700 font-mono select-none pointer-events-none">
            SYSTEMS ENG // THERM CALC V.33
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Informational intro text */}
            <div className="lg:col-span-4" id="calculator-intro-col">
              <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-wider mb-3">
                <Calculator className="w-4 h-4" />
                <span>Smart Engineering Helper</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-wide uppercase" id="calculator-title">
                ESTIMATE REQUIRED THERMAL POWER
              </h2>
              <div className="h-0.5 w-16 bg-orange-500 mt-4 mb-6 shadow-[0_0_8px_#ea580c]" />

              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6 text-justify">
                Are you planning a thermal kiln, curing oven chamber, or packaging drying tunnel? This instant estimator calculates the approximate required electric heating power load in Kilowatts (<span className="text-orange-400">kW</span>) based on your custom chamber dimensions, target heat elevation, and air draft losses.
              </p>

              <div className="space-y-4 text-xs bg-zinc-900/40 border border-zinc-800/20 p-4 rounded-lg" id="calculator-tips">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-350">
                    <strong>Standard losses factored:</strong> Calculations assume standard insulation levels (50mm ceramic wool) plus convection air draft velocities.
                  </span>
                </div>
                <div className="flex gap-3">
                  <Gauge className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-zinc-300">
                    <strong>Selection recommendation:</strong> High heat rises or short execution times trigger rapid short-wave quartz halogen elements.
                  </span>
                </div>
              </div>
            </div>

            {/* Actual Calculator form and results layout */}
            <div className="lg:col-span-8 bg-[#0b0c0f] border border-orange-500/15 p-6 md:p-8 rounded-xl relative shadow-2xl" id="calculator-interface-col">
              <form onSubmit={handleCalculatePower} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Chamber Length (meters)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    max="15"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Chamber Width (meters)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    max="8"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Chamber Height (meters)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.1"
                    max="8"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Target Temp Rise (°C)</label>
                  <input 
                    type="number" 
                    min="10"
                    max="600"
                    value={tempChange}
                    onChange={(e) => setTempChange(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Target Heat Time (minutes)</label>
                  <input 
                    type="number" 
                    min="1"
                    max="120"
                    value={timeMin}
                    onChange={(e) => setTimeMin(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wide">Draft Air-Flow Velocity (m/s)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0.0"
                    max="5"
                    value={gasVelocity}
                    onChange={(e) => setGasVelocity(e.target.value)}
                    className="bg-zinc-900 text-white text-sm px-3.5 py-2.5 rounded-md border border-zinc-800 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="col-span-1 sm:col-span-2 mt-4 px-5 py-3 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-all shadow-[0_0_12px_rgba(234,88,12,0.3)] text-sm cursor-pointer border border-orange-500/10"
                >
                  Perform Thermal Estimation Simulation
                </button>
              </form>

              {/* Results Display */}
              {calculationResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 border border-orange-500/20 bg-orange-950/10 rounded-lg flex flex-col md:flex-row items-stretch justify-between gap-6"
                  id="calculator-results"
                >
                  <div className="flex flex-col justify-between" id="calc-metrics">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Estimated Total Heat Power Load</span>
                      <div className="text-3xl md:text-4xl font-display font-extrabold text-orange-500 mt-1">
                        {calculationResult.powerNeeded} <span className="text-lg font-mono">kW</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Recommended Element Setup</span>
                      <span className="text-xs font-semibold text-zinc-200 mt-1 block">
                        {calculationResult.recommendedElementsCount}x Elements of {calculationResult.recommendedProduct}
                      </span>
                    </div>
                  </div>

                  <div className="md:w-3/5 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between" id="calc-recommendations">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Technical Context Specification</span>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-1">{calculationResult.description}</p>
                    </div>

                    <button
                      onClick={addCalcToInquiry}
                      disabled={addedToQuote}
                      className={`mt-4 px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all w-full text-center ${
                        addedToQuote
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-default'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500/30 text-center cursor-pointer'
                      }`}
                    >
                      {addedToQuote ? 'Estimates Connected To Inquiry' : 'Add Rec Setup to Inquiry Quote'}
                    </button>
                  </div>
                </motion.div>
              )}

            </div>

          </div>
        </section>

        {/* 3. PERFORMANCE CERTIFICATIONS */}
        <section className="mt-20 pt-10 border-t border-zinc-900/60" id="home-certifications-shifted">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center" id="certifications-grid">
            
            <div className="p-6 bg-[#0b0c0f] border border-zinc-900 rounded-lg flex flex-col items-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-orange-500">100%</h4>
              <p className="text-xs md:text-sm font-semibold text-white uppercase mt-1 tracking-wider">Thermal Checked</p>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">Prior to delivery, dual circuit resistance checks run nonstop for absolute safety confirmation.</p>
            </div>

            <div className="p-6 bg-[#0b0c0f] border border-zinc-900 rounded-lg flex flex-col items-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-orange-500">2 Weeks</h4>
              <p className="text-xs md:text-sm font-semibold text-white uppercase mt-1 tracking-wider">Fast custom design</p>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">Custom lengths blown and sealed perfectly within prompt project delivery deadlines.</p>
            </div>

            <div className="p-6 bg-[#0b0c0f] border border-zinc-900 rounded-lg flex flex-col items-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-orange-500">&lt; 0.1%</h4>
              <p className="text-xs md:text-sm font-semibold text-white uppercase mt-1 tracking-wider">Expansion Stress</p>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">High purity silica retains flawless structure during temperature changes.</p>
            </div>

            <div className="p-6 bg-[#0b0c0f] border border-zinc-900 rounded-lg flex flex-col items-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-orange-500">T/T, L/C</h4>
              <p className="text-xs md:text-sm font-semibold text-white uppercase mt-1 tracking-wider">Structured Fin.</p>
              <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">Flexible business transactional invoice terms matching small and corporate scales.</p>
            </div>

          </div>
        </section>
      </motion.div>
    )}
  </AnimatePresence>

        {/* Premium SEO Content Section */}
        <section className="mt-20 pt-16 border-t border-zinc-900/60 max-w-7xl mx-auto" id="products-seo-content">
          <h2 className="text-xl md:text-2xl font-display font-medium text-white mb-6 uppercase tracking-wide">
            Industrial Heating Solutions by Heat One Technology
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-400 text-xs md:text-sm leading-relaxed">
            <div className="space-y-4 text-justify">
              <p>
                Heat One Technology manufactures high-quality industrial heating
                elements for a wide range of applications. Our Quartz Tube Heaters
                provide fast and efficient infrared heating for industrial processes,
                drying systems, and heating chambers. These quartz elements are
                designed to endure rapid thermal cycles, making them highly reliable
                for continuous conveyor ovens, batch furnaces, and automotive paint booths.
              </p>

              <p>
                Our Ceramic Band Heaters are widely used in plastic processing
                machinery, extrusion equipment, and industrial heating systems.
                They offer excellent heat retention and energy efficiency by minimizing
                rearward heat loss. Built with high-purity ceramic bricks and computer-wound
                Ni-Cr resistance coils, these band heaters provide reliable operations up
                to 700°C, lowering operational electricity consumption significantly.
              </p>

              <p>
                Additionally, we specialize in high-density Cartridge Heaters compacted
                with high-grade magnesium oxide insulation for maximum heat dispersion in
                compact spaces. These cartridge elements are precision-swaged to fit tightly
                into metal dies, molds, and hot runner tips, ensuring excellent longevity.
              </p>
            </div>

            <div className="space-y-4 text-justify">
              <p>
                We also manufacture Infrared Heaters, Tubular Heaters, Cartridge
                Heaters, Bobbin Heaters, and custom industrial heating solutions
                designed for demanding manufacturing environments. Our multi-element immersion
                heaters are engineered for boiling process oils, chemical pools, and large water
                tanks. Fitted with robust threaded brass adapters and U-tube bundles, they ensure
                leak-free, prolonged operations in high-pressure fluid reservoirs.
              </p>

              <p>
                Our Bobbin Heaters are built for quick replacements inside protective tubes without
                depleting tanks, making them an excellent choice for asphalt storage and paraffin heating.
                We also supply finned air heaters that increase convective surface area by 2.5 times,
                perfect for forced air drying cabinets, curing ducts, and industrial food dehydration ovens.
              </p>

              <p>
                Heat One Technology serves customers across India with reliable
                heating products, technical support, and customized heating solutions
                for industrial applications. Based in Thane, Maharashtra, we are committed
                to delivering standard and custom-calibrated heating elements matching precise
                voltages, wattages, and dimensional shapes for optimal thermal transfer.
              </p>
            </div>
          </div>
        </section>

        {/* Floating Active Quote Inquiry panel if items are in cart */}
        <AnimatePresence>
          {quoteCart.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[420px] bg-zinc-950 border border-orange-500/25 p-5 rounded-xl shadow-2xl z-40"
              id="sticky-quote-cart-drawer"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-600 text-[10px] text-white flex items-center justify-center font-bold font-mono">
                      {quoteCart.length}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Active Inquiry List</h4>
                    <span className="text-[10px] text-zinc-500">Heater elements ready to quote</span>
                  </div>
                </div>
                
                <button
                  onClick={onProceedToInquiry}
                  className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                >
                  Proceed <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable products list inside quoting bar */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin" id="quote-cart-scroll">
                {quoteCart.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800/60 px-3 py-2 rounded text-xs"
                    id={`quote-cart-item-${item.id}`}
                  >
                    <div className="truncate pr-4">
                      <span className="text-white font-medium block truncate">{item.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 truncate">{item.subtitle}</span>
                    </div>
                    <button
                      onClick={() => onRemoveProductFromQuote(item.id)}
                      className="p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded transition-colors shrink-0 cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex gap-2">
                <button
                  onClick={onProceedToInquiry}
                  className="w-full text-center py-2.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_8px_rgba(234,88,12,0.3)] cursor-pointer"
                  id="drawer-proceed-btn"
                >
                  Configure Quote Details Form & Submit
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Customizer Side-Drawer Workspace Panel Overlay */}
        {isEditPanelOpen && editingProductTarget && onUpdateProductDetail && (
          <ProductEditPanel
            product={editingProductTarget}
            isOpen={isEditPanelOpen}
            onClose={() => {
              setIsEditPanelOpen(false);
              setEditingProductTarget(null);
            }}
            onSave={(updated) => {
              onUpdateProductDetail(editingProductTarget.id, updated);
            }}
          />
        )}

        {/* Full-screen Lightbox Image Modal */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/95 z-55 flex flex-col items-center justify-center p-4 backdrop-blur-sm select-none"
              id="product-image-lightbox"
              onClick={() => setLightboxImage(null)}
            >
              {/* Outer frame */}
              <div 
                className="relative max-w-5xl max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent close on clicking image
              >
                <img
                  src={lightboxImage}
                  alt="High Resolution Showcase"
                  referrerPolicy="no-referrer"
                  className="w-[90vw] md:w-[75vw] max-w-3xl h-[45vh] sm:h-[55vh] md:h-[65vh] object-cover rounded-xl border border-zinc-800 shadow-2xl select-text pointer-events-auto"
                />

                {/* Close Button Top-Right on desktop and screen */}
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="absolute -top-12 right-0 sm:-right-4 p-2 bg-zinc-900 hover:bg-orange-600 hover:text-white text-zinc-400 rounded-full transition-colors cursor-pointer border border-zinc-800"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Gallery Navigation Controls */}
                {viewedProduct && (
                  (() => {
                    const allImages: string[] = [];
                    if (viewedProduct.imageUrl) {
                      allImages.push(viewedProduct.imageUrl);
                    }
                    if (viewedProduct.additionalImages && viewedProduct.additionalImages.length > 0) {
                      allImages.push(...viewedProduct.additionalImages);
                    }

                    if (allImages.length <= 1) return null;

                    const currentIndex = allImages.indexOf(lightboxImage);

                    const handlePrev = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
                      setLightboxImage(allImages[prevIdx]);
                    };

                    const handleNext = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      const nextIdx = (currentIndex + 1) % allImages.length;
                      setLightboxImage(allImages[nextIdx]);
                    };

                    return (
                      <>
                        {/* Prev Button */}
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-orange-600 hover:text-white text-zinc-400 rounded-full border border-zinc-800/80 transition-all cursor-pointer backdrop-blur"
                          title="Previous (Left Arrow)"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={handleNext}
                          className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-orange-600 hover:text-white text-zinc-400 rounded-full border border-zinc-800/80 transition-all cursor-pointer backdrop-blur"
                          title="Next (Right Arrow)"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Indicator Dots */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-zinc-900 pointer-events-auto">
                          {allImages.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setLightboxImage(allImages[dotIdx])}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                dotIdx === currentIndex 
                                  ? 'bg-orange-500 scale-125' 
                                  : 'bg-zinc-700 hover:bg-zinc-500'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    );
                  })()
                )}
              </div>

              {/* Status title below display */}
              {viewedProduct && (
                <div className="mt-8 text-center bg-black/40 px-4 py-2 rounded-lg border border-zinc-900/60 backdrop-blur-sm max-w-sm">
                  <h4 className="text-xs font-semibold text-zinc-350 font-mono tracking-wide uppercase">{viewedProduct.name}</h4>
                  <p className="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">Use ESC Key, arrows, or Click backdrop to exit</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
    </>
  );
}