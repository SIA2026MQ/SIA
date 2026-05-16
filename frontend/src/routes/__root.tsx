import { Outlet, createRootRoute, HeadContent, Scripts, useLocation, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CustomCursor } from "@/components/custom-cursor";
import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/context/AuthContext";   // ✅ Changed from @/lib/auth
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { Lotus } from "@/components/decorative";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-cream)] px-4">
      <div className="max-w-md text-center">
        <Lotus className="mx-auto mb-6 h-16 w-16 text-[var(--color-purple)]" />
        <h1 className="font-serif text-7xl text-[var(--color-purple)]">404</h1>
        <h2 className="mt-4 font-serif text-2xl text-[var(--color-text-dark)]">This page is not on the path</h2>
        <p className="mt-3 text-sm text-[var(--color-text-mid)]">
          Wherever you are, the way home is always available.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-purple)] px-6 py-3 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Shifting Into Awareness · Jake Light · The Pathless Path" },
      { name: "description", content: "An award-winning spiritual platform by Jake Light. Live satsangs, retreats, scripture commentary, and the practices of awakening." },
      { name: "author", content: "Shifting Into Awareness" },
      { name: "theme-color", content: "#43006B" },
      { property: "og:title", content: "Shifting Into Awareness · Jake Light · The Pathless Path" },
      { property: "og:description", content: "An award-winning spiritual platform by Jake Light. Live satsangs, retreats, scripture commentary, and the practices of awakening." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Shifting Into Awareness · Jake Light · The Pathless Path" },
      { name: "twitter:description", content: "An award-winning spiritual platform by Jake Light. Live satsangs, retreats, scripture commentary, and the practices of awakening." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c050cdc5-0391-4446-944e-218a5442646b/id-preview-324ba006--2abfcdfa-3729-4217-a9fa-7bd983ef1e58.lovable.app-1777110152374.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c050cdc5-0391-4446-944e-218a5442646b/id-preview-324ba006--2abfcdfa-3729-4217-a9fa-7bd983ef1e58.lovable.app-1777110152374.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text-dark)]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useSmoothScroll();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <AuthProvider>                {/* ✅ Firebase Auth Provider */}
      <CartProvider>
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <CartDrawer />
        {!isAdmin && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}