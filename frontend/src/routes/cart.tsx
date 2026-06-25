import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

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
  const {
    items, removeFromCart, subtotalLabel, discountLabel, totalLabel,
    applyCoupon, clearCart, currency, couponCode
  } = useCart();

  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ---------------------------------------------------------------------------
  // 🚨 ENTERPRISE CHECKOUT LOGIC (Razorpay Integration)
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

      // 1. Load Razorpay securely
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) throw new Error("Payment gateway failed to load. Please check your connection.");

      // 2. Create the Order in your Node.js Backend
      const orderData = await api.createUnifiedOrder({
        itemId: courseToBuy.id,
        itemType: 'COURSE',
      });

      // 3. Configure Razorpay UI Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Shifting Into Awareness",
        description: `Purchase: ${courseToBuy.title}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 4. Verify the cryptographic signature on your backend
            await api.verifyUnifiedPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId
            });

            // 5. Success Flow!
            setPurchased(true);
            clearCart();
            setTimeout(() => { navigate("/my-learning"); }, 3000);
          } catch (verifyError: any) {
            setMessage({ ok: false, text: "Payment received, but verification is processing. Please check your dashboard in a few minutes." });
          }
        },
        theme: { color: "#600694" }
      };

      // 6. Open the Razorpay Modal
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setMessage({ ok: false, text: `Payment Failed: ${response.error.description}` });
        setIsCheckingOut(false);
      });
      rzp.open();

    } catch (error: any) {
      setMessage({ ok: false, text: error.message || "Failed to start checkout. Please ensure you are logged in." });
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh]">
        <div className="sia-container">
          <h1 className="sia-h1 text-[#600694]">Your Cart</h1>

          {items.length === 0 && !purchased ? (
            <div className="mt-8 sia-card text-center bg-white py-16 border border-gray-100 shadow-sm rounded-3xl">
              <ShoppingBag className="mx-auto h-12 w-12 text-primary/30 mb-4" />
              <h2 className="sia-h3 text-xl">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground mb-6">Explore our offerings and add a course to continue.</p>
              <button onClick={() => navigate("/courses")} className="sia-button-primary bg-[#600694] text-white">
                Browse Courses
              </button>
            </div>
          ) : purchased ? (
            // 🚨 Enterprise Success Screen
            <div className="mt-8 sia-card text-center bg-emerald-50 border border-emerald-200 py-16 rounded-3xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-display text-emerald-800">Payment Secured!</h2>
              <p className="mt-3 text-emerald-700 font-medium">Your lifetime access has been unlocked. Redirecting you to your learning sanctuary...</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

              {/* CART ITEMS LIST (New Version Layout) */}
              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="sia-card flex flex-col gap-5 sm:flex-row sm:items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Course Image */}
                    <div className="h-28 w-full sm:w-40 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-8 w-8 opacity-20" />
                        </div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      {item.category && (
                        <span className="mb-2 inline-block rounded-full bg-[#600694]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#600694]">
                          {item.category}
                        </span>
                      )}
                      <h2 className="font-display text-xl text-primary leading-snug line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="mt-2 font-semibold text-[#600694]">
                        {item.priceLabel || `₹${item.priceINR || 0} / $${item.priceUSD || 0}`}
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center sm:ml-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                      <button
                        className="rounded-full border border-gray-200 bg-gray-50 p-3 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* CHECKOUT SIDEBAR */}
              <aside className="sia-card h-fit space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-28">
                <h3 className="font-display text-2xl text-[#600694]">Order Summary</h3>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{subtotalLabel}</span>
                  </div>
                  {discountLabel && discountLabel !== "$0.00" && discountLabel !== "₹0.00" && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">- {discountLabel}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg">
                    <span className="font-bold text-primary">Total</span>
                    <span className="font-bold text-[#600694]">{totalLabel}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Enter coupon code"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#600694]/20 uppercase"
                  />
                  <button
                    type="button"
                    className="sia-button-outline w-full rounded-xl h-12 text-[#600694] border-[#600694] hover:bg-[#600694]/5"
                    onClick={() => {
                      const result = applyCoupon(couponInput);
                      setMessage({ ok: result.ok, text: result.message });
                    }}
                  >
                    Apply Coupon
                  </button>
                </div>

                {message && (
                  <p className={`text-sm p-3 rounded-xl border ${message.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {message.text}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-100">
                  {!dbUser ? (
                    <button
                      type="button"
                      className="sia-button-primary w-full bg-[#600694] text-white h-12 rounded-xl text-sm font-bold shadow-md hover:bg-[#4a0473]"
                      onClick={() => navigate("/login?redirectTo=/cart")}
                    >
                      Sign in to Checkout
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isCheckingOut}
                      className="sia-button-primary w-full bg-[#600694] text-white h-12 rounded-xl text-sm font-bold shadow-md hover:bg-[#4a0473] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                      onClick={handleCheckout}
                    >
                      {isCheckingOut ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Securing Payment...</>
                      ) : (
                        <><ShieldCheck className="h-5 w-5" /> Pay Securely</>
                      )}
                    </button>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </AnimatedPage>
  );
}