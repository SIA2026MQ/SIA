import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { Loader2 } from "lucide-react";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { api } from "@/lib/api";

export default function BlogDetailPage() {
  const { slug } = useParams();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for the Category-based Related Posts feature
  const [allOtherPosts, setAllOtherPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!slug) return;
      setLoading(true);
      
      try {
        const blogRes = await api.getBlogBySlug(slug);
        const currentPost = blogRes.blog;
        setPost(currentPost);
        
        try {
          const allBlogsRes = await api.getBlogs();
          
          // 1. Get all posts EXCEPT the one currently being read
          const others = (allBlogsRes.blogs || []).filter((b: any) => b.slug !== slug);
          setAllOtherPosts(others);

          // 2. Extract unique categories from these remaining posts
          const uniqueCategories = Array.from(
            new Set(others.map((b: any) => b.category).filter(Boolean))
          ) as string[];
          setCategories(uniqueCategories);

          // 3. Set the default active category 
          if (currentPost?.category && uniqueCategories.includes(currentPost.category)) {
            setSelectedCategory(currentPost.category);
          } else if (uniqueCategories.length > 0) {
            setSelectedCategory(uniqueCategories[0]);
          }

        } catch (relatedErr) {
          console.warn("Could not load related posts", relatedErr);
        }

      } catch (error) {
        console.error("Failed to load main blog:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogData();
  }, [slug]);

  const getParagraphs = (bodyData: any): string[] => {
    if (!bodyData) return [];
    let parsedData = bodyData;
    
    if (typeof bodyData === 'string') {
      try {
        parsedData = JSON.parse(bodyData);
      } catch (e) {
        return bodyData.split('\n').filter((p: string) => p.trim() !== "");
      }
    }

    if (Array.isArray(parsedData)) {
      const combinedText = parsedData.map(block => {
        return block.content || block.text || block.data?.text || (typeof block === 'string' ? block : "");
      }).join('\n');
      return combinedText.split('\n').filter((p: string) => p.trim() !== "");
    }
    return [];
  };

  if (loading) {
    return (
      <section className="section-odd min-h-screen pt-32 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#600694]" />
        <p className="mt-4 text-[#600694] font-semibold">Loading wisdom...</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section-odd min-h-screen pt-32">
        <div className="sia-container text-center">
          <h1 className="sia-h1">Post not found</h1>
          <p className="text-gray-500 mt-2">This article may have been moved or deleted.</p>
          <Link to="/blog" className="mt-4 inline-flex font-bold text-[#600694] hover:underline">
            ← Back to blog
          </Link>
        </div>
      </section>
    );
  }

  const paragraphs = getParagraphs(post.body);
  
  // Slices to exactly 4 posts for the 4-column grid
  const filteredPosts = allOtherPosts
    .filter(p => p.category === selectedCategory)
    .slice(0, 4); 

  return (
    <AnimatedPage>
      {/* 📖 THE BLOG CONTENT */}
      <section className="section-odd pt-32 pb-12">
        <div className="sia-container relative">
          <article className="mx-auto max-w-3xl">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 bg-primary" />
            </div>
            
            <img
              src={post.image || lotusDawn}
              alt={post.title}
              className="mt-6 aspect-[16/8] w-full rounded-3xl object-cover bg-gray-100 shadow-sm"
              loading="eager"
            />
            
            <h1 className="mt-8 font-display text-5xl leading-tight text-primary">{post.title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground font-medium">
              <span className="bg-[#600694]/10 text-[#600694] px-2 py-0.5 rounded uppercase text-xs font-bold tracking-wider">{post.category}</span>
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <div className="mt-10 space-y-8 text-[17px] leading-[1.9] text-foreground/95">
              {post.excerpt && (
                <p className="text-xl text-gray-900 font-bold italic mb-10 leading-relaxed border-l-4 border-[#600694] pl-6">
                  {post.excerpt}
                </p>
              )}

              {paragraphs.map((paragraph: string, index: number) => (
                <section key={index} id={`section-${index + 1}`}>
                  <p className="font-bold text-gray-800">{paragraph}</p>
                </section>
              ))}
              
              <blockquote className="border-l-4 border-primary pl-5 font-display text-4xl italic text-primary/85 my-12">
                Awareness does not arrive from outside. It is remembered from within.
              </blockquote>
              
              {post.youtubeUrl && (
                <div className="overflow-hidden rounded-2xl border border-border shadow-lg mt-12">
                  <div className="aspect-video">
                    <ReactPlayer src={post.youtubeUrl} width="100%" height="100%" controls />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
              {["WhatsApp", "X", "Facebook", "Copy Link"].map((name) => (
                <button key={name} className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-primary hover:bg-primary/5 transition-colors">
                  {name}
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* 🧭 DISCOVER MORE SECTION */}
      {categories.length > 0 && (
        <section className="section-even py-14 bg-gray-50">
          <div className="sia-container space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <h2 className="sia-h2 mb-4">Discover More</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all ${
                        selectedCategory === cat 
                          ? "bg-[#600694] text-white shadow-md" 
                          : "bg-white text-gray-600 border border-gray-200 hover:border-[#600694] hover:text-[#600694]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {selectedCategory && (
                <Link 
                  to={`/blog?category=${encodeURIComponent(selectedCategory)}`}
                  className="text-sm font-bold uppercase tracking-wider text-[#600694] hover:text-[#4a0473] shrink-0"
                >
                  View all in {selectedCategory} →
                </Link>
              )}
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
                {filteredPosts.map((entry) => (
                  <article 
                    key={entry.slug} 
                    className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    {entry.image && (
                      <div className="w-full h-32 shrink-0 rounded-xl overflow-hidden mb-3 shadow-sm">
                        <img 
                          src={entry.image} 
                          alt={entry.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-col flex-1">
                      <h3 className="font-display text-lg text-primary line-clamp-2 leading-tight">
                        {entry.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2 flex-1">
                        {entry.excerpt}
                      </p>
                      <Link 
                        to={`/blog/${entry.slug}`} 
                        className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-[#600694] hover:text-[#4a0473]"
                      >
                        Read →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic py-8">No other posts found in this category.</p>
            )}

          </div>
        </section>
      )}
    </AnimatedPage>
  );
}