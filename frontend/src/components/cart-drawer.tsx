import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/admin-store";

export function CartDrawer() {
  const { items, isOpen, setOpen, remove, subtotal, clear } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col bg-[var(--color-cream)] shadow-2xl"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between border-b border-[var(--color-purple)]/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[var(--color-purple)]" />
                <h2 className="font-serif text-2xl text-[var(--color-purple)]">Your Cart</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-[var(--color-purple)] hover:bg-[var(--color-purple-pale)] transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--color-purple-pale)] text-[var(--color-purple)]">
                  <ShoppingBag className="h-9 w-9" />
                </div>
                <p className="mt-6 font-serif text-2xl text-[var(--color-purple)]">Your cart is empty</p>
                <p className="mt-2 text-sm text-[var(--color-text-mid)]">
                  Add a course or retreat to begin the journey.
                </p>
                <Link
                  to="/courses"
                  onClick={() => setOpen(false)}
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-purple)] px-6 py-3 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[var(--color-purple)]/10 overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-5">
                      <img
                        src={item.image}
                        alt=""
                        className="h-20 w-20 flex-none rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {item.tag && (
                              <p className="text-[10px] uppercase tracking-wider text-[var(--color-gold-deep)] font-semibold">
                                {item.tag}
                              </p>
                            )}
                            <p className="mt-0.5 font-serif text-lg text-[var(--color-purple)] leading-snug">
                              {item.title}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-[var(--color-text-mid)] hover:text-[var(--color-purple)]"
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-auto font-semibold text-[var(--color-purple)]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <footer className="border-t border-[var(--color-purple)]/10 bg-white px-6 py-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-mid)]">Subtotal</span>
                    <span className="font-serif text-2xl text-[var(--color-purple)]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-[var(--color-purple)] px-6 py-3.5 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={clear}
                    className="mt-3 w-full text-xs uppercase tracking-wider text-[var(--color-text-mid)] hover:text-[var(--color-purple)] transition-colors"
                  >
                    Clear cart
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
