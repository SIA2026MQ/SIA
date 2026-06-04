import { Link, useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import lotusDawn from "@/assets/lotus-dawn.jpg";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { blogs: blogPosts } = useSiteContent();
  const post = blogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    return (
      <section className="section-odd min-h-screen pt-32">
        <div className="sia-container text-center">
          <h1 className="sia-h1">Post not found</h1>
          <Link to="/blog" className="mt-4 inline-flex text-primary">
            Back to blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-12">
        <div className="sia-container relative lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                Contents
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {post.body.map((_: string, index: number) => (
                  <li key={index}>
                    <a href={`#section-${index + 1}`} className="hover:text-primary">
                      Section {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <article className="mx-auto max-w-3xl">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 bg-primary" />
            </div>
            <img
              src={
                ("imageDataUrl" in post && typeof post.imageDataUrl === "string"
                  ? post.imageDataUrl
                  : undefined) || post.imageUrl || lotusDawn
              }
              alt={post.title}
              className="mt-6 aspect-[16/8] w-full rounded-3xl object-cover"
              width={1200}
              height={800}
              loading="eager"
            />
            <h1 className="mt-8 font-display text-5xl leading-tight text-primary">{post.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>

            <div className="mt-10 space-y-8 text-[17px] leading-[1.9] text-foreground/95">
              {post.body.map((paragraph: string, index: number) => (
                <section key={index} id={`section-${index + 1}`}>
                  <p>{paragraph}</p>
                </section>
              ))}
              <blockquote className="border-l-4 border-primary pl-5 font-display text-4xl italic text-primary/85">
                Awareness does not arrive from outside. It is remembered from within.
              </blockquote>
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="aspect-video">
                  <ReactPlayer
                    src="https://www.youtube.com/watch?v=2OEL4P1Rz04"
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {["WhatsApp", "X", "Facebook", "Copy Link"].map((name) => (
                <button
                  key={name}
                  className="rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-primary"
                >
                  {name}
                </button>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section-even py-14">
        <div className="sia-container space-y-6">
          <h2 className="sia-h2">Related Posts</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {blogPosts
              .filter((entry) => entry.slug !== post.slug)
              .slice(0, 3)
              .map((entry) => (
                <article key={entry.slug} className="sia-card">
                  <h3 className="font-display text-3xl text-primary">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.excerpt}</p>
                  <Link
                    to={`/blog/${entry.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold uppercase tracking-[0.06em] text-primary"
                  >
                    Read More →
                  </Link>
                </article>
              ))}
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
}
