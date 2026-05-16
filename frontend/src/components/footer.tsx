import { Link } from "@tanstack/react-router";
import { 
  Instagram, Youtube, Facebook, MessageCircle, Send, 
  MapPin, Mail, Phone, ArrowRight 
} from "lucide-react";
import { Lotus } from "./decorative";
import { NAV_LINKS } from "@/lib/sia-data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png"; 

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
     
    <footer id="site-footer" className="relative overflow-hidden bg-[#1C0F2E] text-[#FAF9F6]">
      {/* Visual Veil & Orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C0F2E] via-[#1C0F2E] to-[#2D1A4A] opacity-95 pointer-events-none" />
      <Lotus className="pointer-events-none absolute -top-12 -right-12 h-60 w-60 md:h-80 md:w-80 text-[#4B0082] opacity-[0.15]" />
      <div className="absolute -left-32 top-1/4 h-64 w-64 md:h-96 md:w-96 rounded-full bg-[#4B0082]/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-0 h-64 w-64 md:h-96 md:w-96 rounded-full bg-[#B89B5E]/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-4">
        {/* Main Grid: 1 col on mobile, 2 cols on tablet, 12 cols on desktop */}
        <div className="grid gap-8 lg:grid-cols-12 mb-10">
          
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-4 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-4">
              <div className="rounded-2xl bg-white/5 backdrop-blur-md p-2 border border-white/10 shadow-2xl">
                <img src={logo} alt="Shifting Into Awareness" className="h-12 md:h-14 w-auto object-contain" />
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block" />
              <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-[#B89B5E] leading-none text-left">
                Pure<br />Awareness
              </p>
            </div>
            
            <h3 className="font-serif italic text-2xl md:text-3xl leading-snug text-white/90 max-w-md">
              "The shift sought outside is already complete within."
            </h3>
            
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              A global sanctuary for sincere seekers. We offer the inner science of awakening through live satsangs, scriptural reflections, and immersive retreats.
            </p>

            <div className="flex gap-3 justify-center lg:justify-start">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Facebook, label: "Facebook" },
                { icon: MessageCircle, label: "WhatsApp" },
              ].map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#B89B5E] hover:border-[#B89B5E]/50 transition-all shadow-xl"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B89B5E] mb-6 md:mb-8 border-b border-[#B89B5E]/20 pb-2 inline-block lg:border-none lg:pb-0">Navigation</h4>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-8 sm:block sm:space-y-4">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <Link 
                    to={l.to} 
                    className="text-sm text-gray-400 hover:text-white flex items-center group transition-colors"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#B89B5E]" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B89B5E] mb-6 md:mb-8 border-b border-[#B89B5E]/20 pb-2 inline-block lg:border-none lg:pb-0">Sanctuary Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-[#B89B5E]/10 p-2.5 rounded-lg shrink-0">
                  <Mail className="h-4 w-4 text-[#B89B5E]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Email Us</p>
                  <a href="mailto:hello@sia.org" className="text-sm font-medium hover:text-[#B89B5E] transition-colors break-all">hello@sia.org</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-[#B89B5E]/10 p-2.5 rounded-lg shrink-0">
                  <Phone className="h-4 w-4 text-[#B89B5E]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">WhatsApp</p>
                  <a href="#" className="text-sm font-medium hover:text-[#B89B5E] transition-colors">+91 98765 43210</a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 bg-[#B89B5E]/10 p-2.5 rounded-lg shrink-0">
                  <MapPin className="h-4 w-4 text-[#B89B5E]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium">Pune, Maharashtra, India</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 sm:col-span-2 lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B89B5E] mb-6 md:mb-8 border-b border-[#B89B5E]/20 pb-2 inline-block lg:border-none lg:pb-0">Journal Subscription</h4>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-md">
              Join 5,000+ seekers. Receive monthly wisdom reflections and satsang invitations directly.
            </p>
            <form onSubmit={onSubscribe} className="space-y-3 max-w-md">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The seeker's email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#B89B5E]/50 focus:ring-4 focus:ring-[#B89B5E]/5 transition-all placeholder:text-gray-600"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 aspect-square grid place-items-center rounded-xl bg-[#B89B5E] text-[#1C0F2E] hover:bg-white active:scale-90 transition-all shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <AnimatePresence>
                {subscribed && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#B89B5E] font-medium"
                  >
                    Deep gratitude. The next reflection awaits you.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-gray-500 tracking-wide text-center lg:text-left order-2 lg:order-1">
            © {new Date().getFullYear()} Shifting Into Awareness. <br className="sm:hidden" /> Built for the evolution of consciousness.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 order-1 lg:order-2">
            <a href="/PrivacyPolicy" className="hover:text-[#B89B5E] transition-colors">Privacy Policy</a>
            <a href="/Terms" className="hover:text-[#B89B5E] transition-colors">Terms of Use</a>
            <a href="/CancellationPolicy" className="hover:text-[#B89B5E] transition-colors">Cancellation & Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}