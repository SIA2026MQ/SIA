import { useEffect, useState } from "react";
import { MapPin, Calendar, Lock, X, Image as ImageIcon } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RetreatsPage() {
  const [retreats, setRetreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetreat, setSelectedRetreat] = useState<any | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { dbUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (dbUser?.name && !name) setName(dbUser.name);
  }, [dbUser]);

  useEffect(() => {
    api.getRetreats()
      .then(res => setRetreats(res.retreats || []))
      .catch(err => console.error("Failed to fetch retreats:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    if (!dbUser) { alert("Please login to apply."); navigate("/login"); return; }
    try {
      await api.applyForRetreat({ retreatId: selectedRetreat.id, name, email: dbUser.email, phone });
      alert("Application submitted! The admin will review it shortly. Check your Dashboard.");
      setSelectedRetreat(null);

      // 🚨 Automatically redirect the user to their dashboard!
      navigate("/my-learning");

    } catch (err: any) {
      alert(err.message || "Failed to apply.");
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 sia-container">
        <h1 className="font-display text-4xl text-[#600694] mb-10 text-center">Upcoming Retreats & Events</h1>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#600694]"></div>
          </div>
        )}

        {!loading && retreats.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border border-gray-100 max-w-2xl mx-auto shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No Upcoming Events</h3>
            <p className="text-gray-500 mt-2">Check back soon for new retreats and live gatherings.</p>
          </div>
        )}

        {/* 1. GRID CARDS (Uniform Height) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 max-w-6xl mx-auto">
          {retreats.map((retreat) => (
            <div
              key={retreat.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Card Image */}
              <div className="h-32 lg:h-48 bg-gray-200 relative overflow-hidden">
                {retreat.imageUrl ? (
                  <img
                    src={retreat.imageUrl}
                    alt={retreat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <ImageIcon className="h-6 w-6 lg:h-8 lg:w-8" />
                  </div>
                )}
              </div>

              <div className="p-3 lg:p-6 flex flex-col flex-1">
                <h2 className="text-sm lg:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {retreat.title}
                </h2>

                <p className="text-gray-600 text-xs lg:text-sm mb-4 lg:mb-6 flex-1 line-clamp-3">
                  {retreat.description}
                </p>

                <div className="space-y-2 mb-4 lg:mb-6 text-[10px] lg:text-xs font-semibold text-gray-700">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-[#600694]" />
                    {retreat.location}
                  </p>

                  <p className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-[#600694]" />
                    {new Date(retreat.startDate).toLocaleDateString()} -{" "}
                    {new Date(retreat.endDate).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRetreat(retreat)}
                  className="w-full bg-[#600694]/10 text-[#600694] py-2 lg:py-2.5 rounded-full font-bold text-xs lg:text-base hover:bg-[#600694] hover:text-white transition-colors"
                >
                  View Details & Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2. FULL SCREEN MODAL - PERFECTED FOR MOBILE */}
        {selectedRetreat && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 sm:p-4 md:p-8 backdrop-blur-sm">

            {/* Modal Wrapper - Fixed height, handles inner scrolling */}
            <div className="bg-white rounded-none sm:rounded-2xl lg:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-[95vh] md:max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

              {/* Close Button - Always pinned to the top right, unaffected by scrolling */}
              <button
                onClick={() => setSelectedRetreat(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/90 shadow-md hover:bg-white hover:scale-105 rounded-full backdrop-blur-md transition-all"
              >
                <X className="h-5 w-5 text-gray-800" />
              </button>

              {/* INNER CONTAINER 
                  Mobile: flex-col, overflow-y-auto (scrolls as one seamless page)
                  Desktop: flex-row, overflow-hidden (splits into two independently scrolling columns) */}
              <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden relative custom-scrollbar">

                {/* LEFT SIDE: Full Description 
                    Mobile: Appears SECOND (order-2) below the form. Takes natural height.
                    Desktop: Appears FIRST (order-1) on the left. Scrolls independently. */}
                <div className="w-full md:w-1/2 bg-gray-50 p-6 md:p-12 order-2 md:order-1 h-max md:h-full md:overflow-y-auto custom-scrollbar pb-16 md:pb-12">
                  <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Official Retreat
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mt-4 mb-4">{selectedRetreat.title}</h2>

                  <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="flex items-center gap-2 w-full"><MapPin className="h-4 w-4 text-[#600694]" /> {selectedRetreat.location}</p>
                    <p className="flex items-center gap-2 w-full"><Calendar className="h-4 w-4 text-[#600694]" /> {new Date(selectedRetreat.startDate).toLocaleDateString()} to {new Date(selectedRetreat.endDate).toLocaleDateString()}</p>
                  </div>

                  <div className="prose prose-sm text-gray-600">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedRetreat.description}</p>
                  </div>
                </div>

                {/* RIGHT SIDE: Image & Application Form 
                    Mobile: Appears FIRST (order-1) at the top of the modal.
                    Desktop: Appears SECOND (order-2) on the right. Scrolls independently. */}
                <div className="w-full md:w-1/2 flex flex-col bg-white order-1 md:order-2 h-max md:h-full md:overflow-y-auto custom-scrollbar">
                  {/* Header Image */}
                  <div className="h-56 sm:h-64 w-full bg-gray-200 relative shrink-0">
                    {selectedRetreat.imageUrl ? (
                      <img src={selectedRetreat.imageUrl} alt="Retreat" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="h-10 w-10" /></div>
                    )}
                    {/* Gradient Overlay for a seamless blend into the form */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  </div>

                  {/* Form */}
                  <div className="p-6 md:p-12 flex-1 flex flex-col pb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for a Seat</h3>
                    <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                      Your application will be reviewed. If accepted, pricing and secure Razorpay links will unlock in your dashboard.
                    </p>

                    <div className="space-y-4 flex-1">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 ml-1">Full Name</span>
                        <input className="w-full p-3 mt-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] transition-all" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 ml-1">Registered Account Email</span>
                        <div className="w-full p-3 mt-1 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed">
                          {dbUser?.email || "Log in to apply"}
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 ml-1">WhatsApp / Mobile Number</span>
                        <input className="w-full p-3 mt-1 border border-gray-200 rounded-xl focus:outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] transition-all" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                      </label>
                    </div>

                    <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 italic">
                        <Lock className="h-3.5 w-3.5" /> Price hidden until approved
                      </div>
                      <button onClick={handleApply} className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-[#600694] text-white shadow-md hover:bg-[#4a0473] hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        Submit Details
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}