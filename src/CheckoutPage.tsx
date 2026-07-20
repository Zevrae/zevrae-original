import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';
import {
  ShieldCheck,
  Lock,
  Truck,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Smartphone,
  Globe,
  Apple,
  Tag,
  Package,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Razorpay script loader
───────────────────────────────────────── */
const loadScript = (src: string) =>
  new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ─────────────────────────────────────────
   Floating-label input component
───────────────────────────────────────── */
interface FloatInputProps {
  id: string;
  name: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  optional?: boolean;
  autoComplete?: string;
}

function FloatInput({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  optional,
  autoComplete,
}: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;

  return (
    <div className="zv-float-group">
      <div
        className={`zv-float-wrap ${focused ? 'is-focused' : ''} ${
          touched && error ? 'is-error' : ''
        }`}
      >
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          className="zv-float-input"
          placeholder=" "
          aria-label={label}
          aria-invalid={!!(touched && error)}
        />
        <label htmlFor={id} className={`zv-float-label ${raised ? 'is-raised' : ''}`}>
          {label}
          {optional && (
            <span className="zv-float-optional"> — optional</span>
          )}
        </label>
      </div>
      <AnimatePresence>
        {touched && error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="zv-field-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   FloatSelect component
───────────────────────────────────────── */
interface FloatSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}

function FloatSelect({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  children,
}: FloatSelectProps) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;

  return (
    <div className="zv-float-group">
      <div
        className={`zv-float-wrap ${focused ? 'is-focused' : ''} ${
          touched && error ? 'is-error' : ''
        }`}
      >
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          className="zv-float-input zv-float-select"
          aria-label={label}
        >
          <option value="" disabled hidden />
          {children}
        </select>
        <label htmlFor={id} className={`zv-float-label ${raised ? 'is-raised' : ''}`}>
          {label}
        </label>
        <ChevronDown size={14} className="zv-select-chevron" />
      </div>
      <AnimatePresence>
        {touched && error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="zv-field-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   Section header
───────────────────────────────────────── */
function SectionHeader({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="zv-section-header">
      <span className="zv-section-num">{number}</span>
      <span className="zv-section-title">{title}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Shipping-method radio card
───────────────────────────────────────── */
interface ShipCardProps {
  id: string;
  label: string;
  sub: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
  Icon: React.ElementType;
}

function ShipCard({ id, label, sub, price, selected, onSelect, Icon }: ShipCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`zv-ship-card ${selected ? 'is-selected' : ''}`}
    >
      <div className="zv-ship-card-radio">
        <div className={`zv-radio-dot ${selected ? 'is-active' : ''}`} />
      </div>
      <Icon size={16} className="zv-ship-icon" strokeWidth={1.5} />
      <div className="zv-ship-info">
        <span className="zv-ship-label">{label}</span>
        <span className="zv-ship-sub">{sub}</span>
      </div>
      <span className="zv-ship-price">{price}</span>
    </button>
  );
}

/* ─────────────────────────────────────────
   Payment method card
───────────────────────────────────────── */
interface PayCardProps {
  id: string;
  label: string;
  Icon: React.ElementType;
  selected: boolean;
  onSelect: () => void;
  tag?: string;
  recommended?: boolean;
  children?: React.ReactNode;
}

function PayCard({
  id,
  label,
  Icon,
  selected,
  onSelect,
  tag,
  recommended,
  children,
}: PayCardProps) {
  return (
    <div className={`zv-pay-card ${selected ? 'is-selected' : ''}`}>
      <button
        type="button"
        onClick={onSelect}
        className="zv-pay-card-header"
        aria-pressed={selected}
      >
        <div className="zv-pay-card-left">
          <div className="zv-pay-radio">
            <div className={`zv-radio-dot ${selected ? 'is-active' : ''}`} />
          </div>
          <Icon size={18} strokeWidth={1.5} className="zv-pay-icon" />
          <span className="zv-pay-label">{label}</span>
        </div>
        <div className="zv-pay-card-right">
          {recommended && <span className="zv-pay-badge zv-pay-badge--rec">Recommended</span>}
          {tag && !recommended && <span className="zv-pay-badge">{tag}</span>}
        </div>
      </button>

      <AnimatePresence>
        {selected && children && (
          <motion.div
            key={`pay-expand-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="zv-pay-expand"
          >
            <div className="zv-pay-expand-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   Order summary item
───────────────────────────────────────── */
function OrderItem({ item, formatVal }: { item: any; formatVal: (v: number) => string }) {
  return (
    <div className="zv-order-item">
      <div className="zv-order-img-wrap">
        <img src={item.image} alt={item.name} className="zv-order-img" />
        <span className="zv-order-qty">{item.quantity}</span>
      </div>
      <div className="zv-order-info">
        <p className="zv-order-name">{item.name}</p>
        <p className="zv-order-size">Size — {item.size}</p>
      </div>
      <p className="zv-order-price">{formatVal(item.price * item.quantity)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN CheckoutPage
═══════════════════════════════════════════════════════════ */
export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const navigate = useNavigate();

  /* ── Auth ── */
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoginModalOpen(true);
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsLoginModalOpen(true);
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setIsLoginModalOpen]);

  /* ── Form state ── */
  const [form, setForm] = useState({
    email: '',
    phone: '',
    country: 'India',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saveInfo, setSaveInfo] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'free' | 'express'>('free');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  /* ── Pricing ── */
  const subtotal = cartTotal;
  const shippingCost = shippingMethod === 'express' ? 299 : subtotal > 1000 ? 0 : 99;
  const taxes = Math.round(subtotal * 0.05);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shippingCost + taxes - discount;

  const formatVal = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  /* ── Validation ── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Exactly 10 digits';
    if (!form.firstName) e.firstName = 'Required';
    else if (!/^[A-Za-z]{2,}$/.test(form.firstName)) e.firstName = 'Letters only, min 2';
    if (!form.lastName) e.lastName = 'Required';
    else if (!/^[A-Za-z]{2,}$/.test(form.lastName)) e.lastName = 'Letters only, min 2';
    if (!form.address) e.address = 'Required';
    else if (form.address.length < 10) e.address = 'Min 10 characters';
    if (!form.city) e.city = 'Required';
    if (!form.state) e.state = 'Required';
    if (!form.postalCode) e.postalCode = 'Required';
    else if (!/^\d{6}$/.test(form.postalCode)) e.postalCode = '6 digits required';
    return e;
  };

  const errors = validate();
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Payment submit ── */
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !isFormValid) return;
    setIsProcessing(true);

    if (selectedPayment === 'RAZORPAY') {
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      try {
        const orderData = await fetch('/.netlify/functions/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, customer: form, products: items }),
        }).then((r) => r.json());

        if (orderData.error) throw new Error(orderData.error);

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ZEVRAE',
          description: 'Luxury Apparel Checkout',
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              const { error } = await supabase.from('orders').insert([
                {
                  order_id: orderData.orderId,
                  customer_name: `${form.firstName} ${form.lastName}`.trim(),
                  customer_email: form.email,
                  customer_address: `${form.address}, ${form.city}, ${form.state}, ${form.postalCode}`,
                  customer_phone: form.phone || 'N/A',
                  amount: Number(total),
                  products: JSON.stringify(items),
                  payment_method: 'RAZORPAY',
                  status: 'paid',
                },
              ]);
              if (error) { alert('Order failed: ' + error.message); setIsProcessing(false); return; }
              clearCart();
              setOrderSuccess(true);
              setTimeout(() => navigate('/'), 4000);
            } catch {
              alert('Unexpected error');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: '#C8A96A' },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (r: any) => {
          alert(r.error.description);
          setIsProcessing(false);
        });
        rzp.open();
      } catch (err: any) {
        alert(err.message || 'Failed to initialize payment');
        setIsProcessing(false);
      }
    } else if (selectedPayment === 'COD') {
      try {
        const orderId = 'ZE' + Date.now();
        const { error } = await supabase.from('orders').insert([
          {
            order_id: orderId,
            customer_name: `${form.firstName} ${form.lastName}`.trim(),
            customer_email: form.email,
            customer_address: `${form.address}, ${form.city}, ${form.state}, ${form.postalCode}`,
            customer_phone: form.phone || 'N/A',
            amount: Number(total),
            products: JSON.stringify(items),
            payment_method: 'COD',
            status: 'pending',
          },
        ]);
        if (error) { alert('Order failed: ' + error.message); setIsProcessing(false); return; }
        clearCart();
        setOrderSuccess(true);
        setTimeout(() => navigate('/'), 4000);
      } catch {
        alert('Unexpected error');
        setIsProcessing(false);
      }
    } else {
      // Card / GPay / Apple Pay / UPI — placeholder
      setTimeout(() => {
        setIsProcessing(false);
        alert('Payment gateway integration pending.');
      }, 1500);
    }
  };

  /* ── Recommendations (static) ── */
  const recommendations = [
    {
      name: 'Silk Overshirt',
      price: '₹4,200',
      img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80',
    },
    {
      name: 'Linen Trousers',
      price: '₹3,800',
      img: 'https://images.unsplash.com/photo-1594938298603-c8148f4c5994?w=300&q=80',
    },
  ];

  /* ── Auth guard loading ── */
  if (!user) {
    return (
      <div className="zv-auth-loading">
        <div className="zv-auth-dot" />
      </div>
    );
  }

  /* ── Order success screen ── */
  if (orderSuccess) {
    return (
      <div className="zv-success-screen">
        <motion.div
          className="zv-success-inner"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="zv-success-icon-wrap">
            <div className="zv-success-pulse" />
            <CheckCircle2 size={36} className="zv-success-icon" />
          </div>
          <h2 className="zv-success-title">Order Confirmed</h2>
          <p className="zv-success-sub">Thank you for choosing ZEVRAE.<br />A confirmation has been sent to your email.</p>
          <button onClick={() => navigate('/')} className="zv-success-btn">
            Continue Browsing
          </button>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════ */
  return (
    <>
      <style>{CHECKOUT_CSS}</style>

      <motion.div
        className="zv-checkout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ── Top Nav ── */}
        <header className="zv-checkout-nav">
          <div className="zv-checkout-nav-inner">
            <button
              onClick={() => navigate('/')}
              className="zv-logo"
              aria-label="ZEVRAE home"
            >
              ZEVRAE
            </button>
            <div className="zv-secure-badge">
              <Lock size={10} strokeWidth={1.5} />
              <span>Secure Checkout</span>
            </div>
          </div>
          <div className="zv-nav-divider" />
        </header>

        {/* ── Progress Indicator ── */}
        <div className="zv-progress-wrap">
          <div className="zv-progress-inner">
            {(['BAG', 'CHECKOUT', 'CONFIRMATION'] as const).map((step, i) => (
              <React.Fragment key={step}>
                <span className={`zv-progress-step ${i === 1 ? 'is-active' : ''}`}>
                  {step}
                </span>
                {i < 2 && <div className={`zv-progress-line ${i === 0 ? 'is-done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Mobile Order Summary accordion ── */}
        <div className="zv-mobile-summary">
          <button
            className="zv-mobile-summary-toggle"
            onClick={() => setMobileSummaryOpen((v) => !v)}
            aria-expanded={mobileSummaryOpen}
          >
            <div className="zv-mobile-summary-left">
              <Package size={14} strokeWidth={1.5} />
              <span>{mobileSummaryOpen ? 'Hide' : 'Show'} order summary</span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={`zv-mobile-chevron ${mobileSummaryOpen ? 'is-open' : ''}`}
              />
            </div>
            <span className="zv-mobile-total">{formatVal(total)}</span>
          </button>

          <AnimatePresence>
            {mobileSummaryOpen && (
              <motion.div
                key="mobile-summary"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="zv-mobile-summary-body"
              >
                <MobileSummaryContent
                  items={items}
                  formatVal={formatVal}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  taxes={taxes}
                  discount={discount}
                  total={total}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  promoApplied={promoApplied}
                  setPromoApplied={setPromoApplied}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Two-column layout ── */}
        <main className="zv-checkout-main">
          {/* ────────────────────────────
              LEFT COLUMN — Form
          ──────────────────────────── */}
          <div className="zv-form-col">
            {/* CONTACT */}
            <motion.section
              className="zv-form-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <SectionHeader number="01" title="Contact" />

              <div className="zv-fields-grid zv-fields-single">
                <FloatInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  touched={touched.email}
                  autoComplete="email"
                />
              </div>

              <div className="zv-fields-grid zv-fields-single">
                <FloatInput
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  error={errors.phone}
                  touched={touched.phone}
                  optional
                  autoComplete="tel"
                />
              </div>
            </motion.section>

            <div className="zv-section-divider" />

            {/* DELIVERY */}
            <motion.section
              className="zv-form-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionHeader number="02" title="Delivery" />

              <div className="zv-fields-grid zv-fields-single">
                <FloatSelect
                  id="country"
                  name="country"
                  label="Country / Region"
                  value={form.country}
                  onChange={handleChange}
                  onBlur={() => handleBlur('country')}
                >
                  <option value="India">India</option>
                  <option value="UAE">United Arab Emirates</option>
                  <option value="UK">United Kingdom</option>
                  <option value="USA">United States</option>
                  <option value="Singapore">Singapore</option>
                </FloatSelect>
              </div>

              <div className="zv-fields-grid zv-fields-two">
                <FloatInput
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  error={errors.firstName}
                  touched={touched.firstName}
                  autoComplete="given-name"
                />
                <FloatInput
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  error={errors.lastName}
                  touched={touched.lastName}
                  autoComplete="family-name"
                />
              </div>

              <div className="zv-fields-grid zv-fields-single">
                <FloatInput
                  id="address"
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={() => handleBlur('address')}
                  error={errors.address}
                  touched={touched.address}
                  autoComplete="street-address"
                />
              </div>

              <div className="zv-fields-grid zv-fields-single">
                <FloatInput
                  id="apartment"
                  name="apartment"
                  label="Apartment, suite, etc."
                  value={form.apartment}
                  onChange={handleChange}
                  optional
                  autoComplete="address-line2"
                />
              </div>

              <div className="zv-fields-grid zv-fields-three">
                <FloatInput
                  id="city"
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={() => handleBlur('city')}
                  error={errors.city}
                  touched={touched.city}
                  autoComplete="address-level2"
                />
                <FloatInput
                  id="state"
                  name="state"
                  label="State"
                  value={form.state}
                  onChange={handleChange}
                  onBlur={() => handleBlur('state')}
                  error={errors.state}
                  touched={touched.state}
                  autoComplete="address-level1"
                />
                <FloatInput
                  id="postalCode"
                  name="postalCode"
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={handleChange}
                  onBlur={() => handleBlur('postalCode')}
                  error={errors.postalCode}
                  touched={touched.postalCode}
                  autoComplete="postal-code"
                />
              </div>

              <label className="zv-save-check">
                <div
                  className={`zv-checkbox ${saveInfo ? 'is-checked' : ''}`}
                  onClick={() => setSaveInfo((v) => !v)}
                  role="checkbox"
                  aria-checked={saveInfo}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === ' ' && setSaveInfo((v) => !v)}
                >
                  {saveInfo && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#0A0A0A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  )}
                </div>
                <span>Save this information for next time</span>
              </label>
            </motion.section>

            <div className="zv-section-divider" />

            {/* SHIPPING */}
            <motion.section
              className="zv-form-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SectionHeader number="03" title="Shipping Method" />

              <div className="zv-ship-cards">
                <ShipCard
                  id="free"
                  label="Standard Shipping"
                  sub="5–7 business days"
                  price={subtotal > 1000 ? 'Free' : '₹99'}
                  selected={shippingMethod === 'free'}
                  onSelect={() => setShippingMethod('free')}
                  Icon={Truck}
                />
                <ShipCard
                  id="express"
                  label="Express Delivery"
                  sub="1–2 business days"
                  price="₹299"
                  selected={shippingMethod === 'express'}
                  onSelect={() => setShippingMethod('express')}
                  Icon={ArrowRight}
                />
              </div>
            </motion.section>

            <div className="zv-section-divider" />

            {/* PAYMENT */}
            <motion.section
              className="zv-form-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionHeader number="04" title="Payment" />

              <form onSubmit={handlePaymentSubmit}>
                <div className="zv-pay-cards">
                  {/* Credit / Debit Card */}
                  <PayCard
                    id="CARD"
                    label="Credit / Debit Card"
                    Icon={CreditCard}
                    selected={selectedPayment === 'CARD'}
                    onSelect={() => setSelectedPayment('CARD')}
                  >
                    <div className="zv-card-fields">
                      <FloatInput
                        id="cardNumber"
                        name="cardNumber"
                        label="Card Number"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        autoComplete="cc-number"
                      />
                      <div className="zv-fields-grid zv-fields-two">
                        <FloatInput
                          id="expiry"
                          name="expiry"
                          label="MM / YY"
                          value={cardData.expiry}
                          onChange={handleCardChange}
                          autoComplete="cc-exp"
                        />
                        <FloatInput
                          id="cvv"
                          name="cvv"
                          label="CVV"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          autoComplete="cc-csc"
                        />
                      </div>
                      <FloatInput
                        id="nameOnCard"
                        name="nameOnCard"
                        label="Name on Card"
                        value={cardData.nameOnCard}
                        onChange={handleCardChange}
                        autoComplete="cc-name"
                      />
                    </div>
                  </PayCard>

                  {/* Razorpay (UPI / Netbanking) */}
                  <PayCard
                    id="RAZORPAY"
                    label="UPI / Netbanking / Wallets"
                    Icon={Smartphone}
                    selected={selectedPayment === 'RAZORPAY'}
                    onSelect={() => setSelectedPayment('RAZORPAY')}
                    recommended
                    tag="Fast & Secure"
                  >
                    <p className="zv-pay-info-text">
                      Pay securely via UPI, Netbanking, or Wallets using Razorpay.
                    </p>
                  </PayCard>

                  {/* Google Pay */}
                  <PayCard
                    id="GPAY"
                    label="Google Pay"
                    Icon={Globe}
                    selected={selectedPayment === 'GPAY'}
                    onSelect={() => setSelectedPayment('GPAY')}
                    tag="Instant"
                  >
                    <p className="zv-pay-info-text">
                      Complete your purchase instantly with Google Pay.
                    </p>
                  </PayCard>

                  {/* Apple Pay */}
                  <PayCard
                    id="APPLEPAY"
                    label="Apple Pay"
                    Icon={Apple}
                    selected={selectedPayment === 'APPLEPAY'}
                    onSelect={() => setSelectedPayment('APPLEPAY')}
                  >
                    <p className="zv-pay-info-text">
                      Seamless checkout using Apple Pay on your Apple device.
                    </p>
                  </PayCard>

                  {/* COD */}
                  <PayCard
                    id="COD"
                    label="Cash on Delivery"
                    Icon={Truck}
                    selected={selectedPayment === 'COD'}
                    onSelect={() => setSelectedPayment('COD')}
                    tag="Pay at doorstep"
                  >
                    <p className="zv-pay-info-text">
                      Pay {formatVal(total)} with cash upon delivery.
                    </p>
                  </PayCard>
                </div>

                {/* Security badges */}
                <div className="zv-security-row">
                  <div className="zv-security-badge">
                    <ShieldCheck size={14} strokeWidth={1.5} />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="zv-security-badge">
                    <Lock size={14} strokeWidth={1.5} />
                    <span>Encrypted Checkout</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  id="complete-purchase-btn"
                  disabled={!selectedPayment || !isFormValid || isProcessing}
                  className={`zv-cta-btn ${
                    selectedPayment && isFormValid && !isProcessing ? 'is-active' : ''
                  }`}
                >
                  {isProcessing ? (
                    <span className="zv-cta-processing">
                      <span className="zv-spinner" />
                      Processing...
                    </span>
                  ) : (
                    <span className="zv-cta-content">
                      <span>Complete Purchase</span>
                      <ArrowRight size={18} strokeWidth={1.5} className="zv-cta-arrow" />
                    </span>
                  )}
                </button>
              </form>
            </motion.section>
          </div>

          {/* ────────────────────────────
              RIGHT COLUMN — Order Summary
          ──────────────────────────── */}
          <div className="zv-summary-col">
            <div className="zv-summary-sticky">
              <motion.div
                className="zv-summary-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <h3 className="zv-summary-heading">Order Summary</h3>

                {/* Items */}
                <div className="zv-order-items">
                  {items.map((item) => (
                    <OrderItem key={`${item.id}-${item.size}`} item={item} formatVal={formatVal} />
                  ))}
                </div>

                <div className="zv-summary-divider" />

                {/* Promo code */}
                <div className="zv-promo-row">
                  <div className="zv-promo-wrap">
                    <Tag size={13} strokeWidth={1.5} className="zv-promo-icon" />
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="zv-promo-input"
                      aria-label="Promo code"
                    />
                  </div>
                  <button
                    type="button"
                    className="zv-promo-btn"
                    onClick={() => {
                      if (promoCode.trim().toUpperCase() === 'ZEVRAE10') {
                        setPromoApplied(true);
                      } else {
                        alert('Invalid promo code');
                      }
                    }}
                  >
                    Apply
                  </button>
                </div>

                <AnimatePresence>
                  {promoApplied && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="zv-promo-success"
                    >
                      10% discount applied
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="zv-summary-divider" />

                {/* Totals */}
                <div className="zv-summary-totals">
                  <div className="zv-total-row">
                    <span>Subtotal</span>
                    <span>{formatVal(subtotal)}</span>
                  </div>
                  <div className="zv-total-row">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatVal(shippingCost)}</span>
                  </div>
                  <div className="zv-total-row">
                    <span>Taxes (5% GST)</span>
                    <span>{formatVal(taxes)}</span>
                  </div>
                  {promoApplied && (
                    <div className="zv-total-row zv-total-discount">
                      <span>Discount (ZEVRAE10)</span>
                      <span>−{formatVal(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="zv-summary-divider" />

                <div className="zv-grand-total">
                  <span>Total</span>
                  <span>{formatVal(total)}</span>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                className="zv-reco-section"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <p className="zv-reco-title">You may also like</p>
                <div className="zv-reco-grid">
                  {recommendations.map((r) => (
                    <div key={r.name} className="zv-reco-card">
                      <div className="zv-reco-img-wrap">
                        <img src={r.img} alt={r.name} className="zv-reco-img" />
                      </div>
                      <p className="zv-reco-name">{r.name}</p>
                      <p className="zv-reco-price">{r.price}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* ── Footer strip ── */}
        <footer className="zv-checkout-footer">
          <span>© {new Date().getFullYear()} ZEVRAE</span>
          <span>·</span>
          <a href="#">Privacy</a>
          <span>·</span>
          <a href="#">Terms</a>
          <span>·</span>
          <a href="#">Returns</a>
        </footer>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────
   Mobile summary body (reused in accordion)
───────────────────────────────────────── */
function MobileSummaryContent({
  items,
  formatVal,
  subtotal,
  shippingCost,
  taxes,
  discount,
  total,
  promoCode,
  setPromoCode,
  promoApplied,
  setPromoApplied,
}: {
  items: any[];
  formatVal: (v: number) => string;
  subtotal: number;
  shippingCost: number;
  taxes: number;
  discount: number;
  total: number;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoApplied: boolean;
  setPromoApplied: (v: boolean) => void;
}) {
  return (
    <div className="zv-mobile-summary-content">
      {items.map((item) => (
        <OrderItem key={`${item.id}-${item.size}`} item={item} formatVal={formatVal} />
      ))}
      <div className="zv-summary-divider" />
      <div className="zv-promo-row">
        <div className="zv-promo-wrap">
          <Tag size={13} strokeWidth={1.5} className="zv-promo-icon" />
          <input
            type="text"
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="zv-promo-input"
          />
        </div>
        <button
          type="button"
          className="zv-promo-btn"
          onClick={() => {
            if (promoCode.trim().toUpperCase() === 'ZEVRAE10') setPromoApplied(true);
            else alert('Invalid promo code');
          }}
        >
          Apply
        </button>
      </div>
      <div className="zv-summary-divider" />
      <div className="zv-summary-totals">
        <div className="zv-total-row"><span>Subtotal</span><span>{formatVal(subtotal)}</span></div>
        <div className="zv-total-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : formatVal(shippingCost)}</span></div>
        <div className="zv-total-row"><span>Taxes (5% GST)</span><span>{formatVal(taxes)}</span></div>
        {promoApplied && <div className="zv-total-row zv-total-discount"><span>Discount</span><span>−{formatVal(discount)}</span></div>}
      </div>
      <div className="zv-summary-divider" />
      <div className="zv-grand-total"><span>Total</span><span>{formatVal(total)}</span></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMBEDDED CSS  —  all styles scoped to .zv-* classes
   so they never bleed into App.tsx
═══════════════════════════════════════════════════════════ */
const CHECKOUT_CSS = `
  /* ── Google Fonts ──────────────────────── */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&family=Archivo:wdth,wght@125,700;125,800&family=Inter+Tight:wght@700;900&display=swap');

  /* ── Auth guard ──────────────────────── */
  .zv-auth-loading {
    min-height: 100vh;
    background: #0A0A0A;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .zv-auth-dot {
    width: 6px;
    height: 6px;
    background: #C8A96A;
    border-radius: 50%;
    animation: zvPulse 1.4s ease-in-out infinite;
  }

  /* ── Success screen ──────────────────── */
  .zv-success-screen {
    min-height: 100vh;
    background: #0A0A0A;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
  }
  .zv-success-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 48px 32px;
    max-width: 480px;
    text-align: center;
  }
  .zv-success-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .zv-success-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(200,169,106,0.12);
    animation: zvPulse 2s ease-in-out infinite;
  }
  .zv-success-icon { color: #C8A96A; }
  .zv-success-title {
    font-family: 'Archivo', sans-serif;
    font-weight: 700;
    font-size: 28px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #F5F2ED;
  }
  .zv-success-sub {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #A6A6A6;
    line-height: 1.7;
  }
  .zv-success-btn {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #F5F2ED;
    border: 1px solid rgba(245,242,237,0.15);
    background: transparent;
    padding: 14px 32px;
    cursor: pointer;
    transition: border-color 0.3s, color 0.3s;
  }
  .zv-success-btn:hover {
    border-color: #C8A96A;
    color: #C8A96A;
  }

  /* ── Page shell ──────────────────────── */
  .zv-checkout {
    min-height: 100vh;
    background: #0A0A0A;
    color: #F5F2ED;
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    padding-bottom: 80px;
  }

  /* ── Top nav ──────────────────────────── */
  .zv-checkout-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #0A0A0A;
  }
  .zv-checkout-nav-inner {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 40px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .zv-logo {
    font-family: 'Archivo', sans-serif;
    font-weight: 800;
    font-size: clamp(18px, 2.5vw, 26px);
    letter-spacing: 0.15em;
    color: #F5F2ED;
    text-transform: uppercase;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-stretch: 125%;
    transition: color 0.3s;
  }
  .zv-logo:hover { color: #C8A96A; }
  .zv-secure-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #A6A6A6;
  }
  .zv-nav-divider {
    height: 1px;
    background: #222222;
  }

  /* ── Progress ──────────────────────────── */
  .zv-progress-wrap {
    max-width: 1240px;
    margin: 0 auto;
    padding: 32px 40px;
  }
  .zv-progress-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .zv-progress-step {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(245,242,237,0.28);
    white-space: nowrap;
    transition: color 0.3s;
  }
  .zv-progress-step.is-active {
    color: #C8A96A;
  }
  .zv-progress-line {
    flex: 1;
    height: 1px;
    background: #222222;
  }
  .zv-progress-line.is-done {
    background: rgba(200,169,106,0.4);
  }

  /* ── Mobile summary accordion ──────────── */
  .zv-mobile-summary {
    display: none;
    border-top: 1px solid #222222;
    border-bottom: 1px solid #222222;
    background: #111111;
    padding: 0 20px;
  }
  @media (max-width: 900px) {
    .zv-mobile-summary { display: block; }
  }
  .zv-mobile-summary-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 18px 0;
    background: none;
    border: none;
    cursor: pointer;
    color: #F5F2ED;
  }
  .zv-mobile-summary-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #A6A6A6;
  }
  .zv-mobile-chevron {
    transition: transform 0.3s ease;
  }
  .zv-mobile-chevron.is-open { transform: rotate(180deg); }
  .zv-mobile-total {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: #C8A96A;
    letter-spacing: 0.05em;
  }
  .zv-mobile-summary-body { overflow: hidden; }
  .zv-mobile-summary-content {
    padding: 20px 0 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Two-column layout ──────────────────── */
  .zv-checkout-main {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 40px;
    display: grid;
    grid-template-columns: 65fr 35fr;
    gap: 80px;
    align-items: start;
  }
  @media (max-width: 1100px) {
    .zv-checkout-main {
      grid-template-columns: 60fr 40fr;
      gap: 48px;
    }
  }
  @media (max-width: 900px) {
    .zv-checkout-main {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .zv-summary-col { display: none; }
    .zv-progress-wrap { padding: 24px 20px; }
    .zv-checkout-main { padding: 0 20px; }
    .zv-checkout-nav-inner { padding: 0 20px; }
  }
  @media (max-width: 600px) {
    .zv-checkout-main { padding: 0 16px; }
    .zv-checkout-nav-inner { padding: 0 16px; }
    .zv-progress-wrap { padding: 20px 16px; }
  }

  /* ── Form column ─────────────────────────── */
  .zv-form-col {
    padding-top: 8px;
    padding-bottom: 40px;
  }
  .zv-form-section {
    padding: 40px 0;
  }
  .zv-section-divider {
    height: 1px;
    background: #1A1A1A;
    margin: 0;
  }

  /* ── Section header ─────────────────────── */
  .zv-section-header {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 32px;
  }
  .zv-section-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #C8A96A;
    font-weight: 400;
  }
  .zv-section-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #F5F2ED;
    font-weight: 500;
  }

  /* ── Field grids ────────────────────────── */
  .zv-fields-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
  }
  .zv-fields-single { grid-template-columns: 1fr; }
  .zv-fields-two { grid-template-columns: 1fr 1fr; }
  .zv-fields-three { grid-template-columns: 1fr 1fr 1fr; }
  @media (max-width: 600px) {
    .zv-fields-two { grid-template-columns: 1fr; }
    .zv-fields-three { grid-template-columns: 1fr; }
  }

  /* ── Floating label input ───────────────── */
  .zv-float-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .zv-float-wrap {
    position: relative;
    border-bottom: 1px solid #2A2A2A;
    transition: border-color 0.25s ease;
  }
  .zv-float-wrap.is-focused {
    border-color: #C8A96A;
  }
  .zv-float-wrap.is-focused::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background: #C8A96A;
    animation: zvFocusLine 0.25s ease forwards;
  }
  .zv-float-wrap.is-error { border-color: rgba(200,80,80,0.6); }
  .zv-float-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 20px 0 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #F5F2ED;
    letter-spacing: 0.01em;
    appearance: none;
    -webkit-appearance: none;
  }
  .zv-float-select {
    cursor: pointer;
    padding-right: 24px;
  }
  .zv-float-select option {
    background: #111111;
    color: #F5F2ED;
  }
  .zv-select-chevron {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #A6A6A6;
    pointer-events: none;
  }
  .zv-float-label {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #555555;
    pointer-events: none;
    transition: top 0.22s ease, font-size 0.22s ease, color 0.22s ease, letter-spacing 0.22s ease;
    white-space: nowrap;
  }
  .zv-float-label.is-raised {
    top: 8px;
    font-size: 8px;
    letter-spacing: 0.22em;
    color: #A6A6A6;
  }
  .zv-float-wrap.is-focused .zv-float-label.is-raised {
    color: #C8A96A;
  }
  .zv-float-optional {
    color: #444;
    font-style: italic;
  }
  .zv-field-error {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: rgba(220,80,80,0.9);
    margin: 0;
  }

  /* ── Save info checkbox ─────────────────── */
  .zv-save-check {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #A6A6A6;
    user-select: none;
  }
  .zv-checkbox {
    width: 16px;
    height: 16px;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
    cursor: pointer;
  }
  .zv-checkbox.is-checked {
    background: #C8A96A;
    border-color: #C8A96A;
  }

  /* ── Shipping cards ─────────────────────── */
  .zv-ship-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .zv-ship-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    border: 1px solid #1E1E1E;
    background: #0D0D0D;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.25s, background 0.25s;
    width: 100%;
  }
  .zv-ship-card:hover { border-color: #333; }
  .zv-ship-card.is-selected {
    border-color: rgba(200,169,106,0.5);
    background: rgba(200,169,106,0.04);
  }
  .zv-ship-card-radio {
    width: 16px;
    height: 16px;
    border: 1px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.25s;
  }
  .zv-ship-card.is-selected .zv-ship-card-radio { border-color: #C8A96A; }
  .zv-radio-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: transparent;
    transition: background 0.2s;
  }
  .zv-radio-dot.is-active { background: #C8A96A; }
  .zv-ship-icon { color: #A6A6A6; flex-shrink: 0; }
  .zv-ship-card.is-selected .zv-ship-icon { color: #C8A96A; }
  .zv-ship-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .zv-ship-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #F5F2ED;
  }
  .zv-ship-sub {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #555;
  }
  .zv-ship-price {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #C8A96A;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  /* ── Payment cards ─────────────────────── */
  .zv-pay-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 32px;
  }
  .zv-pay-card {
    border: 1px solid #1E1E1E;
    background: #0D0D0D;
    overflow: hidden;
    transition: border-color 0.25s, background 0.25s;
  }
  .zv-pay-card:hover { border-color: #2A2A2A; }
  .zv-pay-card.is-selected {
    border-color: rgba(200,169,106,0.4);
    background: rgba(200,169,106,0.03);
  }
  .zv-pay-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #F5F2ED;
  }
  .zv-pay-card-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .zv-pay-radio {
    width: 16px;
    height: 16px;
    border: 1px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.25s;
  }
  .zv-pay-card.is-selected .zv-pay-radio { border-color: #C8A96A; }
  .zv-pay-icon { color: #A6A6A6; flex-shrink: 0; }
  .zv-pay-card.is-selected .zv-pay-icon { color: #C8A96A; }
  .zv-pay-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #F5F2ED;
  }
  .zv-pay-card-right { display: flex; align-items: center; gap: 10px; }
  .zv-pay-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #A6A6A6;
    padding: 4px 8px;
    border: 1px solid #222;
  }
  .zv-pay-badge--rec {
    color: #C8A96A;
    border-color: rgba(200,169,106,0.25);
    background: rgba(200,169,106,0.06);
  }
  .zv-pay-expand { overflow: hidden; }
  .zv-pay-expand-inner {
    padding: 0 20px 20px;
    border-top: 1px solid #1A1A1A;
    padding-top: 20px;
  }
  .zv-card-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .zv-pay-info-text {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: #555;
    line-height: 1.6;
    margin: 0;
  }

  /* ── Security row ─────────────────────── */
  .zv-security-row {
    display: flex;
    align-items: center;
    gap: 28px;
    margin-bottom: 32px;
  }
  .zv-security-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #3A3A3A;
  }

  /* ── CTA button ───────────────────────── */
  .zv-cta-btn {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 500;
    border: none;
    cursor: not-allowed;
    background: #1A1A1A;
    color: rgba(245,242,237,0.25);
    transition: background 0.3s, color 0.3s, transform 0.2s, box-shadow 0.3s;
    position: relative;
    overflow: hidden;
  }
  .zv-cta-btn.is-active {
    background: #C8A96A;
    color: #0A0A0A;
    cursor: pointer;
  }
  .zv-cta-btn.is-active:hover {
    background: #b89558;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(200,169,106,0.2);
  }
  .zv-cta-btn.is-active:active { transform: translateY(0); }
  .zv-cta-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .zv-cta-arrow {
    transition: transform 0.25s ease;
  }
  .zv-cta-btn.is-active:hover .zv-cta-arrow {
    transform: translateX(4px);
  }
  .zv-cta-processing {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .zv-spinner {
    width: 14px;
    height: 14px;
    border: 1.5px solid rgba(245,242,237,0.3);
    border-top-color: #F5F2ED;
    border-radius: 50%;
    animation: zvSpin 0.7s linear infinite;
  }
  .zv-cta-btn.is-active .zv-spinner {
    border-color: rgba(10,10,10,0.3);
    border-top-color: #0A0A0A;
  }

  /* ── Order summary column ──────────────── */
  .zv-summary-col { padding-top: 8px; }
  .zv-summary-sticky { position: sticky; top: 92px; }
  .zv-summary-card {
    background: #111111;
    border: 1px solid #1E1E1E;
    padding: 36px 32px;
  }
  .zv-summary-heading {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #C8A96A;
    font-weight: 400;
    margin: 0 0 28px;
  }
  .zv-order-items {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .zv-order-items::-webkit-scrollbar { width: 3px; }
  .zv-order-items::-webkit-scrollbar-track { background: transparent; }
  .zv-order-items::-webkit-scrollbar-thumb { background: #222; }
  .zv-order-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .zv-order-img-wrap {
    position: relative;
    width: 68px;
    height: 86px;
    flex-shrink: 0;
    overflow: hidden;
    background: #0D0D0D;
  }
  .zv-order-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.88;
    transition: transform 0.5s ease, opacity 0.5s ease;
  }
  .zv-order-img-wrap:hover .zv-order-img {
    transform: scale(1.04);
    opacity: 1;
  }
  .zv-order-qty {
    position: absolute;
    top: 0;
    right: 0;
    width: 18px;
    height: 18px;
    background: #C8A96A;
    color: #0A0A0A;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .zv-order-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-top: 2px;
  }
  .zv-order-name {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #F5F2ED;
    margin: 0;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .zv-order-size {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    color: #555;
    margin: 0;
  }
  .zv-order-price {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #A6A6A6;
    margin: 0;
    flex-shrink: 0;
    padding-top: 2px;
    letter-spacing: 0.03em;
  }

  /* ── Summary divider ─────────────────── */
  .zv-summary-divider {
    height: 1px;
    background: #1A1A1A;
    margin: 20px 0;
  }

  /* ── Promo ──────────────────────────── */
  .zv-promo-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .zv-promo-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #2A2A2A;
    padding-bottom: 8px;
    transition: border-color 0.25s;
  }
  .zv-promo-wrap:focus-within { border-color: #C8A96A; }
  .zv-promo-icon { color: #444; flex-shrink: 0; }
  .zv-promo-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #F5F2ED;
  }
  .zv-promo-input::placeholder { color: #333; }
  .zv-promo-btn {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #A6A6A6;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }
  .zv-promo-btn:hover { color: #C8A96A; }
  .zv-promo-success {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #C8A96A;
    margin: 8px 0 0;
  }

  /* ── Totals ──────────────────────────── */
  .zv-summary-totals {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .zv-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #555;
  }
  .zv-total-row span:last-child {
    font-family: 'IBM Plex Mono', monospace;
    color: #A6A6A6;
    letter-spacing: 0.03em;
  }
  .zv-total-discount { color: #C8A96A; }
  .zv-total-discount span:last-child { color: #C8A96A; }
  .zv-grand-total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #F5F2ED;
  }
  .zv-grand-total span:last-child {
    font-size: 16px;
    color: #C8A96A;
    letter-spacing: 0.05em;
  }

  /* ── Recommendations ─────────────────── */
  .zv-reco-section {
    margin-top: 32px;
  }
  .zv-reco-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #444;
    margin: 0 0 20px;
  }
  .zv-reco-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .zv-reco-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .zv-reco-img-wrap {
    width: 100%;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: #0D0D0D;
  }
  .zv-reco-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.75;
    transition: transform 0.6s ease, opacity 0.4s ease;
  }
  .zv-reco-img-wrap:hover .zv-reco-img {
    transform: scale(1.05);
    opacity: 0.92;
  }
  .zv-reco-name {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #A6A6A6;
    margin: 0;
  }
  .zv-reco-price {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    color: #C8A96A;
    margin: 0;
  }

  /* ── Footer ──────────────────────────── */
  .zv-checkout-footer {
    max-width: 1240px;
    margin: 60px auto 0;
    padding: 28px 40px;
    border-top: 1px solid #1A1A1A;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #333;
  }
  .zv-checkout-footer a {
    color: #333;
    text-decoration: none;
    transition: color 0.2s;
  }
  .zv-checkout-footer a:hover { color: #A6A6A6; }
  @media (max-width: 600px) {
    .zv-checkout-footer { padding: 28px 16px; flex-wrap: wrap; gap: 10px; }
  }

  /* ── Animations ──────────────────────── */
  @keyframes zvPulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.15); }
  }
  @keyframes zvSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes zvFocusLine {
    from { transform: scaleX(0); transform-origin: left; }
    to { transform: scaleX(1); transform-origin: left; }
  }
`;

