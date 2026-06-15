import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react"; // Removed Minus and Plus
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function CartPage() {
  const { items, removeFromCart, subtotalLabel, discountLabel, totalLabel, applyCoupon, clearCart } = useCart();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [purchased, setPurchased] = useState(false);

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh]">
        <div className="sia-container">
          <h1 className="sia-h1 text-[#600694]">Your Cart</h1>
          
          {items.length === 0 ? (
            <div className="mt-8 sia-card text-center bg-white py-16 border border-gray-100 shadow-sm rounded-3xl">
              <ShoppingBag className="mx-auto h-12 w-12 text-primary/30 mb-4" />
              <h2 className="sia-h3 text-xl">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground mb-6">Explore our offerings and add a course to continue.</p>
              <button onClick={() => navigate("/courses")} className="sia-button-primary bg-[#600694] text-white">
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              
              {/* CART ITEMS LIST */}
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

                    {/* Action Controls - REMOVED +/- pod completely */}
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
              <aside className="sia-card h-fit space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
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
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#600694]/20"
                  />
                  <button
                    type="button"
                    className="sia-button-outline w-full rounded-xl h-12"
                    onClick={() => {
                      const result = applyCoupon(couponInput);
                      setMessage({ ok: result.ok, text: result.message });
                    }}
                  >
                    Apply Coupon
                  </button>
                </div>
                
                {message && (
                  <p className={`text-xs font-semibold px-2 ${message.ok ? "text-green-600" : "text-red-500"}`}>
                    {message.text}
                  </p>
                )}

                <div className="pt-4 border-t border-gray-100">
                  {!dbUser ? (
                    <button
                      type="button"
                      className="sia-button-primary w-full bg-[#600694] text-white h-12 rounded-xl text-sm font-bold"
                      onClick={() => navigate("/login?redirectTo=/cart")}
                    >
                      Sign in to Checkout
                    </button>
                  ) : (
                    <button
  type="button"
  className="sia-button-primary w-full bg-[#600694] text-white h-12 rounded-xl text-sm font-bold shadow-md hover:bg-[#4a0473] transition-colors disabled:opacity-50"
  onClick={async () => {
    try {
      // 1. Send the cart items directly to the PostgreSQL database
      await api.checkoutCart(items);
      
      // 2. Clear the cart and show success
      setPurchased(true);
      clearCart();
    } catch (error) {
      console.error("Checkout failed:", error);
      setMessage({ ok: false, text: "Failed to complete purchase. Please try again." });
    }
  }}
>
  Complete Purchase
</button>
                  )}
                </div>

                {purchased && (
                  <p className="rounded-xl bg-[#600694]/10 p-4 text-sm text-[#600694] font-semibold text-center mt-4">
                    Purchase successful! 🎉<br/>
                    <button onClick={() => navigate("/my-learning")} className="underline mt-1 hover:text-[#4a0473]">
                      Go to My Learning
                    </button>
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
    </AnimatedPage>
  );
}