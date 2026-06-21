import React, { useState, useEffect, useRef } from 'react';
import { TabType, Product } from './types';
import { PRODUCTS } from './data';
import { getApiUrl } from './utils/api';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ProductsView from './components/ProductsView';
import ContactView from './components/ContactView';
import AdminView from './components/AdminView';
import AdminLogin from './components/AdminLogin';
import SearchModal from './components/SearchModal';
import CallModal from './components/CallModal';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Land on HomeView by default, which is the rebranded Company Profile details
  const getInitialTab = (): TabType => {
    const path = window.location.pathname.toLowerCase();

    if (path.startsWith('/products')) return 'products';
    if (path === '/contact') return 'contact';
    if (path === '/admin') return 'admin';

    return 'home';
  };

  const getInitialProductId = (): string | null => {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/products/')) {
      const parts = path.split('/');
      if (parts.length > 2 && parts[2]) {
        const slug = parts[2];
        const found = PRODUCTS.find(p => p.slug === slug);
        return found ? found.id : null;
      }
    }
    return null;
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(getInitialProductId);

  // Dynamic products list from MongoDB
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedProductId(null);
  };

  // Scroll to top of the page on tab/page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Synchronize browser URL pathname with activeTab and selectedProductId
  useEffect(() => {
    if (loading) return;

    const routes: Record<TabType, string> = {
      home: '/',
      products: '/products',
      contact: '/contact',
      admin: '/admin'
    };

    let targetPath = routes[activeTab] || '/';
    if (activeTab === 'products' && selectedProductId) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        targetPath = `/products/${selectedProduct.slug}`;
      }
    }

    const currentPath = window.location.pathname.toLowerCase();

    // If we're on the products tab, and the URL has an unrecognized slug, 
    // keep the current URL so we can show the "Product Not Found" screen.
    const isInvalidSlug = currentPath.startsWith('/products/') &&
      currentPath !== '/products' &&
      currentPath !== '/products/' &&
      !products.some(p => p.slug === currentPath.replace('/products/', ''));

    if (activeTab === 'products' && isInvalidSlug && !selectedProductId) {
      return;
    }

    if (currentPath !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [activeTab, selectedProductId, products, loading]);

  // Handle browser back/forward buttons (popstate navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/contact') {
        setActiveTab('contact');
        setSelectedProductId(null);
      } else if (path === '/admin') {
        setActiveTab('admin');
        setSelectedProductId(null);
      } else if (path.startsWith('/products')) {
        setActiveTab('products');
        const parts = path.split('/');
        if (parts.length > 2 && parts[2]) {
          const slug = parts[2];
          const found = products.find(p => p.slug === slug);
          if (found) {
            setSelectedProductId(found.id);
          } else {
            setSelectedProductId(null);
          }
        } else {
          setSelectedProductId(null);
        }
      } else {
        setActiveTab('home');
        setSelectedProductId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(() => {
    try {
      const stored = localStorage.getItem('heat_one_user');
      if (stored) return JSON.parse(stored);
      const session = sessionStorage.getItem('heat_one_user');
      if (session) return JSON.parse(session);
    } catch (e) {
      console.error("Error loading user session:", e);
    }
    return null;
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleLoginSuccess = (user: { email: string }, rememberMe: boolean) => {
    setCurrentUser(user);
    try {
      const userStr = JSON.stringify(user);
      if (rememberMe) {
        localStorage.setItem('heat_one_user', userStr);
      } else {
        sessionStorage.setItem('heat_one_user', userStr);
      }
    } catch (e) {
      console.error("Error saving user session:", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('heat_one_user');
      sessionStorage.removeItem('heat_one_user');
    } catch (e) {
      console.error("Error clearing user session:", e);
    }
  };
  
  // Modals visibility toggles
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  // Inquiry Shopping Cart holds listings
  const [quoteCart, setQuoteCart] = useState<Product[]>([]);

  // Chamber estimate calculated requirements
  const [customCalculations, setCustomCalculations] = useState<string | null>(null);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('heat_one_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminUsername, setAdminUsername] = useState(() => {
    try {
      return sessionStorage.getItem('heat_one_admin_username') || '';
    } catch {
      return '';
    }
  });

  // Steel White / Industrial Dark theme toggle
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('heat_one_theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('heat_one_theme', theme);
    } catch (e) {
      console.error(e);
    }
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);



  // Browser storage/connection limits tracker
  const [storageError, setStorageError] = useState<string | null>(null);

  // Admin notifications states
  const [inquiriesCount, setInquiriesCount] = useState<number>(0);
  const lastInquiriesCountRef = useRef<number | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => {
      setToast((prev: { message: string; visible: boolean }) => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Dynamic backend polling for new inquiries
  useEffect(() => {
    // Check local storage count initially
    try {
      const stored = localStorage.getItem('heat_one_inquiries');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) {
          setInquiriesCount(arr.length);
          if (lastInquiriesCountRef.current === null) {
            lastInquiriesCountRef.current = arr.length;
          }
        }
      }
    } catch (e) {}

    if (!isAdminLoggedIn) return;

    const checkNewInquiries = async () => {
      try {
        const res = await fetch(getApiUrl("/api/inquiries"));
        const data = await res.json();
        if (data.inquiries && Array.isArray(data.inquiries)) {
          const newCount = data.inquiries.length;
          setInquiriesCount(newCount);

          // Prompt permission
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }

          const lastCount = lastInquiriesCountRef.current;
          if (lastCount !== null && newCount > lastCount) {
            const diffCount = newCount - lastCount;
            const newLeads = data.inquiries.slice(0, diffCount);

            newLeads.forEach((inq: any) => {
              // Browser notifications
              if (Notification.permission === 'granted') {
                new Notification("New Inquiry Received", {
                  body: `Client: ${inq.name}\nContact: ${inq.phone}`,
                  tag: inq.id
                });
              }
              // Toast notification
              showToast(`New inquiry received from ${inq.name} (${inq.phone})`);
            });
          }
          lastInquiriesCountRef.current = newCount;
          
          // Keep local storage synced for consistency
          localStorage.setItem('heat_one_inquiries', JSON.stringify(data.inquiries));
        }
      } catch (e) {
        console.error("Error checking inquiries:", e);
      }
    };

    // Run initial fetch
    checkNewInquiries();

    // Poll every 10 seconds
    const interval = setInterval(checkNewInquiries, 10000);
    return () => clearInterval(interval);
  }, [isAdminLoggedIn]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(getApiUrl("/api/products"));
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        
        // Reconcile dynamic path with database loaded products synchronously inside the fetch handler
        const path = window.location.pathname.toLowerCase();
        if (path.startsWith('/products/')) {
          const parts = path.split('/');
          if (parts.length > 2 && parts[2]) {
            const slug = parts[2];
            const found = data.products.find((p: any) => p.slug === slug);
            if (found) {
              setSelectedProductId(found.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching products from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reconcile dynamic path with database loaded products (fallback/updates check)
  useEffect(() => {
    if (!loading && products.length > 0) {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/products/')) {
        const parts = path.split('/');
        if (parts.length > 2 && parts[2]) {
          const slug = parts[2];
          const found = products.find(p => p.slug === slug);
          if (found && selectedProductId !== found.id) {
            setSelectedProductId(found.id);
          }
        }
      }
    }
  }, [loading, products, selectedProductId]);

  const handleAddProduct = async (newProd: Product) => {
    try {
      const res = await fetch(getApiUrl("/api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        await fetchProducts();
        setStorageError(null);
      } else {
        setStorageError("Failed to save product to database.");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setStorageError("Database connection error.");
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      const res = await fetch(getApiUrl(`/api/products/${updatedProd.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProd),
      });
      if (res.ok) {
        await fetchProducts();
        setStorageError(null);
      } else {
        setStorageError("Failed to update product in database.");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setStorageError("Database connection error.");
    }
  };

  const handleUpdateProductDetail = (productId: string, updatedProduct: Product) => {
    handleUpdateProduct(updatedProduct);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/products/${productId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchProducts();
        setStorageError(null);
      } else {
        setStorageError("Failed to delete product from database.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setStorageError("Database connection error.");
    }
  };

  const handleResetProducts = async () => {
    try {
      const res = await fetch(getApiUrl("/api/products"), {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchProducts();
        setStorageError(null);
      } else {
        setStorageError("Failed to reset database catalog.");
      }
    } catch (err) {
      console.error("Error resetting catalog:", err);
      setStorageError("Database connection error.");
    }
  };

  const handleReorderProducts = async (productIds: string[]) => {
    try {
      const res = await fetch(getApiUrl("/api/products/reorder"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: productIds }),
      });
      if (res.ok) {
        await fetchProducts();
        setStorageError(null);
      } else {
        setStorageError("Failed to save new product arrangement.");
      }
    } catch (err) {
      console.error("Error reordering products:", err);
      setStorageError("Database connection error.");
    }
  };


  // Cart operations
  const handleAddProductToQuote = (product: Product) => {
    if (!quoteCart.some((item: Product) => item.id === product.id)) {
      setQuoteCart([...quoteCart, product]);
    }
  };

  const handleRemoveProductFromQuote = (productId: string) => {
    setQuoteCart(quoteCart.filter((item: Product) => item.id !== productId));
  };

  const handleClearQuoteCart = () => {
    setQuoteCart([]);
  };

  const handleAddCustomCalculationToQuote = (powerkW: number, recommendedElement: string, details: string) => {
    setCustomCalculations(details);
    // Switch to inform user
    setActiveTab('contact');
  };

  const handleClearCustomCalculations = () => {
    setCustomCalculations(null);
  };

  const handleProceedToInquiry = () => {
    setActiveTab('contact');
    // After the Contact tab renders, scroll smoothly to the form column
    setTimeout(() => {
      const formCol = document.getElementById('contact-form-col');
      if (formCol) {
        formCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleClearStorageError = () => {
    setStorageError(null);
  };

  // Switch rendered tabs body
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            theme={theme}
            products={products}
            onNavigateToProduct={(productId) => {
              setSelectedProductId(productId);
              setActiveTab('products');
            }}
          />
        );
      case 'products':
        return (
          <ProductsView
            onAddProductToQuote={handleAddProductToQuote}
            quoteCart={quoteCart}
            onRemoveProductFromQuote={handleRemoveProductFromQuote}
            onProceedToInquiry={handleProceedToInquiry}
            onAddCustomCalculationToQuote={handleAddCustomCalculationToQuote}
            activeProductId={selectedProductId}
            onSelectProductId={setSelectedProductId}
            products={products}
            loading={loading}
            isAdminLoggedIn={isAdminLoggedIn}
            onUpdateProductDetail={handleUpdateProductDetail}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'contact':
        return (
          <ContactView
            quoteCart={quoteCart}
            onClearQuoteCart={handleClearQuoteCart}
            customCalculations={customCalculations}
            onClearCustomCalculations={handleClearCustomCalculations}
            currentUser={currentUser}
          />
        );
      case 'admin':
        if (!isAdminLoggedIn) {
          return (
            <AdminLogin
              onLoginSuccess={(uname) => {
                setIsAdminLoggedIn(true);
                setAdminUsername(uname);
                try {
                  sessionStorage.setItem('heat_one_admin_auth', 'true');
                  sessionStorage.setItem('heat_one_admin_username', uname);
                } catch (e) {
                  console.error(e);
                }
              }}
              onCancel={() => setActiveTab('home')}
            />
          );
        }
        return (
          <AdminView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetProducts={handleResetProducts}
            onReorderProducts={handleReorderProducts}
            onUpdateProductDetail={handleUpdateProductDetail}
            storageError={storageError}
            onClearStorageError={handleClearStorageError}
            adminUsername={adminUsername}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setAdminUsername('');
              try {
                sessionStorage.removeItem('heat_one_admin_auth');
                sessionStorage.removeItem('heat_one_admin_username');
              } catch (e) {
                console.error(e);
              }
              setActiveTab('home');
            }}
          />
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-[#060608] font-sans antialiased selection:bg-orange-500 selection:text-white pb-0 ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* Dynamic Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCall={() => setIsCallOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        quoteCount={quoteCart.length}
        onOpenQuoteCart={handleProceedToInquiry}
        isAdminLoggedIn={isAdminLoggedIn}
        inquiriesCount={inquiriesCount}
        user={currentUser}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />

      {/* Primary tab views container */}
      <main className="flex-grow">
        {renderActiveTabContent()}
      </main>

      {/* Unified footer */}
      <Footer 
        setActiveTab={handleTabChange} 
        onOpenCall={() => setIsCallOpen(true)} 
      />

      {/* Portals / Modals overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={setActiveTab}
        setSelectedProductById={setSelectedProductId}
        products={products}
      />

      <CallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        theme={theme}
      />

      {/* Floating WhatsApp Support Desk with Dual Contacts */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5"
        id="global-floating-whatsapp-container"
      >
        {isWhatsappOpen && (
          <div 
            className="bg-[#0b0c10]/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 animate-fadeIn w-52 mr-1 mb-1 z-50 text-left"
            id="whatsapp-menu-popover"
          >
            <div className="border-b border-zinc-900 pb-1.5 px-1">
              <span className="font-bold text-[#25D366] uppercase text-[9px] tracking-wider block">WhatsApp Connect</span>
              <span className="text-[10px] text-zinc-400">Select a number to start support chat:</span>
            </div>
            
            <a
              href="https://wa.me/919221783525?text=Dear%20Heat%20One%20Technology%20Team%2C%0A%0AI%20came%20across%20your%20website%20and%20would%20like%20to%20learn%20more%20about%20your%20industrial%20heating%20solutions.%20Please%20provide%20detailed%20information%20about%20your%20complete%20product%20range%2C%20including%20technical%20specifications%2C%20features%2C%20and%20pricing%2C%20if%20available.%0A%0AI%20look%20forward%20to%20your%20response."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsWhatsappOpen(false)}
              className="flex items-center gap-3 p-2.5 hover:bg-[#25D366]/5 rounded-lg border border-transparent hover:border-[#25D366]/20 transition-all group/item"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 group-hover/item:bg-[#25D366]/25 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.022-.015-.022-.015-.502-.255-.453-.226-.502-.226-.643-.016-.015.022-.44.555-.54.67-.101.115-.202.13-.502-.015-.3-.15-1.268-.468-2.417-1.493-.892-.796-1.493-1.78-1.67-2.08-.178-.3-.02-.46.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.643-1.547-.88-2.112-.233-.562-.47-.487-.643-.496l-.547-.01c-.19 0-.5.07-.76.357-.26.287-1.0 1.0-1.0 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.437.702.302 1.25.485 1.68.623.704.224 1.344.192 1.85.117.564-.083 1.73-.707 1.977-1.39.248-.684.248-1.272.173-1.39-.075-.118-.27-.18-.501-.3zM12 21.8c-1.8 0-3.56-.47-5.12-1.36l-.37-.22-3.6 1 .98-3.5-.24-.38C2.71 15.82 2.19 14 2 12.1c-.1-5.5 4.3-10 9.8-10.1 2.7.1 5.2 1.1 7.1 3 1.9 1.9 3 4.4 2.9 7.1-.1 5.5-4.6 10-10.2 9.7z M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-100 block group-hover/item:text-[#25D366] transition-colors leading-tight font-mono">+91 92217 83525</span>
              </div>
            </a>

            <a
              href="https://wa.me/917666634617?text=Dear%20Heat%20One%20Technology%20Team%2C%0A%0AI%20came%20across%20your%20website%20and%20would%20like%20to%20learn%20more%20about%20your%20industrial%20heating%20solutions.%20Please%20provide%20detailed%20information%20about%20your%20complete%20product%20range%2C%20including%20technical%20specifications%2C%20features%2C%20and%20pricing%2C%20if%2520available.%0A%0AI%20look%20forward%20to%20your%20response."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsWhatsappOpen(false)}
              className="flex items-center gap-3 p-2.5 hover:bg-[#25D366]/5 rounded-lg border border-transparent hover:border-[#25D366]/20 transition-all group/item"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 group-hover/item:bg-[#25D366]/25 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.022-.015-.022-.015-.502-.255-.453-.226-.502-.226-.643-.016-.015.022-.44.555-.54.67-.101.115-.202.13-.502-.015-.3-.15-1.268-.468-2.417-1.493-.892-.796-1.493-1.78-1.67-2.08-.178-.3-.02-.46.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.643-1.547-.88-2.112-.233-.562-.47-.487-.643-.496l-.547-.01c-.19 0-.5.07-.76.357-.26.287-1.0 1.0-1.0 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.437.702.302 1.25.485 1.68.623.704.224 1.344.192 1.85.117.564-.083 1.73-.707 1.977-1.39.248-.684.248-1.272.173-1.39-.075-.118-.27-.18-.501-.3zM12 21.8c-1.8 0-3.56-.47-5.12-1.36l-.37-.22-3.6 1 .98-3.5-.24-.38C2.71 15.82 2.19 14 2 12.1c-.1-5.5 4.3-10 9.8-10.1 2.7.1 5.2 1.1 7.1 3 1.9 1.9 3 4.4 2.9 7.1-.1 5.5-4.6 10-10.2 9.7z M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-100 block group-hover/item:text-[#25D366] transition-colors leading-tight font-mono">+91 76666 34617</span>
              </div>
            </a>
          </div>
        )}

        <button
          onClick={() => setIsWhatsappOpen(!isWhatsappOpen)}
          className={`group flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 relative shrink-0 ${
            isWhatsappOpen 
              ? 'bg-zinc-800 text-[#25D366] shadow-lg scale-95' 
              : 'bg-[#25D366] hover:bg-[#20ba56] text-black shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_4px_32px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95'
          }`}
          title="Instant WhatsApp Support Desk"
          id="global-floating-whatsapp"
        >
          {/* Pulsing indicator ring - strictly pointer-events-none */}
          {!isWhatsappOpen && <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 pointer-events-none" />}
          
          {/* SVG WhatsApp Custom-configured path */}
          <svg className="w-7 h-7 fill-current relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.022-.015-.022-.015-.502-.255-.453-.226-.502-.226-.643-.016-.015.022-.44.555-.54.67-.101.115-.202.13-.502-.015-.3-.15-1.268-.468-2.417-1.493-.892-.796-1.493-1.78-1.67-2.08-.178-.3-.02-.46.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.643-1.547-.88-2.112-.233-.562-.47-.487-.643-.496l-.547-.01c-.19 0-.5.07-.76.357-.26.287-1.0 1.0-1.0 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.02 4.437.702.302 1.25.485 1.68.623.704.224 1.344.192 1.85.117.564-.083 1.73-.707 1.977-1.39.248-.684.248-1.272.173-1.39-.075-.118-.27-.18-.501-.3zM12 21.8c-1.8 0-3.56-.47-5.12-1.36l-.37-.22-3.6 1 .98-3.5-.24-.38C2.71 15.82 2.19 14 2 12.1c-.1-5.5 4.3-10 9.8-10.1 2.7.1 5.2 1.1 7.1 3 1.9 1.9 3 4.4 2.9 7.1-.1 5.5-4.6 10-10.2 9.7z M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4z" />
          </svg>

          {/* Completely non-shifting absolute tooltip */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-[#0b0c10]/95 backdrop-blur-md text-zinc-200 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] font-mono shadow-2xl transition-all duration-200 origin-right scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 flex flex-col pointer-events-none select-none w-max z-50">
            <span className="font-bold text-[#25D366] uppercase text-[9px] tracking-wider mb-0.5">WhatsApp Desk</span>
            <span className="whitespace-nowrap">{isWhatsappOpen ? 'Click to Close' : 'Click to Connect'}</span>
          </div>
        </button>
      </div>

      {/* In-app Toast Notification Alert */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 z-50 p-4 bg-[#0b0c0f] border border-orange-500/35 rounded-xl shadow-2xl max-w-sm flex items-start gap-3"
            id="toast-notification-banner"
          >
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-lg shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">New Inquiry Alert</h4>
              <p className="text-xs text-white font-sans mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, visible: false }))}
              className="text-zinc-500 hover:text-white text-xs p-1 font-bold font-mono"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
