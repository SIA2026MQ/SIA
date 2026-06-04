import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS, fileToDataUrl, makeFallbackImage } from "./adminUtils";
import { loadManagedBlogs, saveManagedBlogs, toSlug, type ManagedBlog } from "@/utils/contentStore";

type BlogFormState = {
  title: string;
  category: string;
  author: string;
  readTime: string;
  excerpt: string;
  content: string;
  youtubeUrl: string;
};

const DEFAULT_FORM: BlogFormState = {
  title: "",
  category: "Spirituality",
  author: "Admin",
  readTime: "6 min read",
  excerpt: "",
  content: "",
  youtubeUrl: "",
};

export function BlogsTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [blogs, setBlogs] = useState<ManagedBlog[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(DEFAULT_FORM);

  useEffect(() => {
    setBlogs(loadManagedBlogs());
  }, []);

  const resetEditor = () => {
    setEditingSlug(null);
    setForm(DEFAULT_FORM);
  };

  const deleteBlog = (slug: string) => {
    const updated = blogs.filter((item) => item.slug !== slug);
    setBlogs(updated);
    saveManagedBlogs(updated);
    if (editingSlug === slug) resetEditor();
    window.dispatchEvent(new Event("sia-content-updated"));
  };

  const editBlog = (blog: ManagedBlog) => {
    setEditingSlug(blog.slug);
    setForm({
      title: blog.title,
      category: blog.category,
      author: blog.author,
      readTime: blog.readTime,
      excerpt: blog.excerpt,
      content: blog.body?.join("\n") || "",
      youtubeUrl: blog.youtubeUrl || "",
    });
  };

  const blogSlugPreview = editingSlug ?? (form.title ? toSlug(form.title) : "post-slug");

  return (
    <article className="sia-card space-y-6">
      <h2 className="sia-h3">{editingSlug ? "Edit Blog Post" : "Add Blog Post"}</h2>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);

          // Image handling: this maps to your imageUrlR2 database field
          const imageDataUrl = await fileToDataUrl((data.get("image") as File) || null);

          const next: ManagedBlog = {
            slug: editingSlug ?? toSlug(form.title),
            category: form.category,
            title: form.title,
            excerpt: form.excerpt,
            author: form.author,
            date: new Date().toLocaleDateString(),
            readTime: form.readTime,
            youtubeUrl: form.youtubeUrl,
            imageDataUrl,
            body: form.content.split("\n").map((line) => line.trim()).filter(Boolean),
          };

          const updated = editingSlug
            ? blogs.map((item) =>
                item.slug === editingSlug ? { ...item, ...next, imageDataUrl: imageDataUrl || item.imageDataUrl } : item
              )
            : [...blogs, next];

          setBlogs(updated);
          saveManagedBlogs(updated);
          window.dispatchEvent(new Event("sia-content-updated"));
          resetEditor();
          handlePostSave();
        }}
      >
        <AdminFormField label="Title" className="md:col-span-2">
          <input name="title" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <AdminFormField label="Slug">
          <input value={blogSlugPreview} readOnly className={`${ADMIN_INPUT_CLASS} cursor-not-allowed opacity-80`} />
        </AdminFormField>

        <AdminFormField label="Category">
          <input name="category" required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <AdminFormField label="Short Description (Excerpt)" className="md:col-span-2">
          <textarea name="excerpt" required value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} />
        </AdminFormField>

        <AdminFormField label="YouTube Embed URL" className="md:col-span-2">
          <input name="youtubeUrl" value={form.youtubeUrl} onChange={(e) => setForm((p) => ({ ...p, youtubeUrl: e.target.value }))} placeholder="https://youtube.com/..." className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <AdminFormField label="Post Body Content" className="md:col-span-2">
          <textarea name="content" required value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="min-h-44 w-full rounded-3xl border border-border bg-input px-4 py-3" />
        </AdminFormField>

        <AdminFormField label="Author">
          <input name="author" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <AdminFormField label="Read Time">
          <input name="readTime" value={form.readTime} onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <AdminFormField label="Cover Image (R2 Upload)" className="md:col-span-2">
          <input name="image" type="file" accept="image/*" className="block h-12 w-full rounded-full border border-border bg-input px-4 py-3 text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary" />
        </AdminFormField>

        <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
          <button className="sia-button-primary">{editingSlug ? "Update Blog" : "Save Blog"}</button>
          {editingSlug && (
            <button type="button" className="sia-button-outline" onClick={resetEditor}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {blogs.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">Managed Blogs</p>
          {blogs.map((blog) => (
            <div key={blog.slug} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src={blog.imageDataUrl || blog.imageUrl || makeFallbackImage("Blog")} alt={blog.title} className="h-16 w-24 rounded-lg border border-border object-cover" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{blog.title}</p>
                  <p className="text-xs text-muted-foreground">{blog.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary" onClick={() => editBlog(blog)}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-destructive/40 text-destructive" onClick={() => deleteBlog(blog.slug)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}