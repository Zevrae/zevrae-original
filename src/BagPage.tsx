import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';
import './BagPage.css';

// "YOUR BAG" — only the 7 letter chars (space rendered separately)
const BAG_CHARS = 'YOUR BAG'.split('');
// Hero-style scrambled stagger order for the 7 letters: Y=0,O=1,U=2,R=3,B=4,A=5,G=6
// Scrambled like ZEVRAE hero [3,0,5,1,4,2] — pick non-sequential visual order: R,Y,G,O,B,U,A
const BAG_CHAR_ORDER = [3, 0, 6, 1, 4, 2, 5]; // R,Y,G,O,B,U,A

export default function BagPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Page fade-up entrance — short delay so React has painted the frame
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // GSAP letter animation — only starts AFTER page fade-in has begun
  useEffect(() => {
    if (!mounted) return;  // Wait for page to become visible first
    if (!headerRef.current) return;

    const letters = headerRef.current.querySelectorAll<HTMLElement>('.bag-heading-letter');
    if (!letters.length) return;

    // Divider starts invisible — draws left→right simultaneously like hero gold line
    if (dividerRef.current) {
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' });
    }

    // GSAP takes ownership of the transform — syncs to yPercent:110 (same as CSS default)
    // then animates to 0 so letters slide into view
    gsap.set(letters, { yPercent: 110 });

    // Small delay after page fade begins, then scrambled stagger (like hero's delay: 0.2)
    const tl = gsap.timeline({ delay: 0.15 });

    // Slide each letter up — power4.out, 0.09s stagger, exactly matching hero
    BAG_CHAR_ORDER.forEach((charIdx, seqIdx) => {
      tl.to(
        letters[charIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Gold divider draws left→right simultaneously with letters (like hero gold line)
    if (dividerRef.current) {
      tl.to(
        dividerRef.current,
        { scaleX: 1, duration: 1.25, ease: 'power2.inOut' },
        0,
      );
    }

    return () => { tl.kill(); };
  }, [mounted]);

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const isEmpty = items.length === 0;

  return (
    <div
      className="bag-page"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* ── Hero Heading ── */}
      <header className="bag-header" ref={headerRef}>
        <h1 className="bag-heading" aria-label="YOUR BAG">
          {BAG_CHARS.map((char, i) =>
            char === ' ' ? (
              // Real word gap — not animated, just provides the space between YOUR and BAG
              <span key={i} className="bag-heading-space" aria-hidden="true" />
            ) : (
              <span key={i} className="bag-heading-clip" aria-hidden="true">
                <span className="bag-heading-letter">{char}</span>
              </span>
            )
          )}
        </h1>
        <div className="bag-heading-divider" ref={dividerRef} />
      </header>

      {/* ── Empty State ── */}
      {isEmpty ? (
        <div className="bag-empty">
          <p className="bag-empty-headline">Some choices disappoint</p>
          <p className="bag-empty-sub">Your's doesn't have to.</p>
          <button className="bag-empty-cta" onClick={() => navigate('/')}>
            Continue Shopping ↗
          </button>
        </div>
      ) : (
        <>
          {/* ── Item List ── */}
          <ul className="bag-items">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="bag-item">
                {/* Left — Name + Price */}
                <div className="bag-item-info">
                  <span className="bag-item-name">{item.name}</span>
                  {item.size && item.size !== 'One Size' && (
                    <span className="bag-item-size">{item.size}</span>
                  )}
                  <span className="bag-item-price">{formatPrice(item.price)}</span>
                </div>

                {/* Center — Product image */}
                <div className="bag-item-image-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="bag-item-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="bag-item-image-placeholder" />
                  )}
                </div>

                {/* Right — Remove + Quantity */}
                <div className="bag-item-controls">
                  <button
                    className="bag-item-remove"
                    onClick={() => removeFromCart(item.id, item.size)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Delete
                  </button>
                  <div className="bag-qty">
                    <button
                      className="bag-qty-btn"
                      onClick={() => updateQuantity(item.id, item.size, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="bag-qty-value">{item.quantity}</span>
                    <button
                      className="bag-qty-btn"
                      onClick={() => updateQuantity(item.id, item.size, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Thin divider below item */}
                <div className="bag-item-divider" />
              </li>
            ))}
          </ul>

          {/* ── Checkout Section ── */}
          <div className="bag-footer">
            {/* Left — Subtotal */}
            <div className="bag-subtotal">
              <span className="bag-subtotal-label">Subtotal</span>
              <span className="bag-subtotal-amount">{formatPrice(cartTotal)}</span>
              <p className="bag-subtotal-note">
                Taxes and shipping will be calculated at checkout.
              </p>
            </div>

            {/* Right — Oversized checkout CTA */}
            <button
              className="bag-checkout-cta"
              onClick={handleCheckout}
              aria-label="Proceed to checkout"
            >
              CHECKOUT&nbsp;<span className="bag-checkout-arrow">↗</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
