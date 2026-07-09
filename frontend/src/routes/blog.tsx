import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import heroMandala from "@/assets/hero-mandala.jpg";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { api } from "@/lib/api";

const defaultTags = ["All", "Spirituality", "Meditation", "Healing", "Wellness", "Retreats"];

export default function BlogPage() {
  // 1. Grab the URL parameter
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // 2. Set default active tag to the URL category, fallback to "All"
  const [tag, setTag] = useState(categoryFromUrl || "All");

  // 3. If the URL changes while they are on the page, update the active tag instantly
  useEffect(() => {
    if (categoryFromUrl) {
      setTag(categoryFromUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.getBlogs();
        setBlogPosts(res.blogs || []);
      } catch (error) {
        console.error("Failed to load blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesTag = tag === "All" || post.category === tag;
      const matchesQuery = [post.title || "", post.excerpt || "", post.category || ""]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [blogPosts, query, tag]);

  const featuredPost = useMemo(() => {
    if (blogPosts.length === 0) return null;
    return blogPosts.find(post => post.featured) || blogPosts[0];
  }, [blogPosts]);

  // Merge default tags with the currently active tag
  const displayTags = Array.from(new Set([...defaultTags, tag]));

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 pt-20">
        <Loader2 className="h-12 w-12 animate-spin text-[#600694]" />
        <p className="mt-4 font-semibold text-[#600694]">Gathering wisdom...</p>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-10">
        <div className="sia-container space-y-5">
          <h1 className="sia-h1">Wisdom Writings</h1>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            className="h-12 w-full max-w-md rounded-full border border-input bg-card px-5 focus:outline-none focus:border-[#600694]"
          />
          <div className="flex flex-wrap gap-2">
            {displayTags.map((value) => (
              <button
                key={value}
                onClick={() => setTag(value)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${tag === value
                    ? "border-[#600694] bg-[#600694] text-white"
                    : "border-[#600694]/40 text-[#600694] hover:bg-[#600694]/10"
                  }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED POST */}
      {featuredPost && (
        <section className="section-even py-12">
          <div className="sia-container">
            <Link to={`/blog/${featuredPost.slug}`}>
              <article className="relative overflow-hidden rounded-3xl group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-500">
                <img
                  src={featuredPost.image || heroMandala}
                  alt={featuredPost.title}
                  className="aspect-[21/8] w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                  <span className="w-fit inline-flex rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-white mb-3">
                    {featuredPost.category || "Featured Post"}
                  </span>
                  <h2 className="mt-2 max-w-2xl font-display text-4xl italic text-white md:text-5xl line-clamp-2">
                    {featuredPost.title}
                  </h2>
                  <p className="text-white/80 mt-4 max-w-xl line-clamp-2">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* BLOG GRID */}
      <section className="section-odd py-16">
        {/* Updated grid classes: grid-cols-2 on mobile, responsive gaps */}
        <div className="sia-container grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No articles found matching your criteria.
            </div>
          )}

          {filtered.map((post, index) => (
            <article key={post.slug} className="sia-card overflow-hidden p-0 flex flex-col group">
              {/* Responsive image height */}
              <Link to={`/blog/${post.slug}`} className="overflow-hidden h-32 sm:h-48 md:h-56 shrink-0 bg-gray-100 block">
                <img
                  src={post.image || (index % 2 === 0 ? lotusDawn : heroMandala)}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>

              {/* Responsive padding and spacing */}
              <div className="flex flex-col flex-1 p-3 sm:p-6 space-y-2 sm:space-y-4">
                <div className="flex items-start justify-between">
                  {/* Responsive badge text */}
                  <span className="inline-flex rounded-full bg-[#600694]/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.05em] text-[#600694]">
                    {post.category}
                  </span>
                </div>

                <Link to={`/blog/${post.slug}`} className="hover:text-[#600694] transition-colors block">
                  {/* Responsive title size */}
                  <h3 className="line-clamp-2 font-display text-sm sm:text-xl leading-snug text-gray-900">
                    {post.title}
                  </h3>
                </Link>

                {/* Responsive excerpt: hidden or shorter on mobile */}
                <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed text-gray-600 flex-1">
                  {post.excerpt}
                </p>

                {/* Responsive meta footer: flex-wrap to prevent overflow on tiny screens */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-xs text-gray-500 pt-2 sm:pt-4 border-t border-gray-100 mt-auto">
                  <span className="font-semibold truncate max-w-[45%]">{post.author}</span>
                  <span className="truncate">{post.date}</span>
                </div>

                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex text-[10px] sm:text-sm font-bold uppercase tracking-wider text-[#600694] hover:text-[#4a0473] transition-colors mt-2"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}