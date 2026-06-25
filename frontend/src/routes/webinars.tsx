import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, X, Image as ImageIcon, Calendar, Lock, Unlock, LogIn } from "lucide-react";
import { api } from "@/lib/api";

export default function WebinarsPage() {
  // --- State Management ---
  const [webinars, setWebinars] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Interactive UI State ---
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<any | null>(null);
  const navigate = useNavigate();

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchWebinarData = async () => {
      setLoading(true);

      // STEP A: Fetch Webinars (PUBLIC - Everyone can see this)
      try {
        const webinarsRes = await api.getUpcomingWebinars();
        const webinarData = webinarsRes?.data?.webinars || webinarsRes?.webinars || webinarsRes?.data || webinarsRes;
        setWebinars(Array.isArray(webinarData) ? webinarData : []);
      } catch (error) {
        console.error("Failed to fetch webinars:", error);
        setWebinars([]);
      }

      // STEP B: Fetch Subscription/User (PRIVATE - Only works if logged in)
      try {
        // We use the token to check if they are logged in at all
        const token = localStorage.getItem("token"); // Or however you check auth
        
        // If there's no token, we skip trying to fetch private data
        if (token || api.auth?.currentUser) { // Adjust based on your Firebase/JWT setup
          setIsLoggedIn(true);
          const subRes = await api.getUserSubscription();
          const subData = subRes?.data?.subscription || subRes?.subscription || subRes?.data || subRes;
          setSubscription(subData);
        } else {
          setIsLoggedIn(false);
          setSubscription(null);
        }
      } catch (error) {
        // If this fails (e.g., 401 Unauthorized), they are just not logged in/subscribed
        console.warn("User is not logged in or has no active subscription.");
        setIsLoggedIn(false);
        setSubscription(null);
      }

      setLoading(false);
    };

    fetchWebinarData();
  }, []);

  // 2. Handle the "Join / Unlock" Click based on User Status
  const handleActionClick = async (webinar: any) => {
    // SCENARIO 1: User is completely logged out
    if (!isLoggedIn) {
      alert("Please sign in to access webinars.");
      navigate("/login"); // Adjust to your login route
      return;
    }

    // SCENARIO 2: Webinar is already unlocked for this user
    if (webinar.hasAccess && webinar.meetLink && !webinar.meetLink.includes('LOCKED')) {
      window.open(webinar.meetLink, "_blank", "noopener,noreferrer");
      return;
    }

    // SCENARIO 3: Logged in, but 0 credits / no subscription
    if (!subscription || subscription.remainingCredits < 1) {
      alert("You don't have enough webinar credits. Please upgrade your membership to join.");
      navigate("/satsungs"); // Adjust to your pricing/subscription route
      return;
    }

    // SCENARIO 4: Logged in, has credits -> Confirm and Redeem
    const confirm = window.confirm(`This will consume 1 Webinar Credit. You have ${subscription.remainingCredits} left. Proceed?`);
    if (!confirm) return;

    setProcessingId(webinar.id);
    try {
      const res = await api.redeemWebinarCredit(webinar.id);
      
      // Update the main list in the background
      setWebinars((prev) => prev.map(w => 
        w.id === webinar.id ? { ...w, hasAccess: true, meetLink: res.meetLink } : w
      ));

      // Update the open modal view
      setSelectedWebinar((prev: any) => prev ? { ...prev, hasAccess: true, meetLink: res.meetLink } : null);

      // Deduct the credit visually
      setSubscription((prev: any) => ({
        ...prev,
        remainingCredits: prev.remainingCredits - 1
      }));

      // Launch the webinar
      window.open(res.meetLink, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      alert(error.message || "Failed to redeem credit. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Helper to determine Button UI State ---
  const getButtonConfig = (webinar: any) => {
    if (!isLoggedIn) return { text: "Sign in to Join", color: "bg-gray-800 hover:bg-black", icon: <LogIn className="w-5 h-5" /> };
    if (webinar.hasAccess) return { text: "Join Zoom Webinar", color: "bg-green-600 hover:bg-green-700 animate-pulse", icon: <Video className="w-5 h-5" /> };
    if (!subscription || subscription.remainingCredits < 1) return { text: "Upgrade to Join", color: "bg-orange-500 hover:bg-orange-600", icon: <Lock className="w-5 h-5" /> };
    return { text: "Redeem 1 Credit to Join", color: "bg-[#600694] hover:bg-[#4a0473]", icon: <Unlock className="w-5 h-5" /> };
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            PAGE HEADER
        ========================================== */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#600694]/10 rounded-2xl">
              <Video className="w-8 h-8 text-[#600694]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-display">
              Live Webinars
            </h1>
          </div>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl">
            Explore our upcoming live sessions. Subscribed members can use their credits to unlock access and join the conversation.
          </p>
          
          {/* Subscription Status Banner - Only shows if logged in */}
          {!loading && isLoggedIn && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              <span>Your Available Credits:</span>
              <span className={`text-base ${subscription?.remainingCredits > 0 ? 'text-[#600694]' : 'text-red-500'}`}>
                {subscription?.remainingCredits || 0}
              </span>
            </div>
          )}
        </div>

        {/* ==========================================
            WEBINARS GRID
        ========================================== */}
        {loading ? (
          <div className="text-center p-10 text-gray-500 animate-pulse">Loading upcoming webinars...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 mt-2">
            {webinars.length === 0 && (
              <div className="col-span-2 text-center p-10 bg-white rounded-3xl border border-gray-100">
                <p className="text-muted-foreground">No upcoming webinars scheduled right now.</p>
              </div>
            )}

            {webinars.map((webinar) => (
              <div key={webinar.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group cursor-pointer" onClick={() => setSelectedWebinar(webinar)}>
                
                {/* Top Badges */}
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {webinar.date}
                  </span>
                  {webinar.hasAccess && isLoggedIn && (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold border border-green-100">Unlocked</span>
                  )}
                </div>

                {/* Card Image Thumbnail */}
                <div className="w-full h-48 bg-gray-100 rounded-2xl mb-5 overflow-hidden relative shrink-0">
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
                <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{webinar.description}</p>
                
                {/* View Button */}
                <div className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gray-50 text-gray-700 group-hover:bg-[#600694]/5 group-hover:text-[#600694] transition-colors border border-gray-200">
                  View Details
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================
            FULL SCREEN SPLIT MODAL
        ========================================== */}
        {selectedWebinar && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedWebinar(null)} 
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top: Header Image */}
              <div className="h-48 md:h-64 w-full bg-gray-200 relative shrink-0">
                {selectedWebinar.imageUrl ? (
                  <img src={selectedWebinar.imageUrl} alt="Webinar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <ImageIcon className="h-10 w-10"/>
                  </div>
                )}
                {/* Gradient overlay for text legibility if needed later */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Bottom: Content & Action Area */}
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                
                {/* Description Box */}
                <div className="md:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Live Webinar
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                      <Calendar className="h-4 w-4"/> {selectedWebinar.date} • {selectedWebinar.time}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6">{selectedWebinar.title}</h2>
                  
                  <div className="prose prose-sm text-gray-600">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedWebinar.description}</p>
                  </div>
                </div>

                {/* Action Box */}
                <div className="md:w-1/3 p-6 md:p-8 bg-gray-50 border-l border-gray-100 flex flex-col justify-center items-center text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Join?</h3>
                  
                  <p className="text-sm text-gray-500 mb-8">
                    {!isLoggedIn 
                      ? "Create an account or sign in to participate in this live session." 
                      : (!subscription || subscription.remainingCredits < 1) && !selectedWebinar.hasAccess
                      ? "You need an active subscription with credits to unlock this session."
                      : "Use 1 credit to unlock the secure Zoom link for this session."
                    }
                  </p>

                  <button
                    onClick={() => handleActionClick(selectedWebinar)}
                    disabled={processingId === selectedWebinar.id}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-colors shadow-md ${getButtonConfig(selectedWebinar).color}`}
                  >
                    {processingId === selectedWebinar.id ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        {getButtonConfig(selectedWebinar).icon}
                        {getButtonConfig(selectedWebinar).text}
                      </>
                    )}
                  </button>

                  {/* Show credit status under button if they are logged in but haven't unlocked it yet */}
                  {isLoggedIn && !selectedWebinar.hasAccess && (
                    <p className="text-xs text-gray-500 mt-4">
                      Your balance: <span className={`font-bold ${subscription?.remainingCredits > 0 ? 'text-[#600694]' : 'text-red-500'}`}>{subscription?.remainingCredits || 0} credits</span>
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}