import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ADDED
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useAuth } from "@/context/AuthContext"; // ADDED

export default function CartPage() {
  const { items, removeFromCart, updateQty, subtotalLabel, discountLabel, totalLabel, applyCoupon, clearCart } = useCart();
  const { dbUser } = useAuth(); // ADDED
  const navigate = useNavigate(); // ADDED

  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [purchased, setPurchased] = useState(false);

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[80vh]">
        <div className="sia-container">
          <h1 className="sia-h1">Your Cart</h1>
          {items.length === 0 ? (
            <div className="mt-8 sia-card text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-primary/70" />
              <p className="mt-3 text-muted-foreground">Your cart is empty. Add a course to continue.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* ... (Keep your existing items.map code here) ... */}
              
              <aside className="sia-card h-fit space-y-4">
                <h3 className="sia-h3">Checkout Summary</h3>
                {/* ... (Keep your existing subtotal and coupon inputs here) ... */}

                {/* MODIFIED CHECKOUT BUTTON LOGIC */}
                {!dbUser ? (
                  <button
                    type="button"
                    className="sia-button-primary w-full bg-[#600694] text-white"
                    onClick={() => navigate("/login?redirectTo=/cart")}
                  >
                    Sign in to Checkout
                  </button>
                ) : (
                  <button
  type="button"
  className="sia-button-primary w-full bg-[#600694] text-white"
  onClick={() => {
    // 1. Define a unique storage key for this specific user
    const purchaseKey = `sia-purchased-${dbUser.id}`;
    
    // 2. Fetch any previously purchased courses they already own
    const existingPurchases = JSON.parse(window.localStorage.getItem(purchaseKey) || "[]");
    
    // 3. Combine old purchases with new cart items
    const combinedPurchases = [...existingPurchases, ...items];
    
    // 4. Remove duplicates (just in case they somehow buy the same course twice)
    const uniquePurchases = Array.from(
      new Map(combinedPurchases.map((item) => [item.id, item])).values()
    );

    // 5. Save the updated library back to storage
    window.localStorage.setItem(purchaseKey, JSON.stringify(uniquePurchases));

    // 6. Complete the checkout flow
    setPurchased(true);
    clearCart();
  }}
>
  Purchase Course
</button>
                )}

                {purchased ? (
                  <p className="rounded-xl bg-purple-pale p-3 text-sm text-primary">
                    Purchase successful. You can now view it in My Learning.
                  </p>
                ) : null}
              </aside>
            </div>
          )}
        </div>
      </section>
    </AnimatedPage>
  );
}