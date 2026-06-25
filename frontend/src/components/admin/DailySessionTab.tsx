import { useState, useEffect } from "react";
import { Clock, Edit, Trash2, Link as LinkIcon, CheckCircle2, Power } from "lucide-react";
import { api } from "@/lib/api";

export function DailySessionTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [title, setTitle] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [time, setTime] = useState(""); 
  
  const [history, setHistory] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); 

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getSessionHistory();
      if (data && data.sessions) {
        setHistory(data.sessions);
      }
    } catch (error) {
      console.error("Failed to load session history:", error);
    }
  };

  const saveSession = async () => {
    if (!zoomLink || !title || !time) {
      alert("Please provide a title, time, and Zoom link.");
      return;
    }

    try {
      if (editingId) {
        await api.updateDailySession(editingId, { title, zoomLink, time });
        alert("Daily session updated successfully!");
      } else {
        await api.createDailySession({ title, zoomLink, time });
        alert("New daily session published!");
      }
      
      resetForm();
      fetchHistory();
      handlePostSave();
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to publish the daily session.");
    }
  };

  // 🚨 NEW: The toggle function!
  const toggleSession = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleDailySession(id, !currentStatus);
      fetchHistory(); // Refresh to show the green "Enabled" status
    } catch (error) {
      alert("Failed to toggle session status.");
    }
  };

  const editSession = (session: any) => {
    setEditingId(session.id);
    setTitle(session.title);
    setZoomLink(session.zoomLink);
    setTime(session.time || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSession = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.deleteDailySession(id);
      fetchHistory();
    } catch (error) {
      alert("Failed to delete session.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setZoomLink("");
    setTime("");
  };

  return (
    <div className="space-y-8">
      {/* Creation/Edit Form */}
      <div className="sia-card p-6 space-y-4 border border-gray-100 shadow-sm rounded-3xl bg-white relative">
        {editingId && (
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 px-4 py-1 rounded-bl-xl rounded-tr-3xl text-xs font-bold uppercase tracking-wider">
            Edit Mode
          </div>
        )}
        <h3 className="sia-h3 text-[#600694]">
          {editingId ? "Update Live Session" : "Create Master Live Session Link"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] transition-colors"
                placeholder="Session Title (e.g. Sunday Morning Satsang)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div className="relative">
                <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                <input 
                type="time" 
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] transition-colors cursor-pointer"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                />
            </div>
        </div>
        
        <input 
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] transition-colors"
          placeholder="Zoom Meeting Link"
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
        />
        
        <div className="flex gap-3">
          <button 
            className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a0473] transition-colors flex items-center gap-2 shadow-md" 
            onClick={saveSession}
          >
            <CheckCircle2 className="h-5 w-5" /> 
            {editingId ? "Update Session Link" : "Save Link to Dashboard"}
          </button>
          
          {editingId && (
            <button 
              className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="sia-card p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <h3 className="sia-h3 mb-4 text-gray-800">Master Links</h3>
        
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 italic bg-gray-50 p-6 rounded-2xl text-center border border-dashed">No master links found. Create one above.</p>
        ) : (
          <div className="space-y-3">
            {history.map((session: any) => (
              <div key={session.id} className={`p-4 border ${session.isActive ? 'border-green-400 bg-green-50/30' : 'border-gray-100 bg-gray-50/50'} rounded-2xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:shadow-sm transition-all group`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900 text-lg">{session.title}</p>
                    {session.isActive && <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse">Live Now</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold mt-1">
                    {session.time && (
                      <span className="text-[#600694] bg-[#600694]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {session.time}
                      </span>
                    )}
                    <span className="truncate max-w-[200px] sm:max-w-xs">{session.zoomLink}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto pt-3 xl:pt-0 border-t xl:border-t-0 border-gray-200">
                  
                  {/* 🚨 NEW: Enable/Disable Button */}
                  <button 
                    onClick={() => toggleSession(session.id, session.isActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
                      session.isActive 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    <Power className="h-4 w-4" />
                    {session.isActive ? 'Disable Link' : 'Enable Link'}
                  </button>

                  <a 
                    href={session.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#600694] hover:bg-[#600694]/10 rounded-xl transition-colors"
                    title="Test Link"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </a>
                  <button 
                    onClick={() => editSession(session)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Session"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}