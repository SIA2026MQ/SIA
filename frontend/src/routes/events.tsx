import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { 
  Calendar, MapPin, Sparkles, Check, X, ArrowRight, 
  MonitorPlay, BookOpen, Info, ShieldAlert 
} from "lucide-react";

// Validated Asset & Layout Data hooks imports
import gallerySatsang from "@/assets/gallery-satsang.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import scriptureStudy from "@/assets/scripture-study.jpg";

// Modern component dependencies
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing";
import { useSiteContent } from "@/hooks/useSiteContent";
import { eventsData } from "@/utils/constants";
import { cn } from "@/lib/utils";

const subscriptionPlans = [
  {
    id: "sub-satsang-basic",
    name: "Satsang Core",
    validity: "1 Month",
    details: "Daily satsang Zoom access + 1 premium webinar.",
    price: "$49",
  },
  {
    id: "sub-satsang-pro",
    name: "Satsang Pro",
    validity: "1 Month",
    details: "Daily satsang Zoom access + 2 premium webinars.",
    price: "$79",
  },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { webinars } = useSiteContent();
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing();
  
  // Extracts active navigation state parameters
  const activeFilter = searchParams.get("filter") || "all";
  const [activeWorkflowRetreat, setActiveWorkflowRetreat] = useState<any | null>(null);

  const setFilter = (newFilter: string) => {
    setSearchParams({ filter: newFilter }, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Synchronized item array filtering loop
  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return eventsData;
    if (activeFilter === "satsang") return eventsData.filter(e => e.type === "Free Satsang");
    if (activeFilter === "webinar") return eventsData.filter(e => e.type === "Webinars");
    if (activeFilter === "retreat") return eventsData.filter(e => e.type === "Retreats");
    return eventsData;
  }, [activeFilter]);

  return (
    <AnimatedPage>

      {/* ========================================================================= */}
      {/* CORE VIEWPORT DISPLAY GATHERINGS PORTFOLIO MATRIX                         */}
      {/* ========================================================================= */}
      <section className="section-odd py-30">
        <div className="sia-container">
          <AnimatePresence mode="wait">
            
            {/* VIEW: SATSANG CHANNELS */}
            {(activeFilter === "all" || activeFilter === "satsang") && (
              <motion.div key="satsang-segment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-16">
                <SatsangSpotlight />
              </motion.div>
            )}

            {/* VIEW: WEBINARS SECTION */}
            {(activeFilter === "all" || activeFilter === "webinar") && (
              <motion.div key="webinar-segment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-16 space-y-10">
                
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-gold-deep)] font-black">Live Interactive Training</span>
                  <h2 className="sia-h2">Available Live Webinars</h2>
                  <p className="text-sm text-muted-foreground max-w-xl">Recorded and live stream explorations of higher scriptures.</p>
                </div>

                {/* Subscription Plans Banner */}
                <div className="grid gap-6 md:grid-cols-2 pb-6">
                  {subscriptionPlans.map((plan, idx) => (
                    <article key={plan.id} className="sia-card overflow-hidden p-0 bg-white border border-border">
                      <img src={idx === 0 ? gallerySatsang : scriptureStudy} alt={plan.name} className="aspect-[21/9] w-full object-cover" />
                      <div className="p-5 space-y-3">
                        <span className="rounded-full bg-purple-pale px-3 py-1 text-xs font-semibold uppercase text-primary inline-block">{plan.validity} Validity</span>
                        <h3 className="sia-h3">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.details}</p>
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <span className="font-semibold text-primary">{localizePrice(plan.price)}</span>
                          <button className="sia-button-primary text-xs" onClick={() => addToCart({ id: plan.id, category: "Practices", title: `${plan.name} Subscription`, description: plan.details, duration: "1 month", lessons: 30, rating: 5, price: localizePrice(plan.price), imageUrl: gallerySatsang })}>Buy Plan</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Individual Grid Cards wrapper */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.filter(e => e.type === "Webinars").map((ev) => (
                    <article key={ev.id} className="sia-card flex flex-col rounded-2xl bg-white shadow-soft overflow-hidden border border-border relative">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img src={scriptureStudy} alt={ev.title} className="h-full w-full object-cover" />
                        <span className="absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase bg-indigo-600 text-white shadow-sm">Webinar</span>
                      </div>
                      <div className="flex flex-1 flex-col p-5 space-y-3">
                        <h3 className="font-serif text-xl font-bold text-primary">{ev.title}</h3>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>📅 {ev.date} · {ev.time || "9:00 PM IST"}</p>
                          <p>📍 {ev.location}</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{ev.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="font-bold text-primary">{localizePrice(ev.price)}</span>
                          <button className="sia-button-outline text-xs" onClick={() => addToCart({ id: `${ev.id}-single`, category: "Scriptures", title: ev.title, description: ev.description, duration: "1 live webinar", lessons: 1, rating: 5, price: localizePrice(ev.price), imageUrl: scriptureStudy })}>Buy Webinar</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            )}

            {/* VIEW: RETREATS IMMERSIONS */}
            {(activeFilter === "all" || activeFilter === "retreat") && (
              <motion.div key="retreat-segment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-gold-deep)] font-black">Multi-day Immersions</span>
                  <h2 className="sia-h2">Upcoming Retreat Programs</h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-2 pt-2">
                  {filteredEvents.filter(e => e.type === "Retreats" || e.type === "retreat").map((r) => (
                    <article key={r.id} className="group relative overflow-hidden rounded-3xl shadow-soft aspect-[16/10] w-full">
                      <img src={retreatMountain} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-900/30 to-transparent" />
                      <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-950 shadow-sm">
                        <Sparkles className="h-3 w-3 animate-pulse" /> Limited Seats
                      </span>
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1">
                        <p className="text-xs uppercase tracking-widest font-bold text-amber-400">{r.location}</p>
                        <h3 className="font-serif text-2xl font-bold">{r.title}</h3>
                        <p className="text-xs opacity-90">{r.date} · {r.price}</p>
                        <button onClick={() => setActiveWorkflowRetreat(r)} className="mt-3 bg-[#600694] hover:bg-opacity-95 text-white font-bold px-5 py-2 rounded text-xs uppercase tracking-wider transition-all shadow-md">
                          Register
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                
                {/* Structural boundary layout line break spacer */}
                <div className="border-t border-border/40 pt-10" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* OVERLAY RETREAT REGISTRATION DRAWER */}
      <AnimatePresence>
        {activeWorkflowRetreat && (
          <RetreatStepperForm event={activeWorkflowRetreat} onClose={() => setActiveWorkflowRetreat(null)} />
        )}
      </AnimatePresence>

    </AnimatedPage>
  );
}

// ========================================================================= 
// SPOTLIGHT GATHERING SUB-LAYOUT COMPONENTS                                 
// ========================================================================= 
function SatsangSpotlight() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative bg-amber-50/20 border border-border rounded-3xl p-10 sm:p-10 overflow-hidden shadow-soft">
      
      <div className="space-y-5 mb-8">
        <span className="text-xs uppercase tracking-widest text-[var(--color-gold-deep)] font-black">Free Weekly Gathering</span>
        <h2 className="sia-h2">The Saturday Satsang</h2>
        <p className="text-sm text-muted-foreground max-w-xl">A free, open, and ongoing invitation. Bring your questions, your silence, your seeking.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 items-start">
        <div className="rounded-2xl bg-white shadow-soft overflow-hidden border border-border p-3">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
            <ReactPlayer url="https://www.youtube.com/watch?v=inpok4MKVLM" width="100%" height="100%" controls light />
          </div>
          <div className="p-4 pt-6">
            <h3 className="font-serif text-xl text-primary font-bold">Recurring Schedule</h3>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-border/60 text-muted-foreground">
                {[
                  ["Every Saturday", "7:00 PM IST · 9:30 AM EST", "Open Satsang"],
                  ["First Friday", "8:00 PM IST", "Devotional Chanting"],
                  ["Last Sunday", "10:00 AM IST", "Silent Sit"],
                ].map(([day, time, name]) => (
                  <tr key={day}>
                    <td className="py-2.5 font-semibold text-primary text-xs uppercase tracking-wider">{day}</td>
                    <td className="py-2.5 text-xs sm:text-sm">{time}</td>
                    <td className="py-2.5 text-foreground font-medium text-right">{name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-soft p-6 sm:p-8 border border-border space-y-4">
          <h3 className="font-serif text-xl text-primary font-bold">Register for the next Satsang</h3>
          <p className="text-xs text-muted-foreground">We will broadcast the access parameters directly into your digital endpoints.</p>
          
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center animate-fadeIn">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-serif text-lg text-primary font-bold">Registration Captured</p>
              <p className="text-xs text-muted-foreground max-w-xs">We meet in absolute silence on Saturday. Check your email inbox shortly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4 pt-2">
              {["Full Name", "Email Address", "WhatsApp Number"].map(lbl => (
                <input key={lbl} type={lbl.includes("Email") ? "email" : "text"} placeholder={`${lbl} *`} required className="w-full h-11 px-4 rounded-xl border border-border outline-none bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary" />
              ))}
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-soft">
                Register Free Access
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function RetreatStepperForm({ event, onClose }: { event: any; onClose: () => void }) {
  const [step, setStep] = useState<"details" | "form" | "success">("details");
  const [fullName, setFullName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative z-10 w-full max-w-xl sm:max-w-2xl h-full bg-white shadow-2xl flex flex-col text-gray-800 border-l"
      >
        <header className="p-5 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary">Retreat Portal Screening</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">SIA Pathless Pathway / Review Node</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-400"><X className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-sm leading-relaxed">
          
          {step === "details" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-border rounded-2xl p-5 bg-card space-y-4">
                <h4 className="font-serif text-lg font-bold text-primary border-b pb-2">Guidelines Statement</h4>
                <p className="text-xs text-red-500 font-medium flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> Direct submission approval requested</p>
                
                <p>
                  After you submit the form, your application will be reviewed and if approved, you will receive a reply in which the dates and contribution amount will be shared.
                </p>
                <p className="font-bold text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 text-xs">
                  If you do not receive a reply within 1 week of submitting this form, it means the application has not been approved.
                </p>
                <p className="text-xs text-muted-foreground leading-normal">
                  Please note that for retreats, you need to be a member of SiA and have done at least the basic practices. No spot allocations are permitted under any conditions.
                </p>
              </div>

              <button onClick={() => setStep("form")} className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-1 shadow-md">
                Proceed to Screening Questionnaire <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={(e) => { e.preventDefault(); setStep("success"); }} className="space-y-4 text-xs sm:text-sm animate-fadeIn">
              <label className="block space-y-1">
                <span className="font-semibold text-gray-700 text-xs tracking-wide">Full Name *</span>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border p-2.5 rounded-xl outline-none bg-background text-sm font-medium text-foreground focus:border-primary" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="font-semibold text-gray-700 text-xs tracking-wide">Age *</span>
                  <input type="number" required className="w-full border p-2.5 rounded-xl outline-none bg-background text-sm font-medium text-foreground focus:border-primary" />
                </label>
                <label className="block space-y-1">
                  <span className="font-semibold text-gray-700 text-xs tracking-wide">WhatsApp *</span>
                  <input type="tel" required className="w-full border p-2.5 rounded-xl outline-none bg-background text-sm font-medium text-foreground focus:border-primary" />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-semibold text-gray-700 text-xs tracking-wide">Email Reference Address *</span>
                <input type="email" required className="w-full border p-2.5 rounded-xl outline-none bg-background text-sm font-medium text-foreground focus:border-primary" />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-gray-700 text-xs tracking-wide">Current Spiritual Core Routine *</span>
                <input type="text" required placeholder="Describe your daily practices..." className="w-full border p-2.5 rounded-xl outline-none bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-primary" />
              </label>

              <label className="block space-y-1">
                <span className="font-semibold text-gray-700 text-xs tracking-wide">Why do you want to attend this multi-day session? *</span>
                <textarea required rows={3} className="w-full border p-2.5 rounded-xl outline-none focus:border-primary resize-none bg-background text-sm font-medium text-foreground" />
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs pt-2">
                <input type="checkbox" required className="accent-primary h-4 w-4 shrink-0 rounded border-border mt-0.5" />
                <span className="font-semibold text-gray-900 leading-normal">I certify that all details submitted above are accurate. If found incorrect, my application can be rejected. *</span>
              </label>

              <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md mt-2">
                Transmit Parameters For Review
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center py-14 space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full grid place-items-center mx-auto shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-primary">Application Transmitted</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Thank you, {fullName || "seeker"}. Your screening variables are logged securely in the review verification stack.
              </p>
              <button onClick={onClose} className="px-5 py-2 border rounded-full text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-gray-50 transition-colors">
                Exit Process
              </button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}