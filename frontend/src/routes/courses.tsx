import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import ReactPlayer from "react-player";
import { Star, Clock, Layers, X, Play, ShoppingBag, Check } from "lucide-react";
import { Mandala } from "@/components/decorative";
import { SectionHeading } from "@/components/sia-ui";
import { type SIACourse, type CourseCategory } from "@/lib/sia-data";
import { useCourses } from "@/lib/admin-store";
import { useCart, makeCartItem } from "@/lib/cart";
import { cn } from "@/lib/utils";

// 1. Define Search Parameter Types
type CoursesSearchParams = {
  cat?: CourseCategory;
};

export const Route = createFileRoute("/courses")({
  // 2. Validate the 'cat' parameter from the URL
  validateSearch: (search: Record<string, unknown>): CoursesSearchParams => {
    return {
      cat: (search.cat as CourseCategory) || "practices",
    };
  },
  head: () => ({
    meta: [
      { title: "Courses · Practices & Scriptures · SIA" },
      { name: "description", content: "Transform from within. Online courses in Kundalini, meditation, pranayama, and the great Vedic scriptures." },
      { property: "og:title", content: "Courses · SIA" },
      { property: "og:description", content: "Transform from within. Online courses in Kundalini, meditation, pranayama, and the great Vedic scriptures." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  // 3. Get the active category from the URL
  const { cat } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [active, setActive] = useState<SIACourse | null>(null);
  
  const COURSES = useCourses();

  // 4. Update the URL when a tab is clicked
  const setCat = (newCat: CourseCategory) => {
    navigate({ search: { cat: newCat }, replace: true });
  };

  const list = useMemo(() => COURSES.filter((c) => c.category === cat), [cat, COURSES]);

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-cream)] pt-32 pb-16">
        <Mandala className="absolute -left-40 -top-20 w-[700px] text-[var(--color-purple)] opacity-[0.06] spin-slow" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="btn-label text-[var(--color-gold)]">Courses</p>
          <h1 className="mt-5 font-serif italic text-5xl sm:text-6xl text-[var(--color-purple)] leading-[1.05]">
            Transform From Within
          </h1>
          <p className="mt-6 text-lg text-[var(--color-text-mid)] max-w-2xl mx-auto">
            Self-paced and live programs in the inner science and the living scriptures.
          </p>
        </div>

        <div className="mt-12 flex justify-center px-4">
          <div className="relative inline-flex rounded-full bg-white shadow-card p-1.5">
            {[
              { id: "practices", label: "SIA Practices" },
              { id: "scriptures", label: "Scriptures" },
            ].map((t) => {
              const isActive = cat === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setCat(t.id as CourseCategory)}
                  className="relative px-7 py-2.5 btn-label rounded-full transition-colors"
                  style={{ color: isActive ? "var(--color-cream)" : "var(--color-purple)" }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="course-tab-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-purple)]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={cn("py-20 transition-colors duration-500", cat === "practices" ? "bg-[var(--color-peach)]" : "bg-[var(--color-cream)]")}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow={cat === "practices" ? "Embodied" : "Living Wisdom"}
            title={cat === "practices" ? "The Inner Science" : "Sacred Scriptures"}
            subtitle={
              cat === "practices"
                ? "Kundalini kriya, pranayama, meditation, and yoga — taught with traditional rigour."
                : "Verse-by-verse commentaries on the Gita, Upanishads, Yoga Sutras, and the Vedas."
            }
          />
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={cat}
              layout 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
            >
              {list.map((c, i) => (
                <motion.button
                  layout
                  key={c.id}
                  onClick={() => setActive(c)}
                  className="hover-lift group flex flex-col rounded-2xl bg-white shadow-card overflow-hidden text-left"
                >
                  {c.category === "scriptures" && <span className="h-1.5 w-full bg-[var(--color-cream)]" />}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={c.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <span className="absolute top-3 left-3 rounded-full bg-[var(--color-cream)]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">{c.tag}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-xl text-[var(--color-purple)] leading-snug line-clamp-2">{c.title}</h3>
                    <p className="mt-2 text-sm text-[var(--color-text-mid)] line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-mid)]">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                      <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {c.lessons} lessons</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-semibold text-[var(--color-purple)]">{c.price}</span>
                      <span className="flex items-center gap-1 text-[var(--color-gold)]">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-[var(--color-text-dark)] text-sm">{c.rating}</span>
                      </span>
                    </div>
                    <CourseCardCTA course={c} onView={() => setActive(c)} />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CourseDrawer course={active} onClose={() => setActive(null)} />
    </>
  );
}

function CourseCardCTA({ course, onView }: { course: SIACourse; onView: () => void }) {
  const { has, add } = useCart();
  const inCart = has(course.id);
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onView(); }}
        className="rounded-full border-2 border-[var(--color-purple)] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)] transition-colors"
      >
        Details
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!inCart) add(makeCartItem({ id: course.id, title: course.title, price: course.price, image: course.image, type: "course", tag: course.tag }));
        }}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all",
          inCart
            ? "bg-[var(--color-gold)]/20 text-[var(--color-purple)]"
            : "bg-gradient-brand text-white hover:opacity-95",
        )}
      >
        {inCart ? <><Check className="h-3 w-3" /> In Cart</> : <><ShoppingBag className="h-3 w-3" /> Add</>}
      </button>
    </div>
  );
}

function CourseDrawer({ course, onClose }: { course: SIACourse | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {course && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 z-[80] h-full w-full max-w-2xl overflow-y-auto bg-[var(--color-cream)] shadow-2xl"
          >
            <button
              onClick={onClose}
              className="sticky top-4 left-full ml-[-3.5rem] z-10 grid h-10 w-10 place-items-center rounded-full bg-white shadow-card text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)] transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video bg-black -mt-14">
              <ReactPlayer src="https://www.youtube.com/watch?v=inpok4MKVLM" width="100%" height="100%" controls light playIcon={<Play className="h-16 w-16 text-white" />} />
            </div>
            <div className="px-8 py-10">
              <span className="rounded-full bg-[var(--color-purple-pale)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">{course.tag}</span>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-[var(--color-purple)] leading-tight">{course.title}</h2>
              <p className="mt-4 text-[var(--color-text-mid)] leading-relaxed">{course.description}</p>
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-[var(--color-text-mid)]">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> {course.lessons} lessons</span>
                <span className="flex items-center gap-2 text-[var(--color-gold)]"><Star className="h-4 w-4 fill-current" /> {course.rating} rating</span>
              </div>

              <h3 className="mt-10 font-serif text-2xl text-[var(--color-purple)]">Curriculum</h3>
              <div className="mt-4 divide-y divide-[var(--color-purple)]/10 rounded-xl border border-[var(--color-purple)]/10 bg-white">
                {["Introduction & Foundation", "The Core Practices", "Deepening the Practice", "Integration in Daily Life", "Final Module & Certification"].map((m, i) => (
                  <details key={m} className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-5 list-none">
                      <span className="flex items-center gap-3"><span className="font-serif text-[var(--color-gold)] text-xl">{String(i + 1).padStart(2, "0")}</span><span className="font-medium">{m}</span></span>
                      <span className="text-[var(--color-purple)] transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-[var(--color-text-mid)]">A guided sequence of lessons, recorded sessions, and reflection prompts to integrate the teaching.</div>
                  </details>
                ))}
              </div>

              <div className="mt-10 rounded-xl bg-[var(--color-purple-pale)]/40 p-6">
                <h3 className="font-serif text-xl text-[var(--color-purple)]">Your Guide</h3>
                <p className="mt-2 text-sm text-[var(--color-text-mid)] leading-relaxed">Jake Light brings three decades of immersive practice and study, with the warmth of a friend and the precision of a tradition.</p>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4 sticky bottom-0 bg-[var(--color-cream)] py-4">
                <CourseDrawerCTA course={course} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CourseDrawerCTA({ course }: { course: SIACourse }) {
  const { add, has } = useCart();
  const inCart = has(course.id);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-mid)]">One-time</p>
        <p className="font-serif text-3xl text-[var(--color-purple)]">{course.price}</p>
      </div>
      <button
        onClick={() => { if (!inCart) add(makeCartItem({ id: course.id, title: course.title, price: course.price, image: course.image, type: "course", tag: course.tag })); }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 btn-label transition-all",
          inCart ? "bg-[var(--color-gold)]/20 text-[var(--color-purple)]" : "bg-gradient-brand text-white hover:opacity-95",
        )}
      >
        {inCart ? <><Check className="h-4 w-4" /> In Cart</> : <><ShoppingBag className="h-4 w-4" /> Add to Cart</>}
      </button>
    </div>
  );
}