import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { CollectionScroller } from './components/CollectionScroller';
import './components/CollectionScroller.css';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import CheckoutPage from './CheckoutPage';
import Admin from './Admin';
import ProductPage from './ProductPage';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';
import { Preloader } from './features/preloader';
import { usePreloader } from './features/PreloaderContext';
import { PageTransitionLoader } from './features/PageTransitionLoader';
import { usePageTransition } from './features/PageTransitionContext';
import { CustomCursor } from './features/CustomCursor';

function CampaignSection() {
  const editorialRef = useRef(null);
  const { scrollYProgress: editorialScroll } = useScroll({ 
    target: editorialRef,
    offset: ["start end", "end start"]
  });
  // const editorialY = useTransform(editorialScroll, [0, 1], [50, -50]);

  return (
    <section id="campaign" ref={editorialRef} className="py-[160px] px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-2 md:order-1 pr-0 md:pr-16"
        >
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-serif text-[#EAE6E1]/50 mb-12">
            CAMPAIGN
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-12 leading-tight text-[#EAE6E1] tracking-[0.05em]">
            Autumn / Winter 2026
          </h3>
          <p className="text-[#EAE6E1]/60 font-serif leading-relaxed text-[13px] md:text-[14px] max-w-md tracking-[0.02em]">
            A study in architectural minimalism. The new collection explores the tension between structured tailoring and fluid drape, crafted from the finest European textiles. Each piece is designed with an uncompromising focus on form, function, and enduring elegance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-1 md:order-2 relative"
        >
          <div className="aspect-[4/5] overflow-hidden bg-[#111111]" data-cursor-image>
            <img 
              src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1974&auto=format&fit=crop" 
              alt="Campaign" 
              className="w-full h-full object-cover opacity-70 grayscale-[30%]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#0a0a0a]/20 mix-blend-multiply" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function App() {
  const { isLoginModalOpen, setIsLoginModalOpen } = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { scrollY } = useScroll();
  const { setIsCartOpen, items } = useCart();
  const { isLoading, hasCompletedOnce } = usePreloader();
  const { trigger: navTransition } = usePageTransition();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Prevent scrolling during preloader (skip on admin)
  useEffect(() => {
    if (isLoading && !location.pathname.startsWith('/admin')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLoading, location.pathname]);
  
  // Hero animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroAnimatedRef = useRef(false);

  useEffect(() => {
    const checkAdminStatus = async (u: any) => {
      if (u && u.email) {
        if (u.email === 'officialzevrae@gmail.com') {
          setIsAdmin(true);
          return;
        }

        try {
          const { data } = await supabase.from('admin_users').select('*').eq('email', u.email);
          setIsAdmin(data && data.length > 0);
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null;
      setUser(u);
      checkAdminStatus(u);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      checkAdminStatus(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Hero GSAP: hide letters immediately, animate when preloader reveals ──
  const HERO_LETTERS = 'ZEVRAE'.split('');
  const HERO_LETTER_ORDER = [3, 0, 5, 1, 4, 2];

  const resetHero = () => {
    if (!heroRef.current) return;
    heroAnimatedRef.current = false;
    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');
    letters.forEach((el) => gsap.set(el, { yPercent: 110 }));
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    if (infoRow) gsap.set(infoRow, { opacity: 0, y: 20 });
  };

  const runHeroAnimation = () => {
    if (heroAnimatedRef.current || !heroRef.current) return;
    heroAnimatedRef.current = true;

    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');

    if (!letters.length) return;

    const tl = gsap.timeline();

    // Letters slide up — power4.out gives a strong decel right before landing
    // Last letter starts at 5*0.09=0.45s, finishes at 0.45+0.9 = 1.35s
    HERO_LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Line: starts at 0s, duration 1.25s → finishes at 1.25s (just before last letter at 1.35s)
    if (line) {
      tl.to(line, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0);
    }

    // Info row fades up after letters land
    if (infoRow) {
      tl.to(infoRow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
    }
  };

  // Reset + hide hero whenever location changes AWAY from home, so it's ready to animate on return
  useEffect(() => {
    if (isHome) {
      // On home: hide immediately then run if already past preloader (HMR / direct nav)
      resetHero();
      if (hasCompletedOnce) {
        setTimeout(runHeroAnimation, 50);
      }
    }
  }, [location.pathname]);

  // Preloader: fires at slide start → delay 500ms = 50% into the 1.0s slide
  useEffect(() => {
    const handle = () => {
      if (!isHome) return;
      setTimeout(runHeroAnimation, 500);
    };
    window.addEventListener('preloader-sliding', handle);
    return () => window.removeEventListener('preloader-sliding', handle);
  }, [isHome]);

  // Page transition: fires when curtain lifts to reveal new page
  useEffect(() => {
    const handle = () => {
      if (!isHome) return;
      // Small delay to let the page content settle before animating
      setTimeout(runHeroAnimation, 100);
    };
    window.addEventListener('hero-reveal', handle);
    return () => window.removeEventListener('hero-reveal', handle);
  }, [isHome]);

  // Luxury animation pacing
  const transition = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };
  const staggerTransition = { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] };

  const getDisplayName = () => {
    if (!user) return null;
    const fullName = user.user_metadata?.full_name;
    if (fullName) return fullName.split(' ')[0].toUpperCase();
    const email = user.email;
    if (email) return email.split('@')[0].toUpperCase();
    return 'USER';
  };
  
  const displayName = getDisplayName();

return (
  <div data-page-content className="min-h-screen bg-[#0a0a0a] text-[#EAE6E1] selection:bg-[#C5A059]/30 selection:text-[#EAE6E1] relative overflow-x-hidden font-sans">
    {/* Premium custom cursor — hidden on touch devices */}
    <CustomCursor />
    {/* Preloader Overlay — self-manages slide-up exit, never re-renders after completion */}
    {!hasCompletedOnce && !location.pathname.startsWith('/admin') && <Preloader />}
    {/* Page Transition Loader */}
    <PageTransitionLoader />

      {/* Global Film Grain */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Navigation — hidden on /admin */}
      {!location.pathname.startsWith('/admin') && (
      <nav 
        className={`fixed top-0 w-full z-40 transition-all duration-1000 ${
          isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md py-6 border-b border-[#C5A059]/10' : 'bg-transparent py-10'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="hidden md:flex space-x-16 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70">
            <button onClick={() => navTransition(() => { navigate('/'); })} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              HOME
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/men'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              MEN
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/women'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              WOMEN
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/jewellery'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              JEWELLERY
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
          </div>

          <motion.button 
            onClick={() => navTransition(() => { navigate('/'); })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="text-xl md:text-3xl font-archivo font-bold tracking-[0.1em] absolute left-1/2 transform -translate-x-1/2 text-[#EAE6E1] cursor-pointer"
            style={{ fontStretch: '125%' }}
          >
            ZEVRAE
          </motion.button>

          <div className="hidden md:flex space-x-16 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70">
            {isAdmin && (
              <button onClick={() => navTransition(() => navigate('/admin'))} className="group relative overflow-hidden pb-1 hover:text-[#C5A059] text-[10px] font-bold transition-colors duration-700">
                ADMIN PANEL
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059] transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            )}
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
                {displayName} | LOGOUT
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            ) : (
              <button onClick={() => navTransition(() => setIsLoginModalOpen(true))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
                LOGIN
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            )}
            <button onClick={() => navTransition(() => setIsCartOpen(true))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              CART {items.length > 0 && `(${items.length})`}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
          </div>

          <button 
            className="md:hidden z-40 relative text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} strokeWidth={1} />
          </button>
        </div>
      </nav>
      )}

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && !location.pathname.startsWith('/admin') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center justify-center space-y-12"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-10 right-6 md:right-12 text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300"
            >
              <X size={28} strokeWidth={1} />
            </button>
            {[
              { name: 'Home', href: '#collection', onClick: () => { navTransition(() => { navigate('/'); }); setIsMenuOpen(false); } },
              { name: 'Men Wear', href: '#collection', onClick: () => { navTransition(() => navigate('/men')); setIsMenuOpen(false); } },
              { name: 'Women Wear', href: '#collection', onClick: () => { navTransition(() => navigate('/women')); setIsMenuOpen(false); } },
              { name: 'Jewellery', href: '#collection', onClick: () => { navTransition(() => navigate('/jewellery')); setIsMenuOpen(false); } },
              ...(isAdmin 
                ? [{ name: 'Admin Panel', href: '#', onClick: () => { navTransition(() => navigate('/admin')); setIsMenuOpen(false); } }]
                : []),
              user 
                ? { name: `${displayName} | Logout`, href: '#', onClick: () => { supabase.auth.signOut(); setIsMenuOpen(false); } }
                : { name: 'Login', href: '#', onClick: () => { navTransition(() => setIsLoginModalOpen(true)); setIsMenuOpen(false); } },
              { name: `Cart (${items.length})`, href: '#', onClick: () => { navTransition(() => setIsCartOpen(true)); setIsMenuOpen(false); } }
            ].map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-3xl md:text-5xl font-plex-mono tracking-[0.2em] text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300 uppercase"
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsMenuOpen(false);
                }}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section — OUTFIT-style typography */}
      {isHome && (
        <>
          <section ref={heroRef} className="relative bg-[#0a0a0a] overflow-hidden">
            {/* Giant ZEVRAE text */}
            <div className="hero-typography-wrapper">
              <h1 className="hero-brand-text" aria-label="ZEVRAE">
                {HERO_LETTERS.map((letter, i) => (
                  <span key={`hero-${letter}-${i}`} className="inline-block overflow-hidden" style={{ lineHeight: 1 }}>
                    <span
                      className="zv-hero-letter inline-block"
                      style={{ willChange: 'transform' }}
                    >
                      {letter}
                    </span>
                  </span>
                ))}
              </h1>
            </div>

            {/* Registered trademark symbol */}
            <div className="hero-trademark">
              <span>®</span>
            </div>

            {/* Gold horizontal divider — draws left to right */}
            <div className="hero-divider">
              <div className="hero-divider-line" />
            </div>

            {/* Info row below divider */}
            <div className="hero-info-row">
              <div className="hero-info-col hero-info-brand">
                <span className="hero-info-label">ZEVRAE</span>
              </div>
              <div className="hero-info-col hero-info-why">
                <span className="hero-info-label">WHY</span>
              </div>
              <div className="hero-info-col hero-info-desc">
                <p>
                  Created by the Zevrae team, this store and signature collection
                  celebrates our collective creativity and passion for apparel. Carefully
                  designed.
                </p>
              </div>
              <div className="hero-info-col hero-info-links">
                <span className="hero-info-link-item">
                  <button onClick={() => navTransition(() => navigate('/men'))}>VISIT COLLECTION</button>
                </span>
                <span className="hero-info-link-item">© {new Date().getFullYear()}</span>
                <span className="hero-info-link-item">
                  <button onClick={() => navTransition(() => navigate('/jewellery'))}>SHIPPING & RETURNS</button>
                </span>
              </div>
            </div>
          </section>

          {/* Collection Scroller */}
          <CollectionScroller />
        </>
      )}

      <Routes>
        <Route path="/" element={<ProductGrid categoryFilter="all" />} />
        <Route path="/men" element={<ProductGrid categoryFilter="men" />} />
        <Route path="/men/tshirts" element={<ProductGrid categoryFilter="men-tshirts" />} />
        <Route path="/men/lowers" element={<ProductGrid categoryFilter="men-lowers" />} />
        <Route path="/women" element={<ProductGrid categoryFilter="women" />} />
        <Route path="/women/tshirts" element={<ProductGrid categoryFilter="women-tshirts" />} />
        <Route path="/women/lowers" element={<ProductGrid categoryFilter="women-lowers" />} />
        <Route path="/jewellery" element={<ProductGrid categoryFilter="jewellery" />} />
        <Route path="/jewellery/rings" element={<ProductGrid categoryFilter="rings" />} />
        <Route path="/jewellery/pendants" element={<ProductGrid categoryFilter="pendants" />} />
        <Route path="/jewellery/keychain" element={<ProductGrid categoryFilter="keychain" />} />
        <Route path="/jewellery/bracelet" element={<ProductGrid categoryFilter="bracelet" />} />
        <Route path="/jewellery/toys" element={<ProductGrid categoryFilter="toys" />} />
        <Route path="/jewellery/earrings" element={<ProductGrid categoryFilter="earrings" />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<Admin />} />
        <Route path="/admin/products" element={<Admin />} />
        <Route path="/admin/collections" element={<Admin />} />
        <Route path="/admin/categories" element={<Admin />} />
        <Route path="/admin/discounts" element={<Admin />} />
      </Routes>

      {isHome && (
        <>
          <CampaignSection />

          {/* Global Presence Section */}
          <section className="py-[160px] bg-[#0a0a0a]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-row flex-wrap justify-center items-center gap-16 md:gap-32 text-[10px] uppercase tracking-[0.4em] font-serif text-[#EAE6E1]/50"
              >
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">PARIS</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">MILAN</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">TOKYO</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">NEW YORK</span>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pt-[160px] pb-16 px-6 md:px-12 border-t border-[#C5A059]/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-32">
            <div className="col-span-1 md:col-span-4">
              <h2 className="text-xl font-serif font-light tracking-[0.3em] mb-12 text-[#EAE6E1]">ZEVRAE</h2>
              <div className="mt-8 flex border-b border-[#EAE6E1]/20 pb-3 max-w-xs group focus-within:border-[#C5A059]/40 transition-colors duration-700">
                <input 
                  type="email" 
                  placeholder="Newsletter" 
                  className="bg-transparent border-none outline-none w-full text-[11px] font-serif placeholder:text-[#EAE6E1]/30 text-[#EAE6E1] tracking-[0.1em]"
                />
                <button className="text-[9px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/50 hover:text-[#EAE6E1] transition-colors duration-500">
                  Subscribe
                </button>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 md:col-start-7">
              <ul className="space-y-6 text-[11px] font-serif text-[#EAE6E1]/60 tracking-[0.05em]">
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Customer Care</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Shipping</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Returns</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Size Guide</a></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <ul className="space-y-6 text-[11px] font-serif text-[#EAE6E1]/60 tracking-[0.05em]">
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Legal</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#EAE6E1]/10 text-[10px] font-serif text-[#EAE6E1]/40 tracking-[0.1em]">
            <p>&copy; {new Date().getFullYear()} ZEVRAE.</p>
            <div className="flex space-x-12 mt-8 md:mt-0">
              <a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Instagram</a>
              <a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Twitter</a>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
