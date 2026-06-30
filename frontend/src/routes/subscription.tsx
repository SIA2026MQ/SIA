import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Video, CalendarDays, ShieldCheck, Ticket, X, IndianRupee, Loader2, Users, Plus, Trash2, Minus } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  webinarCredits: number;
  minPriceInr: number;
  minPriceUsd: number;
}

export default function SatsungsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { dbUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------------------------------------
  // 1. CHECKOUT MODAL STATE
  // -------------------------------------------------------------
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [quantity, setQuantity] = useState(1); 
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [activeCouponId, setActiveCouponId] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // -------------------------------------------------------------
  // 2. GROUP DISCOUNT APPLICATION STATE
  // -------------------------------------------------------------
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupEmails, setGroupEmails] = useState<string[]>([""]);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // =============================================================
  // HASH SCROLLING LOGIC
  // =============================================================
  useEffect(() => {
    if (!loadingPlans) {
      if (location.hash) {
        setTimeout(() => {
          const element = document.getElementById(location.hash.substring(1));
          if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    }
  }, [location.hash, loadingPlans]);

  // =============================================================
  // DATA FETCHING
  // =============================================================
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.getAllPlans();
        if (res.plans) setPlans(res.plans);
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // =============================================================
  // CHECKOUT LOGIC
  // =============================================================
  const openCheckoutModal = (plan: Plan) => {
    if (!dbUser) {
      navigate(`/login?redirectTo=${location.pathname}`);
      return;
    }
    setSelectedPlan(plan);
    setQuantity(1); 
    setCouponCode("");
    setDiscountPercent(0);
    setActiveCouponId(null);
    setCouponError("");
    setCouponSuccess("");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await api.validateCoupon(couponCode); 
      setDiscountPercent(res.discountPercent);
      setActiveCouponId(res.couponId);
      setCouponSuccess(`${res.discountPercent}% Group Discount Applied!`);
    } catch (error: any) {
      setCouponError(error.message || "Invalid or expired coupon code.");
      setDiscountPercent(0);
      setActiveCouponId(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const processPayment = async () => {
    if (!selectedPlan || !dbUser) return;
    setProcessingId(selectedPlan.id);

    // Calculate the base total (Price x Quantity)
    // We do NOT subtract the discount here. We let the backend do it securely!
    const baseTotal = selectedPlan.minPriceInr * quantity;

    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        try {
          const orderRes = await api.createUnifiedOrder({
            itemId: selectedPlan.id,
            itemType: "SUBSCRIPTION",
            customAmountInr: baseTotal, // 🚨 Send the un-discounted base total
            couponId: activeCouponId    // 🚨 Send the coupon ID so the backend applies the math
          });

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderRes.amount,
            currency: orderRes.currency,
            name: "Shifting Into Awareness",
            description: `${quantity}x ${selectedPlan.name}`,
            order_id: orderRes.razorpayOrderId,
            prefill: { name: dbUser.name, email: dbUser.email },
            theme: { color: "#600694" },
            handler: async function (response: any) {
              try {
                await api.verifyUnifiedPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  dbOrderId: orderRes.dbOrderId
                });
                
                alert("Purchase successful! Welcome to the Satsang.");
                navigate("/my-learning");
              } catch (err) {
                alert("Payment verification failed.");
              }
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err: any) {
          console.error(err);
          alert("Failed to initiate checkout. Please check the console.");
        } finally {
          setProcessingId(null);
          setSelectedPlan(null); 
        }
      };
    } catch (error) {
      console.error("Checkout failed:", error);
      setProcessingId(null);
    }
  };

  // =============================================================
  // GROUP APPLICATION LOGIC
  // =============================================================
  const openGroupModal = () => {
    if (!dbUser) {
      navigate(`/login?redirectTo=${location.pathname}`);
      return;
    }
    setShowGroupModal(true);
  };

  const updateGroupEmail = (index: number, value: string) => {
    const newEmails = [...groupEmails];
    newEmails[index] = value;
    setGroupEmails(newEmails);
  };

  const removeGroupEmail = (index: number) => {
    if (groupEmails.length === 1) return;
    const newEmails = groupEmails.filter((_, i) => i !== index);
    setGroupEmails(newEmails);
  };

  const submitGroupRequest = async () => {
    const validEmails = groupEmails.filter(e => e.trim() !== "");
    
    if (validEmails.length === 0) {
      alert("Please enter at least one friend's email address.");
      return;
    }

    setIsSubmittingGroup(true);
    try {
      await api.submitGroupRequest({ 
        memberCount: validEmails.length + 1,
        emails: validEmails 
      });
      alert("Application sent successfully! Our team will email you and your friends the discount code shortly.");
      setShowGroupModal(false);
      setGroupEmails([""]); 
    } catch (error) {
      alert("Failed to send application. Please try again.");
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // =============================================================
  // RENDER UI
  // =============================================================
  if (loadingPlans || authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#600694]"></div>
      </div>
    );
  }

  const standardPlans = plans.filter(p => !p.name.toLowerCase().includes("webinar"));
  const topUpPlans = plans.filter(p => p.name.toLowerCase().includes("webinar"));
  const highestStandardPrice = Math.max(...standardPlans.map(p => p.minPriceInr), 0);

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50/50 pt-32 pb-20">
        <div className="sia-container max-w-6xl">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl text-[#600694] mb-4">
              Join Our Daily Satsang
            </h1>
            <p className="text-lg text-muted-foreground">
              Deepen your spiritual practice with daily live sessions and exclusive weekend webinars.
            </p>
          </div>

          {/* STANDARD PLANS GRID */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {standardPlans.map((plan, index) => {
              const isPremium = plan.minPriceInr === highestStandardPrice && highestStandardPrice > 0; 
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-3xl p-8 bg-white border flex flex-col ${
                    isPremium ? 'border-[#600694] shadow-xl shadow-[#600694]/10' : 'border-gray-200 shadow-md'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#600694] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      ★ Recommended
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h2 className="font-display text-2xl text-gray-900 mb-2">{plan.name}</h2>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-bold text-[#600694]">₹{plan.minPriceInr}</span>
                      <span className="text-muted-foreground mb-1">/ month</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="h-5 w-5 text-[#600694] shrink-0 mt-0.5" />
                      <span className="text-gray-600">Access to <strong>Daily Live Sessions</strong></span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-[#600694] shrink-0 mt-0.5" />
                      <span className="text-gray-600"><strong>{plan.webinarCredits} Free Webinar Credits</strong> per month</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#600694] shrink-0 mt-0.5" />
                      <span className="text-gray-600">Automated email reminders</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openCheckoutModal(plan)}
                    className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                      isPremium ? 'bg-[#600694] text-white hover:bg-[#4a0473]' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Subscribe Now
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* GROUP DISCOUNT CALL TO ACTION */}
          <div className="mt-8 mb-16 text-center bg-white p-8 rounded-3xl border border-[#600694]/20 shadow-lg max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Users className="h-32 w-32 text-[#600694]" />
            </div>
            <h3 className="font-display text-2xl text-[#600694] mb-2 flex items-center justify-center gap-2 relative z-10">
              <Users className="h-6 w-6" /> Have a group of friends?
            </h3>
            <p className="text-gray-600 mb-6 relative z-10">
              Spiritual growth is better together. Apply as a group to receive a special, exclusive discount code for everyone!
            </p>
            <button 
              onClick={openGroupModal}
              className="px-8 py-3 bg-[#600694]/10 text-[#600694] rounded-full font-bold hover:bg-[#600694] hover:text-white transition-colors relative z-10"
            >
              Apply for Group Discount
            </button>
          </div>

          {/* TOP-UP / WEBINAR ONLY PASSES */}
         

        </div>
      </div>

      {/* CHECKOUT & COUPON MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full mx-auto relative"
            >
              <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>

              <h3 className="text-2xl font-display text-[#600694] mb-2">Secure Checkout</h3>
              <p className="text-gray-500 text-sm mb-6">Complete your purchase for the {selectedPlan.name}.</p>

              {/* 🚨 NEW: INCREMENT/DECREMENT QUANTITY SELECTOR */}
              <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Select Quantity
                </span>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-1 py-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-600 hover:text-[#600694] hover:bg-[#600694]/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-[#600694]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2 text-gray-600 hover:text-[#600694] hover:bg-[#600694]/10 rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* DYNAMIC PRICING BREAKDOWN */}
              <div className="space-y-3 mb-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Standard Price (x{quantity})</span>
                  <span>₹{selectedPlan.minPriceInr * quantity}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between items-center text-green-600 font-bold">
                    <span>Group Discount ({discountPercent}%)</span>
                    <span>- ₹{(selectedPlan.minPriceInr * quantity * discountPercent) / 100}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-5 w-5"/> 
                    {(selectedPlan.minPriceInr * quantity) - ((selectedPlan.minPriceInr * quantity * discountPercent) / 100)}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Have a group referral code?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. FRIENDS-5"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={discountPercent > 0}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#600694] focus:ring-1 focus:ring-[#600694] outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || isApplyingCoupon || discountPercent > 0}
                    className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-colors shrink-0"
                  >
                    {isApplyingCoupon ? <Loader2 className="h-5 w-5 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs font-semibold mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-green-600 text-sm font-bold mt-2 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> {couponSuccess}</p>}
              </div>

              <button 
                onClick={processPayment}
                disabled={processingId !== null}
                className="w-full py-4 bg-[#600694] text-white rounded-full font-bold text-lg hover:bg-[#4a0473] transition-colors shadow-md transform hover:-translate-y-0.5 disabled:transform-none disabled:bg-gray-400"
              >
                {processingId !== null ? "Processing..." : `Pay ₹${(selectedPlan.minPriceInr * quantity) - ((selectedPlan.minPriceInr * quantity * discountPercent) / 100)} Securely`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GROUP APPLICATION MODAL */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setShowGroupModal(false)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <h3 className="text-2xl font-display text-[#600694] mb-2 flex items-center gap-2">
                <Users className="h-6 w-6" /> Group Discount
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter the email addresses of the friends joining you. To prevent fraud, the generated discount code will <span className="font-bold text-gray-800">only work for these specific emails</span>.
              </p>
              
              <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {groupEmails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder={`Friend ${i + 1}'s Email Address`}
                      value={email} 
                      onChange={(e) => updateGroupEmail(i, e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#600694] outline-none"
                    />
                    {groupEmails.length > 1 && (
                      <button onClick={() => removeGroupEmail(i)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setGroupEmails([...groupEmails, ""])} 
                className="text-sm font-bold text-[#600694] mb-8 flex items-center gap-1 hover:bg-[#600694]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" /> Add another friend
              </button>
              
              <button 
                onClick={submitGroupRequest}
                disabled={isSubmittingGroup}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isSubmittingGroup ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Group Request"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AnimatedPage>
  );
}