import { useState, useEffect } from "react";
import { Calendar, Clock, Edit, Trash2, Save, X } from "lucide-react";
import { api } from "@/lib/api";

export function ScheduleTab() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); 
  const [category, setCategory] = useState("Satsung");
  
  const [schedules, setSchedules] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    try {
      const data = await api.getSchedules();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error("Failed to load schedules", error);
    }
  };

  const saveSchedule = async () => {
    if (!title || !date || !time) {
      alert("Please provide title, date, and time.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateSchedule(editingId, { title, date, time, category });
      } else {
        await api.createSchedule({ title, date, time, category });
      }
      resetForm();
      fetchSchedules();
    } catch (error) {
      alert("Error saving schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editSchedule = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDate(item.date.split("T")[0]); // Format YYYY-MM-DD for input
    setTime(item.time);
    setCategory(item.category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSchedule = async (id: string) => {
    if (!window.confirm("Delete this scheduled event?")) return;
    try {
      await api.deleteSchedule(id);
      if (editingId === id) resetForm();
      fetchSchedules();
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setTime("");
    setCategory("Satsung");
  };

  return (
    <div className="space-y-8">
      <div className="sia-card p-6 space-y-4 border border-gray-100 shadow-sm rounded-3xl bg-white relative">
        <h3 className="sia-h3 text-[#600694]">{editingId ? "Edit Schedule" : "Add Upcoming Event"}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full p-3 border border-gray-200 rounded-xl" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="w-full p-3 border border-gray-200 rounded-xl bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Satsung">Satsung</option>
              <option value="QnA">QnA</option>
            </select>
            <input type="date" className="w-full p-3 border border-gray-200 rounded-xl" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" className="w-full p-3 border border-gray-200 rounded-xl" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button disabled={isSubmitting} className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a0473] flex items-center gap-2" onClick={saveSchedule}>
            <Save className="h-5 w-5" /> {editingId ? "Update Schedule" : "Save Schedule"}
          </button>
          {editingId && <button className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-2" onClick={resetForm}><X className="h-5 w-5" /> Cancel</button>}
        </div>
      </div>

      <div className="sia-card p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <h3 className="sia-h3 mb-4 text-gray-800">Upcoming Events</h3>
        <div className="space-y-3">
          {schedules.map((item) => (
            <div key={item.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">{item.title} <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${item.category === 'QnA' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{item.category}</span></p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(item.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editSchedule(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl"><Edit size={18} /></button>
                <button onClick={() => deleteSchedule(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-xl"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}