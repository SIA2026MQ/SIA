import { useState, useEffect } from "react";
import { Trash2, Send, Users, CheckCircle2, Ticket, X, Percent, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

export function CouponsTab({ handlePostSave }: { handlePostSave?: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [requestToApprove, setRequestToApprove] = useState<any | null>(null);
  const [discountValue, setDiscountValue] = useState("20");
  const [isApproving, setIsApproving] = useState(false);

  const [couponToDelete, setCouponToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.getAdminGroupRequests();
      setRequests(res.requests || []);
      setCoupons(res.coupons || []);
    } catch (error) {
      console.error("Failed to load coupons data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // -------------------------------------------------------------
  // APPROVAL PANEL LOGIC
  // -------------------------------------------------------------
  const openApprovePanel = (req: any) => {
    setRequestToApprove(req);
    setDiscountValue("20"); // Default recommendation
  };

  const handleConfirmApprove = async () => {
    if (!requestToApprove) return;
    
    const discountNum = Number(discountValue);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      alert("Please enter a valid discount percentage between 1 and 100.");
      return;
    }

    setIsApproving(true);
    try {
      const res = await api.approveGroupRequest(requestToApprove.id, discountNum);
      alert(`Success! Coupon Code generated: ${res.coupon.code}\n\nThis code will ONLY work for the emails provided in the application.`);
      fetchData(); 
      if (handlePostSave) handlePostSave(); 
      setRequestToApprove(null); // Close panel
    } catch (error) {
      alert("Failed to approve request.");
    } finally {
      setIsApproving(false);
    }
  };

  // -------------------------------------------------------------
  // DELETE PANEL LOGIC
  // -------------------------------------------------------------
  const openDeletePanel = (coupon: any) => {
    setCouponToDelete(coupon);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCoupon(couponToDelete.id);
      fetchData();
      setCouponToDelete(null); // Close panel
    } catch (error) {
      alert("Failed to delete coupon.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#600694]" /></div>;

  const pendingRequests = requests.filter(r => r.status === "PENDING");

  return (
    <div className="space-y-8 relative">
      
      {/* 1. NOTIFICATION PANEL: PENDING REQUESTS */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-display text-[#600694] mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" /> Action Required: Group Requests
        </h3>
        
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending group applications at the moment.</p>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-5 border border-yellow-200 bg-yellow-50/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{req.user.name} <span className="text-sm font-normal text-gray-500">({req.user.email})</span></h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Group Members ({req.emails.length}):</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {req.emails.map((email: string, idx: number) => (
                        <li key={idx}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={() => openApprovePanel(req)}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-md shrink-0 transition-colors"
                >
                  <Send className="h-5 w-5" /> Review & Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ACTIVE COUPONS DIRECTORY */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-display text-gray-900 mb-6 flex items-center gap-2">
          <Ticket className="h-6 w-6 text-gray-400" /> Active Discount Codes
        </h3>
        
        {coupons.length === 0 ? (
          <p className="text-gray-500 text-sm">No active coupons generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-3 pl-2">Coupon Code</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3">Usage</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map(coupon => {
                  const isExhausted = coupon.usedCount >= coupon.maxUses;
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2 font-bold text-[#600694]">{coupon.code}</td>
                      <td className="py-4 font-semibold text-gray-700">{coupon.discountPercent}% OFF</td>
                      <td className="py-4">
                        <span className={`text-sm font-bold ${isExhausted ? 'text-red-500' : 'text-gray-700'}`}>
                          {coupon.usedCount} / {coupon.maxUses}
                        </span>
                      </td>
                      <td className="py-4">
                        {isExhausted ? (
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold">Exhausted</span>
                        ) : (
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1"><CheckCircle2 className="h-3 w-3"/> Active</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => openDeletePanel(coupon)} 
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Permanently Delete Coupon"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* MODALS / PANELS                           */}
      {/* ========================================= */}
      <AnimatePresence>
        
        {/* APPROVE REQUEST PANEL */}
        {requestToApprove && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setRequestToApprove(null)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <h3 className="text-2xl font-display text-[#600694] mb-2 flex items-center gap-2">
                <Ticket className="h-6 w-6" /> Generate Coupon
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Approving group request for <span className="font-bold text-gray-800">{requestToApprove.user.name}</span> and their {requestToApprove.emails.length} friends.
              </p>
              
              <div className="mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Set Discount Percentage
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input 
                    type="number" 
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#600694] focus:ring-1 focus:ring-[#600694] outline-none text-lg font-bold"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setRequestToApprove(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmApprove}
                  disabled={isApproving}
                  className="flex-1 py-4 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {isApproving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Approve & Send"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE COUPON PANEL */}
        {couponToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full relative shadow-2xl border-t-8 border-red-500"
            >
              <button onClick={() => setCouponToDelete(null)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Coupon?</h3>
              <p className="text-center text-sm text-gray-500 mb-8">
                Are you sure you want to permanently delete <span className="font-bold text-red-600">{couponToDelete.code}</span>? This action cannot be undone and any unused uses will be lost.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Delete Coupon"}
                </button>
                <button 
                  onClick={() => setCouponToDelete(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  Keep Coupon
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}