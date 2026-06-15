import { useState, useEffect } from "react";
import { api } from "@/lib/api"; // <-- We MUST use your secure API wrapper!

export function DailySessionTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [title, setTitle] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  // Securely fetch session history when the tab opens
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getSessionHistory();
        // Safely set the array to prevent .map() crashes
        if (data && data.sessions) {
          setHistory(data.sessions);
        }
      } catch (error) {
        console.error("Failed to load session history:", error);
      }
    };
    
    fetchHistory();
  }, []);

  const saveSession = async () => {
    if (!zoomLink) {
      alert("Please provide a Zoom link.");
      return;
    }

    try {
      // Securely post the new session
      await api.createDailySession({ title, zoomLink });
      alert("Daily session updated!");
      
      // Clear the form
      setTitle("");
      setZoomLink("");
      
      // Refresh the history list so the admin sees the new entry immediately
      const data = await api.getSessionHistory();
      if (data && data.sessions) setHistory(data.sessions);
      
      handlePostSave();
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to publish the daily session. Check console for details.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Creation Form */}
      <div className="sia-card p-6 space-y-4 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <h3 className="sia-h3 text-[#600694]">Update Today's Live Session</h3>
        <input 
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694]/50"
          placeholder="Session Title (e.g. Sunday Morning Satsang)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694]/50"
          placeholder="Zoom Meeting Link"
          value={zoomLink}
          onChange={(e) => setZoomLink(e.target.value)}
        />
        <button 
          className="bg-[#600694] text-white px-6 py-3 rounded-full font-bold hover:bg-[#4a0473] transition-colors" 
          onClick={saveSession}
        >
          Publish to Dashboard
        </button>
      </div>

      {/* History List */}
      <div className="sia-card p-6 border border-gray-100 shadow-sm rounded-3xl bg-white">
        <h3 className="sia-h3 mb-4 text-gray-800">Session History</h3>
        
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No past sessions found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((session: any) => (
              <div key={session.id} className="p-4 border border-gray-100 bg-gray-50/50 rounded-2xl flex justify-between items-center hover:shadow-sm transition-all">
                <div>
                  <p className="font-bold text-gray-800">{session.title}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {new Date(session.date).toLocaleString()}
                  </p>
                </div>
                <a 
                  href={session.zoomLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-[#600694]/10 text-[#600694] px-4 py-2 rounded-full font-bold hover:bg-[#600694] hover:text-white transition-colors"
                >
                  Test Link
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}