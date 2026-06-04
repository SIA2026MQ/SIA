import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom"; 
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Play } from "lucide-react";

// Validated asset imports from your directory structure
import heroSanctuary from "@/assets/hero-video3.mp4";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Framer-motion scroll parallax values for foreground elements
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  // Mocked state so the layout works perfectly. 
  const dbUser = null; 
  const loading = false;

  useEffect(() => {
    if (!heroRef.current || !contentRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Smooth tracking shift using GSAP ScrollTrigger
    const tween = gsap.to(contentRef.current, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        scrub: true,
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="section-odd relative min-h-[100dvh] overflow-hidden pt-24 md:pt-32"
    >
      {/* ========================================================================= */}
      {/* BACKGROUND LAYER: Full Video Ambient Flow                                 */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 bg-[#1a0b2e]">
        <video
          src={heroSanctuary} 
          className="h-full w-full object-cover opacity-90" 
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
      
      {/* Smooth dark overlay over video */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/40 mix-blend-multiply" />

      {/* FIX: White Shadow Gradient at the Bottom */}
      {/* This creates a smooth fade from transparent to the background color of the next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-40 z-10 bg-gradient-to-t from-[var(--color-cream)] to-transparent" />
      {/* If your next section is pure white, change 'from-[var(--color-cream)]' to 'from-white' */}

      {/* ========================================================================= */}
      {/* FOREGROUND LAYOUT (CENTERED & RESPONSIVE)                                 */}
      {/* ========================================================================= */}
      <div 
        ref={contentRef} 
        className="sia-container relative z-20 flex flex-col items-center justify-center text-center min-h-[calc(100dvh-120px)] pb-12 md:pb-20 px-4 sm:px-6"
      >
        <motion.div style={{ y: fgY }} className="w-full max-w-4xl space-y-5 sm:space-y-6 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
              Welcome to the Pathless Path
            </p>
          </motion.div>

          <motion.h1
            className="font-serif italic font-semibold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] sm:leading-[1.05] text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            Awakening<br /> the Light Within
          </motion.h1>

          <motion.p
            className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-white/90 leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
          >
            Jake Light · Spiritual Guide · The Pathless Path. A sanctuary for sincere seekers — satsangs, scriptures, and the inner science of awakening.
          </motion.p>

          {/* Core Interactive Actions */}
          <motion.div
            className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            {!loading && dbUser ? (
              <>
                <Link to="/my-learning" className="w-full sm:w-auto">
                  <button className="sia-button-primary w-full sm:w-auto justify-center text-white gap-2 flex items-center bg-[#600694] hover:bg-[#4a0473] px-6 py-3.5 sm:py-3 rounded-full text-sm sm:text-base">
                    Donate <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <button className="sia-button-outline w-full sm:w-auto justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#600694] uppercase tracking-widest transition-colors duration-300 px-6 py-3.5 sm:py-3 text-xs sm:text-sm font-medium">
                    Recommend
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/sia" className="w-full sm:w-auto">
                  <button className="sia-button-primary w-full sm:w-auto justify-center text-white gap-2 flex items-center bg-[#a23adf] hover:bg-[#4a0473] px-6 py-3.5 sm:py-3 rounded-full text-sm sm:text-base">
                    Explore the Journey <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link to="/events" className="w-full sm:w-auto">
                  <button className="sia-button-outline w-full sm:w-auto justify-center rounded-full border border-white text-white hover:bg-white hover:text-[#600694] uppercase tracking-widest transition-colors duration-300 flex items-center px-6 py-3.5 sm:py-3 text-xs sm:text-sm font-medium">
                    <Play className="h-4 w-4 mr-2 inline" /> Watch Free Satsang
                  </button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Quick Feature highlights display cards */}
          <motion.div
            className="grid max-w-2xl mx-auto grid-cols-1 gap-3 pt-6 sm:grid-cols-3 w-full"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              "Daily guided satsang sessions",
              "Live Zoom webinar deep-dives",
              "Applied wisdom for modern life",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/20 bg-black/30 px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium text-white backdrop-blur-md w-full"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}