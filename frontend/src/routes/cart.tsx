import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Trash2, ShieldCheck, Loader2,
  Minus, Plus, Tag, ArrowRight, HeartHandshake
} from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useRegionalPricing } from "@/hooks/useRegionalPricing";

// 🚨 Razorpay Injection Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  // 🚨 NEW: Hook now returns isCurrencyReady for a safer UX
  const { currency, getPrice, formatAmount, isCurrencyReady } = useRegionalPricing();

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Dynamic Calculation States
  const [localCouponId, setLocalCouponId] = useState<string | null>(null);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // ---------------------------------------------------------------------------
  // DYNAMIC MATH & QUANTITY LOGIC
  // ---------------------------------------------------------------------------
  const getQty = (id: string) => quantities[id] || 1;

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta) // Prevent going below 1
    }));
  };

  // Live real-time calculations using the Regional Pricing Hook
  const { rawSubtotal, discountAmount, finalTotal } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (getPrice(item) * getQty(item.id)), 0);
    const discount = (subtotal * appliedDiscountPercent) / 100;
    const total = Math.max(0, subtotal - discount); // Prevent negative totals

    return {
      rawSubtotal: subtotal,
      discountAmount: discount,
      finalTotal: total
    };
  }, [items, quantities, appliedDiscountPercent, getPrice]);

  // ---------------------------------------------------------------------------
  // COUPON VALIDATION
  // ---------------------------------------------------------------------------
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setMessage({ ok: false, text: "Please enter a coupon code." });
      return;
    }

    try {
      setMessage(null);
      const validation = await api.validateCoupon(couponInput);

      setLocalCouponId(validation.couponId);
      setAppliedDiscountPercent(validation.discountPercent);
      setMessage({ ok: true, text: `Coupon applied: ${validation.discountPercent}% OFF!` });
    } catch (error: any) {
      setLocalCouponId(null);
      setAppliedDiscountPercent(0);
      setMessage({ ok: false, text: error.message || "Invalid or expired coupon" });
    }
  };

  // ---------------------------------------------------------------------------
  // ENTERPRISE CHECKOUT LOGIC (HARDENED – ZERO TRUST ON CLIENT)
  // ---------------------------------------------------------------------------
  const handleCheckout = async () => {
    if (items.length === 0) return;
    const courseToBuy = items[0];

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setMessage({ ok: false, text: "System Error: Missing Razorpay Public Key in frontend .env file." });
      return;
    }

    try {
      setIsCheckingOut(true);
      setMessage(null);

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) throw new Error("Payment gateway failed to load. Please check your connection.");

      // 🚨 1. NO CURRENCY SENT – backend determines it securely from IP
      const orderData = await api.createUnifiedOrder({
        itemId: courseToBuy.id,
        itemType: 'COURSE',
        couponId: localCouponId || null
      });

      // 2. Free transaction path
      if (orderData.freeTransaction) {
        setPurchased(true);
        clearCart();
        setTimeout(() => { navigate("/my-learning"); }, 3000);
        return;
      }

      // 3. Strict validation of backend response
      const paymentCurrency = orderData.currency;
      const paymentAmount = orderData.amount;

      if (!paymentCurrency) {
        console.error("❗ Backend did not return currency in order response.");
      }
      if (!paymentAmount && paymentAmount !== 0) {
        throw new Error("Backend did not return a valid amount.");
      }

      // 4. Mismatch warning – log only, backend is the authority
      if (currency && paymentCurrency && currency !== paymentCurrency) {
        console.warn(
          `⚠️ Currency mismatch: frontend displays ${currency}, but backend order is in ${paymentCurrency}. Using backend value.`
        );
      }

      // 5. Razorpay options – STRICTLY from backend response
      const options = {
        key: razorpayKey,
        amount: paymentAmount,          // from backend (paise/cents)
        currency: paymentCurrency || currency, // fallback to hook currency if backend missing (safety net)
        name: "Shifting Into Awareness",
        description: `Purchase: ${courseToBuy.title}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            await api.verifyUnifiedPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId
            });

            setPurchased(true);
            clearCart();
            setTimeout(() => { navigate("/my-learning"); }, 3000);
          } catch (verifyError: any) {
            setMessage({ ok: false, text: "Payment received, but verification is processing. Please check your dashboard in a few minutes." });
          }
        },
        theme: { color: "#600694" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setMessage({ ok: false, text: `Payment Failed: ${response.error.description}` });
        setIsCheckingOut(false);
      });
      rzp.open();

    } catch (error: any) {
      setMessage({ ok: false, text: error.message || "Failed to start checkout." });
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh] bg-gray-50/30">
        <div className="sia-container max-w-6xl">
          <h1 className="font-display text-4xl text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-500 mb-8 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> 256-bit encrypted secure payment
          </p>

          {items.length === 0 && !purchased ? (
            <div className="mt-8 sia-card text-center bg-white py-20 border border-gray-100 shadow-sm rounded-3xl">
              <div className="bg-purple-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-[#600694]/40" />
              </div>
              <h2 className="font-display text-2xl text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500 mb-8 max-w-md mx-auto">Explore our pathways and add a course to begin your journey of inner transformation.</p>
              <button onClick={() => navigate("/courses")} className="bg-[#600694] hover:bg-[#4a0473] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2 mx-auto">
                Explore Courses <ArrowRight size={18} />
              </button>
            </div>
          ) : purchased ? (
            <div className="mt-8 sia-card text-center bg-emerald-50 border border-emerald-200 py-20 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400"></div>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-display text-emerald-900 mb-3">Payment Secured!</h2>
              <p className="text-emerald-700 font-medium text-lg">Your lifetime access has been unlocked. Redirecting you to your learning sanctuary...</p>
              <Loader2 className="animate-spin text-emerald-600 h-6 w-6 mx-auto mt-8" />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

              {/* CART ITEMS LIST */}
              <div className="space-y-6">
                {items.map((item) => {
                  const qty = getQty(item.id);
                  const basePrice = getPrice(item);
                  const lineTotal = basePrice * qty;

                  return (
                    <article key={item.id} className="sia-card flex flex-col sm:flex-row bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow gap-6 relative">

                      <button
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <div className="h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-8 w-8 text-gray-300" /></div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between pr-8">
                        <div>
                          {item.category && <span className="mb-2 inline-block rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#600694]">{item.category}</span>}
                          <h2 className="font-display text-2xl text-gray-900 leading-tight mb-1">{item.title}</h2>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><HeartHandshake size={12} /> Support Multiplier</p>
                            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-1 w-fit">
                              <button onClick={() => updateQuantity(item.id, -1)} disabled={qty <= 1} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all">
                                <Minus size={16} className="text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-bold text-gray-900 text-sm">{qty}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-[#600694] transition-all">
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">{formatAmount(basePrice)} × {qty}</p>
                            <p className="font-display text-2xl text-[#600694]">{formatAmount(lineTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* CHECKOUT SIDEBAR */}
              <aside className="sia-card h-fit bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
                <h3 className="font-display text-2xl text-gray-900 mb-6">Order Summary</h3>

                <div className="space-y-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{formatAmount(rawSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1.5 font-semibold"><Tag size={14} /> Discount ({appliedDiscountPercent}%)</span>
                      <span className="font-bold">- {formatAmount(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-display text-[#600694]">{formatAmount(finalTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Have a coupon code?</label>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      placeholder="ENTER CODE"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] uppercase font-bold tracking-wider"
                    />
                    <button
                      type="button"
                      className="bg-gray-900 text-white px-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shrink-0"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </button>
                  </div>
                  {message && (
                    <p className={`text-xs font-bold flex items-center gap-1.5 mt-2 ${message.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                      {message.ok ? <ShieldCheck size={14} /> : <Trash2 size={14} />} {message.text}
                    </p>
                  )}
                </div>

                {/* Checkout Button – now safe & currency‑aware */}
                {!dbUser ? (
                  <button
                    type="button"
                    className="w-full bg-[#600694] text-white h-14 rounded-full text-base font-bold shadow-lg shadow-purple-900/20 hover:bg-[#4a0473] hover:-translate-y-0.5 transition-all"
                    onClick={() => navigate("/login?redirectTo=/cart")}
                  >
                    Sign in to Secure Checkout
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isCheckingOut || !isCurrencyReady}
                    className="w-full bg-[#600694] text-white h-14 rounded-full text-base font-bold shadow-lg shadow-purple-900/20 hover:bg-[#4a0473] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    onClick={handleCheckout}
                  >
                    {!isCurrencyReady ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Loading currency...</>
                    ) : isCheckingOut ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Initializing Gateway...</>
                    ) : (
                      <><ShieldCheck className="h-5 w-5" /> Pay {formatAmount(finalTotal)} Securely</>
                    )}
                  </button>
                )}

                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-semibold">
                  Transactions are safe & encrypted
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </AnimatedPage>
  );
}