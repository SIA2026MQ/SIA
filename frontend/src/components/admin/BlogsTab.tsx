import { useState, useEffect } from "react";
import { Pencil, Trash2, UploadCloud, BookOpen, Link as LinkIcon, Youtube, Clock, User, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS } from "./adminUtils";

export function BlogsTab({ handlePostSave }: { handlePostSave?: () => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Spirituality");
  const [excerpt, setExcerpt] = useState("");
  const [bodyContent, setBodyContent] = useState(""); // We type text here, convert to JSON on submit
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [author, setAuthor] = useState("SIA Team");
  const [readTime, setReadTime] = useState("5 min read");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadData = async () => {
    try {
      const res = await api.getBlogs();
      setBlogs(res.blogs || []);
    } catch (error) {
      console.error("Failed to load blogs:", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Automatically generate a URL-friendly slug as the admin types the title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!editingId) {
      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setSlug(""); setCategory("Spirituality"); setExcerpt(""); 
    setBodyContent(""); setYoutubeUrl(""); setAuthor("SIA Team"); setReadTime("5 min read"); setImageFile(null);
  };

  const handleEditClick = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setCategory(blog.category);
    setExcerpt(blog.excerpt || "");
    setYoutubeUrl(blog.youtubeUrl || "");
    setAuthor(blog.author);
    setReadTime(blog.readTime);
    
    // Extract the text back out of the JSON array for editing
    let extractedText = "";
    if (Array.isArray(blog.body) && blog.body.length > 0) {
      extractedText = blog.body[0].content || "";
    } else if (typeof blog.body === 'string') {
      extractedText = blog.body;
    }
    setBodyContent(extractedText);
    
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, blogTitle: string) => {
    if (!window.confirm(`WARNING: Are you sure you want to completely delete "${blogTitle}"?`)) return;
    try {
      await api.deleteBlog(id);
      loadData();
    } catch (error) {
      alert("Failed to delete blog.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = "";

      // 1. Upload Cover Image to Cloudflare R2
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("http://localhost:5000/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        
        if (uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // 2. Prepare Payload (Matches your exact blog.controller.ts)
      const payload: any = { 
        title, 
        slug, 
        category, 
        excerpt, 
        // Wrap the raw string in an array so Prisma accepts it as valid JSON
        body: [{ type: 'paragraph', content: bodyContent }], 
        youtubeUrl, 
        author, 
        readTime 
      };
      
      if (imageUrl) payload.image = imageUrl;

      // 3. Save to Database
      if (editingId) {
        await api.updateBlog(editingId, payload);
        alert("Blog Updated Successfully!");
      } else {
        await api.createBlog(payload);
        alert("Blog Published Successfully!");
      }
      
      resetForm();
      loadData();
      if (handlePostSave) handlePostSave();
    } catch (error: any) {
      alert(error.message || "Failed to save blog. Check if the slug already exists.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <article className="space-y-8">
      {/* ---------------- CREATE / EDIT FORM ---------------- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        {editingId && <span className="absolute top-6 right-8 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Editing Mode</span>}
        
        <h2 className="text-xl font-bold text-[#600694] mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> {editingId ? "Update Blog Post" : "Draft New Blog Post"}
        </h2>
        
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          
          <AdminFormField label="Blog Title" className="md:col-span-2">
            <input required value={title} onChange={handleTitleChange} className={ADMIN_INPUT_CLASS} placeholder="e.g. 5 Morning Rituals for Inner Peace" />
          </AdminFormField>

          <AdminFormField label="URL Slug (Auto-generated)">
            <div className="flex relative">
              <span className="absolute left-3 top-3.5 text-gray-400"><LinkIcon className="h-4 w-4"/></span>
              <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={`${ADMIN_INPUT_CLASS} pl-10`} placeholder="5-morning-rituals" />
            </div>
          </AdminFormField>

          <AdminFormField label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={ADMIN_INPUT_CLASS}>
              <option value="Spirituality">Spirituality</option>
              <option value="Meditation">Meditation</option>
              <option value="Healing">Healing</option>
              <option value="Wellness">Wellness</option>
              <option value="Retreats">Retreats</option>
            </select>
          </AdminFormField>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <AdminFormField label="Author Name">
              <div className="flex relative"><span className="absolute left-3 top-3.5 text-gray-400"><User className="h-4 w-4"/></span>
                <input required value={author} onChange={(e) => setAuthor(e.target.value)} className={`${ADMIN_INPUT_CLASS} pl-10`} placeholder="SIA Team" />
              </div>
            </AdminFormField>
            
            <AdminFormField label="Estimated Read Time">
              <div className="flex relative"><span className="absolute left-3 top-3.5 text-gray-400"><Clock className="h-4 w-4"/></span>
                <input required value={readTime} onChange={(e) => setReadTime(e.target.value)} className={`${ADMIN_INPUT_CLASS} pl-10`} placeholder="5 min read" />
              </div>
            </AdminFormField>
          </div>

          <AdminFormField label="Short Excerpt (Displayed on Cards)" className="md:col-span-2">
            <textarea required rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={ADMIN_TEXTAREA_CLASS} placeholder="A short, catchy summary of the post..." />
          </AdminFormField>
          
          <AdminFormField label="Main Body Content" className="md:col-span-2">
            <textarea required rows={10} value={bodyContent} onChange={(e) => setBodyContent(e.target.value)} className={ADMIN_TEXTAREA_CLASS} placeholder="Write your full blog post here... You can use paragraphs." />
          </AdminFormField>

          <AdminFormField label="YouTube Embed URL (Optional)" className="md:col-span-2">
             <div className="flex relative"><span className="absolute left-3 top-3.5 text-red-500"><Youtube className="h-4 w-4"/></span>
                <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className={`${ADMIN_INPUT_CLASS} pl-10`} placeholder="https://www.youtube.com/embed/..." />
              </div>
          </AdminFormField>
          
          {/* Cloudflare Image Upload Field */}
          <div className="md:col-span-2 p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors mt-2 mb-4">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <UploadCloud className="h-10 w-10 text-[#600694] mb-3" />
              <span className="text-sm font-bold text-gray-800">{imageFile ? imageFile.name : editingId ? "Upload NEW Cover Image (Optional)" : "Upload Blog Cover Image"}</span>
              <span className="text-xs text-gray-500 mt-1">Recommended: 1200x630px (Max 5MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 md:col-span-2 border-t border-gray-100 pt-5">
            {editingId && (
              <button type="button" onClick={resetForm} disabled={isUploading} className="sia-button-outline px-6 py-2.5">
                Cancel Edit
              </button>
            )}
            <button type="submit" disabled={isUploading} className={`px-8 py-2.5 rounded-full font-bold text-white transition-colors shadow-md ${isUploading ? 'bg-gray-400' : 'bg-[#600694] hover:bg-[#4a0473]'}`}>
              {isUploading ? "Uploading & Saving..." : editingId ? "Update Blog Post" : "Publish Blog Post"}
            </button>
          </div>
        </form>
      </div>

      {/* ---------------- ACTIVE BLOGS LIST ---------------- */}
      {blogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 flex items-center gap-2 ml-2">
            <BookOpen className="h-5 w-5 text-[#600694]" /> Published Articles ({blogs.length})
          </h3>
          <div className="grid gap-4">
            {blogs.map(blog => (
              <div key={blog.id} className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${editingId === blog.id ? 'border-[#600694] bg-[#600694]/5' : 'border-gray-100'}`}>
                
                <div className="flex items-center gap-5 mb-4 sm:mb-0">
                  {blog.image ? (
                    <img src={blog.image} alt="cover" className="w-24 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-24 h-16 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-200 text-gray-400 shrink-0">
                      <ImageIcon className="h-5 w-5 mb-1" />
                      <span className="text-[9px] font-bold">NO IMG</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{blog.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">{blog.category}</span>
                      <span className="text-xs text-gray-500 flex items-center">/{blog.slug}</span>
                      <span className="text-xs text-gray-500 hidden md:inline"> • {blog.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <button onClick={() => handleEditClick(blog)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100" title="Edit Blog">
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(blog.id, blog.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Delete Blog">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}