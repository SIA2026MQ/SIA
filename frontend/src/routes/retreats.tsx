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
      
      // 🚨 NEW: Automatically redirect the user to their dashboard!
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {retreats.map(retreat => (
            <div key={retreat.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-all group">
              
              {/* Card Image Area */}
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {retreat.imageUrl ? (
                  <img src={retreat.imageUrl} alt={retreat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="h-8 w-8"/></div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{retreat.title}</h2>
                {/* 🚨 line-clamp-3 ensures descriptions cut off cleanly with an ellipsis (...) */}
                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{retreat.description}</p>
                
                <div className="space-y-2 mb-6 text-xs font-semibold text-gray-700">
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#600694]"/> {retreat.location}</p>
                  <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-[#600694]"/> {new Date(retreat.startDate).toLocaleDateString()} - {new Date(retreat.endDate).toLocaleDateString()}</p>
                </div>
                
                <button onClick={() => setSelectedRetreat(retreat)} className="w-full bg-[#600694]/10 text-[#600694] py-2.5 rounded-full font-bold hover:bg-[#600694] hover:text-white transition-colors">
                  View Details & Apply
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2. FULL SCREEN SPLIT MODAL */}
        {selectedRetreat && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedRetreat(null)} 
                className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-gray-100 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>

              {/* LEFT SIDE: Full Description */}
              <div className="md:w-1/2 bg-gray-50 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <span className="bg-[#600694]/10 text-[#600694] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Official Retreat
                </span>
                <h2 className="text-3xl font-display font-bold text-gray-900 mt-4 mb-4">{selectedRetreat.title}</h2>
                
                <div className="flex flex-wrap gap-4 mb-8 text-sm font-semibold text-gray-700 bg-white p-4 rounded-2xl border border-gray-100">
                  <p className="flex items-center gap-2 w-full"><MapPin className="h-4 w-4 text-[#600694]"/> {selectedRetreat.location}</p>
                  <p className="flex items-center gap-2 w-full"><Calendar className="h-4 w-4 text-[#600694]"/> {new Date(selectedRetreat.startDate).toLocaleDateString()} to {new Date(selectedRetreat.endDate).toLocaleDateString()}</p>
                </div>

                <div className="prose prose-sm text-gray-600">
                  {/* whitespace-pre-wrap ensures paragraphs from the DB render correctly */}
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedRetreat.description}</p>
                </div>
              </div>

              {/* RIGHT SIDE: Image & Application Form */}
              <div className="md:w-1/2 flex flex-col bg-white overflow-y-auto">
                {/* Header Image */}
                <div className="h-48 md:h-64 w-full bg-gray-200 relative shrink-0">
                  {selectedRetreat.imageUrl ? (
                    <img src={selectedRetreat.imageUrl} alt="Retreat" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><ImageIcon className="h-10 w-10"/></div>
                  )}
                  {/* Gradient Overlay for a seamless blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                {/* Form */}
                <div className="p-8 md:p-12 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for a Seat</h3>
                  <p className="text-xs text-gray-500 font-medium mb-6">Your application will be reviewed. If accepted, pricing and secure Razorpay links will unlock in your dashboard.</p>
                  
                  <div className="space-y-4 flex-1">
                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">Full Name</span>
                      <input className="w-full p-3 mt-1 border rounded-xl focus:outline-none focus:border-[#600694]" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">Registered Account Email</span>
                      <div className="w-full p-3 mt-1 border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed">
                        {dbUser?.email || "Log in to apply"}
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 ml-1">WhatsApp / Mobile Number</span>
                      <input className="w-full p-3 mt-1 border rounded-xl focus:outline-none focus:border-[#600694]" placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} />
                    </label>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 italic">
                      <Lock className="h-3.5 w-3.5" /> Price hidden until approved
                    </div>
                    <button onClick={handleApply} className="px-8 py-3 rounded-full font-bold bg-[#600694] text-white shadow-md hover:bg-[#4a0473] transition-colors">
                      Submit Details
                    </button>
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