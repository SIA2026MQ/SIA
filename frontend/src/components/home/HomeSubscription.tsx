import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Video, ShieldCheck, X, IndianRupee, Ticket, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  webinarCredits: number;
  minPriceInr: number;
  minPriceUsd: number;
}

export function HomeSubscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Fetch Data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.getAllPlans();
        if (res.plans) {
          // Separate standard subscriptions and a-la-carte webinar passes
          const subs = res.plans.filter((p: Plan) => !p.name.toLowerCase().includes("webinar"));
          const passes = res.plans.filter((p: Plan) => p.name.toLowerCase().includes("webinar"));
          
          // Grab top 2 subscriptions and 1 webinar pass
          const combinedPlans = [...subs.slice(0, 2), ...passes.slice(0, 1)];
          setPlans(combinedPlans);
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // 2. Safe Razorpay Script Loading
  useEffect(() => {
    const scriptId = "razorpay-checkout-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 3. Checkout Handlers
  const openCheckoutModal = (plan: Plan) => {
    if (!dbUser) {
      navigate(`/login?redirectTo=${location.pathname}`);
      return;
    }
    setSelectedPlan(plan);
  };

  const processPayment = async () => {
    if (!selectedPlan || !dbUser) return;
    setProcessingId(selectedPlan.id);

    try {
      const orderRes = await api.createUnifiedOrder({
        itemId: selectedPlan.id,
        itemType: "SUBSCRIPTION", 
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "Shifting Into Awareness",
        description: `${selectedPlan.name}`,
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
      
      rzp.on('payment.failed', function () {
        setProcessingId(null);
      });
      
      rzp.open();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to initiate checkout.");
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center ">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#600694]"></div>
      </div>
    );
  }

  if (plans.length === 0) return null;

  // Filter out the Webinar Pass if the user is NOT logged in
  const displayPlans = dbUser ? plans : plans.filter(p => !p.name.toLowerCase().includes("webinar"));

  return (
    <section className="py-24 bg-[#F7F3FA] border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================
            HEADER (Perfectly Aligned)
        ========================================= */}
        <div className="flex flex-col items-center text-center max-w-7xl mx-auto mb-12 gap-3">
           <h2 className="sia-h2 text-3xl md:text-4xl">Start Your Journey</h2>
          <p className="text-[10px] sm:text-xl font-bold uppercase tracking-widest text-[#fdb022]">
            Join our daily live Satsangs or get an exclusive pass to our weekend webinars. Choose the plan that fits your path.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className={`grid gap-6 items-stretch ${displayPlans.length === 3 ? 'md:grid-cols-3 max-w-5xl' : 'md:grid-cols-2 max-w-3xl'} mx-auto`}>
          {displayPlans.map((plan, index) => {
            // Determine card type based on name
            const isPass = plan.name.toLowerCase().includes("webinar");
            const isPremium = !isPass && plan.webinarCredits > 1; 

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 bg-white border flex flex-col ${
                  isPremium ? 'border-[#600694] shadow-lg shadow-[#600694]/5 scale-105 z-10' : 'border-gray-200 shadow-sm'
                }`}
              >
                {/* Badges */}
                {isPremium && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#600694] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                {isPass && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    One-Time Pass
                  </div>
                )}

                

                <div className="space-y-3 mb-6 flex-1 text-sm">
                  {/* FEATURES FOR WEBINAR PASS */}
                  {isPass ? (
                    <>
                      
                      
                    </>
                  ) : (
                  /* FEATURES FOR SUBSCRIPTIONS */
                    <>
                      <div className="flex items-start gap-2.5">
                        <CalendarDays className="h-4 w-4 text-[#600694] shrink-0 mt-0.5" />
                        <span className="text-gray-600 leading-tight text-[15px]">Access to <strong>Daily Live Sessions</strong></span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Video className="h-4 w-4 text-[#600694] shrink-0 mt-0.5" />
                        <span className="text-gray-600 leading-tight text-[15px]"><strong>{plan.webinarCredits} Free Webinar Credit{plan.webinarCredits > 1 ? 's' : ''}</strong> per month</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-[#600694] shrink-0 mt-0.5" />
                        <span className="text-gray-600 leading-tight text-[15px]">Automated email reminders</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 🚨 BUTTON LOGIC */}
                <button
                  onClick={() => {
                    if (isPass) {
                      // Navigate to Satsung page and add the hash for scrolling
                      navigate('/satsungs#alacarte-passes');
                    } else {
                      // Just navigate to the top of the Satsung page
                      navigate('/membership');
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-slg transition-colors flex items-center justify-center gap-2 ${
                    isPremium ? 'bg-[#600694] text-white hover:bg-[#4a0473]' : 
                    isPass ? 'bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white' : 
                    'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isPass ? 'Select Pass' : 'Subscribe Details'}
                </button>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================= */}
      {/* CHECKOUT MODAL (No Coupons)               */}
      {/* ========================================= */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full mx-auto relative"
            >
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              <h3 className="text-2xl font-display text-[#600694] mb-2">Checkout</h3>
              <p className="text-gray-500 text-sm mb-6">Complete your purchase to start learning.</p>

              <div className="space-y-3 mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Plan</span>
                  <span className="text-gray-900 font-bold">{selectedPlan.name}</span>
                </div>
                
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-5 w-5"/> 
                    {selectedPlan.minPriceInr}
                  </span>
                </div>
              </div>

              <button 
                onClick={processPayment}
                disabled={processingId !== null}
                className="w-full py-4 bg-[#600694] text-white rounded-full font-bold text-lg hover:bg-[#4a0473] transition-colors shadow-md disabled:bg-gray-400"
              >
                {processingId !== null ? "Processing..." : `Pay ₹${selectedPlan.minPriceInr} Securely`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}