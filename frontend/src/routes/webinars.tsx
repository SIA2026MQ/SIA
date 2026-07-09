import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Video, X, Image as ImageIcon, Calendar, IndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ==========================================
// 1. PRESENTATIONAL COMPONENT (Grid & Modal)
// ==========================================
interface WebinarGridProps {
  webinars: any[];
  setWebinars: any;
  loading: boolean;
  subscription: any;
  setSubscription: any;
  isLoggedIn: boolean;
}

export function WebinarGrid({ webinars, setWebinars, loading, subscription, setSubscription, isLoggedIn }: WebinarGridProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<any | null>(null);
  const navigate = useNavigate();

  // Custom Popup State
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const closePopup = () => setPopup(null);

  // Helper function to ensure the URL is absolute
  const getAbsoluteUrl = (url: string) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  // 🚨 REFACTORED: The Modal Button Logic
  // This handles all the gatekeeper checks when the user actually tries to Join/Unlock
  const handleJoinClick = async (webinar: any) => {
    // 1. Check if user is logged in
    if (!isLoggedIn) {
      setPopup({
        isOpen: true,
        title: "Authentication Required",
        message: "Please sign in or create an account to unlock webinars and join live sessions.",
        type: "alert",
        confirmText: "Go to Login",
        onConfirm: () => {
          closePopup();
          navigate("/login", { state: { from: "/membership" } });
        }
      });
      return;
    }

    // 2. If already unlocked, just open the Zoom link
    if (webinar.hasAccess && webinar.meetLink && !webinar.meetLink.includes('LOCKED')) {
      window.open(getAbsoluteUrl(webinar.meetLink), "_blank", "noopener,noreferrer");
      return;
    }

    // 3. Check if user has a subscription at all
    if (!subscription) {
      navigate("/membership");
      return;
    }

    // 4. Check if user has enough credits
    const credits = Number(subscription?.remainingCredits) || 0;
    if (credits <= 0) {
      navigate("/membership");
      return;
    }

    // 5. All checks passed! Ask for confirmation to spend a credit
    setPopup({
      isOpen: true,
      title: "Unlock Webinar",
      message: `This will consume 1 Webinar Credit. You currently have ${credits} left. Do you want to proceed?`,
      type: "confirm",
      confirmText: "Yes, Unlock Now",
      cancelText: "Cancel",
      onCancel: closePopup,
      onConfirm: () => {
        closePopup();
        processRedemption(webinar);
      }
    });
  };

  const processRedemption = async (webinar: any) => {
    setProcessingId(webinar.id);
    try {
      const res = await api.redeemWebinarCredit(webinar.id);

      setWebinars((prev: any[]) => prev.map(w =>
        w.id === webinar.id ? { ...w, hasAccess: true, meetLink: res.meetLink } : w
      ));

      setSelectedWebinar((prev: any) => prev ? { ...prev, hasAccess: true, meetLink: res.meetLink } : null);

      setSubscription((prev: any) => ({
        ...prev,
        remainingCredits: prev.remainingCredits - 1
      }));

      window.open(getAbsoluteUrl(res.meetLink), "_blank", "noopener,noreferrer");
    } catch (error: any) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: error.message || "Failed to redeem credit. Please try again.",
        type: "alert",
        confirmText: "Okay",
        onConfirm: closePopup
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-500 animate-pulse">Loading upcoming webinars...</div>;

  return (
    <>
      {/* THE CUSTOM POPUP WINDOW */}
      {popup?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{popup.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">{popup.message}</p>

              <div className="flex gap-3 justify-end mt-auto">
                {popup.type === "confirm" && (
                  <button
                    onClick={popup.onCancel}
                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                  >
                    {popup.cancelText || "Cancel"}
                  </button>
                )}
                <button
                  onClick={popup.onConfirm}
                  className="px-6 py-3 bg-[#600694] hover:bg-[#4a0473] text-white rounded-xl font-bold transition-colors shadow-md"
                >
                  {popup.confirmText || "OK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBINAR GRID - Force 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-2">
        {webinars.length === 0 && (
          <div className="col-span-2 lg:col-span-3 text-center p-10 bg-white rounded-3xl border border-gray-100">
            <p className="text-muted-foreground">No upcoming webinars scheduled right now.</p>
          </div>
        )}

        {webinars.map((webinar) => (
          <div key={webinar.id} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group">

            {/* Header / Badges */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <span className="bg-[#600694]/10 text-[#600694] px-2 sm:px-3 py-1 rounded-md sm:rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider">
                {webinar.date}
              </span>
              {webinar.hasAccess && (
                <span className="text-green-600 bg-green-50 px-1.5 py-1 rounded-md text-[9px] sm:text-xs font-bold">Unlocked</span>
              )}
            </div>

            {/* Thumbnail Image */}
            <div className="w-full h-24 sm:h-40 bg-gray-100 rounded-xl sm:rounded-2xl mb-3 sm:mb-5 overflow-hidden relative shrink-0">
              {webinar.imageUrl ? (
                <img
                  src={webinar.imageUrl}
                  alt={webinar.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="font-display text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 line-clamp-2">{webinar.title}</h3>
            <p className="text-[10px] sm:text-sm text-gray-500 mb-3 sm:mb-6 flex-1 line-clamp-2 sm:line-clamp-3">{webinar.description}</p>

            {/* Action Button */}
            <button
              onClick={() => setSelectedWebinar(webinar)}
              className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-2 bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors text-[10px] sm:text-base"
            >
              View Details <span className="hidden sm:inline"> & Join</span>
            </button>
          </div>
        ))}
      </div>

      {/* FULL SCREEN MODAL - PERFECTED FOR MOBILE */}
      {selectedWebinar && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 sm:p-4 md:p-8 backdrop-blur-sm">

          {/* Modal Wrapper */}
          <div className="bg-white rounded-none sm:rounded-2xl lg:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            {/* Close Button */}
            <button
              onClick={() => setSelectedWebinar(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/90 shadow-md hover:bg-white hover:scale-105 rounded-full backdrop-blur-md transition-all"
            >
              <X className="h-5 w-5 text-gray-800" />
            </button>

            {/* INNER CONTAINER */}
            <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden relative custom-scrollbar">

              {/* LEFT SIDE: Full Description */}
              <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-12 order-2 md:order-1 h-max md:h-full md:overflow-y-auto custom-scrollbar pb-16 md:pb-12">
                <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Live Webinar
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-4 mb-4">{selectedWebinar.title}</h2>

                <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="flex items-center gap-2 w-full"><Calendar className="h-4 w-4 text-[#600694]" /> {selectedWebinar.date} at {selectedWebinar.time}</p>
                </div>

                <div className="prose prose-sm text-gray-600">
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedWebinar.description}</p>
                </div>
              </div>

              {/* RIGHT SIDE: Image & Action Panel */}
              <div className="w-full md:w-1/2 flex flex-col bg-white order-1 md:order-2 h-max md:h-full md:overflow-y-auto custom-scrollbar">

                {/* Header Image */}
                <div className="h-56 sm:h-64 w-full bg-gray-200 relative shrink-0">
                  {selectedWebinar.imageUrl ? (
                    <img src={selectedWebinar.imageUrl} alt="Webinar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="h-10 w-10" /></div>
                  )}
                  {/* Gradient Overlay for a seamless blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                {/* Content / Buttons */}
                <div className="p-6 md:p-12 flex-1 flex flex-col pb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Webinar Access</h3>

                  {selectedWebinar.hasAccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <p className="text-green-800 font-semibold text-sm flex items-center gap-2">
                        <Video className="h-4 w-4" /> Access Granted
                      </p>
                      <p className="text-xs text-green-600 mt-1">You have unlocked the Zoom link for this session.</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-gray-400" /> Standard Price:</span>
                        <span>₹{selectedWebinar.priceInr}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold text-[#600694] pt-3 border-t border-gray-200">
                        <span>Subscriber Price:</span>
                        <span>1 Credit</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <button
                      onClick={() => handleJoinClick(selectedWebinar)}
                      disabled={processingId === selectedWebinar.id}
                      className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg ${selectedWebinar.hasAccess
                          ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                          : 'bg-[#600694] hover:bg-[#4a0473] text-white'
                        }`}
                    >
                      {processingId === selectedWebinar.id ? "Processing..." :
                        selectedWebinar.hasAccess ? "Join Zoom Webinar Now" : "Redeem 1 Credit to Unlock"}
                    </button>

                    {!selectedWebinar.hasAccess && (
                      <p className="text-center text-xs text-gray-500 mt-4 font-medium">
                        You currently have <span className="font-bold text-[#600694]">{subscription?.remainingCredits || 0}</span> credits remaining.
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 2. MAIN PAGE WRAPPER (Data Fetching)
// ==========================================
export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { dbUser, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchWebinarData = async () => {
      setDataLoading(true);

      try {
        const webinarsRes = await api.getUpcomingWebinars();
        const webinarData = webinarsRes?.data?.webinars || webinarsRes?.webinars || webinarsRes?.data || webinarsRes;

        // 🚨 ADDED SORTING LOGIC: Newest webinars appear first
        let parsedWebinars = Array.isArray(webinarData) ? [...webinarData] : [];
        parsedWebinars.sort((a, b) => {
          const timeA = new Date(a.date || a.scheduledFor || a.createdAt || 0).getTime();
          const timeB = new Date(b.date || b.scheduledFor || b.createdAt || 0).getTime();
          return timeB - timeA; // Descending order (Newest to oldest)
        });

        setWebinars(parsedWebinars);
      } catch (error) {
        console.error("Failed to fetch webinars:", error);
        setWebinars([]);
      }

      if (dbUser) {
        setIsLoggedIn(true);
        try {
          const subRes = await api.getUserSubscription();
          const subData = subRes?.data?.subscription || subRes?.subscription || subRes?.data || subRes;
          setSubscription(subData);
        } catch (error) {
          console.warn("User has no active subscription or fetch failed.");
          setSubscription(null);
        }
      } else {
        setIsLoggedIn(false);
        setSubscription(null);
      }

      setDataLoading(false);
    };

    fetchWebinarData();
  }, [dbUser, authLoading]);

  const isLoading = authLoading || dataLoading;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

          {!isLoading && isLoggedIn && subscription && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
              <span>Your Available Credits:</span>
              <span className={`text-base ${subscription.remainingCredits > 0 ? 'text-[#600694]' : 'text-red-500'}`}>
                {subscription.remainingCredits || 0}
              </span>
            </div>
          )}
        </div>

        <WebinarGrid
          webinars={webinars}
          setWebinars={setWebinars}
          loading={isLoading}
          subscription={subscription}
          setSubscription={setSubscription}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}