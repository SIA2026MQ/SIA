import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import heroMandala from "@/assets/hero-mandala.jpg";

export function BlogTicker() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from your database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Ensure this points to your actual backend endpoint
        const response = await fetch('/api/blogs'); 
        const data = await response.json();
        
        // Ensure we are working with an array
        const fetchedBlogs = Array.isArray(data) ? data : data.blogs || [];
        
        // Save the total count to determine if we need the "See More" link
        setTotalBlogs(fetchedBlogs.length);
        
        // Limit the displayed blogs to a maximum of 4 (Assuming backend returns newest first)
        setBlogs(fetchedBlogs.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch blogs from database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Don't render the section at all if there are no blogs in the database
  if (!isLoading && blogs.length === 0) {
    return null; 
  }

  return (
    <section className="section-even overflow-hidden py-16 bg-[#f7e7e7] border-y border-[var(--color-gold)]/10">
      
      {/* Header Container */}
      {/* Header Container */}
<div className="sia-container mb-12 flex flex-col items-center justify-center text-center px-4 md:px-8 max-w-7xl mx-auto relative">
  
  <div className="space-y-2 max-w-2xl">
    <h2 className="sia-h2 text-3xl md:text-5xl">The Pathless Path Blog</h2>
    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
      Reflections on silence, awakening, and the science of the inner Self.
    </p>
  </div>

  {/* Conditionally render the "See More" link if total blogs > 4 */}
  {!isLoading && totalBlogs > 4 && (
    <Link 
      to="/blog" 
      className="group flex items-center gap-2 text-sm md:text-base font-semibold text-primary hover:text-[#fdb022] transition-colors mt-6 md:mt-0 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2"
    >
      See more Blogs
      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
    </Link>
  )}
</div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-12 flex justify-center text-primary/50 animate-pulse">
          Gathering blogs...
        </div>
      ) : (
        /* Static Grid Container */
        <div className="sia-container px-4 md:px-8 max-w-7xl mx-auto">
          {/* Uses CSS Grid to arrange cards: 
            1 column on mobile, 2 on tablets, up to 4 on desktops.
            Uses justify-center so if there are only 2 blogs, they sit nicely in the middle.
          */}
          <div className="flex flex-wrap justify-center lg:grid lg:grid-cols-4 gap-6">
            {blogs.map((post, index) => {
              const resolvePostImage = 
  post.image || // This is the field your backend actually uses!
  post.imageUrl || 
  post.imageDataUrl || 
  (index % 2 === 0 ? lotusDawn : heroMandala);
              return (
                <Link
                  key={`${post.slug}-${index}`}
                  to={`/blog/${post.slug}`}
                  className="block w-full sm:w-[340px] lg:w-auto shrink-0 rounded-2xl border border-border bg-card shadow-soft hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="overflow-hidden rounded-t-2xl relative aspect-[16/10]">
                    <img
                      src={resolvePostImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-3 p-5">
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
            })}
          </div>
        </div>
      )}
    </section>
  );
}