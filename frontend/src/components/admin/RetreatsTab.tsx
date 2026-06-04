import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS, fileToDataUrl, makeFallbackImage } from "./adminUtils";
import { loadManagedRetreats, saveManagedRetreats, type ManagedRetreat } from "@/utils/contentStore";

type RetreatFormState = {
  title: string; date: string; location: string; price: string; description: string;
};

const DEFAULT_FORM: RetreatFormState = {
  title: "", date: "", location: "", price: "$699", description: "",
};

export function RetreatsTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [retreats, setRetreats] = useState<ManagedRetreat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RetreatFormState>(DEFAULT_FORM);

  useEffect(() => { setRetreats(loadManagedRetreats()); }, []);

  const resetEditor = () => { setEditingId(null); setForm(DEFAULT_FORM); };

  const deleteRetreat = (id: string) => {
    const updated = retreats.filter((item) => item.id !== id);
    setRetreats(updated); saveManagedRetreats(updated);
    if (editingId === id) resetEditor();
    window.dispatchEvent(new Event("sia-content-updated"));
  };

  const editRetreat = (retreat: ManagedRetreat) => {
    setEditingId(retreat.id);
    setForm({
      title: retreat.title, date: retreat.date, location: retreat.location,
      price: retreat.price, description: retreat.description,
    });
  };

  return (
    <article className="sia-card space-y-5">
      <h2 className="sia-h3">{editingId ? "Edit Retreat" : "Add Retreat"}</h2>
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const imageDataUrl = await fileToDataUrl((data.get("image") as File) || null);
          const next: ManagedRetreat = {
            id: editingId ?? crypto.randomUUID(),
            title: form.title, date: form.date, location: form.location,
            description: form.description, price: form.price, imageDataUrl,
          };
          const updated = editingId
            ? retreats.map((item) => item.id === editingId ? { ...item, ...next, imageDataUrl: imageDataUrl || item.imageDataUrl } : item)
            : [...retreats, next];
          
          setRetreats(updated); saveManagedRetreats(updated);
          window.dispatchEvent(new Event("sia-content-updated"));
          resetEditor(); handlePostSave();
        }}
      >
        <input name="title" required value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Retreat title" className="h-11 rounded-xl border border-input px-3 md:col-span-2" />
        <input name="date" required value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} placeholder="Date" className="h-11 rounded-xl border border-input px-3" />
        <input name="location" required value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" className="h-11 rounded-xl border border-input px-3" />
        <input name="price" required value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price" className="h-11 rounded-xl border border-input px-3" />
        <input name="image" type="file" accept="image/*" className="h-11 rounded-xl border border-input px-3 py-2" />
        <textarea name="description" required value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="min-h-28 rounded-xl border border-input px-3 py-2 md:col-span-2" />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button className="sia-button-primary">{editingId ? "Update Retreat" : "Save Retreat"}</button>
          {editingId && <button type="button" className="sia-button-outline" onClick={resetEditor}>Cancel Edit</button>}
        </div>
      </form>
      
      {retreats.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">Managed Retreats</p>
          {retreats.map((retreat) => (
            <div key={retreat.id} className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <img src={retreat.imageDataUrl || retreat.imageUrl || makeFallbackImage("Retreat")} alt={retreat.title} className="h-16 w-24 rounded-lg border border-border object-cover" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{retreat.title}</p>
                  <p className="text-xs text-muted-foreground">{retreat.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 text-primary" onClick={() => editRetreat(retreat)}><Pencil className="h-4 w-4" /></button>
                <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-destructive/40 text-destructive" onClick={() => deleteRetreat(retreat.id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}