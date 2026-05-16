import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import ReactPlayer from "react-player";
import { Calendar, MapPin, Sparkles, Check } from "lucide-react";
import { Mandala, Lotus, LotusDivider } from "@/components/decorative";
import { SectionHeading } from "@/components/sia-ui";
import { EVENTS, type EventType } from "@/lib/sia-data";
import { cn } from "@/lib/utils";

// 1. Define Search Parameter Types for Filtering
type EventsSearchParams = {
  filter?: EventType | "all";
};

export const Route = createFileRoute("/events")({
  // 2. Validate the 'filter' parameter from the URL
  validateSearch: (search: Record<string, unknown>): EventsSearchParams => {
    return {
      filter: (search.filter as EventType | "all") || "all",
    };
  },
  head: () => ({
    meta: [
      { title: "Events · Satsangs, Webinars & Retreats · SIA" },
      { name: "description", content: "Gather, seek, awaken. Join Jake Light's free satsangs, live webinars, and multi-day retreats." },
      { property: "og:title", content: "Events · SIA" },
      { property: "og:description", content: "Gather, seek, awaken. Join Jake Light's free satsangs, live webinars, and multi-day retreats." },
    ],
  }),
  component: EventsPage,
});

const FILTERS: Array<{ id: EventType | "all"; label: string }> = [
  { id: "all", label: "All Events" },
  { id: "satsang", label: "Free Satsang" },
  { id: "webinar", label: "Webinars" },
  { id: "retreat", label: "Retreats" },
];

function EventsPage() {
  // 3. Get the active filter from the URL
  const { filter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // 4. Function to update the URL (syncs Header and Page)
  const setFilter = (newFilter: EventType | "all") => {
    navigate({ search: { filter: newFilter }, replace: true });
  };

  const filtered = useMemo(
    () => EVENTS.filter((e) => filter === "all" || e.type === filter),
    [filter]
  );

  return (
    <>
      <Hero />
      <FilterBar activeFilter={filter} setFilter={setFilter} />
      
      {/* 5. Animated Grid Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <Grid events={filtered} />
        </motion.div>
      </AnimatePresence>

      <SatsangSpotlight />
      <RetreatStrip />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-cream)] pt-32 pb-20">
      <Mandala className="absolute -right-32 -top-20 w-[700px] text-[var(--color-purple)] opacity-[0.06] spin-slow" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="btn-label text-[var(--color-gold)]">Live · Online · In Person</p>
        <h1 className="mt-5 font-serif italic text-5xl sm:text-6xl text-[var(--color-purple)] leading-[1.05]">
          Gather. Seek. Awaken.
        </h1>
        <p className="mt-6 text-lg text-[var(--color-text-mid)] max-w-2xl mx-auto">
          Every gathering is an invitation — to remember, to release, to recognise the awareness you already are.
        </p>
      </div>
    </section>
  );
}

function FilterBar({ activeFilter, setFilter }: { activeFilter: EventType | "all"; setFilter: (f: EventType | "all") => void }) {
  return (
    <div className="sticky top-16 lg:top-20 z-30 glass-cream border-y border-[oklch(0.247_0.165_305_/_0.08)]">
      <div className="mx-auto max-w-5xl px-4 overflow-x-auto">
        <div className="flex gap-2 py-3 min-w-max mx-auto justify-center">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "relative rounded-full px-5 py-2 btn-label transition-all duration-300 overflow-hidden",
                  isActive
                    ? "text-[var(--color-cream)]"
                    : "border border-[var(--color-purple)]/30 text-[var(--color-purple)] hover:border-[var(--color-purple)]"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-[var(--color-purple)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Grid({ events }: { events: typeof EVENTS }) {
  const typeColor: Record<EventType, string> = {
    satsang: "bg-[var(--color-gold)]/90 text-[var(--color-text-dark)]",
    webinar: "bg-[var(--color-purple-light)] text-[var(--color-cream)]",
    retreat: "bg-[var(--color-purple)] text-[var(--color-cream)]",
  };
  return (
    <section className="bg-[var(--color-cream)] py-20 min-h-[400px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev, i) => (
            <motion.article
              layout
              key={ev.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={cn(
                "hover-lift group flex flex-col rounded-2xl bg-white shadow-card overflow-hidden relative",
                ev.past && "grayscale"
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className={cn("absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider", typeColor[ev.type])}>
                  {ev.type}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-2xl text-[var(--color-purple)] leading-snug">{ev.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-[var(--color-text-mid)]">
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {ev.date} · {ev.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {ev.location}</p>
                </div>
                <p className="mt-4 text-sm text-[var(--color-text-mid)] leading-relaxed flex-1">{ev.description}</p>
                <div className="mt-6 flex items-center justify-between">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    ev.price === "FREE" ? "bg-[var(--color-gold)]/20 text-[var(--color-purple)]" : "text-[var(--color-purple)]"
                  )}>
                    {ev.price}
                  </span>
                  <button
                    disabled={ev.past}
                    className={cn(
                      "rounded-full px-5 py-2.5 btn-label transition-all",
                      ev.past
                        ? "border border-[var(--color-text-mid)]/30 text-[var(--color-text-mid)] cursor-not-allowed"
                        : ev.price === "FREE"
                          ? "border-2 border-[var(--color-purple)] text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)]"
                          : "bg-[var(--color-purple)] text-[var(--color-cream)] hover:bg-[var(--color-purple-light)]"
                    )}
                  >
                    {ev.past ? "Recording" : ev.price === "FREE" ? "Join Free" : "Book Now"}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Keep your existing SatsangSpotlight, FloatingField, and RetreatStrip functions below...
function SatsangSpotlight() {
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="relative bg-[var(--color-peach)] py-24 overflow-hidden">
      <Lotus className="absolute -bottom-20 -right-20 h-96 w-96 text-[var(--color-purple)] opacity-[0.06]" />
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <SectionHeading eyebrow="Free Weekly Gathering" title="The Saturday Satsang" subtitle="A free, open, and ongoing invitation. Bring your questions, your silence, your seeking." />

        <div className="mt-14 grid gap-10 lg:grid-cols-2 items-start">
          <div className="rounded-2xl bg-white shadow-card overflow-hidden">
            <div className="aspect-video bg-black">
              <ReactPlayer
                src="https://www.youtube.com/watch?v=inpok4MKVLM"
                width="100%"
                height="100%"
                controls
                light
              />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-2xl text-[var(--color-purple)]">Recurring Schedule</h3>
              <table className="mt-4 w-full text-sm">
                <tbody className="divide-y divide-[var(--color-purple)]/10">
                  {[
                    ["Every Saturday", "7:00 PM IST · 9:30 AM EST", "Open Satsang"],
                    ["First Friday", "8:00 PM IST", "Devotional Chanting"],
                    ["Last Sunday", "10:00 AM IST", "Silent Sit"],
                  ].map(([day, time, name]) => (
                    <tr key={day}>
                      <td className="py-3 font-semibold text-[var(--color-purple)]">{day}</td>
                      <td className="py-3 text-[var(--color-text-mid)]">{time}</td>
                      <td className="py-3 text-[var(--color-text-dark)]">{name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-card p-8">
            <h3 className="font-serif text-2xl text-[var(--color-purple)]">Register for the next satsang</h3>
            <p className="mt-2 text-sm text-[var(--color-text-mid)]">We'll send you the Zoom link and a quiet reminder.</p>
            {submitted ? (
              <div className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-gold)]/20 text-[var(--color-purple)]">
                  <Check className="h-7 w-7" />
                </div>
                <p className="font-serif text-xl text-[var(--color-purple)]">You are registered.</p>
                <p className="text-sm text-[var(--color-text-mid)]">A confirmation is on its way. We'll meet in stillness on Saturday.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                {[
                  { name: "name", label: "Full Name", type: "text" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "whatsapp", label: "WhatsApp Number", type: "tel" },
                ].map((f) => (
                  <FloatingField key={f.name} {...f} />
                ))}
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[var(--color-purple)] px-6 py-3.5 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors"
                >
                  Register Free
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingField({ name, label, type }: { name: string; label: string; type: string }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        id={`f-${name}`}
        type={type}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full rounded-lg border border-[var(--color-purple)]/20 bg-transparent px-4 pt-5 pb-2 text-[var(--color-text-dark)] focus:border-[var(--color-purple)] focus:outline-none transition-colors"
      />
      <label
        htmlFor={`f-${name}`}
        className={cn(
          "pointer-events-none absolute left-4 transition-all duration-200",
          active
            ? "top-1.5 text-[10px] uppercase tracking-wider text-[var(--color-purple)]"
            : "top-3.5 text-sm text-[var(--color-text-mid)]",
        )}
      >
        {label}
      </label>
    </div>
  );
}

function RetreatStrip() {
  const retreats = EVENTS.filter((e) => e.type === "retreat");
  return (
    <section className="bg-[var(--color-cream)] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading eyebrow="Multi-day Immersions" title="Upcoming Retreats" />
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {retreats.map((r, i) => (
            <motion.article
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-card aspect-[5/4] sm:aspect-[16/10]"
            >
              <img
                src={r.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-purple)]/95 via-[var(--color-purple)]/40 to-transparent" />
              <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">
                <Sparkles className="h-3 w-3" /> Limited Seats
              </span>
              <div className="absolute inset-x-0 bottom-0 p-7 text-[var(--color-cream)]">
                <p className="btn-label text-[var(--color-gold)]">{r.location}</p>
                <h3 className="mt-2 font-serif text-3xl">{r.title}</h3>
                <p className="mt-1 text-sm opacity-90">{r.date} · {r.price}</p>
              </div>
            </motion.article>
          ))}
        </div>
        <LotusDivider />
      </div>
    </section>
  );
}