import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import { ArrowRight, Calendar, MapPin, Star, Play, Clock } from "lucide-react";
import { Mandala, FloatingPetals, LotusDivider, Lotus } from "@/components/decorative";
import { SectionHeading, SiaButton, ScrollIndicator } from "@/components/sia-ui";
import { GALLERY_IMAGES, EVENTS, COURSES, BLOG_POSTS } from "@/lib/sia-data";
import HeroImage from "@/assets/home7.jpg";
import jake from "@/assets/jake.png";
import { useEvents } from "@/lib/admin-store";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Awakening the Light Within · Shifting Into Awareness" },
      { name: "description", content: "Walk the Pathless Path with Jake Light. Free satsangs, retreats, and the living practices of awakening." },
      { property: "og:title", content: "Awakening the Light Within · SIA" },
      { property: "og:description", content: "Walk the Pathless Path with Jake Light. Free satsangs, retreats, and the living practices of awakening." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[var(--color-cream)]">
      <Hero />
      <AboutTeaser />
      <BlogTeaser />
      <Webinars />
      <FeaturedCourses />
      <Gallery />
      <FinalCTA />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  // ✅ FIX: Changed 'user' to 'dbUser' to match our upgraded AuthContext!
  const { dbUser, loading } = useAuth();

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden bg-[var(--color-cream)] pt-20">
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] text-[#600694] opacity-[0.06] spin-slow">
          <Mandala />
        </div>
      </motion.div>
      <FloatingPetals />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)] py-12 lg:py-0">
        <motion.div style={{ y: fgY }} className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="btn-label text-[#600694] mb-4 sm:mb-6"
          >
            Welcome to the Pathless Path
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif italic font-semibold text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] sm:leading-[1.02] text-[#600694]"
          >
            Awakening<br /> the Light Within
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-5 sm:mt-7 max-w-xl text-base sm:text-lg lg:text-xl text-[#600694] leading-relaxed"
          >
            Jake Light · Spiritual Guide · The Pathless Path. A sanctuary for sincere seekers — satsangs, scriptures, and the inner science of awakening.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-4"
          >
            {/* ✅ FIX: Checking against dbUser instead of user */}
            {!loading && dbUser ? (
              <>
                <Link to="/my-learning" className="w-full sm:w-auto">
                  <SiaButton className="w-full sm:w-auto bg-[#600694] justify-center text-white">
                    Donate <ArrowRight className="h-4 w-4" />
                  </SiaButton>
                </Link>

                <Link to="/courses" className="w-full sm:w-auto">
                  <SiaButton
                    variant="outline"
                    className="w-full sm:w-auto justify-center rounded-full border-[#600694] text-[#600694] hover:bg-[#600694] hover:text-white uppercase tracking-widest transition-colors duration-300"
                  >
                    Recommend
                  </SiaButton>
                </Link>
              </>
            ) : (
              <>
                <Link to="/sia" className="w-full sm:w-auto">
                  <SiaButton className="w-full sm:w-auto bg-[#600694] justify-center text-white">
                    Explore the Journey <ArrowRight className="h-4 w-4" />
                  </SiaButton>
                </Link>

                <Link to="/events" className="w-full sm:w-auto">
                  <SiaButton
                    variant="outline"
                    className="w-full sm:w-auto justify-center rounded-full border-[#600694] text-[#600694] hover:bg-[#600694] hover:text-white uppercase tracking-widest transition-colors duration-300"
                  >
                    <Play className="h-4 w-4 mr-2" /> Watch Free Satsang
                  </SiaButton>
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative flex justify-center mt-8 lg:mt-0"
        >
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full blur-3xl bg-[var(--color-purple-light)] opacity-30 scale-110" />
            <div className="relative aspect-[4/5] w-[280px] max-w-[90vw] sm:w-[340px] lg:w-[400px] overflow-hidden rounded-full border-[6px] border-[var(--color-gold)]/40 shadow-[0_30px_80px_-20px_oklch(0.247_0.165_305_/_0.4)] pulse-glow">
              <img
                src={HeroImage}
                alt="Jake Light in meditation"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <Lotus className="absolute -bottom-8 -right-4 h-20 w-20 text-[#600694] opacity-80" />
          </div>
        </motion.div>
      </div>
      <ScrollIndicator />
    </section>
  );
}

// ... The rest of your components (AboutTeaser, BlogTeaser, Webinars, FeaturedCourses, Gallery, FinalCTA) remain exactly the same!

function AboutTeaser() {
  return (
    <section className="relative bg-[var(--color-peach)] py-24 sm:py-32 overflow-hidden">
      <div className="absolute right-0 top-10 text-[#600694] opacity-[0.05] w-[400px]">
        <Lotus />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5 order-2 lg:order-1"
        >
          <div className="relative mx-auto max-w-md w-full">
            <div className="absolute -inset-3 rounded-md border-2 border-[var(--color-gold)]" />
            <img
              src={jake}
              alt="Jake Light"
              className="relative aspect-[4/5] w-full rounded-md object-cover shadow-card"
              loading="lazy"
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:col-span-7 relative order-1 lg:order-2"
        >
          <span className="absolute -top-12 -left-4 font-serif text-[180px] leading-none text-[#600694] opacity-10 select-none hidden sm:block">"</span>
          <p className="btn-label text-[#600694]">About Jake Light</p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl text-[#600694] leading-tight">
            All deep wisdom is within each of us.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-[#c108d9] leading-relaxed">
            Jake Light had an exciting journey traversing the landscapes of spirituality through all religions, ultimately discovering that everything comes from the same One Source. He discovered in a young age that he had lot of familiarity with Vedic teachings and eventually learnt that all the deep wisdom is there within each of us, cultivated through many lifetimes. After having walked the path of Kundalini Yoga, Bhakti Yoga, Raj Yoga, he finally was led to the Gyana Yoga (path of wisdom). This deep wisdom took him beyond the path beyond all paths, which he terms as the 'pathless path'. He today shares with the world the enlightening revelations of the path and where it finally leads everyone to. Determined to bring crystal clear clarity of the whole journey of a seeker, he finds various ways to deliver this to keen seekers.
          </p>
          <Link
            to="/sia"
            search={{ tab: 'jake' }}
            className="group mt-8 inline-flex items-center gap-2 text-[#600694] font-semibold"
          >
            Read Jake's Full Story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function BlogTeaser() {
  const mobilePosts = BLOG_POSTS.slice(0, 5);

  return (
    <section className="bg-[var(--color-cream)] py-24 overflow-hidden border-y border-[var(--color-gold)]/10">

      <style>{`
        .continuous-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 [&_h2]:text-[#600694] [&_h3]:text-[#600694]">
        <SectionHeading
          eyebrow="Wisdom"
          title="The Pathless Path Blog"
          subtitle="Reflections on silence, awakening, and the science of the inner Self."
        />
      </div>

      <div className="mt-14 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 hidden lg:block">
        <Swiper
          modules={[Autoplay]}
          slidesPerView="auto"
          spaceBetween={24}
          loop={true}
          speed={6000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="continuous-swiper !overflow-visible py-10"
        >
          {BLOG_POSTS.map((post) => (
            <SwiperSlide
              key={post.slug}
              className="!w-[320px] !h-auto z-10 hover:z-50 transition-all duration-300"
            >
              <article className="relative group/card h-full">

                <div className="flex flex-col h-full rounded-2xl bg-white shadow-card overflow-hidden border border-[var(--color-purple)]/5 transition-shadow duration-300 group-hover/card:shadow-md">
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={post.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-lg text-[#600694] leading-snug line-clamp-2">
                      <Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link>
                    </h3>

                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#600694]">
                      <span className="rounded bg-[var(--color-purple-pale)] px-2 py-1 font-semibold uppercase tracking-wider text-[#600694]">
                        {post.category}
                      </span>
                      <span className="font-medium text-[#600694]">{post.author}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-0 left-[calc(100%+12px)] w-[320px] bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 border border-[var(--color-purple)]/10 opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-300 hidden lg:flex flex-col z-[100] after:content-[''] after:absolute after:top-0 after:left-[-12px] after:h-full after:w-[12px] after:bg-transparent">
                  <div className="absolute top-12 -left-2 w-4 h-4 bg-white transform rotate-45 border-b border-l border-[var(--color-purple)]/10" />
                  <h4 className="font-serif text-xl text-[#600694] leading-tight">{post.title}</h4>
                  <div className="mt-3 flex items-center gap-2">
                    {post.featured && (
                      <span className="bg-[var(--color-gold)]/20 text-[#600694] text-xs font-bold px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[#600694]">Updated {post.date}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#600694] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.readTime} · Deep Dive
                  </p>
                  <p className="mt-4 text-sm text-[#600694] leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="mt-6 w-full text-center py-3 bg-[var(--color-purple)] text-white rounded-lg font-bold hover:bg-[var(--color-purple-light)] transition-colors">
                    Read Article
                  </Link>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="mt-10 mx-auto px-4 sm:px-6 block lg:hidden">
        <Swiper
          modules={[FreeMode]}
          slidesPerView="auto"
          spaceBetween={16}
          freeMode={true}
          className="!overflow-visible py-4"
        >
          {mobilePosts.map((post) => (
            <SwiperSlide key={post.slug} className="!w-[280px] sm:!w-[320px] !h-auto self-stretch">
              <article className="flex flex-col h-full rounded-2xl bg-white shadow-card overflow-hidden border border-[var(--color-purple)]/5">
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-lg text-[#600694] leading-snug line-clamp-2">
                    <Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link>
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#600694]">
                    <span className="rounded bg-[var(--color-purple-pale)] px-2 py-1 font-semibold uppercase tracking-wider text-[#600694]">
                      {post.category}
                    </span>
                    <span className="font-medium text-[#600694]">{post.author}</span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}

          <SwiperSlide className="!w-[200px] !h-auto self-stretch">
            <Link
              to="/blog"
              className="group flex flex-col items-center justify-center h-full rounded-2xl bg-[var(--color-purple-pale)]/50 border border-[var(--color-purple)]/10 shadow-sm transition-all duration-300 hover:bg-[var(--color-purple)] hover:shadow-md text-[#600694] hover:text-white"
            >
              <span className="font-serif text-2xl mb-4">See All</span>
              <div className="h-12 w-12 rounded-full bg-[var(--color-purple)]/10 text-[#600694] flex items-center justify-center group-hover:bg-white group-hover:text-[#600694] transition-colors">
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}

function Webinars() {
  const allEvents = useEvents();
  const upcoming = allEvents.filter((e) => !e.past).slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="bg-[var(--color-peach)] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 [&_h2]:text-white [&_h3]:text-[#600694]">
        <div className="[&_h2]:text-white [&_p]:text-white/90">
          <SectionHeading
            eyebrow="Live Gatherings"
            title="Webinars & Upcoming Satsangs"
            subtitle="Join a global sangha exploring stillness, scripture, and inner awakening — live."
          />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((ev, i) => (
            <motion.article
              key={ev.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="hover-lift group flex flex-col rounded-2xl bg-white shadow-card overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={ev.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 rounded-full bg-[#600694]/90 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-cream)]">
                  {ev.type}
                </span>
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h3 className="font-serif text-2xl text-[#600694] leading-snug">{ev.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-[#600694]">
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4 shrink-0" /> {ev.date} · {ev.time}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {ev.location}</p>
                </div>
                <p className="mt-4 text-sm text-[#600694] leading-relaxed flex-1">{ev.description}</p>
                <Link
                  to="/events"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#600694] px-5 py-2.5 btn-label text-white hover:bg-[#600694]/90 transition-colors w-full sm:w-auto"
                >
                  Register Now
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCourses() {
  return (
    <section className="bg-[var(--color-cream)] py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 [&_h2]:text-[#600694] [&_h3]:text-[#600694]">
        <SectionHeading
          eyebrow="Begin Your Journey"
          title="Featured Courses"
          subtitle="Curated programs in practice and scripture, taught with the rigour of tradition and the freshness of direct experience."
        />
      </div>
      <div className="mt-14 px-6 lg:px-10">
        <Swiper
          modules={[FreeMode]}
          slidesPerView="auto"
          spaceBetween={24}
          freeMode
          className="!overflow-visible"
        >
          {COURSES.slice(0, 6).map((course) => (
            <SwiperSlide key={course.id} className="!w-[280px] sm:!w-[340px]">
              <article className="hover-lift group flex h-full flex-col rounded-2xl bg-white shadow-card overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={course.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-[var(--color-cream)]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#600694]">
                    {course.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl text-[#600694] leading-snug line-clamp-2">{course.title}</h3>
                  <p className="mt-2 text-sm text-[#600694] line-clamp-2">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#600694]">{course.price}</span>
                    <span className="flex items-center gap-1 text-[#600694]">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-[#600694]">{course.rating}</span>
                    </span>
                  </div>
                  <Link
                    to="/courses"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-purple)] px-4 py-2.5 btn-label text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] transition-colors"
                  >
                    Enroll Now
                  </Link>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="bg-[var(--color-cream)] py-20 overflow-hidden">
      <div className="[&_h2]:text-[#600694] [&_h3]:text-[#600694]">
        <SectionHeading
          eyebrow="Glimpses"
          title="The Sacred in Practice"
          subtitle="Moments from satsangs, retreats, and the daily living of the Pathless Path."
        />
      </div>
      <div className="mt-12">
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={20}
          loop
          freeMode
          speed={5000}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          allowTouchMove={false}
          className="!px-6"
        >
          {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((img, i) => (
            <SwiperSlide key={i} className="!w-[280px] sm:!w-[360px]">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover grayscale-[40%] transition-all duration-700 hover:grayscale-0 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <LotusDivider />
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-peach)] py-20 sm:py-28">
      <Mandala className="absolute -right-40 -top-40 w-[600px] text-[#600694] opacity-[0.06]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Lotus className="mx-auto h-12 w-12 sm:h-14 sm:w-14 text-[#600694] mb-6" />
        <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-[#600694] leading-tight">
          The journey within is the only journey worth taking.
        </h2>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[#600694]">Join the next free satsang and begin where you are.</p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <Link to="/events" className="w-full sm:w-auto">
            <SiaButton variant="primary" className="w-full sm:w-auto justify-center">Join Free Satsang <ArrowRight className="h-4 w-4" /></SiaButton>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <SiaButton variant="outline" className="w-full sm:w-auto justify-center">Speak With Us</SiaButton>
          </Link>
        </div>
      </div>
    </section>
  );
}