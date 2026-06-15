import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Clock, Star, Video, GraduationCap, BookOpen, TrendingUp, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "./utils";
import { EnrolledCourse, Tab } from "./types";
import { MiniCalendar } from "./MiniCalendar";

export function StudentDashboardPanel({ courses, webinars, subscription, onChangeTab }: { courses: EnrolledCourse[], webinars: any[], subscription: any, onChangeTab: (tab: Tab) => void }) {
  const { dbUser } = useAuth();
  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    api.getMyRetreatApplications().then(res => setMyApplications(res.applications || []));
  }, []);

  const practicesCount = courses.filter(c => c.category === "practices").length;
  const scripturesCount = courses.filter(c => c.category === "scriptures").length;

  const stats = [
    { label: "My Practices", value: practicesCount, icon: GraduationCap, bg: "bg-[#600694]", action: () => onChangeTab("practices") },
    { label: "My Scriptures", value: scripturesCount, icon: BookOpen, bg: "bg-purple-800", action: () => onChangeTab("scriptures") },
  ];

  const handleRetreatPayment = async (app: any) => {
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        try {
          const orderRes = await api.createUnifiedOrder({ itemId: app.retreatId, itemType: "RETREAT" });
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderRes.amount,
            currency: orderRes.currency,
            name: "Shifting Into Awareness",
            description: `${app.retreat.title} Retreat Payment`,
            order_id: orderRes.razorpayOrderId,
            prefill: { name: dbUser?.name, email: dbUser?.email },
            theme: { color: "#600694" },
            handler: async function (response: any) {
              await api.verifyUnifiedPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderRes.dbOrderId
              });
              alert("Payment Successful! Your spot is confirmed.");
              window.location.reload();
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err) {
          alert("Failed to initiate payment.");
        }
      };
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      
      {myApplications.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="font-display text-2xl text-[#600694]">My Retreat Applications</h3>
          {myApplications.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {app.retreat.imageUrl ? (
                  <img src={app.retreat.imageUrl} alt={app.retreat.title} className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-xl shrink-0 border border-gray-100 shadow-sm" />
                ) : (
                  <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center border border-gray-200">
                    <span className="text-xs font-bold text-gray-400">No Image</span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{app.retreat.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">Status: <span className="font-semibold text-gray-700">{app.status}</span></p>
                </div>
              </div>
              
              <div className="shrink-0 flex items-center gap-3">
                {app.status === 'PENDING' && <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-bold border border-yellow-200">Under Review</div>}
                {app.status === 'REJECTED' && <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">Application Closed</div>}
                {app.status === 'PAID' && <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-200">Spot Confirmed!</div>}
                {app.status === 'APPROVED' && (
                  <button onClick={() => handleRetreatPayment(app)} className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 shadow-md animate-pulse transition-colors">
                    Pay Fees Now (₹{app.retreat.priceInr})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {subscription && (
        <div className="mb-8">
          <h3 className="font-display text-2xl text-[#600694] flex items-center gap-2 mb-4">
            <Star className="h-6 w-6 text-yellow-500" fill="currentColor" /> Active Membership
          </h3>
          <div className="bg-gradient-to-r from-[#600694] to-[#4a0473] rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-white/30">
                Satsang Subscriber
              </div>
              <h3 className="text-3xl font-display mb-2">{subscription.plan?.name || "Premium Membership"}</h3>
              <div className="flex flex-col sm:flex-row gap-4 text-white/80 text-sm mt-4">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Renews: {new Date(subscription.expiryDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Video className="h-4 w-4" /> {subscription.remainingCredits} Webinar Credits Remaining</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <Link to="/satsungs" className="bg-white text-[#600694] px-8 py-3 rounded-full font-bold text-center hover:bg-gray-100 transition-colors shadow-md">
                Join Today's Live Session
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} onClick={s.action} className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
              <div className={cn("inline-grid h-14 w-14 place-items-center rounded-2xl text-white", s.bg)}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-4xl text-[#600694]">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-3xl bg-white p-8 border border-gray-100 shadow-sm h-fit">
          <h3 className="font-display text-2xl text-[#600694] flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-yellow-500" /> Recent Learning
          </h3>
          <ul className="mt-6 space-y-4 divide-y divide-gray-100">
            {courses.slice(0, 5).map((course) => (
              <li key={course.id} className="flex items-center gap-4 pt-4 first:pt-0">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#600694]/10 text-[#600694]"><GraduationCap className="h-6 w-6" /></span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-foreground">Continued <span className="text-[#600694]">"{course.title}"</span></p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> Enrolled on: {course.lastAccessed}</p>
                </div>
                <Link to={`/courses/${course.id}/watch`} className="flex-none p-3 rounded-full bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
                  <PlayCircle className="h-6 w-6" />
                </Link>
              </li>
            ))}
            {courses.length === 0 && (
               <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl mt-4">
                 <p className="text-muted-foreground">You haven't started any courses yet.</p>
                 <button onClick={() => onChangeTab("practices")} className="mt-4 text-[#600694] font-semibold text-sm">Browse Catalog &rarr;</button>
               </div>
            )}
          </ul>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm h-fit flex flex-col">
            <h3 className="font-display text-xl text-[#600694] flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-yellow-500" /> Live Events
            </h3>
            <MiniCalendar webinars={webinars} />
          </div>
        </aside>
      </div>
    </div>
  );
}