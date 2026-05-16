import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Twitter, Facebook, MessageCircle, Link2, Check } from "lucide-react";
import { LotusDivider } from "@/components/decorative";
import { BLOG_POSTS, type BlogPost } from "@/lib/sia-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} · SIA` },
          { name: "description", content: loaderData.post.excerpt },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt },
          { property: "og:image", content: loaderData.post.image },
          { property: "og:type", content: "article" },
          { name: "twitter:image", content: loaderData.post.image },
        ]
      : [{ title: "Reflection · SIA" }],
  }),
  component: BlogDetail,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center pt-24 px-6 text-center">
      <div>
        <p className="font-serif text-3xl text-[var(--color-purple)]">This reflection is not yet written.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-[var(--color-purple)] font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to all writings
        </Link>
      </div>
    </div>
  ),
});

function BlogDetail() {
  const { post } = Route.useLoaderData() as { post: BlogPost };
  const heroRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    const onScroll = () => {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / Math.max(1, total)));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Crude markdown-ish renderer
  const blocks = post.body.split("\n\n");

  return (
    <>
      <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 h-1 bg-transparent">
        <div className="h-full bg-[var(--color-purple)] origin-left" style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }} />
      </div>

      <article ref={articleRef} className="bg-[var(--color-cream)]">
        <div ref={heroRef} className="relative h-[70vh] min-h-[480px] overflow-hidden">
          <motion.img
            style={{ y: heroY, scale: 1.15 }}
            src={post.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-purple)]/30 via-transparent to-[var(--color-cream)]" />
        </div>

        <div className="relative -mt-32 mx-auto max-w-3xl px-6 pb-24">
          <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-card">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-mid)] hover:text-[var(--color-purple)]">
              <ArrowLeft className="h-4 w-4" /> All writings
            </Link>
            <span className="mt-6 inline-block rounded-full bg-[var(--color-purple-pale)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">{post.category}</span>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-[var(--color-purple)] leading-tight">{post.title}</h1>
            <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-mid)]">
              <img src={post.authorAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-[var(--color-text-dark)]">{post.author}</p>
                <p>{post.date} · <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span></p>
              </div>
            </div>

            <div className="mt-10 space-y-6 text-[17px] leading-[1.85] text-[var(--color-text-dark)]">
              {blocks.map((block, i) => {
                if (block.startsWith("## ")) return <h2 key={i} className="font-serif text-3xl text-[var(--color-purple)] mt-10">{block.slice(3)}</h2>;
                if (block.startsWith("> ")) return (
                  <blockquote key={i} className="border-l-4 border-[var(--color-purple)] pl-6 my-8 font-serif italic text-2xl text-[var(--color-purple)] leading-snug">
                    {block.slice(2)}
                  </blockquote>
                );
                if (/^\d+\. /.test(block)) {
                  const items = block.split("\n").map((l) => l.replace(/^\d+\.\s*/, ""));
                  return (
                    <ol key={i} className="list-decimal space-y-2 pl-6">
                      {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: simpleInline(it) }} />)}
                    </ol>
                  );
                }
                if (block.startsWith("- ")) {
                  const items = block.split("\n").map((l) => l.replace(/^-\s*/, ""));
                  return (
                    <ul key={i} className="list-disc space-y-2 pl-6">
                      {items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: simpleInline(it) }} />)}
                    </ul>
                  );
                }
                return <p key={i} dangerouslySetInnerHTML={{ __html: simpleInline(block) }} />;
              })}
            </div>

            <div className="mt-12 flex items-center gap-3 border-t border-[var(--color-purple)]/10 pt-6">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-mid)] mr-2">Share</span>
              {[
                { icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}` },
                { icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("#")}` },
                { icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(post.title)}` },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-purple)]/20 text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)] transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <button onClick={onCopy} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-purple)]/20 text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)] transition-colors">
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </article>

      <section className="bg-[var(--color-peach)] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="font-serif text-3xl text-[var(--color-purple)]">Continue Reading</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="hover-lift group block rounded-2xl bg-white shadow-card overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-[var(--color-purple-pale)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-purple)]">{p.category}</span>
                  <h3 className="mt-3 font-serif text-lg text-[var(--color-purple)] line-clamp-2">{p.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-purple)]">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <LotusDivider />
        </div>
      </section>
    </>
  );
}

function simpleInline(s: string) {
  return s
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--color-purple)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, "<br />");
}
