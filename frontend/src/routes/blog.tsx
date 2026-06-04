import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import heroMandala from "@/assets/hero-mandala.jpg";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useSiteContent } from "@/hooks/useSiteContent";

const tags = ["All", "Spirituality", "Vedic Wisdom", "Yoga", "Meditation", "Personal Journey"];

export default function BlogPage() {
  const { blogs: blogPosts } = useSiteContent();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesTag = tag === "All" || post.category === tag;
      const matchesQuery = [post.title, post.excerpt, post.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [blogPosts, query, tag]);

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-10">
        <div className="sia-container space-y-5">
          <h1 className="sia-h1">Wisdom Writings</h1>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            className="h-12 w-full max-w-md rounded-full border border-input bg-card px-5"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((value) => (
              <button
                key={value}
                onClick={() => setTag(value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] ${
                  tag === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/40 text-primary"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-even py-12">
        <div className="sia-container">
          <article className="relative overflow-hidden rounded-3xl">
            <img
              src={heroMandala}
              alt="Featured wisdom post"
              className="aspect-[21/8] w-full object-cover"
              width={1600}
              height={1000}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/75 to-primary/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <p className="text-xs uppercase tracking-[0.1em] text-primary-foreground/80">
                Featured Post
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-4xl italic text-primary-foreground md:text-5xl">
                The Pathless Path in Daily Life
              </h2>
            </div>
          </article>
        </div>
      </section>

      <section className="section-odd py-16">
        <div className="sia-container grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post, index) => (
            <article key={post.slug} className="sia-card overflow-hidden p-0">
              <div className="overflow-hidden">
                <img
                  src={
                    ("imageDataUrl" in post && typeof post.imageDataUrl === "string"
                      ? post.imageDataUrl
                      : undefined) ||
                    post.imageUrl ||
                    (index % 2 === 0 ? lotusDawn : heroMandala)
                  }
                  alt={post.title}
                  className="aspect-video w-full object-cover transition duration-500 hover:scale-105"
                  width={1200}
                  height={800}
                  loading="lazy"
                />
              </div>
              <div className="space-y-3 p-5">
                <span className="inline-flex rounded-full bg-purple-pale px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-primary">
                  {post.category}
                </span>
                <h3 className="line-clamp-2 font-display text-[22px] leading-tight text-primary">
                  {post.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="story-link inline-flex text-sm font-semibold uppercase tracking-[0.06em] text-primary"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="sia-container mt-8">
          <button className="sia-button-outline">Load More</button>
        </div>
      </section>
    </AnimatedPage>
  );
}
