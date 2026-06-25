import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, CreditCard, Ticket, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export function SubscriptionTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<"standard" | "passes">("standard");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 🚨 NEW: Custom Animation States for Prompts
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    durationDays: 30,
    minPriceInr: 0,
    minPriceUsd: 0, 
    webinarCredits: 0
  });

  // Helper to show animated toast notifications
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); // Auto-hide after 3.5s
  };

  const fetchPlans = async () => {
    try {
      const res = await api.getAllPlans();
      if (res.plans) setPlans(res.plans);
    } catch (error) {
      console.error("Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const standardPlans = plans.filter(p => !p.name.toLowerCase().includes("webinar"));
  const passPlans = plans.filter(p => p.name.toLowerCase().includes("webinar"));
  const displayedPlans = activePanel === "standard" ? standardPlans : passPlans;

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: activePanel === "standard" ? "Monthly Subscription" : "Weekend Webinar Pass",
      durationDays: activePanel === "standard" ? 30 : 0,
      minPriceInr: 0,
      minPriceUsd: 0, 
      webinarCredits: activePanel === "standard" ? 1 : 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      durationDays: plan.durationDays,
      minPriceInr: plan.minPriceInr,
      minPriceUsd: plan.minPriceUsd || 0, 
      webinarCredits: plan.webinarCredits
    });
    setIsModalOpen(true);
  };

  // 🚨 NEW: Triggers the animated delete confirmation modal
  const initiateDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  // 🚨 NEW: Executes the delete after confirmation
  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deletePlan(deleteConfirmId);
      fetchPlans();
      showToast("Plan removed successfully.", "success");
    } catch (error) {
      showToast("Failed to delete plan.", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSave = async () => {
    if (!formData.name || formData.minPriceInr < 0 || formData.minPriceUsd < 0) {
      showToast("Please provide a valid name and positive prices.", "error");
      return;
    }

    try {
      if (editingId) {
        await api.updatePlan(editingId, formData);
        showToast("Plan updated successfully!", "success");
      } else {
        await api.createPlan(formData);
        showToast("New plan created!", "success");
      }
      setIsModalOpen(false);
      fetchPlans(); // Refreshes the grid instantly
      
      // 🚨 FIX: Removed handlePostSave() from here so it stops kicking you to the dashboard!
      
    } catch (error) {
      console.error("Failed to save plan:", error);
      showToast("Failed to save the plan.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-[#600694]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative">
      
      {/* 🚨 NEW: Animated Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-10 fade-in duration-300 text-white font-bold ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-display text-[#600694]">Manage Subscriptions</h2>
          <p className="text-gray-500 text-sm">Control pricing tiers and a-la-carte passes.</p>
        </div>
        <button 
          onClick={openCreateModal} 
          className="bg-[#600694] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#4a0473] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create New Plan
        </button>
      </div>

      {/* The Two Panels Toggle */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActivePanel("standard")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activePanel === "standard" ? "text-[#600694] border-[#600694]" : "text-gray-500 border-transparent hover:text-gray-800"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Daily Sessions
        </button>
        <button
          onClick={() => setActivePanel("passes")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activePanel === "passes" ? "text-[#600694] border-[#600694]" : "text-gray-500 border-transparent hover:text-gray-800"
          }`}
        >
          <Ticket className="h-4 w-4" /> Webinar Passes
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPlans.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No {activePanel === "standard" ? "subscription plans" : "webinar passes"} found.
          </div>
        ) : (
          displayedPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 bg-gray-50/50 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-[#600694]">₹{plan.minPriceInr}</span>
                  <span className="text-sm font-bold text-gray-400">/ ${plan.minPriceUsd}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                <p>• <strong>{plan.durationDays}</strong> Days Access</p>
                <p>• <strong>{plan.webinarCredits}</strong> Webinar Credits</p>
              </div>

              <div className="flex gap-2 border-t border-gray-200 pt-4">
                <button 
                  onClick={() => openEditModal(plan)}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button 
                  onClick={() => initiateDelete(plan.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🚨 NEW: Animated Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-display text-gray-900 mb-2">Delete this Plan?</h3>
            <p className="text-sm text-gray-500 mb-8">This will immediately remove the plan from the pricing page. This action cannot be undone.</p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <h3 className="text-2xl font-display text-[#600694] mb-6">
              {editingId ? "Edit Plan" : "Create New Plan"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Plan Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none transition-colors"
                  placeholder="e.g. 1-Month Access"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                  <input 
                    type="number"
                    value={formData.minPriceInr}
                    onChange={(e) => setFormData({...formData, minPriceInr: parseInt(e.target.value) || 0})}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                  <input 
                    type="number"
                    value={formData.minPriceUsd}
                    onChange={(e) => setFormData({...formData, minPriceUsd: parseInt(e.target.value) || 0})}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Days</label>
                  <input 
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({...formData, durationDays: parseInt(e.target.value) || 0})}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Webinar Credits Included</label>
                <input 
                  type="number"
                  value={formData.webinarCredits}
                  onChange={(e) => setFormData({...formData, webinarCredits: parseInt(e.target.value) || 0})}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none transition-colors"
                />
              </div>

              <button 
                onClick={handleSave}
                className="w-full mt-6 py-3 bg-[#600694] text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#4a0473] transition-all shadow-md active:scale-[0.98]"
              >
                <CheckCircle2 className="h-5 w-5" /> Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}