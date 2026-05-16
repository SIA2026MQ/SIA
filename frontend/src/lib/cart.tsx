// Shopping cart context with localStorage persistence + simulated checkout.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readLS, writeLS } from "./storage";
import { priceToNumber } from "./admin-store";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  type: "course" | "event";
  tag?: string;
}

const CART_KEY = "sia:cart:v1";

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (b: boolean) => void;
  has: (id: string) => boolean;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readLS<CartItem[]>(CART_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeLS(CART_KEY, items);
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]));
    setOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.length,
      subtotal: items.reduce((s, i) => s + i.price, 0),
      add,
      remove,
      clear,
      isOpen,
      setOpen,
      has: (id) => items.some((i) => i.id === id),
    }),
    [items, isOpen, add, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export function makeCartItem(input: {
  id: string;
  title: string;
  price: string;
  image: string;
  type: "course" | "event";
  tag?: string;
}): CartItem {
  return {
    id: input.id,
    title: input.title,
    price: priceToNumber(input.price),
    image: input.image,
    type: input.type,
    tag: input.tag,
  };
}
