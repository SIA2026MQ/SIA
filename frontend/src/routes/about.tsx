import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Instagram, Youtube, Facebook, MessageCircle, Sparkles, BookOpen, Users } from "lucide-react";
import { Lotus, LotusDivider, Mandala } from "@/components/decorative";
import { SectionHeading, SiaButton } from "@/components/sia-ui";
import { useCounter } from "@/hooks/use-counter";
import { GALLERY_IMAGES } from "@/lib/sia-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us · The Source of Our Work · SIA" },
      { name: "description", content: "What we do, what we believe, and how to walk with us. The pillars of Shifting Into Awareness." },
      { property: "og:title", content: "About SIA · The Source of Our Work" },
      { property: "og:description", content: "What we do, what we believe, and how to walk with us." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <Hero />
      <WhatWeDo />
      <Stats />
      <Philosophy />
      <Approach />
      <SocialConnections />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-cream)] pt-32 pb-20">
      <Lotus className="pointer-events-none absolute right-0 -bottom-20 h-[420px] w-[420px] text-[var(--color-purple)] opacity-[0.05]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="btn-label text-[var(--color-gold)]">About SIA</p>
        <h1 className="mt-5 font-serif italic text-5xl sm:text-6xl text-[var(--color-purple)] leading-[1.05]">
          The Source of Our Work
        </h1>
        <p className="mt-7 text-lg text-[var(--color-text-mid)] max-w-2xl mx-auto leading-relaxed">
          Everything SIA offers — the satsangs, retreats, courses, and writings — flows from a single conviction: that awakening is the most natural, intimate possibility of being human.
        </p>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    title: "Live Gatherings",
    text: "Weekly free satsangs and live webinars that anchor the global sangha in the rhythm of practice.",
    image: GALLERY_IMAGES[0].src,
    icon: Sparkles,
  },
  {
    title: "Living Scripture",
    text: "Verse-by-verse commentary on the great Vedic, Yogic, and contemplative texts — read as mirrors of the Self.",
    image: GALLERY_IMAGES[3].src,
    icon: BookOpen,
  },
  {
    title: "The Sangha",
    text: "A worldwide community of seekers, walking the Pathless Path together with honesty and reverence.",
    image: GALLERY_IMAGES[5].src,
    icon: Users,
  },
];

function WhatWeDo() {
  return (
    <section className="bg-[var(--color-peach)] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-24">
        <SectionHeading eyebrow="Our Pillars" title="What We Do" />
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className={`grid gap-10 lg:grid-cols-2 items-center ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl border-2 border-[var(--color-gold)]" />
              <img src={p.image} alt={p.title} className="relative aspect-[4/3] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
            </div>
            <div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-purple)] text-[var(--color-cream)] mb-5">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl text-[var(--color-purple)] leading-tight">{p.title}</h3>
              <p className="mt-4 text-lg text-[var(--color-text-mid)] leading-relaxed">{p.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: 500, suffix: "+", label: "Seekers Guided" },
    { value: 100, suffix: "+", label: "Satsangs Hosted" },
    { value: 12, suffix: "+", label: "Retreat Programs" },
    { value: 40, suffix: "+", label: "Countries Reached" },
  ];
  return (
    <section className="bg-[var(--color-cream)] py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-center">
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { value: v, ref } = useCounter(value);
  return (
    <div>
      <p className="font-serif text-5xl sm:text-6xl text-[var(--color-purple)]">
        <span ref={ref}>{v}</span>
        <span className="text-[var(--color-gold)]">{suffix}</span>
      </p>
      <p className="mt-2 btn-label text-[var(--color-text-mid)]">{label}</p>
    </div>
  );
}

function Philosophy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "20%"]);
  return (
    <section ref={ref} className="relative overflow-hidden h-[80vh] min-h-[520px] grid place-items-center">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1800&q=70" alt="" className="h-[120%] w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-[var(--color-purple)]/75" />
      </motion.div>
      <div className="relative px-6 max-w-4xl text-center text-[var(--color-cream)]">
        <Lotus className="mx-auto h-12 w-12 text-[var(--color-gold)]" />
        <p className="mt-6 font-serif italic text-3xl sm:text-5xl leading-snug">
          "There is no path to the Self. There is only the dropping of every path that pretends to lead away from it."
        </p>
        <div className="gold-divider mt-8 max-w-xs mx-auto" />
        <p className="mt-4 btn-label text-[var(--color-gold)]">— Jake Light</p>
      </div>
    </section>
  );
}

function Approach() {
  const items = [
    { title: "Direct Experience", text: "We trust the seeker. Every teaching points back to your own awareness." },
    { title: "Tradition With Freedom", text: "Rooted in classical lineages, free of dogma or sectarian boundary." },
    { title: "Embodied Practice", text: "The body is the temple. Awakening must be lived, not just understood." },
  ];
  return (
    <section className="bg-[var(--color-peach)] py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <SectionHeading eyebrow="Our Way" title="How We Walk Together" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="hover-lift rounded-2xl bg-white p-8 shadow-card"
            >
              <span className="font-serif text-5xl text-[var(--color-gold)]/70">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-serif text-2xl text-[var(--color-purple)]">{it.title}</h3>
              <p className="mt-3 text-[var(--color-text-mid)] leading-relaxed">{it.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialConnections() {
  const socials = [
    { icon: Instagram, name: "Instagram", handle: "@shiftingintoawareness", count: "48.2K", href: "#" },
    { icon: Youtube, name: "YouTube", handle: "Jake Light · SIA", count: "32.5K", href: "#" },
    { icon: Facebook, name: "Facebook", handle: "Shifting Into Awareness", count: "21.8K", href: "#" },
    { icon: MessageCircle, name: "WhatsApp", handle: "Sangha Channel", count: "14.6K", href: "#" },
  ];
  return (
    <section className="relative overflow-hidden bg-[var(--color-cream)] py-24">
      <Mandala className="pointer-events-none absolute -right-40 -bottom-40 w-[600px] text-[var(--color-purple)] opacity-[0.05]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading eyebrow="Stay Connected" title="Walk With the Sangha" subtitle="Follow Jake's daily reflections, satsang clips, and announcements wherever you spend your time." />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {socials.map((s, i) => (
            <motion.a
              key={s.name}
              href={s.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="hover-lift group flex items-center gap-4 rounded-2xl bg-white p-6 shadow-card"
            >
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-purple-pale)] text-[var(--color-purple)] group-hover:bg-[var(--color-purple)] group-hover:text-[var(--color-cream)] transition-colors">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--color-text-dark)]">{s.name}</p>
                <p className="text-xs text-[var(--color-text-mid)]">{s.handle}</p>
                <p className="mt-1 font-serif text-lg text-[var(--color-purple)]">{s.count} <span className="text-xs font-sans text-[var(--color-text-mid)]">followers</span></p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="font-serif text-2xl text-[var(--color-purple)] mb-6">Latest from Instagram</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GALLERY_IMAGES.map((img) => (
              <a key={img.src} href="#" className="group block aspect-square overflow-hidden rounded-md">
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              </a>
            ))}
          </div>
        </div>

        <LotusDivider />

        <div className="text-center">
          <Link to="/contact"><SiaButton>Reach Out</SiaButton></Link>
        </div>
      </div>
    </section>
  );
}
