// events.tsx
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Lock,
  MapPin,
  X,
  Image as ImageIcon,
  Video,
  IndianRupee,
} from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function EventsPage() {
  const { dbUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ========== SHARED STATE ==========
  const [schedules, setSchedules] = useState<any[]>([]);
  const [retreats, setRetreats] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    schedules: false,
    retreats: false,
    webinars: false,
  });

  // Subscription object for webinars
  const [subscription, setSubscription] = useState<any>(null);

  // Retreats modal & form
  const [selectedRetreat, setSelectedRetreat] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Webinars specific
  const [selectedWebinar, setSelectedWebinar] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
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

  // ========== EFFECTS ==========
  useEffect(() => {
    if (dbUser?.name && !name) setName(dbUser.name);
  }, [dbUser]);

  // Check subscription & fetch schedule
  useEffect(() => {
    if (authLoading) return;

    const checkAndFetchSchedule = async () => {
      if (!dbUser) {
        setIsSubscribed(false);
        return;
      }

      try {
        let hasAccess = dbUser.role === "ADMIN";
        if (!hasAccess) {
          try {
            const subRes = await api.getUserSubscription();
            if (subRes && subRes.subscription) hasAccess = true;
          } catch (e) {
            console.warn("User does not have an active subscription.");
          }
        }
        setIsSubscribed(hasAccess);

        if (hasAccess) {
          setDataLoading((prev) => ({ ...prev, schedules: true }));
          const scheduleRes = await api.getSchedules();
          setSchedules(scheduleRes.schedules || []);
          setDataLoading((prev) => ({ ...prev, schedules: false }));
        }
      } catch (err) {
        console.error("Error fetching schedules", err);
        setDataLoading((prev) => ({ ...prev, schedules: false }));
      }
    };

    checkAndFetchSchedule();
  }, [dbUser, authLoading]);

  // Fetch retreats & webinars on mount
  useEffect(() => {
    // Retreats
    setDataLoading((prev) => ({ ...prev, retreats: true }));
    api
      .getRetreats()
      .then((res) => setRetreats(res.retreats || []))
      .catch((err) => console.error("Failed to fetch retreats:", err))
      .finally(() => setDataLoading((prev) => ({ ...prev, retreats: false })));

    // Webinars
    setDataLoading((prev) => ({ ...prev, webinars: true }));
    api
      .getUpcomingWebinars()
      .then((res) => {
        const webinarData =
          res?.data?.webinars || res?.webinars || res?.data || res;
        setWebinars(Array.isArray(webinarData) ? webinarData : []);
      })
      .catch((err) => console.error("Failed to fetch webinars:", err))
      .finally(() =>
        setDataLoading((prev) => ({ ...prev, webinars: false }))
      );

    // Fetch subscription for webinars
    if (dbUser) {
      api
        .getUserSubscription()
        .then((subRes) => {
          const subData =
            subRes?.data?.subscription ||
            subRes?.subscription ||
            subRes?.data ||
            subRes;
          setSubscription(subData);
        })
        .catch(() => setSubscription(null));
    } else {
      setSubscription(null);
    }
  }, [dbUser]);

  // ========== HELPERS ==========
  const closePopup = () => setPopup(null);

  const getAbsoluteUrl = (url: string) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  // ========== RETREATS HANDLERS ==========
  const handleApplyRetreat = async () => {
    if (!dbUser) {
      alert("Please login to apply.");
      navigate("/login");
      return;
    }
    try {
      await api.applyForRetreat({
        retreatId: selectedRetreat.id,
        name,
        email: dbUser.email,
        phone,
      });
      alert(
        "Application submitted! The admin will review it shortly. Check your Dashboard."
      );
      setSelectedRetreat(null);
      navigate("/my-learning");
    } catch (err: any) {
      alert(err.message || "Failed to apply.");
    }
  };

  // ========== WEBINARS HANDLERS ==========

  const handleViewDetails = (webinar: any) => {
    setSelectedWebinar(webinar);
  };

  const handleJoinClick = async (webinar: any) => {
    // 1. Check if logged in
    if (!dbUser) {
      setPopup({
        isOpen: true,
        title: "Authentication Required",
        message: "Please sign in or create an account to unlock webinars and join live sessions.",
        type: "alert",
        confirmText: "Go to Login",
        onConfirm: () => {
          closePopup();
          navigate("/login", { state: { from: "/events" } });
        },
      });
      return;
    }

    // 2. Already unlocked
    if (webinar.hasAccess && webinar.meetLink && !webinar.meetLink.includes("LOCKED")) {
      window.open(getAbsoluteUrl(webinar.meetLink), "_blank", "noopener,noreferrer");
      return;
    }

    // 3. Subscription & Credit checks
    const credits = Number(subscription?.remainingCredits) || 0;
    if (!subscription || credits <= 0) {
      navigate("/membership");
      return;
    }

    // 4. Confirm Unlock
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
      },
    });
  };

  const processRedemption = async (webinar: any) => {
    setProcessingId(webinar.id);
    try {
      const res = await api.redeemWebinarCredit(webinar.id);

      setWebinars((prev) =>
        prev.map((w) =>
          w.id === webinar.id
            ? { ...w, hasAccess: true, meetLink: res.meetLink }
            : w
        )
      );

      setSelectedWebinar((prev: any) =>
        prev ? { ...prev, hasAccess: true, meetLink: res.meetLink } : null
      );

      setSubscription((prev: any) => ({
        ...prev,
        remainingCredits: prev.remainingCredits - 1,
      }));

      window.open(getAbsoluteUrl(res.meetLink), "_blank", "noopener,noreferrer");
    } catch (error: any) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: error.message || "Failed to redeem credit. Please try again.",
        type: "alert",
        confirmText: "Okay",
        onConfirm: closePopup,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const isLoading =
    authLoading || dataLoading.schedules || dataLoading.retreats || dataLoading.webinars;

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-[#600694] mb-4">
              Events & Sessions
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join live Satsungs, Q&A sessions, retreats, and exclusive webinars.
            </p>
          </div>

          {/* 1. Schedule Section */}
          <section className="mb-16">
            <ScheduleTabContent
              isSubscribed={isSubscribed}
              schedules={schedules}
              loading={dataLoading.schedules}
            />
          </section>

          {/* 2. Retreats Section */}
          <section className="mb-16">
            <RetreatsTabContent
              retreats={retreats}
              loading={dataLoading.retreats}
              selectedRetreat={selectedRetreat}
              setSelectedRetreat={setSelectedRetreat}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              dbUser={dbUser}
              handleApply={handleApplyRetreat}
            />
          </section>

          {/* 3. Webinars Section */}
          <section>
            <WebinarsTabContent
              webinars={webinars}
              loading={dataLoading.webinars}
              subscription={subscription}
              isLoggedIn={!!dbUser}
              handleViewDetails={handleViewDetails}
              handleJoinClick={handleJoinClick}
              processingId={processingId}
              selectedWebinar={selectedWebinar}
              setSelectedWebinar={setSelectedWebinar}
              popup={popup}
              closePopup={closePopup}
            />
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}

// ======================
// Schedule Sub-Component
// ======================
function ScheduleTabContent({
  isSubscribed,
  schedules,
  loading,
}: {
  isSubscribed: boolean;
  schedules: any[];
  loading: boolean;
}) {
  if (!isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Required
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          You must have an active subscription to view the upcoming schedule and
          access live sessions.
        </p>
        <Link
          to="/membership"
          className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#4a0473] transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#600694]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
        Upcoming Schedule
      </h2>
      {schedules.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold text-lg">
            No upcoming events scheduled at the moment.
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Check back later for new dates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {schedules.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 sm:h-1.5 ${event.category === "QnA" ? "bg-blue-500" : "bg-orange-500"
                  }`}
              ></div>

              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white font-bold mb-3 sm:mb-5 shadow-sm shrink-0 ${event.category === "QnA"
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-orange-500 to-orange-600"
                  }`}
              >
                <span className="text-[8px] sm:text-[11px] opacity-90 uppercase tracking-widest mt-0.5 sm:mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
                <span className="text-lg sm:text-2xl leading-none mb-0.5 sm:mb-1">
                  {new Date(event.date).getDate()}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-snug sm:mb-2 line-clamp-3 group-hover:text-[#600694] transition-colors">
                  {event.title}
                </h3>
              </div>

              <div className="mt-3 sm:mt-5 pt-2 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-0">
                <span
                  className={`w-fit text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md ${event.category === "QnA"
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-orange-50 text-orange-600 border border-orange-100"
                    }`}
                >
                  {event.category}
                </span>
                <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm text-gray-500 font-medium">
                  <Clock
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${event.category === "QnA"
                        ? "text-blue-400"
                        : "text-orange-400"
                      }`}
                  />
                  {event.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================
// Retreats Sub-Component
// ======================
function RetreatsTabContent({
  retreats,
  loading,
  selectedRetreat,
  setSelectedRetreat,
  name,
  setName,
  phone,
  setPhone,
  dbUser,
  handleApply,
}: any) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#600694]"></div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
        Upcoming Retreats & Events
      </h2>
      {retreats.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto shadow-sm">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Upcoming Events</h3>
          <p className="text-gray-500 mt-2">
            Check back soon for new retreats and live gatherings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 max-w-6xl mx-auto">
          {retreats.map((retreat: any) => (
            <div
              key={retreat.id}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="h-32 sm:h-48 bg-gray-200 relative overflow-hidden">
                {retreat.imageUrl ? (
                  <img
                    src={retreat.imageUrl}
                    alt={retreat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-6 flex flex-col flex-1">
                <h2 className="text-sm sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                  {retreat.title}
                </h2>
                <p className="text-gray-600 text-[10px] sm:text-sm mb-3 sm:mb-6 flex-1 line-clamp-2 sm:line-clamp-3">
                  {retreat.description}
                </p>
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-6 text-[9px] sm:text-xs font-semibold text-gray-700">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#600694]" />{" "}
                    {retreat.location}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#600694]" />{" "}
                    {new Date(retreat.startDate).toLocaleDateString()} -{" "}
                    {new Date(retreat.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRetreat(retreat)}
                  className="w-full bg-[#600694]/10 text-[#600694] py-2 sm:py-2.5 rounded-lg sm:rounded-full font-bold text-[10px] sm:text-base hover:bg-[#600694] hover:text-white transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRetreat && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 sm:p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-none sm:rounded-2xl lg:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <button
              onClick={() => setSelectedRetreat(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/90 shadow-md hover:bg-white hover:scale-105 rounded-full backdrop-blur-md transition-all"
            >
              <X className="h-5 w-5 text-gray-800" />
            </button>

            <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden relative custom-scrollbar">
              <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-12 order-2 md:order-1 h-max md:h-full md:overflow-y-auto custom-scrollbar pb-16 md:pb-12">
                <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Official Retreat
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-4 mb-4">
                  {selectedRetreat.title}
                </h2>
                <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="flex items-center gap-2 w-full">
                    <MapPin className="h-4 w-4 text-[#600694]" />{" "}
                    {selectedRetreat.location}
                  </p>
                  <p className="flex items-center gap-2 w-full">
                    <Calendar className="h-4 w-4 text-[#600694]" />{" "}
                    {new Date(selectedRetreat.startDate).toLocaleDateString()} to{" "}
                    {new Date(selectedRetreat.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="prose prose-sm text-gray-600">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedRetreat.description}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col bg-white order-1 md:order-2 h-max md:h-full md:overflow-y-auto custom-scrollbar">
                <div className="h-56 sm:h-64 w-full bg-gray-200 relative shrink-0">
                  {selectedRetreat.imageUrl ? (
                    <img
                      src={selectedRetreat.imageUrl}
                      alt="Retreat"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div className="p-6 md:p-12 flex-1 flex flex-col pb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Apply for a Seat
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                    Your application will be reviewed. If accepted, pricing and
                    secure Razorpay links will unlock in your dashboard.
                  </p>

                  <div className="space-y-4 flex-1">
                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">Full Name</span>
                      <input
                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] transition-all"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">Registered Account Email</span>
                      <div className="w-full p-3 mt-1 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed">
                        {dbUser?.email || "Log in to apply"}
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">WhatsApp / Mobile Number</span>
                      <input
                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] transition-all"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 italic">
                      <Lock className="h-3.5 w-3.5" /> Price hidden until approved
                    </div>
                    <button
                      onClick={handleApply}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-[#600694] text-white shadow-md hover:bg-[#4a0473] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      Submit Details
                    </button>
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

// ======================
// Webinars Sub-Component
// ======================
function WebinarsTabContent({
  webinars,
  loading,
  subscription,
  isLoggedIn,
  handleViewDetails,
  handleJoinClick,
  processingId,
  selectedWebinar,
  setSelectedWebinar,
  popup,
  closePopup,
}: any) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#600694]"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">
        Live Webinars
      </h2>

      {!loading && isLoggedIn && subscription && (
        <div className="mb-8 inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm mx-auto block w-fit">
          <span>Your Available Credits:</span>
          <span
            className={`text-base ${subscription.remainingCredits > 0
                ? "text-[#600694]"
                : "text-red-500"
              }`}
          >
            {subscription.remainingCredits || 0}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-2">
        {webinars.length === 0 && (
          <div className="col-span-2 lg:col-span-3 text-center p-10 bg-white rounded-3xl border border-gray-100">
            <p className="text-muted-foreground">
              No upcoming webinars scheduled right now.
            </p>
          </div>
        )}

        {webinars.map((webinar: any) => (
          <div
            key={webinar.id}
            className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <span className="bg-[#600694]/10 text-[#600694] px-2 sm:px-3 py-1 rounded-md sm:rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wider">
                {webinar.date}
              </span>
              {webinar.hasAccess && (
                <span className="text-green-600 bg-green-50 px-1.5 py-1 rounded-md text-[9px] sm:text-xs font-bold">
                  Unlocked
                </span>
              )}
            </div>

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

            <h3 className="font-display text-sm sm:text-xl text-gray-900 mb-1 sm:mb-2 line-clamp-2">
              {webinar.title}
            </h3>
            <p className="text-[10px] sm:text-sm text-gray-500 mb-3 sm:mb-6 flex-1 line-clamp-2 sm:line-clamp-3">
              {webinar.description}
            </p>

            <button
              onClick={() => handleViewDetails(webinar)}
              className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-2 bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors text-[10px] sm:text-base"
            >
              View Details <span className="hidden sm:inline"> & Join</span>
            </button>
          </div>
        ))}
      </div>

      {popup?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">
                {popup.title}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {popup.message}
              </p>
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

      {selectedWebinar && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 sm:p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-none sm:rounded-2xl lg:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <button
              onClick={() => setSelectedWebinar(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-white/90 shadow-md hover:bg-white hover:scale-105 rounded-full backdrop-blur-md transition-all"
            >
              <X className="h-5 w-5 text-gray-800" />
            </button>

            <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden relative custom-scrollbar">
              <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-12 order-2 md:order-1 h-max md:h-full md:overflow-y-auto custom-scrollbar pb-16 md:pb-12">
                <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Live Webinar
                </span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-4 mb-4">
                  {selectedWebinar.title}
                </h2>
                <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="flex items-center gap-2 w-full">
                    <Calendar className="h-4 w-4 text-[#600694]" />{" "}
                    {selectedWebinar.date} at {selectedWebinar.time}
                  </p>
                </div>
                <div className="prose prose-sm text-gray-600">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {selectedWebinar.description}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col bg-white order-1 md:order-2 h-max md:h-full md:overflow-y-auto custom-scrollbar">
                <div className="h-56 sm:h-64 w-full bg-gray-200 relative shrink-0">
                  {selectedWebinar.imageUrl ? (
                    <img
                      src={selectedWebinar.imageUrl}
                      alt="Webinar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div className="p-6 md:p-12 flex-1 flex flex-col pb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Webinar Access
                  </h3>

                  {selectedWebinar.hasAccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <p className="text-green-800 font-semibold text-sm flex items-center gap-2">
                        <Video className="h-4 w-4" /> Access Granted
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        You have unlocked the Zoom link for this session.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-gray-400" />{" "}
                          Standard Price:
                        </span>
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
                          ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                          : "bg-[#600694] hover:bg-[#4a0473] text-white"
                        }`}
                    >
                      {processingId === selectedWebinar.id
                        ? "Processing..."
                        : selectedWebinar.hasAccess
                          ? "Join Zoom Webinar Now"
                          : "Redeem 1 Credit to Unlock"}
                    </button>

                    {!selectedWebinar.hasAccess && (
                      <p className="text-center text-xs text-gray-500 mt-4 font-medium">
                        You currently have{" "}
                        <span className="font-bold text-[#600694]">
                          {subscription?.remainingCredits || 0}
                        </span>{" "}
                        credits remaining.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}