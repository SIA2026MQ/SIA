import { useState, useEffect } from "react";
import { Clock, Edit, Trash2, Link as LinkIcon, Radio, Power, Save, X } from "lucide-react";
import { api } from "@/lib/api";

export function DailySessionTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [title, setTitle] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [time, setTime] = useState(""); 
  const [sessionType, setSessionType] = useState("Satsung");
  const [isActive, setIsActive] = useState(false);
  
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getSessionHistory();
      setHistory(data.sessions || []);
    } catch (error) {
      console.error("Failed to load session history:", error);
    }
  };

  const saveSession = async () => {
    if (!zoomLink || !title || !time) {
      alert("Please provide all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { title, zoomLink, time, sessionType, isActive };
      
      if (editingId) {
        await api.updateDailySession(editingId, payload);
        alert("Session updated successfully!");
      } else {
        await api.createDailySession(payload);
        alert("New master link saved!");
      }
      
      resetForm();
      fetchHistory();
      handlePostSave();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Error saving session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editSession = (session: any) => {
    setEditingId(session.id);
    setTitle(session.title);
    setZoomLink(session.zoomLink);
    setTime(session.time || "");
    setSessionType(session.sessionType || "Satsung");
    setIsActive(session.isActive);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSession = async (id: string) => {
    if (!window.confirm("Delete this link permanently?")) return;
    try {
      await api.deleteDailySession(id);
      if (editingId === id) resetForm();
      fetchHistory();
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  const toggleSession = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleDailySession(id, !currentStatus);
      fetchHistory();
    } catch (error) {
      alert("Failed to toggle status.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setZoomLink("");
    setTime("");
    setSessionType("Satsung");
    setIsActive(false);
  };

  return (
    <div className="space-y-8">
      {/* Creation/Edit Form */}
      <div className="sia-card p-6 space-y-4 border border-gray-100 shadow-sm rounded-3xl bg-white relative overflow-hidden">
        {editingId && (
          <div className="absolute top-0 right-0 bg-[#600694] text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
            Edit Mode
          </div>
        )}
        
        <h3 className="sia-h3 text-[#600694]">
          {editingId ? "Update Master Link" : "Create New Master Link"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none" placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="time" className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        
        <input className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none" placeholder="Zoom Meeting Link" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none bg-white" value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
            <option value="Satsung">Satsung</option>
            <option value="QnA">QnA</option>
          </select>
          <select className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none bg-white font-semibold" value={isActive ? "true" : "false"} onChange={(e) => setIsActive(e.target.value === "true")}>
            <option value="true">✅ Enabled (Visible to Users)</option>
            <option value="false">❌ Disabled (Hidden)</option>
          </select>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button 
            disabled={isSubmitting}
            className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a0473] transition-colors flex items-center gap-2 shadow-md disabled:opacity-50" 
            onClick={saveSession}
          >
            <Save className="h-5 w-5" /> 
            {isSubmitting ? "Saving..." : (editingId ? "Update Master Link" : "Save Master Link")}
          </button>
          
          {editingId && (
            <button 
              className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
              onClick={resetForm}
            >
              <X className="h-5 w-5" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* History/Link List */}
      <div className="sia-card p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <h3 className="sia-h3 mb-4 text-gray-800">Saved Master Links</h3>
        <div className="space-y-3">
          {history.map((session) => (
            <div key={session.id} className={`p-4 border ${session.isActive ? 'border-green-400 bg-green-50/30' : 'border-gray-100 bg-gray-50/50'} rounded-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:shadow-sm transition-all`}>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                  {session.isActive && <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">Live</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold mt-1">
                  <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{session.sessionType}</span>
                  {session.time && <span className="text-[#600694] bg-[#600694]/10 px-2 py-0.5 rounded-md flex items-center gap-1"><Clock className="h-3 w-3"/>{session.time}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button onClick={() => toggleSession(session.id, session.isActive)} className={`p-3 rounded-xl transition-colors ${session.isActive ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-200'}`} title="Toggle Status">
                  <Power size={18} />
                </button>
                <button onClick={() => editSession(session)} className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit Session">
                  <Edit size={18} />
                </button>
                <button onClick={() => deleteSession(session.id)} className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-colors" title="Delete Session">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}