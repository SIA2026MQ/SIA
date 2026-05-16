import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Clock } from "lucide-react";
import { Mandala } from "@/components/decorative";
import { BLOG_POSTS } from "@/lib/sia-data";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Wisdom Writings · SIA Blog" },
      { name: "description", content: "Reflections on the Pathless Path — essays on Vedic wisdom, yoga, meditation, and the inner journey." },
      { property: "og:title", content: "Wisdom Writings · SIA Blog" },
      { property: "og:description", content: "Reflections on the Pathless Path — essays on Vedic wisdom, yoga, meditation, and the inner journey." },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [q, setQ] = useState("");

  const featured = BLOG_POSTS.find((p) => p.featured)!;
  const filtered = useMemo(() => {
    return BLOG_POSTS.filter((p) => !p.featured)
      .filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-cream)] pt-32 pb-16">
        <Mandala className="absolute -right-40 -top-20 w-[700px] text-[var(--color-purple)] opacity-[0.06] spin-slow" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="btn-label text-[var(--color-gold)]">The Journal</p>
          <h1 className="mt-5 font-serif italic text-5xl sm:text-6xl text-[var(--color-purple)] leading-[1.05]">
            Wisdom Writings
          </h1>
          <p className="mt-6 text-lg text-[var(--color-text-mid)] max-w-2xl mx-auto">
            Slow reading for inward turning.
          </p>

          <div className="mt-10 mx-auto max-w-xl flex items-center rounded-full bg-white shadow-card pl-5 pr-1.5">
            <Search className="h-5 w-5 text-[var(--color-purple)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reflections..."
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
              aria-label="Search blog"
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-cream)] pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Link to="/blog/$slug" params={{ slug: featured.slug }} className="hover-lift group block overflow-hidden rounded-3xl shadow-card relative aspect-[16/9] sm:aspect-[16/7]">
            <img src={featured.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-purple)]/95 via-[var(--color-purple)]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 text-[var(--color-cream)] max-w-3xl">
              <span className="rounded-full bg-[var(--color-gold)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">Featured · {featured.category}</span>
              <h2 className="mt-4 font-serif text-3xl sm:text-5xl leading-tight">{featured.title}</h2>
              <p className="mt-3 text-base sm:text-lg opacity-90 max-w-2xl">{featured.excerpt}</p>
              <div className="mt-5 inline-block py-2.5 px-6 bg-[var(--color-purple)] text-white rounded-lg font-bold hover:bg-[var(--color-purple-light)] transition-colors">
                Read Article
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-[var(--color-cream)] pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {filtered.length === 0 ? (
            <p className="text-center text-[var(--color-text-mid)] py-20">No reflections match your search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((post, i) => {
                // Determine if this item is on the right edge of the grid to flip the popover direction
                const isRightColLg = (i + 1) % 4 === 0;
                const isRightColSm = (i + 1) % 2 === 0;

                return (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                    // group/card is crucial here to trigger the popover
                    className="relative group/card z-10 hover:z-50"
                  >
                    {/* --- 1. THE MAIN VISIBLE CARD --- */}
                    <div className="flex flex-col h-full rounded-2xl bg-white shadow-card overflow-hidden">
                      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={post.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                      </Link>
                      
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-serif text-lg text-[var(--color-purple)] leading-snug line-clamp-2">
                          <Link to="/blog/$slug" params={{ slug: post.slug }}>{post.title}</Link>
                        </h3>
                        
                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[var(--color-text-mid)]">
                          <span className="rounded bg-[var(--color-purple-pale)] px-2 py-1 font-semibold uppercase tracking-wider text-[var(--color-purple)]">
                            {post.category}
                          </span>
                          <span className="font-medium text-[var(--color-text-dark)]">{post.author}</span>
                        </div>
                      </div>
                    </div>

                    {/* --- 2. THE HOVER POPOVER PANEL --- */}
                    <div className={`
                      absolute top-0 w-[320px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6 border border-[var(--color-purple)]/10
                      opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-300
                      hidden md:flex flex-col z-50
                      
                      /* Smart Positioning: Opens to the right normally, but to the left if on the right edge */
                      ${isRightColLg ? 'lg:right-[calc(100%+12px)] lg:left-auto lg:after:right-[-12px] lg:after:left-auto' : 'lg:left-[calc(100%+12px)] lg:right-auto lg:after:left-[-12px] lg:after:right-auto'}
                      ${isRightColSm ? 'max-lg:right-[calc(100%+12px)] max-lg:left-auto max-lg:after:right-[-12px] max-lg:after:left-auto' : 'max-lg:left-[calc(100%+12px)] max-lg:right-auto max-lg:after:left-[-12px] max-lg:after:right-auto'}
                      
                      /* Invisible bridge so the mouse doesn't fall into the gap and close the popover */
                      after:content-[''] after:absolute after:top-0 after:h-full after:w-[12px] after:bg-transparent
                    `}>
                      
                      {/* The little pointer triangle (caret) */}
                      <div className={`
                        absolute top-12 w-4 h-4 bg-white transform rotate-45 border-[var(--color-purple)]/10
                        ${isRightColLg ? 'lg:-right-2 lg:border-t lg:border-r lg:-left-auto' : 'lg:-left-2 lg:border-b lg:border-l lg:-right-auto'}
                        ${isRightColSm ? 'max-lg:-right-2 max-lg:border-t max-lg:border-r max-lg:-left-auto' : 'max-lg:-left-2 max-lg:border-b max-lg:border-l max-lg:-right-auto'}
                      `} />

                      {/* Popover Content */}
                      <h4 className="font-serif text-xl text-[var(--color-purple)] leading-tight">{post.title}</h4>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <span className="bg-[var(--color-gold)]/20 text-[var(--color-purple)] text-xs font-bold px-2 py-0.5 rounded">Featured</span>
                        <span className="text-xs font-semibold text-[var(--color-text-mid)]">Updated {post.date}</span>
                      </div>
                      
                      <p className="mt-2 text-xs text-[var(--color-text-mid)] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime} · Deep Dive
                      </p>

                      <p className="mt-4 text-sm text-[var(--color-text-dark)] leading-relaxed">
                        {post.excerpt}
                      </p>

                      <Link to="/blog/$slug" params={{ slug: post.slug }} className="mt-6 w-full text-center py-3 bg-[var(--color-purple)] text-white rounded-lg font-bold hover:bg-[var(--color-purple-light)] transition-colors">
                        Read Article
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}