import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogIn, LogOut, Menu, ShoppingCart, X, User, LayoutDashboard, Radio, Award, ShieldBan } from "lucide-react";
import satsungLogo from "@/assets/logo.png";
import { useCart } from "@/components/common/CartContext";
import { navLinks } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [menuUser, setMenuUser] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [liveSession, setLiveSession] = useState<{ id: string, zoomLink: string, title: string, time?: string, sessionType?: string } | null>(null);

  const [isSubscribed, setIsSubscribed] = useState(false);

  // 🚨 NEW: Notification State
  const [notifications, setNotifications] = useState({ webinars: false, retreats: false, satsangs: false });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { dbUser, logout, loading } = useAuth();

  const isAdmin = dbUser?.role === "ADMIN";
  const isBlocked = dbUser?.isBlocked === true;

  const navWithDropdowns = [
    {
      label: "SIA",
      children: [
        { label: "All About SiA", to: "/about" },
        { label: "Jake Light", to: "/sia?tab=jake" },
        { label: "Activities", to: "/activities" },
        { label: "Join", to: "/join" },
      ],
    },
    {
      label: "Events", to: "/events",
      children: [
        ...(isSubscribed || isAdmin ? [{ label: "Satsungs & QnA", to: "/satsungs-qna" }] : []),
        { label: "Retreats", to: "/retreats" },
        { label: "Webinars", to: "/webinars" },
      ],
    },
    {
      label: "Courses", to: "/courses",
      children: [
        { label: "SiA Practices", to: "/courses?cat=practices" },
        { label: "Scriptures", to: "/courses?cat=scriptures" },
      ],
    },
    {
      label: "Social Links",
      children: [
        { label: "Youtube", to: "https://www.youtube.com/shiftingintoawareness" },
        { label: "LinkedIn", to: "https://linkedin.com" },
        { label: "Facebook-SIA", to: "https://www.facebook.com/ShiftingIntoAwareness" },
        { label: "Facebook-Jake Light", to: "https://www.facebook.com/MeJakeLight" },
        { label: "Instagram", to: "https://www.instagram.com/shiftingintoawareness" },
      ],
    },
  ];

  // 🚨 NEW: Fetch Notifications on Mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!dbUser || isBlocked) return;
      try {
        const res = await api.getEventNotifications();
        setNotifications({
          webinars: res.hasNewWebinars,
          retreats: res.hasNewRetreats,
          satsangs: res.hasNewSatsangs,
        });
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications();
  }, [dbUser, isBlocked]);

  // 🚨 NEW: Mark Notification as Read when clicked
  // 🚨 UPDATED: Robust Click Handler
  const handleDropdownClick = (childLabel: string) => {
    // 1. Immediately hide the dot in the UI for a snappy feel
    if (childLabel === "Webinars") {
      setNotifications(p => ({ ...p, webinars: false }));
      api.markEventCategoryAsRead("webinars").catch(console.error);
    } else if (childLabel === "Retreats") {
      setNotifications(p => ({ ...p, retreats: false }));
      api.markEventCategoryAsRead("retreats").catch(console.error);
    } else if (childLabel === "Satsungs & QnA") {
      setNotifications(p => ({ ...p, satsangs: false }));
      api.markEventCategoryAsRead("satsangs").catch(console.error);
    }
  };

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!dbUser || isBlocked) {
        setIsSubscribed(false);
        return;
      }
      try {
        const res = await api.getUserSubscription();
        setIsSubscribed(!!res.subscription);
      } catch (error) {
        console.error("Failed to check subscription:", error);
        setIsSubscribed(false);
      }
    };
    fetchSubscriptionStatus();
  }, [dbUser, isBlocked]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!dbUser || isBlocked) {
        setLiveSession(null);
        return;
      }
      try {
        const res = await api.getTodaySession();
        if (res && res.session) {
          setLiveSession(res.session);
        } else {
          setLiveSession(null);
        }
      } catch (error) {
        setLiveSession(null);
      }
    };
    fetchSession();
  }, [dbUser, isBlocked]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setMenuUser(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenMobileGroup(null);
    setActiveDropdown(null);
    setMenuUser(false);
  }, [location.pathname, location.search]);

  const isHome = location.pathname === "/";
  const needsSolidBg = !isHome || compact || open;

  const getAbsoluteUrl = (link?: string) => {
    if (!link || link.includes('LOCKED')) return '#';
    return link.startsWith('http') ? link : `https://${link}`;
  };

  // 🚨 NEW: Check if the main Events tab needs a dot
  const hasEventNotification = notifications.webinars || notifications.retreats || notifications.satsangs;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${needsSolidBg ? "bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm h-[72px]" : "bg-transparent border-transparent h-[88px]"}`}>
      <div className="sia-container flex h-full items-center justify-between gap-3 md:gap-6 lg:gap-10 px-4 sm:px-6">

        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/logo.png" alt="SIA Logo" className="h-19 w-21" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex ">
          {navLinks.map((link) => {
            const hasDropdown = navWithDropdowns.find((item) => item.label === link.label);
            const active = location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to));

            if (hasDropdown) {
              const isDropdownOpen = activeDropdown === link.label;
              return (
                <div key={link.label} className="relative py-4" onMouseEnter={() => setActiveDropdown(link.label)} onMouseLeave={() => setActiveDropdown(null)}>
                  <div className={`flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary cursor-pointer ${needsSolidBg ? 'text-foreground/90' : 'text-white drop-shadow-md'}`}>
                    {hasDropdown.to ? (
                      <Link to={hasDropdown.to} className="flex items-center gap-1 ">
                        {link.label}
                        {link.label === "Events" && hasEventNotification && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        {link.label}
                        {link.label === "Events" && hasEventNotification && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  <div className={`absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-lg transition-all duration-200 ${isDropdownOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"}`}>
                    {hasDropdown.children.map((child, childIdx) => {
                      // 🚨 NEW: Logic to show individual red dot per child
                      const showDot = (child.label === "Webinars" && notifications.webinars) ||
                        (child.label === "Retreats" && notifications.retreats) ||
                        (child.label === "Satsungs & QnA" && notifications.satsangs);
                      return (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => handleDropdownClick(child.label)}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground/85 transition hover:bg-accent hover:text-primary"
                          onBlur={() => { if (childIdx === hasDropdown.children.length - 1) setActiveDropdown(null); }}
                        >
                          <span>{child.label}</span>
                          {showDot && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                        </Link>
                      );
                    })}
                  </div>
                  {active && <span className={`absolute bottom-2 left-0 h-0.5 w-full transition-colors ${needsSolidBg ? 'bg-primary' : 'bg-white'}`} />}
                </div>
              );
            }

            return (
              <NavLink key={link.to} to={link.to} className={`relative py-4 text-sm font-semibold transition-colors hover:text-primary ${needsSolidBg ? 'text-foreground/90' : 'text-white drop-shadow-md'}`} onFocus={() => setActiveDropdown(null)}>
                {link.label}
                {active && <motion.span layoutId="active-nav" className={`absolute bottom-2 left-0 h-0.5 w-full transition-colors ${needsSolidBg ? 'bg-primary' : 'bg-white'}`} transition={{ type: "spring", stiffness: 360, damping: 30 }} />}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {dbUser && liveSession && !isBlocked && (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!liveSession.zoomLink || liveSession.zoomLink.includes('LOCKED')) { navigate('/satsungs'); return; }
                  if (liveSession.id) {
                    const newTab = window.open('about:blank', '_blank');
                    try {
                      await api.logSessionAttendance(liveSession.id);
                      if (newTab) newTab.location.href = getAbsoluteUrl(liveSession.zoomLink);
                    } catch (err) { if (newTab) newTab.close(); }
                  }
                }}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105 ${liveSession.sessionType === 'QnA' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                <Radio className="h-4 w-6 animate-pulse" />
                Join Live {liveSession.sessionType === 'QnA' ? 'QnA' : 'Satsung'} {liveSession.time ? liveSession.time : ''}
              </button>
            </div>
          )}

          <div className="hidden md:block relative" ref={dropdownRef}>
            {!loading && dbUser ? (
              <div className="relative">
                <button
                  onClick={() => setMenuUser(!menuUser)}
                  className={`flex items-center gap-2 h-11 px-5 border rounded-full text-sm font-semibold uppercase tracking-wider transition-all ${needsSolidBg
                      ? 'border-primary/30 text-primary hover:bg-accent'
                      : 'border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary'
                    }`}
                >
                  <User className="h-4 w-4" />
                  <span>{dbUser.name ? dbUser.name.split(' ')[0].toUpperCase() : "SIA"}</span>
                </button>

                <AnimatePresence>
                  {menuUser && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-72 bg-white border border-border shadow-xl rounded-2xl z-50 overflow-hidden">
                      <div className="p-4 flex items-center gap-3 bg-gray-50/50">
                        <div className="h-12 w-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                          {dbUser.name ? dbUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "S"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm truncate ${isBlocked ? 'text-red-600 line-through' : 'text-foreground'}`}>{dbUser.name}</span>
                            {isBlocked ? (
                              <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                                <ShieldBan className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-gradient-to-r from-[#600694] to-[#8b1ed1] text-white px-2 py-0.5 rounded-full shadow-sm">
                                <Award className="h-3 w-3 text-yellow-300" />
                                <span className="text-[9px] font-bold uppercase tracking-wide">Lvl {dbUser.level || 1}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs truncate">{dbUser.email}</span>
                        </div>
                      </div>

                      <div className="border-t border-border p-1.5 space-y-0.5 text-sm">
                        {isAdmin ? (
                          <Link to="/admin" className="flex items-center px-4 py-2 text-foreground hover:bg-accent rounded-lg">
                            <LayoutDashboard className="h-4 w-4 mr-2 text-primary" /> Admin Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link to="/my-learning" className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg">My Dashboard</Link>
                            {!isBlocked && <Link to="/cart" className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg">My cart</Link>}
                            <Link to="/wishlist" className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg">Wishlist</Link>
                            <Link to="/account" className="block px-4 py-2 text-foreground hover:bg-accent rounded-lg">Account settings</Link>
                          </>
                        )}
                        <hr className="border-border my-1" />
                        <button onClick={logout} className="flex items-center w-full px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg">
                          <LogOut className="h-4 w-4 mr-2" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className={`h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition inline-flex ${needsSolidBg ? 'border-primary/30 text-primary hover:bg-accent' : 'border-white/50 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-primary'}`}>
                <LogIn className="h-4 w-4" /> Login
              </Link>
            )}
          </div>

          <Link to={isBlocked ? "#" : "/cart"} onClick={(e) => isBlocked && e.preventDefault()} className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform ${isBlocked ? 'text-gray-300 opacity-50 cursor-not-allowed' : 'text-primary hover:scale-105'}`}>
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && !isBlocked && (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white border-2 border-white">{itemCount}</span>
            )}
          </Link>

          <button className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white text-primary shadow-md transition-transform hover:scale-105 xl:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="absolute inset-x-0 top-full z-[70] min-h-[calc(100dvh-72px)] max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border bg-background px-6 pb-10 pt-6 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mx-auto w-full max-w-lg space-y-4">
              {dbUser && liveSession && !isBlocked && (
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!liveSession.zoomLink || liveSession.zoomLink.includes('LOCKED')) { setOpen(false); navigate('/satsungs'); return; }
                    if (liveSession.id) {
                      const newTab = window.open('about:blank', '_blank');
                      try {
                        await api.logSessionAttendance(liveSession.id);
                        if (newTab) newTab.location.href = getAbsoluteUrl(liveSession.zoomLink);
                        setOpen(false);
                      } catch (err) { if (newTab) newTab.close(); }
                    }
                  }}
                  className={`block w-full rounded-xl border px-4 py-3 font-display text-xl text-center animate-pulse ${liveSession.sessionType === 'QnA' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-red-500 bg-red-50 text-red-600'}`}
                >
                  <Radio className="inline h-5 w-5 mr-2 -mt-1" />
                  Live {liveSession.sessionType === 'QnA' ? 'QnA' : 'Satsung'} In Progress
                </button>
              )}

              <Link to="/" className="block rounded-xl border border-border bg-card px-4 py-3 font-display text-2xl text-primary" onClick={() => setOpen(false)}>Home</Link>

              {navLinks.filter(l => l.to !== "/").map((link, index) => {
                const hasDropdown = navWithDropdowns.find((item) => item.label === link.label);

                if (!hasDropdown) {
                  return (
                    <motion.div key={link.to} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Link to={link.to} className="block rounded-xl border border-border bg-card px-4 py-3 font-display text-2xl text-primary" onClick={() => setOpen(false)}>
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                }

                const expanded = openMobileGroup === hasDropdown.label;
                return (
                  <motion.div key={link.label} className="rounded-xl border border-border bg-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="flex items-center justify-between px-4 py-3">
                      {hasDropdown.to ? (
                        <Link to={hasDropdown.to} onClick={() => setOpen(false)} className="flex items-center gap-2 font-display text-2xl text-primary">
                          {link.label}
                          {link.label === "Events" && hasEventNotification && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 font-display text-2xl text-primary">
                          {link.label}
                          {link.label === "Events" && hasEventNotification && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                        </span>
                      )}

                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-primary" onClick={() => setOpenMobileGroup(expanded ? null : hasDropdown.label)}>
                        <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    {expanded && (
                      <div className="space-y-1 border-t border-border p-2 bg-gray-50/50 rounded-b-xl">
                        {hasDropdown.children.map((child) => {
                          const showDot = (child.label === "Webinars" && notifications.webinars) ||
                            (child.label === "Retreats" && notifications.retreats) ||
                            (child.label === "Satsungs & QnA" && notifications.satsangs);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              className="flex items-center justify-between rounded-lg px-3 py-2 text-base font-semibold text-foreground/85 transition hover:bg-accent hover:text-primary"
                              onClick={() => {
                                setOpen(false);
                                handleDropdownClick(child.label);
                              }}
                            >
                              <span>{child.label}</span>
                              {showDot && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mx-auto mt-7 flex flex-col w-full max-w-lg gap-4 border-t border-gray-100 pt-6">
              {!loading && dbUser ? (
                <div className="w-full flex flex-col gap-3">
                  <Link to={isAdmin ? "/admin" : "/my-learning"} className="sia-button-primary text-center py-3 rounded-full font-bold text-sm block" onClick={() => setOpen(false)}>
                    {isAdmin ? "Admin Dashboard" : "My Learning"}
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="w-full py-3 border border-red-200 text-red-600 rounded-full font-bold text-sm bg-red-50/50 flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                  <Link to="/login" className="sia-button-outline flex-1 text-center py-3 rounded-full font-bold text-sm" onClick={() => setOpen(false)}>Login</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
