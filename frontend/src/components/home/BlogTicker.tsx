import { Link } from "react-router-dom";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import heroMandala from "@/assets/hero-mandala.jpg";
import { useSiteContent } from "@/hooks/useSiteContent";

export function BlogTicker() {
  const { blogs } = useSiteContent();

  return (
    <section className="section-even overflow-hidden py-16 bg-[var(--color-cream)] border-y border-[var(--color-gold)]/10">
      
      {/* Animation Styles */}
      <style>
        {`
          @keyframes infinite-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: infinite-scroll 45s linear infinite;
          }
          /* Pause animation on desktop hover */
          @media (hover: hover) {
            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="sia-container mb-12 flex flex-col items-center text-center gap-6 px-4">
        <div className="space-y-2 max-w-2xl">

          <h2 className="sia-h2 text-center text-3xl md:text-5xl">The Pathless Path Blog</h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
            Reflections on silence, awakening, and the science of the inner Self.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="group w-full overflow-hidden py-4">
        <div className="flex w-max animate-marquee">
          {[1, 2].map((setIndex) => (
            <div key={`set-${setIndex}`} className="flex gap-6 px-3">
              {blogs.map((post, index) => {
                const resolvePostImage = 
                  ("imageDataUrl" in post && typeof post.imageDataUrl === "string" ? post.imageDataUrl : undefined) ||
                  post.imageUrl || (index % 2 === 0 ? lotusDawn : heroMandala);

                return (
                  // Wrapped in Link to ensure full-card clickability on Mobile & Desktop
                  <Link
                    key={`${post.slug}-${setIndex}-${index}`}
                    to={`/blog/${post.slug}`}
                    className="block w-[300px] sm:w-[340px] shrink-0 rounded-2xl border border-border bg-card shadow-soft hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="overflow-hidden rounded-t-2xl relative aspect-[16/10]">
                      <img
                        src={resolvePostImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>{post.category || "Wisdom"}</span>
                        {post.author && <span>{post.author}</span>}
                      </div>
                      <h3 className="line-clamp-2 text-lg font-semibold text-primary leading-snug">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}