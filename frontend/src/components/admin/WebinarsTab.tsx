import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS, fileToDataUrl, makeFallbackImage } from "./adminUtils";
import { loadManagedWebinars, saveManagedWebinars, type ManagedWebinar } from "@/utils/contentStore";

// UPDATED: Form state now reflects Prisma fields
type WebinarFormState = {
  title: string; 
  scheduledFor: string; // ISO format string
  minPriceInr: string; 
  minPriceUsd: string; 
  link: string; 
  description: string;
};

const DEFAULT_FORM: WebinarFormState = {
  title: "", scheduledFor: "", minPriceInr: "0", minPriceUsd: "0", link: "", description: "",
};

export function WebinarsTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [webinars, setWebinars] = useState<ManagedWebinar[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WebinarFormState>(DEFAULT_FORM);

  useEffect(() => {
    setWebinars(loadManagedWebinars());
  }, []);

  const resetEditor = () => { setEditingId(null); setForm(DEFAULT_FORM); };

  const deleteWebinar = (id: string) => {
    const updated = webinars.filter((item) => item.id !== id);
    setWebinars(updated); saveManagedWebinars(updated);
    if (editingId === id) resetEditor();
    window.dispatchEvent(new Event("sia-content-updated"));
  };

  const editWebinar = (webinar: ManagedWebinar) => {
    setEditingId(webinar.id);
    setForm({
      title: webinar.title,
      scheduledFor: webinar.scheduledFor || "",
      minPriceInr: webinar.minPriceInr?.toString() || "0",
      minPriceUsd: webinar.minPriceUsd?.toString() || "0",
      link: webinar.link || "",
      description: webinar.description || "",
    });
  };

  return (
    <article className="sia-card space-y-6">
      <h2 className="sia-h3">{editingId ? "Edit Webinar" : "Add Webinar"}</h2>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const imageDataUrl = await fileToDataUrl((data.get("image") as File) || null);
          
          const next: ManagedWebinar = {
            id: editingId ?? crypto.randomUUID(),
            title: form.title,
            scheduledFor: form.scheduledFor,
            minPriceInr: parseFloat(form.minPriceInr),
            minPriceUsd: parseFloat(form.minPriceUsd),
            description: form.description,
            link: form.link,
            imageDataUrl,
          };
          
          const updated = editingId
            ? webinars.map((item) => item.id === editingId ? { ...item, ...next, imageDataUrl: imageDataUrl || item.imageDataUrl } : item)
            : [...webinars, next];
          
          setWebinars(updated); saveManagedWebinars(updated);
          window.dispatchEvent(new Event("sia-content-updated"));
          resetEditor(); handlePostSave();
        }}
      >
        <AdminFormField label="Title" className="md:col-span-2">
          <input name="title" required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>
        
        <AdminFormField label="Scheduled Date">
          <input type="datetime-local" name="scheduledFor" required value={form.scheduledFor} onChange={(e) => setForm(p => ({ ...p, scheduledFor: e.target.value }))} className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        <div className="grid grid-cols-2 gap-4">
          <AdminFormField label="Min Price (INR)">
            <input type="number" name="minPriceInr" required value={form.minPriceInr} onChange={(e) => setForm(p => ({ ...p, minPriceInr: e.target.value }))} className={ADMIN_INPUT_CLASS} />
          </AdminFormField>
          <AdminFormField label="Min Price (USD)">
            <input type="number" name="minPriceUsd" required value={form.minPriceUsd} onChange={(e) => setForm(p => ({ ...p, minPriceUsd: e.target.value }))} className={ADMIN_INPUT_CLASS} />
          </AdminFormField>
        </div>

        <AdminFormField label="Description" className="md:col-span-2">
          <textarea name="description" required value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} />
        </AdminFormField>
        
        <AdminFormField label="Zoom/Join Link" className="md:col-span-2">
          <input name="link" value={form.link} onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." className={ADMIN_INPUT_CLASS} />
        </AdminFormField>

        {/* ... Image upload and Buttons remain the same ... */}
        <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
          <button className="sia-button-primary">{editingId ? "Update Webinar" : "Save Webinar"}</button>
          {editingId && <button type="button" className="sia-button-outline" onClick={resetEditor}>Cancel</button>}
        </div>
      </form>
    </article>
  );
}