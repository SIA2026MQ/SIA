import { useState } from "react";
import { X, Image as ImageIcon, Calendar, IndianRupee, Video } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 🚨 NEW: Import the navigation hook
import { api } from "@/lib/api";

interface WebinarGridProps {
  webinars: any[];
  setWebinars: any;
  loading: boolean;
  subscription: any;
  setSubscription: any;
}

export function WebinarGrid({ webinars, setWebinars, loading, subscription, setSubscription }: WebinarGridProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<any | null>(null);
  
  // 🚨 NEW: Initialize the navigate function
  const navigate = useNavigate();

  const handleJoinClick = async (webinar: any) => {
    // 1. If they already have access, just open the link
    if (webinar.hasAccess && webinar.meetLink && !webinar.meetLink.includes('LOCKED')) {
      window.open(webinar.meetLink, "_blank", "noopener,noreferrer");
      return;
    }

    // 2. 🚨 UPDATED: If they have 0 credits, alert them and teleport them to the upgrade page
    if (!subscription || subscription.remainingCredits < 1) {
      alert("You don't have enough webinar credits. Please upgrade your membership.");
      navigate("/satsungs"); 
      return;
    }

    // 3. Otherwise, confirm and process the credit redemption
    const confirm = window.confirm(`This will consume 1 Webinar Credit. You have ${subscription.remainingCredits} left. Proceed?`);
    if (!confirm) return;

    setProcessingId(webinar.id);
    try {
      const res = await api.redeemWebinarCredit(webinar.id);
      
      // Update the main list
      setWebinars((prev: any[]) => prev.map(w => 
        w.id === webinar.id ? { ...w, hasAccess: true, meetLink: res.meetLink } : w
      ));

      // Update the modal view so it instantly shows as unlocked
      setSelectedWebinar((prev: any) => prev ? { ...prev, hasAccess: true, meetLink: res.meetLink } : null);

      setSubscription((prev: any) => ({
        ...prev,
        remainingCredits: prev.remainingCredits - 1
      }));

      window.open(res.meetLink, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      alert(error.message || "Failed to redeem credit.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center p-10">Loading upcoming webinars...</div>;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 mt-2">
        {webinars.length === 0 && (
          <div className="col-span-2 text-center p-10 bg-white rounded-3xl border border-gray-100">
            <p className="text-muted-foreground">No upcoming webinars scheduled right now.</p>
          </div>
        )}

        {/* 1. UNIFORM GRID CARDS WITH IMAGES */}
        {webinars.map((webinar) => (
          <div key={webinar.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group">
            
            {/* Top Badges */}
            <div className="flex justify-between items-start mb-4">
              <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {webinar.date}
              </span>
              {webinar.hasAccess && (
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">Unlocked</span>
              )}
            </div>

            {/* Card Image Thumbnail */}
            <div className="w-full h-40 bg-gray-100 rounded-2xl mb-5 overflow-hidden relative shrink-0">
              {webinar.imageUrl ? (
                <img 
                  src={webinar.imageUrl} 
                  alt={webinar.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="h-8 w-8"/>
                </div>
              )}
            </div>
            
            {/* Title & Description */}
            <h3 className="font-display text-xl text-gray-900 mb-2">{webinar.title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{webinar.description}</p>
            
            {/* Action Button */}
            <button
              onClick={() => setSelectedWebinar(webinar)}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors"
            >
              View Details & Join
            </button>
          </div>
        ))}
      </div>

      {/* 2. FULL SCREEN SPLIT MODAL */}
      {selectedWebinar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedWebinar(null)} 
              className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-gray-100 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            {/* LEFT SIDE: Full Description */}
            <div className="md:w-1/2 bg-gray-50 p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Live Webinar
              </span>
              <h2 className="text-3xl font-display font-bold text-gray-900 mt-4 mb-4">{selectedWebinar.title}</h2>
              
              <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100">
                <p className="flex items-center gap-2 w-full"><Calendar className="h-4 w-4 text-[#600694]"/> {selectedWebinar.date} at {selectedWebinar.time}</p>
              </div>

              <div className="prose prose-sm text-gray-600">
                <p className="whitespace-pre-wrap leading-relaxed">{selectedWebinar.description}</p>
              </div>
            </div>

            {/* RIGHT SIDE: Image & Action Area */}
            <div className="md:w-1/2 flex flex-col bg-white overflow-y-auto">
              {/* Header Image */}
              <div className="h-48 md:h-64 w-full bg-gray-200 relative shrink-0">
                {selectedWebinar.imageUrl ? (
                  <img src={selectedWebinar.imageUrl} alt="Webinar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="h-10 w-10"/></div>
                )}
              </div>

              {/* Action Box */}
              <div className="p-8 md:p-12 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Webinar Access</h3>
                
                {selectedWebinar.hasAccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-green-800 font-semibold text-sm flex items-center gap-2">
                      <Video className="h-4 w-4"/> Access Granted
                    </p>
                    <p className="text-xs text-green-600 mt-1">You have unlocked the Zoom link for this session.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-gray-400"/> Standard Price:</span>
                      <span>₹{selectedWebinar.priceInr}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-[#600694] pt-3 border-t border-gray-200">
                      <span>Subscriber Price:</span>
                      <span>1 Credit</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-6">
                  <button
                    onClick={() => handleJoinClick(selectedWebinar)}
                    disabled={processingId === selectedWebinar.id}
                    className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors shadow-md ${
                      selectedWebinar.hasAccess 
                        ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' 
                        : 'bg-[#600694] hover:bg-[#4a0473] text-white'
                    }`}
                  >
                    {processingId === selectedWebinar.id ? "Processing..." : 
                     selectedWebinar.hasAccess ? "Join Zoom Webinar Now" : "Redeem 1 Credit to Unlock"}
                  </button>
                  
                  {!selectedWebinar.hasAccess && (
                    <p className="text-center text-xs text-gray-500 mt-4">
                      You currently have <span className="font-bold text-[#600694]">{subscription?.remainingCredits || 0}</span> credits remaining.
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}