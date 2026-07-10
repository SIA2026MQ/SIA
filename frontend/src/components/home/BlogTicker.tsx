import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import heroMandala from "@/assets/hero-mandala.jpg";

export function BlogTicker() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch data from your database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        const data = await response.json();

        const fetchedBlogs = Array.isArray(data) ? data : data.blogs || [];
        setTotalBlogs(fetchedBlogs.length);
        setBlogs(fetchedBlogs.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch blogs from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Auto-scroll logic for the mobile marquee
  useEffect(() => {
    let animationId: number;
    const container = scrollRef.current;

    const autoScroll = () => {
      if (container && !isInteracting) {
        // The speed of the continuous scroll (increase to make it faster)
        container.scrollLeft += 1;

        // Infinite loop logic: Once we scroll past the first duplicated set, reset to the beginning
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    if (blogs.length > 0) {
      animationId = requestAnimationFrame(autoScroll);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, blogs]);

  if (!isLoading && blogs.length === 0) {
    return null;
  }

  const renderCard = (post: any, index: number, keyPrefix: string) => {
    const resolvePostImage =
      post.image ||
      post.imageUrl ||
      post.imageDataUrl ||
      (index % 2 === 0 ? lotusDawn : heroMandala);

    return (
      <Link
        key={`${keyPrefix}-${post.slug}-${index}`}
        to={`/blog/${post.slug}`}
        className="block w-[280px] sm:w-[340px] lg:w-auto shrink-0 rounded-2xl border border-border bg-card shadow-soft hover:shadow-lg transition-all duration-300 group"
      >
        <div className="overflow-hidden rounded-t-2xl relative aspect-[16/10]">
          <img
            src={resolvePostImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="space-y-3 p-5 whitespace-normal">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <span>{post.category || "Wisdom"}</span>
            {post.author && <span>{post.author}</span>}
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold text-primary leading-snug group-hover:text-[#fdb022] transition-colors">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section className="section-even overflow-hidden py-16 bg-[#F7F3FA] border-y border-[var(--color-gold)]/10">

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="sia-container mb-12 flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-7xl mx-auto relative">
        <div className="space-y-2 max-w-2xl">
          <h2 className="sia-h2 text-3xl md:text-5xl">The Pathless Path Blog</h2>
          <p className="text-[10px] sm:text-lg font-bold uppercase tracking-widest text-[#fdb022]">
            Reflections on silence, awakening, and the science of the inner Self.
          </p>
        </div>

        {!isLoading && totalBlogs > 4 && (
          <Link
            to="/blog"
            className="group flex items-center gap-2 text-xl md:text-2xl font-semibold text-primary hover:text-[#fdb022] transition-colors mt-6 md:mt-0 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2"
          >
            See more Blogs
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center text-primary/50 animate-pulse">
          Gathering blogs...
        </div>
      ) : (
        <div className="sia-container px-4 md:px-8 max-w-7xl mx-auto">

          {/* MOBILE VIEW: Auto-scrolling AND Native Touchable Slider */}
          <div
            ref={scrollRef}
            // Event listeners to pause the auto-scroll when the user touches or hovers
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            className="lg:hidden flex overflow-x-auto gap-6 pb-6 pt-2 px-4 -mx-4 sm:mx-0 sm:px-0 hide-scrollbar cursor-grab active:cursor-grabbing"
          >
            {/* Duplicated array to allow the seamless infinite looping */}
            {[...blogs, ...blogs].map((post, index) => renderCard(post, index, "mobile"))}
          </div>

          {/* DESKTOP VIEW: Static Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6 justify-center">
            {blogs.map((post, index) => renderCard(post, index, "desktop"))}
          </div>

        </div>
      )}
    </section>
  );
}