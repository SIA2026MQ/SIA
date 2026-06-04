import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadCoupons, type Coupon, type ManagedCourse } from "@/utils/contentStore";
import {
  formatAmount,
  detectCurrencyFromIP,
  type CurrencyCode,
} from "@/utils/pricing";

export type CartItem = {
  id: string;
  title: string;
  priceINR: number;
  priceUSD: number;
  quantity: number;
  imageUrl?: string;
  category?: string; // <--- ADD THIS LINE
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (course: ManagedCourse) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  currency: CurrencyCode;
  subtotalLabel: string;
  discountLabel: string;
  totalLabel: string;
  couponCode: string;
  applyCoupon: (value: string) => { ok: boolean; message: string };
};

const CartContext = createContext<CartContextValue | null>(null);

function loadItems() {
  if (typeof window === "undefined") return [] as CartItem[];
  try {
    const raw = window.localStorage.getItem("sia-cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function loadCouponCode() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("sia-cart-coupon") ?? "";
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadItems());
  const [couponCode, setCouponCode] = useState(() => loadCouponCode());
  
  // Default to USD until the IP check completes
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // Detect currency on mount
  useEffect(() => {
    let active = true;
    detectCurrencyFromIP().then((detected) => {
      if (active) setCurrency(detected);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sia-cart", JSON.stringify(items));
  }, [items]);

  // Sync coupon to local storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sia-cart-coupon", couponCode);
  }, [couponCode]);

  // Calculate totals using the regional prices
  const subtotalUsd = items.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
  const subtotalInr = items.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);
  
  // Select the active subtotal based on the detected currency
  const isINR = currency === "INR";
  const activeSubtotal = isINR ? subtotalInr : subtotalUsd;
  
  const matchedCoupon = useMemo(() => 
    loadCoupons().find((c) => c.code.toUpperCase() === couponCode.toUpperCase()), 
  [couponCode]);

  const discount = matchedCoupon
    ? matchedCoupon.type === "percent"
      ? (activeSubtotal * matchedCoupon.discount) / 100
      : Math.min(activeSubtotal, matchedCoupon.discount)
    : 0;

  const total = Math.max(0, activeSubtotal - discount);

  const value: CartContextValue = {
    items,
    addToCart: (course) => {
  setItems((previous) => {
    const found = previous.find((item) => item.id === course.id);
    if (found) {
      return previous.map((item) =>
        item.id === course.id ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item,
      );
    }
    return [
      ...previous,
      {
        id: course.id,
        title: course.title,
        priceINR: course.priceINR,
        priceUSD: course.priceUSD,
        quantity: 1,
        imageUrl: course.imageDataUrl || course.imageUrl,
        category: course.category, // <--- ADD THIS LINE
      },
    ];
  });
},
    removeFromCart: (id) => setItems((previous) => previous.filter((item) => item.id !== id)),
    updateQty: (id, qty) => {
      const normalized = Math.max(1, Math.min(9, qty)); // Min 1, Max 9 items
      setItems((previous) =>
        previous.map((item) => (item.id === id ? { ...item, quantity: normalized } : item)),
      );
    },
    clearCart: () => setItems([]),
    
    // Derived values for UI
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: activeSubtotal,
    discount,
    total,
    currency,
    subtotalLabel: formatAmount(activeSubtotal, currency),
    discountLabel: formatAmount(discount, currency),
    totalLabel: formatAmount(total, currency),
    couponCode,
    applyCoupon: (val) => {
      const normalized = val.trim().toUpperCase();
      const found = loadCoupons().find((coupon) => coupon.code.toUpperCase() === normalized);
      if (!found) return { ok: false, message: "Invalid coupon code" };
      setCouponCode(normalized);
      return { ok: true, message: `Coupon ${normalized} applied` };
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}