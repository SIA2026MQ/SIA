import { useState, useEffect } from "react";
import { Pencil, Trash2, UploadCloud, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS } from "./adminUtils";

export function AdminWebinarTab() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State (Matches Prisma Schema)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priceInr, setPriceInr] = useState("0");
  const [meetLink, setMeetLink] = useState("");

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load data from your real backend
  const loadData = async () => {
    try {
      const res = await api.getWebinars(); 
      setWebinars(res.webinars || []);
    } catch (error) {
      console.error("Failed to load webinars:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setDescription(""); setDate(""); setTime(""); setPriceInr("0"); setMeetLink(""); setImageFile(null);
  };

  const handleEditClick = (webinar: any) => {
    setEditingId(webinar.id);
    setTitle(webinar.title);
    setDescription(webinar.description);
    // Format the database ISO date string so the HTML <input type="date"> can read it
    setDate(new Date(webinar.date).toISOString().split('T')[0]); 
    setTime(webinar.time);
    setPriceInr(webinar.priceInr.toString());
    setMeetLink(webinar.meetLink || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    const confirm = window.confirm(`WARNING: Are you sure you want to delete "${title}"?`);
    if (!confirm) return;

    try {
      await api.deleteWebinar(id); 
      loadData();
    } catch (error) {
      alert("Failed to delete webinar.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = "";

      // 1. Upload to Cloudflare First (If a file was selected)
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      // 2. Prepare Payload
      const payload: any = {
        title, description, date, time, meetLink, priceInr: Number(priceInr)
      };
      
      // Only attach the imageUrl if we successfully uploaded a new one
      if (imageUrl) payload.imageUrl = imageUrl;

      // 3. Save to Database
      if (editingId) {
        await api.updateWebinar(editingId, payload); 
        alert("Webinar Updated Successfully!");
      } else {
        await api.createWebinar(payload); 
        alert("Webinar Created Successfully!");
      }
      
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to save webinar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <article className="space-y-8">
      {/* ---------------- CREATE / EDIT FORM ---------------- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
        {editingId && (
          <span className="absolute top-6 right-8 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Editing Mode</span>
        )}
        <h2 className="text-lg font-bold text-[#600694] mb-6">
          {editingId ? "Update Webinar Details" : "Schedule New Webinar"}
        </h2>
        
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          
          <AdminFormField label="Title" className="md:col-span-2">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={ADMIN_INPUT_CLASS} placeholder="Webinar Title" />
          </AdminFormField>
          
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <AdminFormField label="Date">
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
            
            <AdminFormField label="Time">
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
          </div>

          <AdminFormField label="Price (INR)">
            <input type="number" required value={priceInr} onChange={(e) => setPriceInr(e.target.value)} className={ADMIN_INPUT_CLASS} />
          </AdminFormField>
          
          <AdminFormField label="Zoom / Meet Link">
            <input value={meetLink} onChange={(e) => setMeetLink(e.target.value)} className={ADMIN_INPUT_CLASS} placeholder="https://zoom.us/j/..." />
          </AdminFormField>

          <AdminFormField label="Description" className="md:col-span-2">
            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={ADMIN_TEXTAREA_CLASS} />
          </AdminFormField>
          
          {/* CLOUDFLARE IMAGE UPLOAD FIELD */}
          <div className="md:col-span-2 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mt-2 mb-4">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <UploadCloud className="h-8 w-8 text-[#600694] mb-2" />
              <span className="text-sm font-bold text-gray-700">
                {imageFile ? imageFile.name : editingId ? "Upload NEW Thumbnail (Optional)" : "Upload Thumbnail Image"}
              </span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
              {/* Hidden file input */}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 md:col-span-2 border-t pt-4">
            {editingId && (
              <button type="button" onClick={resetForm} disabled={isUploading} className="sia-button-outline px-6 py-2">
                Cancel Edit
              </button>
            )}
            <button type="submit" disabled={isUploading} className={`px-6 py-2 rounded-full font-bold text-white transition-colors ${isUploading ? 'bg-gray-400' : 'bg-[#600694] hover:bg-[#4a0473]'}`}>
              {isUploading ? "Uploading & Saving..." : editingId ? "Update Webinar" : "Publish Webinar"}
            </button>
          </div>
        </form>
      </div>

      {/* ---------------- ACTIVE WEBINARS LIST ---------------- */}
      {webinars.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase font-bold text-gray-500 ml-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Active Webinars
          </p>
          <div className="grid gap-4">
            {webinars.map(webinar => (
              <div key={webinar.id} className={`flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl border shadow-sm ${editingId === webinar.id ? 'border-[#600694] bg-[#600694]/5' : 'border-gray-200'}`}>
                
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  {/* Thumbnail Image display */}
                  {webinar.imageUrl ? (
                    <img src={webinar.imageUrl} alt="cover" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 text-[10px] text-gray-400 font-bold">NO IMG</div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{webinar.title}</h4>
                    <p className="text-sm text-gray-500 font-medium">
                      {new Date(webinar.date).toLocaleDateString()} @ {webinar.time} • ₹{webinar.priceInr}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEditClick(webinar)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit">
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(webinar.id, webinar.title)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete">
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