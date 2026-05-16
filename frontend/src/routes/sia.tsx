import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import React, { useState } from "react";
import {
  Flame, Heart, Crown, BookOpen, MonitorPlay, Calendar, Video, Mountain, Users, 
  GraduationCap, BookMarked, Eye, Compass, Sparkles, ArrowRight,
  CheckCircle2, Waves, Eraser, Leaf, MapPin,Info
} from "lucide-react";

import { Mandala, Lotus } from "@/components/decorative";
import { SectionHeading } from "@/components/sia-ui";
import { TIMELINE } from "@/lib/sia-data";
import jake from "@/assets/jake.png";

// 1. Define valid Tab IDs
const TABS = [
  { id: "about", label: "About SIA" },
  { id: "jake", label: "Jake Light" },
  { id: "activities", label: "Activities" },
  { id: "mission", label: "Join" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// 2. Define Search Parameter Types
type SIASearchParams = {
  tab?: TabId;
};

export const Route = createFileRoute("/sia")({
  // 3. Validate and provide default search params
  validateSearch: (search: Record<string, unknown>): SIASearchParams => {
    return {
      tab: (search.tab as TabId) || "about",
    };
  },
  head: () => ({
    meta: [
      { title: "About SIA · Shifting Into Awareness" },
      { name: "description", content: "The story of Shifting Into Awareness, Jake Light's journey, our mission, and the activities of the global sangha." },
      { property: "og:title", content: "About SIA · Shifting Into Awareness" },
      { property: "og:description", content: "The story of Shifting Into Awareness, Jake Light's journey, our mission, and the activities of the global sangha." },
    ],
  }),
  component: SIAPage,
});

function SIAPage() {
  // 4. Use TanStack's useSearch and useNavigate
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setTab = (newTab: TabId) => {
    navigate({ search: { tab: newTab }, replace: true });
  };

  return (
    <>
      {/* STICKY TAB NAVIGATION - Now the top of the page */}
      <div className="sticky top-16 lg:top-20 z-30 glass-cream border-y border-[oklch(0.247_0.165_305_/_0.08)]">
        <div className="mx-auto max-w-5xl px-4 overflow-x-auto">
          <div className="relative flex gap-2 py-3 min-w-max mx-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative px-5 py-2.5 btn-label rounded-full transition-colors"
                style={{ color: tab === t.id ? "var(--color-cream)" : "var(--color-purple)" }}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="sia-tab-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-purple)]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          {tab === "about" && <AboutSIA />}
          {tab === "jake" && <JakeLight />}
          {tab === "mission" && <Mission />}
          {tab === "activities" && <Activities />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function AboutSIA() {
  return (
    <>
        <div className="bg-[#FDFBF7] overflow-hidden">
        {/* 1. Header Section: The Vision */}
        <section className="bg-[var(--color-peach)] py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <SectionHeading
              eyebrow="Our Story"
              title="What SIA Stands For"
              subtitle="Three letters that hold a lifetime's discovery — that the shift sought outside is already complete within."
            />
            <div className="mt-10 space-y-6 text-lg text-[var(--color-text-mid)] leading-relaxed text-center">
              <p>
                Shifting Into Awareness is a platform that helps seekers of truth make the shift from ignorance to wisdom, from darkness to light, and from bondage to freedom. We facilitate the transition from the "mind-ego"—dominated by reactive thoughts and past conditioning—to the state of pure presence or the "Self."
              </p>
              <p className="italic font-medium text-[var(--color-purple)]">
                "It’s only when one lives in awareness that one can remain unentangled with the dramas of life, leading to the state of Jeevanamukta (liberated while in the body)."
              </p>
            </div>
          </div>
        </section>

        {/* 2. Key Aspects Section */}
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
            
            {/* Key Aspects Column */}
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="font-serif text-4xl md:text-5xl text-[oklch(0.247_0.165_305)] leading-tight">
                  Key Aspects of <br />
                  <span className="text-[oklch(0.62_0.27_340)]">Shifting Into Awareness</span>
                </h3>
                <div className="h-1 w-20 bg-[oklch(0.78_0.16_82)] rounded-full" />
              </div>

              <div className="space-y-8">
                {[
                  { 
                    title: "Moving from Mind to Presence", 
                    desc: "The core of the practice is shifting the seat of your existence from the constant “doing” and “chatter” of the mind to the “being” of the Self." 
                  },
                  { 
                    title: "Dissolving the “Doer”", 
                    desc: "A major objective is to dissolve the egoic sense of being the “meditator” or “practitioner,” eventually reaching a state where you are unentangled with life’s highs and lows." 
                  },
                  { 
                    title: "Witnessing Consciousness", 
                    desc: "It involves activating the “Inner Guru” and living as an observer of your thoughts and emotions, rather than being controlled by them." 
                  },
                  { 
                    title: "Practical Benefits", 
                    desc: "Supporters of this shift claim it leads to a “neutral and enriching life,” reduces stress and anxiety, and ultimately leads to Self-Realisation." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-[oklch(0.62_0.27_340_/_0.1)] flex items-center justify-center text-[oklch(0.62_0.27_340)] group-hover:bg-[oklch(0.62_0.27_340)] group-hover:text-white transition-all duration-300">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[oklch(0.247_0.165_305)] mb-2 uppercase tracking-[0.15em] text-xs">
                        {item.title}
                      </h4>
                      <p className="text-[oklch(0.34_0.09_305)] leading-relaxed text-base md:text-lg">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives Column */}
            <div className="relative lg:pl-10">
              <div className="space-y-10">
                <h3 className="font-serif text-3xl text-black flex items-center gap-4">
                  <span className="h-px w-8 bg-black/20" />
                  Objectives
                </h3>

                <ul className="grid gap-5">
                  {[
                    "To begin living in awareness",
                    "Benefit of the power of Satsang to keep you persistent",
                    "Purging, releasing & cleansing the inner-core",
                    "Breakdown of all beliefs, concepts, conditioning",
                    "Begin living as not the body, but divine presence",
                    "Begin the process of knowing who you are",
                    "Meditate on deeper wisdom of higher scriptures",
                    "Learn the highest wisdom & reflect on it",
                    "Annihilating all doership, living in total divine flow",
                    "Nothing to Do but Abide in the Self"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 text-black/70 group">
                      <span className="text-[oklch(0.78_0.16_82)] font-bold text-lg leading-none transition-transform group-hover:scale-125">•</span>
                      <span className="text-base md:text-lg font-medium transition-colors group-hover:text-black">{text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 pt-10 border-t border-black/10 relative">
                  <div className="absolute -top-px left-0 w-20 h-px bg-[oklch(0.62_0.27_340)]" />
                  <p className="text-xl md:text-2xl font-serif italic text-black leading-snug">
                    "The main goal is to finally realise that I am moving around in this human suit, having a human experience for the time being."
                  </p>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.4em] font-black text-black/30">
                    Foundational Truth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. The 5 Phases (Milestones) Section */}
        <section className="bg-[var(--color-cream)] py-24">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHeading 
              eyebrow="The Basic Theme" 
              title="The Phases of Awareness" 
              align="center" 
            />
            
            <div className="mt-16 space-y-24">
              {[
                { 
                  phase: "PHASE 1", 
                  title: "Awakening & Clarity", 
                  subtitle: "the awakening",
                  text: "This is the beginning of seeking when a seeker experiences awakening. The awakening usually involves an incident or situation where one begins questioning the experiences of life and the meaning and purpose of life. This phase is full of doubts and one keeps seeking the truth across all the paths." 
                },
                { 
                  phase: "PHASE 2", 
                  title: "Reflection on the Real", 
                  subtitle: "the learning",
                  text: "On seeking multiple paths, knowledge presents itself until the seeker clarifies all doubts through those who realized the truth or authentic scriptures. Finally, one comes in line with the knowing that one's ego is the cause of all bondage and the goal is to realize this ignorance by abiding more in one's true Self." 
                },
                { 
                  phase: "PHASE 3", 
                  title: "Destruction of Concepts", 
                  subtitle: "the purging",
                  text: "The seeker makes all efforts to purge out all unwanted clutter gathered during lifetimes in ignorance. While most cleansing happens, one realizes that the greatest obstacle to realizing the Self is the removal of concepts that were gathered with the ignorant projections of the mind." 
                },
                { 
                  phase: "PHASE 4", 
                  title: "In the World, Not of It", 
                  subtitle: "the blooming",
                  text: "In this stage, though still bound by ego and its false projections, one becomes certain that liberation is not by living in the mind/ego but by living more in one's true nature. The seeker begins living more and more in one's own presence rather than the false identity one carries." 
                },
                { 
                  phase: "PHASE 5", 
                  title: "Abiding in the Self", 
                  subtitle: "the liberation",
                  text: "Grace magnetically absorbs the soul back into the Source. The soul lives in freedom in the body while going about regular activities. While previous phases involve active participation, this stage is of pure grace—there is nothing worth DOING, only pure BEING and surrender to 'THAT'." 
                }
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="max-w-3xl mx-auto text-center"
                >
                  <p className="font-bold text-[var(--color-gold)] text-xs tracking-[0.3em] mb-2">
                    {m.phase}
                  </p>
                  <h4 className="font-serif text-3xl md:text-4xl text-[var(--color-text-dark)]">
                    {m.title}
                  </h4>
                  <p className="text-[var(--color-gold)] text-[10px] uppercase tracking-[0.25em] font-black mb-6 italic opacity-80">
                    {m.subtitle}
                  </p>
                  <p className="text-base md:text-lg text-[var(--color-text-mid)] leading-relaxed">
                    {m.text}
                  </p>
                  {i !== 4 && (
                    <div className="mt-12 w-12 h-px bg-[var(--color-gold)]/30 mx-auto" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Three-Image Feature Section (Bottom) */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="font-serif text-4xl text-[var(--color-purple)] mb-4">The Journey in Presence</h3>
              <p className="text-[var(--color-text-mid)]">Transforming the external journey through the inner exploration of life.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000" 
                  alt="Inner Awakening" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-purple)]/70 to-transparent flex items-end p-8">
                  <span className="text-white font-serif text-xl">Inner Awakening</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1 }} 
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl md:translate-y-8"
              >
                <img 
                  src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000" 
                  alt="Purification" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-purple)]/70 to-transparent flex items-end p-8">
                  <span className="text-white font-serif text-xl">Purification</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 }} 
                className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1499209974431-9dac3adaf471?q=80&w=1000" 
                  alt="Divine Flow" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-purple)]/70 to-transparent flex items-end p-8">
                  <span className="text-white font-serif text-xl">Divine Flow</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function JakeLight() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);

  const paths = [
    { icon: Flame, name: "Kundalini Yoga", desc: "The science of awakening the dormant Shakti." },
    { icon: Heart, name: "Bhakti Yoga", desc: "The path of devotional surrender and love." },
    { icon: Crown, name: "Raj Yoga", desc: "The royal eight-limbed path of inner mastery." },
    { icon: BookOpen, name: "Gyana Yoga", desc: "The path of discriminative wisdom and self-inquiry." },
  ];

  return (
    <>
      <section ref={ref} className="relative bg-[#FDFBF7] py-24 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          
          {/* 1. Header Section: Title and Subtitle at the Top */}
          <div className="mb-12 border-b border-[#D4AF37]/10 pb-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-3">
              The Teacher
            </p>
            <h2 className="font-serif text-5xl md:text-7xl text-[#2D1A4A] leading-tight">
              Jake Light
            </h2>
            <p className="mt-4 text-xl italic text-[#D4AF37] font-medium">
              "It all began with exploration of the inner self!"
            </p>
          </div>

          {/* 2. Main Content Area with Image Wrapping */}
          <div className="block">
            
            {/* Centered Image Frame that floats left on larger screens */}
            <div className="float-none lg:float-left mb-8 lg:mr-12 lg:mb-10 w-full lg:w-[40%]">
              <div className="relative p-3 rounded-[2.5rem] border-2 border-[#D4AF37]/20 bg-white/50 backdrop-blur-sm shadow-xl">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <img
                    src={jake}
                    alt="Jake Light"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Language Tags inside the frame */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center pb-3">
                  {['English', 'Hindi', 'Malayalam', 'Marathi', 'Kannada'].map((lang) => (
                    <span 
                      key={lang} 
                      className="px-4 py-1.5 bg-[#FCE7F3] rounded-full text-[9px] font-black text-[#C026D3] uppercase tracking-widest shadow-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Wrapping Text Content */}
            <div className="text-[#4A4A4A] leading-[1.8] text-lg space-y-6">
              <p>
                Jake Light is an Inner Journey Coach, helping seekers in their inward journey, helping them navigate through life without forgetting their main goal of life. He has been a wanderer, having travelled extensively to multiple remote locations in India, including forests, mountains, caves, Siddha locations and spent decades meditating at Jeeva Samadhis, meeting innumerable saints, mystics and enlightened masters throughout his life.
              </p>
              
              <p>
                Firmly surrendered to the natural flow of life, he follows the pathless path – the middle path – and teaches others through his own life experiences. He has a deep insight into all the deep scriptures of every religion and professes the same through practical examples. He believes in living a simple life of meaningful existence, deeply emphasizing always that spirituality is very simple but we complicate it.
              </p>

              <div className="py-6 my-6 border-l-4 border-[#D000B8] pl-8 bg-[#D000B8]/5 rounded-r-2xl clear-right lg:clear-none">
                <p className="font-bold text-[#D000B8] text-xl leading-snug">
                  He has a no-nonsense approach towards inner evolution, without clinging to the endless philosophies, methodologies and props of religion, cults, traditions and spirituality. One can easily shift into deep awareness in his presence, practices and teachings.
                </p>
              </div>

              <h3 className="font-serif text-4xl text-[#D000B8] pt-6 mb-4">Know More about Jake</h3>
              
              <p>
                Jake was born in a Roman Catholic family and since childhood loved Christ but could not relate with any Orthodox things. Always aloof and in his own world, something always told him that there is a larger existence and meaning to life.
              </p>
              
              <p>
                Music and poetry naturally flowed out of him, and his passions were filled with life and creativity. Sufferings were immense in every stage of life, which once, in adulthood, went to the extreme of devastating him to the point where alcohol and cigarettes badly gripped him. 
              </p>
              
              <p>
                Through those moments of despair, grace shined upon him. He found himself being led to the Mahasamadhi of a great Mystic named Nityananda, in Ganeshpuri, after which his whole life and perspective changed 180 degrees.
              </p>

              <p>
                From 2008 till now, ‘That One’ led him to many places, mystics and Masters. He had the blessing of living with and serving his master, Shri. Avadhoot Shivanand, for close to 7 years. Later, he dissolved the identities created with names by preferring to use the name <strong>‘Jake Light’</strong> (Jake being the short-form of Jacob and Light symbolizing the child of Light).
              </p>

              {/* Video Podcast Section - Full Width below the wrap */}
              <div className="mt-16 mb-12 p-8 md:p-12 bg-white rounded-[3rem] border border-[#D4AF37]/20 shadow-xl text-center clear-both">
                <div className="flex items-center justify-center gap-3 mb-4">
                 
                  <h4 className="font-serif text-3xl text-[#D000B8]">Video Podcast</h4>
                </div>
                <p className="text-base mb-10 italic text-gray-500 max-w-lg mx-auto">
                  This video podcast where Sukhdev Virdee interviewed him gives some insights into his life.
                </p>
                <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black shadow-2xl max-w-3xl mx-auto border-8 border-white">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/8lwHB1X1PG0" 
                    title="Jake Light Interview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <p className="clear-both pt-4">
                He was also blessed to have physical presence and blessings of 11 Avadhuts in his lifetime. After multiple enlightening awakenings in Arunachala, Tiruvannamalai, he spontaneously began sharing the wisdom with those seekers who longed for nothing other than the truth.
              </p>

              <p className="font-bold text-[#2D1A4A]">
                His prime focus is to help everyone turn within and realize that there is nothing really to do or run behind, for their true liberated nature itself is pure and free.
              </p>


            </div>
          </div>
        </div>
      </section>
    </>
  );
}


function Activities() {
  const items = [
    { 
      icon: Calendar, 
      title: "Free Zoom Sessions", 
      text: "Private satsangs conducted almost every other day at 9 pm IST to keep you connected to your true purpose.", 
      to: "/events" 
    },
    { 
      icon: MonitorPlay, 
      title: "Live Webinars", 
      text: "Life-transformative online courses covering Purification and Ascension to help you live in pure awareness.", 
      to: "/events" 
    },
    { 
      icon: Mountain, 
      title: "Retreats", 
      text: "Power-packed immersions in energetic locations like Tiruvannamalai and Kanhangad for quantum leaps in consciousness.", 
      to: "/events" 
    },
    { 
      icon: BookOpen, 
      title: "Online Courses", 
      text: "Recorded webinars and deep reflections on higher scriptures like the Avadhuta Gita and Shiva Sutras.", 
      to: "/courses" 
    },
  ];

  return (
    <div className="bg-[var(--color-cream)]">
      {/* 1. Main Activities Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading eyebrow="What We Offer" title="Activities of the Sangha" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(({ icon: Icon, title, text, to }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link to={to} className="hover-lift block rounded-2xl bg-white p-7 shadow-card group h-full">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-purple-pale)] text-[var(--color-purple)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-[var(--color-purple)]">{title}</h3>
                  <p className="mt-2 text-[var(--color-text-mid)] leading-relaxed text-sm">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-purple)]">
                    Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Detailed Program Content */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 space-y-20">
          
          {/* Zoom & Webinars Section */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="font-serif text-3xl text-[var(--color-purple)]">Private Zoom Satsangs</h3>
              <p className="text-[var(--color-text-mid)] leading-relaxed">
                Join our WhatsApp list to receive personal links to private sessions conducted at 9 pm IST. These include Weekly Clarity Sessions where seekers can ask doubts directly to bring total clarity to their journey.
              </p>
              <div className="p-6 bg-white rounded-2xl border border-[var(--color-purple)]/10">
                <h4 className="font-bold text-[var(--color-purple)] mb-4 uppercase tracking-widest text-xs">Purification Webinars</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-[var(--color-text-mid)]">
                  <span>• Releasing Karmic Debts</span>
                  <span>• Inner Child Healing</span>
                  <span>• Inner Alchemy</span>
                  <span>• Purge & Reset Your Life</span>
                  <span>• New Beginnings</span>
                  <span>• Unclutter Beliefs</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-serif text-3xl text-[var(--color-purple)]">Ascension Path</h3>
              <p className="text-[var(--color-text-mid)] leading-relaxed">
                Jake Light experientially believes that Purification and Ascension must go hand-in-hand for an evolving seeker. These webinars focus on deepening awareness and returning to the Source.
              </p>
              <div className="p-6 bg-[var(--color-purple)] rounded-2xl text-white shadow-xl">
                <h4 className="font-bold text-[var(--color-gold)] mb-4 uppercase tracking-widest text-xs">Ascension Courses</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm opacity-90">
                  <span>• Deepening Awareness</span>
                  <span>• Power of Grace</span>
                  <span>• Noise to Silence</span>
                  <span>• Living in Presence</span>
                  <span>• Appo Deepo Bhava</span>
                  <span>• Meditate on the Self</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retreats Detailed Section */}
          <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-[var(--color-purple)]/5">
            <div className="flex items-center gap-4 mb-10">
              <MapPin className="h-8 w-8 text-[var(--color-gold)]" />
              <h3 className="font-serif text-4xl text-[var(--color-purple)]">Residential Retreats</h3>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-6">
                <h4 className="font-serif text-2xl text-[var(--color-purple)]">Tiruvannamalai (Tamil Nadu)</h4>
                <p className="text-sm text-[var(--color-text-mid)] italic">Learning to live a life of awareness by tapping into the consciousness of the holy Arunachala hill.</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-text-mid)]">
                  <ul className="space-y-2">
                    <li className="font-bold text-[var(--color-purple)] uppercase text-[10px] tracking-widest">Routines</li>
                    <li>• Trekking Arunachala</li>
                    <li>• Cave Meditations</li>
                    <li>• Giripradakshina</li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="font-bold text-[var(--color-purple)] uppercase text-[10px] tracking-widest">Objectives</li>
                    <li>• Moving from Doing to Being</li>
                    <li>• Activate the Inner Guru</li>
                    <li>• Language of Silence</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-serif text-2xl text-[var(--color-purple)]">Kanhangad (Kerala)</h4>
                <p className="text-sm text-[var(--color-text-mid)] italic">Meditation at the 43 caves built by Bhagwan Nityananda for deep release and purging.</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-text-mid)]">
                  <ul className="space-y-2">
                    <li className="font-bold text-[var(--color-purple)] uppercase text-[10px] tracking-widest">Activities</li>
                    <li>• Guruvan Hill Meditation</li>
                    <li>• Papanashini Bathing</li>
                    <li>• Pancha Tatva Meditation</li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="font-bold text-[var(--color-purple)] uppercase text-[10px] tracking-widest">Goals</li>
                    <li>• Attain Spiritual Clarity</li>
                    <li>• Nityananda Grace</li>
                    <li>• Release Inner Clutter</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Scripture Courses Summary */}
          <div className="text-center space-y-8">
            <h3 className="font-serif text-3xl text-[var(--color-purple)]">Deep Reflection on Higher Scriptures</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {["Avadhuta Gita", "Chidakasha Gita", "Upadesa Saram", "Yog Vashisht", "Devikallotara", "Sarva Jnanottara"].map((s) => (
                <span key={s} className="px-6 py-3 bg-white rounded-full border border-[var(--color-gold)]/20 text-sm font-bold text-[var(--color-purple)] shadow-sm">
                  {s}
                </span>
              ))}
            </div>
           
          </div>

        </div>
      </section>
    </div>
  );
}

function Mission() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    city: "",
    state: "",
    country: "India",
    whatsapp: "",
    spiritualPractice: "",
    reachSource: "",
    agreement: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="bg-[#FDFBF7] overflow-hidden font-sans">
      {/* 1. HERO SECTION - The Vision */}
      <section className="bg-white pt-32 pb-20 border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="uppercase tracking-[0.3em] text-xs font-black text-[#B89B5E] mb-6"
          >
            Our Mission & Join
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl text-[#1C0F2E] leading-tight mb-8"
          >
            What SIA Stands For
          </motion.h1>
          <div className="h-1.5 w-24 bg-[#B89B5E] mx-auto rounded-full mb-10" />
          <p className="text-xl md:text-2xl text-[#3C3C3C] leading-relaxed max-w-3xl mx-auto">
            "Three letters that hold a lifetime's discovery — that the shift sought outside is already complete within."
          </p>
        </div>
      </section>

      {/* 2. KEY ASPECTS - About SIA Format */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            <h3 className="font-serif text-4xl md:text-5xl text-[#1C0F2E] leading-tight">
              Core Principles of <br />
              <span className="text-[#4B0082]">Pure Awareness</span>
            </h3>
            
            <div className="space-y-10">
              {[
                { title: "Moving from Mind to Presence", desc: "Shifting the seat of existence from the constant “doing” of the mind to the “being” of the Self." },
                { title: "Dissolving the “Doer”", desc: "Dissolving the egoic sense of being the “meditator” to reach a state of total unentanglement." },
                { title: "Witnessing Consciousness", desc: "Activating the “Inner Guru” to live as an observer of thoughts rather than being controlled by them." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full bg-[#4B0082]/5 flex items-center justify-center text-[#4B0082] group-hover:bg-[#4B0082] group-hover:text-white transition-all duration-500">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-[#1C0F2E] mb-2 uppercase tracking-widest text-xs">{item.title}</h4>
                    <p className="text-[#3C3C3C] leading-relaxed text-lg">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* JOIN INFO BOX */}
          <div className="bg-[#1C0F2E] p-10 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4B0082] blur-[100px] opacity-20 -mr-32 -mt-32" />
            <h3 className="font-serif text-3xl mb-8 relative z-10">Becoming a part of the SIA Family</h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex gap-4">
                <span className="text-[#B89B5E] font-bold">01.</span>
                <p className="text-gray-300">Membership begins automatically upon attending any webinar or course.</p>
              </li>
              <li className="flex gap-4">
                <span className="text-[#B89B5E] font-bold">02.</span>
                <p className="text-gray-300">New seekers must complete the <span className="text-white font-bold italic">Basic Course</span> to be eligible for daily satsangs.</p>
              </li>
              <li className="flex gap-4">
                <span className="text-[#B89B5E] font-bold">03.</span>
                <p className="text-gray-300">Internal communication is handled via the secure Arratai App for total privacy.</p>
              </li>
            </ul>
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-[#B89B5E] text-xs font-black uppercase tracking-[0.3em]">Foundational Truth</p>
              <p className="mt-4 text-xl font-serif italic text-white/90">"The main goal is to realise that I am having a human experience for the time being."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHATSAPP FORM - Integrated Design */}
      <section id="opt-in" className="py-24 bg-[#F9F7F2]">
        <div className="mx-auto max-w-4xl bg-white p-8 md:p-20 shadow-[0_30px_70px_rgba(0,0,0,0.04)] border border-gray-100 rounded-[2.5rem]">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#1C0F2E]">WhatsApp Opt In</h2>
            <p className="text-gray-400 mt-4 uppercase tracking-widest text-xs">Join the private broadcast list</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {["Name", "Age", "Email", "City", "State"].map((label) => (
                <div key={label} className="flex flex-col gap-3 group">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#4B0082] transition-colors">
                    {label} *
                  </label>
                  <input
                    type={label === "Age" ? "number" : label === "Email" ? "email" : "text"}
                    name={label.toLowerCase()}
                    required
                    className="w-full pb-3 border-b border-gray-200 bg-transparent focus:border-[#4B0082] outline-none transition-all text-lg font-medium"
                    onChange={handleChange}
                  />
                </div>
              ))}
              
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Country *</label>
                <select name="country" className="w-full pb-3 border-b border-gray-200 bg-transparent outline-none text-lg font-medium appearance-none" onChange={handleChange}>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Spiritual Practice *</label>
              <textarea
                name="spiritualPractice"
                rows={4}
                required
                className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#4B0082]/10 outline-none transition-all text-lg resize-none"
                onChange={handleChange}
                placeholder="What is your current practice?"
              />
            </div>

            <div className="space-y-6">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">How did you reach here? *</label>
              <div className="grid sm:grid-cols-2 gap-4">
                {["Friend Recommendation", "YouTube Channel", "Facebook", "Instagram", "Search Engine", "Event"].map((opt) => (
                  <label key={opt} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all group">
                    <input type="radio" name="reachSource" value={opt} required className="h-5 w-5 accent-[#4B0082]" onChange={handleChange} />
                    <span className="font-bold text-sm text-gray-600 group-hover:text-[#1C0F2E]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-8 rounded-3xl border border-[#B89B5E]/20 space-y-6">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-[#B89B5E]" />
                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#B89B5E]">Membership Agreement</h4>
              </div>
              <p className="text-sm text-[#3C3C3C] leading-relaxed italic">
                I understand that to become a member I would need to do the basic course, after which I become eligible for daily satsangs. Monthly fees apply from May 2026.
              </p>
              <div className="flex flex-col gap-3">
                {["I agree", "I am not ready yet"].map((status) => (
                  <label key={status} className="flex items-center gap-3 font-bold text-[#1C0F2E] text-sm cursor-pointer">
                    <input type="radio" name="agreement" value={status} required className="h-5 w-5 accent-[#4B0082]" onChange={handleChange} />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-[#1C0F2E] text-white font-black py-6 rounded-2xl hover:bg-[#4B0082] transition-all uppercase tracking-[0.3em] text-xs shadow-xl"
              >
                Submit and Request Access
              </motion.button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}