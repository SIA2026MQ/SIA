import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import jakePortrait from "@/assets/jake.png";

export function AboutTeaser() {
  return (
    <section
      id="journey"
      className="section-even relative overflow-hidden bg-[#f7e7e7] py-20 lg:py-24"
    >
      <div className="sia-container grid items-center gap-12 lg:grid-cols-12">

        {/* LEFT COLUMN - Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5"
        >
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-gold/60 bg-card p-3 lg:max-w-none">
            <img
              src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/jP.jpg"
              alt="Jake Light in contemplative pose"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
              width={1024}
              height={1280}
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* RIGHT COLUMN - Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Section Label */}
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[var(--color-gold-deep)]"></span>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-deep)]">
              About Jake Light
            </p>
          </div>

          {/* Heading */}
          <h2 className="sia-h2">Meet Jake Light</h2>

          {/* Biography */}
          <p className="sia-body text-base  sm:text-xl">
            Jake Light had an exciting journey traversing the landscapes of
            spirituality through all religions, ultimately discovering that
            everything comes from the same One Source. He discovered at a young
            age that he had a lot of familiarity with Vedic teachings and
            eventually learnt that all deep wisdom is there within each of us,
            cultivated through many lifetimes. After having walked the path of
            Kundalini Yoga, Bhakti Yoga, and Raja Yoga, he finally was led to
            Gyana Yoga (path of wisdom). This deep wisdom took him beyond the
            path beyond all paths, which he terms as the "pathless path". He
            today shares with the world the enlightening revelations of the path
            and where it finally leads everyone to. Determined to bring crystal
            clear clarity of the whole journey of a seeker, he finds various
            ways to deliver this to keen seekers.
          </p>

          {/* Quote */}
          <blockquote className="relative rounded-2xl border border-primary/20 bg-card/70 p-6 font-display text-2xl italic text-primary/90">
            <span className="pointer-events-none absolute -left-1 top-0 hidden select-none text-7xl leading-none text-primary/15 sm:block">
              “
            </span>
            All deep wisdom is within each of us.
          </blockquote>

          {/* CTA */}
          <div className="pt-2">
            <Link
              to="/sia?tab=jake"
              className="story-link group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-primary"
            >
              Read Jake's Full Story
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}