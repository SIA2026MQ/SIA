import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const navbarMenus = {
  sia: [
    { label: "All About SiA", to: "/sia", search: { tab: "about" } },
    { label: "Jake Light", to: "/sia", search: { tab: "jake" } },
    { label: "Activities", to: "/sia", search: { tab: "activities" } },
    { label: "Join", to: "/sia", search: { tab: "mission" } },
  ],
  events: [
    { label: "Free Satsangs", to: "/events", search: { filter: "satsang" } },
    { label: "Webinars", to: "/events", search: { filter: "webinar" } },
    { label: "Retreats", to: "/events", search: { filter: "retreat" } },
    { label: "All Events", to: "/events", search: { filter: "all" } },
  ],
  courses: [
    { label: "SiA Practices", to: "/courses", search: { cat: "practices" } },
    { label: "Scriptures", to: "/courses", search: { cat: "scriptures" } },
  ],
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuUser, setMenuUser] = useState(false);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const { count, setOpen: setCartOpen } = useCart();
  const { dbUser, logout, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuUser(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuUser(false);
    setActiveDesktopMenu(null);
    setMobileExpanded(null);
  }, [location.pathname]);

  // Admin identification based on the required email
  const isAdmin = dbUser?.email === "siawebteam@gmail.com";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-300 flex flex-col",
        scrolled || open ? "bg-white border-b border-gray-100 shadow-sm" : "bg-[#FDFBF7]"
      )}
    >
      <div className={cn(
        "flex w-full items-center justify-between px-4 sm:px-6 lg:px-10 lg:max-w-7xl lg:mx-auto transition-all duration-300",
        scrolled ? "h-14 lg:h-16" : "h-16 lg:h-20"
      )}>
        <Link to="/" className="flex shrink-0 items-center outline-none">
          <img src={logo} alt="SIA Logo" className={cn("transition-all duration-300 object-contain", scrolled ? "h-10" : "h-12 lg:h-16")} />
        </Link>

        <nav className="hidden lg:flex items-center gap-14">
          <Link to="/" className="text-[14px] font-bold text-[#4B0082]">Home</Link>
          {Object.entries(navbarMenus).map(([key, items]) => (
            <div key={key} className="relative" onMouseEnter={() => setActiveDesktopMenu(key)} onMouseLeave={() => setActiveDesktopMenu(null)}>
              <button className="flex items-center gap-1 text-[14px] font-bold text-[#4B0082] uppercase hover:opacity-70">
                {key} <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {activeDesktopMenu === key && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-lg rounded-lg p-2 mt-1"
                  >
                    {items.map((item) => (
                      <Link key={item.label} to={item.to} search={item.search} className="block px-3 py-2 text-[13px] font-medium text-[#4B0082] hover:bg-gray-50 rounded-md">
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Link to="/blog" className="text-[14px] font-bold text-[#4B0082]">Blog</Link>
          <Link to="/contact" className="text-[14px] font-bold text-[#4B0082]">Contact</Link>
          <Link to="/help" className="text-[14px] font-bold text-[#4B0082]">Help</Link>
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <button onClick={() => setCartOpen(true)} className="relative p-1 text-[#4B0082]">
            <ShoppingBag className="h-6 w-6 stroke-[1.5px]" />
            {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">{count}</span>}
          </button>

          <div className="hidden sm:block relative" ref={dropdownRef}>
            {!loading && dbUser ? (
              <div className="relative">
                <button
                  onClick={() => setMenuUser(!menuUser)}
                  className="flex items-center gap-2 px-6 py-2 border border-[#4B0082]/30 rounded-full text-[#4B0082] text-[13px] font-bold uppercase tracking-widest hover:bg-[#4B0082]/5 transition-all"
                >
                  <User className="h-4 w-4" />
                  <span>{dbUser.name ? dbUser.name.split(' ')[0].toUpperCase() : "SIA"}</span>
                </button>

                <AnimatePresence>
                  {menuUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 shadow-2xl rounded-sm z-[110]"
                    >
                      <div className="p-4 flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 rounded-full bg-[#1c1d1f] flex items-center justify-center text-white text-2xl font-bold">
                          {dbUser.name ? dbUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : "S"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#1c1d1f] text-lg truncate">{dbUser.name}</span>
                          <span className="text-gray-500 text-sm truncate">{dbUser.email}</span>
                        </div>
                      </div>

                      {/* Admin dropdown (based on email) */}
                      {isAdmin ? (
                        <div className="border-t border-gray-100 py-2">
                          <Link to="/admin" onClick={() => setMenuUser(false)} className="block px-4 py-2 text-[#1c1d1f] hover:text-[#4B0082]">
                            <LayoutDashboard className="inline h-4 w-4 mr-2" /> Admin Dashboard
                          </Link>
                          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-red-600 font-bold hover:bg-red-50 mt-1">
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="border-t border-gray-100 py-2">
                            <Link to="/my-learning" className="block px-4 py-2 text-[#1c1d1f] hover:text-[#4B0082]">My learning</Link>
                            <button onClick={() => { setCartOpen(true); setMenuUser(false); }} className="block w-full text-left px-4 py-2 text-[#1c1d1f] hover:text-[#4B0082]">My cart</button>
                            <Link to="/wishlist" className="block px-4 py-2 text-[#1c1d1f] hover:text-[#4B0082]">Wishlist</Link>
                          </div>
                          <div className="border-t border-gray-100 py-2 text-sm">
                            <Link to="/account" className="block px-4 py-2 text-[#1c1d1f] hover:text-[#4B0082]">Account settings</Link>
                            <button onClick={logout} className="flex items-center w-full px-4 py-2 text-red-600 font-bold hover:bg-red-50 mt-1">
                              <LogOut className="h-4 w-4 mr-2" /> Logout
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-6 py-2 border border-[#4B0082]/30 rounded-full text-[#4B0082] text-[13px] font-bold tracking-widest uppercase hover:bg-[#4B0082]/5">
                <User className="h-4 w-4" /> LOGIN
              </Link>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden p-1 text-[#4B0082] z-[160]">
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 top-[64px] bg-white z-[150] lg:hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              <Link to="/" className="block text-lg font-bold text-[#4B0082] border-b pb-2">Home</Link>

              {Object.entries(navbarMenus).map(([key, items]) => (
                <div key={key} className="space-y-3">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
                    className="flex items-center justify-between w-full text-lg font-bold text-[#4B0082] uppercase"
                  >
                    {key} <ChevronDown className={cn("h-5 w-5 transition-transform", mobileExpanded === key && "rotate-180")} />
                  </button>

                  {mobileExpanded === key && (
                    <div className="pl-4 space-y-4 border-l-2 border-[#4B0082]/10 ml-1">
                      {items.map((item) => (
                        <Link key={item.label} to={item.to} className="block text-md font-medium text-[#4B0082]/80">
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link to="/blog" className="block text-lg font-bold text-[#4B0082]">Blog</Link>
              <Link to="/contact" className="block text-lg font-bold text-[#4B0082]">Contact</Link>
              <Link to="/help" className="block text-lg font-bold text-[#4B0082]">Help</Link>
            </div>

            <div className="p-6 border-t bg-gray-50">
              {!loading && dbUser ? (
                <div className="space-y-3">
                  {/* Admin sees Admin Dashboard, regular user sees My Learning */}
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center w-full py-3 bg-white border-2 border-[#4B0082] text-[#4B0082] hover:bg-[#4B0082] hover:text-white transition-colors rounded-full font-bold"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/my-learning"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center w-full py-3 bg-white border-2 border-[#4B0082] text-[#4B0082] hover:bg-[#4B0082] hover:text-white transition-colors rounded-full font-bold"
                    >
                      My Learning
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors"
                  >
                    <LogOut className="h-5 w-5" /> LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-3 w-full justify-center px-6 py-3 bg-[#4B0082] hover:bg-[#3b0066] text-white rounded-full font-bold transition-colors"
                >
                  <User className="h-5 w-5" /> LOGIN / REGISTER
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}