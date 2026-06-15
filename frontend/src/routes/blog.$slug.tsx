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
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      if (!slug) return;
      setLoading(true);
      
      try {
        const blogRes = await api.getBlogBySlug(slug);
        setPost(blogRes.blog);
        
        try {
          const allBlogsRes = await api.getBlogs();
          const others = (allBlogsRes.blogs || []).filter((b: any) => b.slug !== slug).slice(0, 3);
          setRelatedPosts(others);
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
        return bodyData.split('\n').filter(p => p.trim() !== "");
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

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-12">
        {/* 🚨 REMOVED the grid layout classes here so the article centers naturally */}
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

              {/* 🚨 ADDED font-bold to the mapped paragraphs here */}
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

      {relatedPosts.length > 0 && (
        <section className="section-even py-14">
          <div className="sia-container space-y-6">
            <h2 className="sia-h2">Related Posts</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedPosts.map((entry) => (
                <article key={entry.slug} className="sia-card hover:shadow-md transition-shadow">
                  <h3 className="font-display text-3xl text-primary line-clamp-2">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground line-clamp-3">{entry.excerpt}</p>
                  <Link to={`/blog/${entry.slug}`} className="mt-4 inline-flex text-sm font-semibold uppercase tracking-[0.06em] text-[#600694] hover:text-[#4a0473]">
                    Read More →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </AnimatedPage>
  );
}