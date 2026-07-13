import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { products } from '../data';
import { ProductCard } from '../components/ProductCard';

const HERO_LETTERS = 'ZEVRAE'.split('');
// Same stagger order as App.tsx: Z(0) E(1) V(2) R(3) A(4) E(5) → order: 3,0,5,1,4,2
const HERO_LETTER_ORDER = [3, 0, 5, 1, 4, 2];

export const Home: React.FC = () => {
  const menPreview = products.filter(p => p.category === 'men').slice(0, 3);
  const womenPreview = products.filter(p => p.category === 'women').slice(0, 3);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-home-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.zv-home-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.zv-home-info-row');

    // Set initial hidden states
    letters.forEach(el => gsap.set(el, { yPercent: 110 }));
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    if (infoRow) gsap.set(infoRow, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ delay: 0.2 });

    // Letters slide up — identical timing to App.tsx hero
    HERO_LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Gold line draws left-to-right simultaneously
    if (line) {
      tl.to(line, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0);
    }

    // Info row fades up after letters land
    if (infoRow) {
      tl.to(infoRow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="bg-[#12100C] min-h-screen text-white">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#12100C]"
      >
        {/* Season label */}
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#EAE6E1]/50 font-plex-mono mb-10">
          AUTUMN / WINTER 2026
        </p>

        {/* Giant ZEVRAE — letter-by-letter slide up */}
        <h1
          className="font-archivo font-extrabold uppercase text-[#EAE6E1] text-center leading-none mb-6"
          style={{
            fontSize: 'clamp(5rem, 19vw, 22rem)',
            fontStretch: '125%',
            letterSpacing: '-0.02em',
            lineHeight: 0.85,
          }}
          aria-label="ZEVRAE"
        >
          {HERO_LETTERS.map((letter, i) => (
            <span key={i} className="inline-block overflow-hidden" style={{ lineHeight: 1 }}>
              <span className="zv-home-hero-letter inline-block" style={{ willChange: 'transform' }}>
                {letter}
              </span>
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="font-serif italic text-[#EAE6E1]/60 text-sm md:text-base tracking-wide mb-12">
          The Architecture of Elegance
        </p>

        {/* Gold divider line — draws left to right */}
        <div className="zv-home-divider w-full max-w-[900px] px-6 mb-0">
          <div
            className="zv-home-divider-line"
            style={{
              height: '1px',
              background: '#C5A059',
              width: '100%',
              transformOrigin: 'left center',
            }}
          />
        </div>

        {/* Info row — fades up after line draws */}
        <div
          className="zv-home-info-row w-full max-w-[900px] px-6 pt-6 flex items-center justify-between"
        >
          <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/60">
            <Link
              to="/men"
              className="hover:text-[#EAE6E1] transition-colors duration-500"
            >
              View Collection
            </Link>
            <Link
              to="/women"
              className="hover:text-[#EAE6E1] transition-colors duration-500"
            >
              Lookbook
            </Link>
          </div>
          {/* Gold dot — right side */}
          <span
            className="block rounded-full"
            style={{ width: '8px', height: '8px', background: '#C5A059' }}
          />
        </div>
      </section>

      {/* Women Preview Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">Women's Collection</h2>
            <p className="text-sm text-gray-500 tracking-wider">Curated pieces for the modern silhouette.</p>
          </div>
          <Link 
            to="/women" 
            className="hidden md:inline-block text-xs uppercase tracking-[0.2em] border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-all"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {womenPreview.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link 
            to="/women" 
            className="inline-block px-8 py-4 border border-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            View More Women
          </Link>
        </div>
      </section>

      {/* Men Preview Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl font-serif tracking-widest uppercase mb-4">Men's Collection</h2>
            <p className="text-sm text-gray-500 tracking-wider">Refined tailoring and elevated essentials.</p>
          </div>
          <Link 
            to="/men" 
            className="hidden md:inline-block text-xs uppercase tracking-[0.2em] border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-all"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {menPreview.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link 
            to="/men" 
            className="inline-block px-8 py-4 border border-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            View More Men
          </Link>
        </div>
      </section>
    </div>
  );
};
