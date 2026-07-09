import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Clock, Star, Video, GraduationCap, TrendingUp, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { EnrolledCourse, Tab } from "./types";
import { MiniCalendar } from "./MiniCalendar";

export function StudentDashboardPanel({
  courses,
  webinars,
  subscription,
  onChangeTab
}: {
  courses: EnrolledCourse[],
  webinars: any[],
  subscription: any,
  onChangeTab: (tab: Tab) => void
}) {
  const { dbUser } = useAuth();
  const [myApplications, setMyApplications] = useState<any[]>([]);

  useEffect(() => {
    api.getMyRetreatApplications().then(res => {
      const validApplications = (res.applications || []).filter((app: any) => app && app.retreat);
      setMyApplications(validApplications);
    }).catch(err => console.error("Failed to fetch applications", err));
  }, []);

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
            description: `${app.retreat?.title || 'Retreat'} Payment`,
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
    <div className="space-y-6 sm:space-y-8">

      {/* =========================================
          RETREAT APPLICATIONS GRID
          Mobile: 1 column, smaller text/padding
          Desktop: 3 columns
          ========================================= */}
      {myApplications.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h3 className="font-display text-lg sm:text-xl md:text-2xl text-[#600694] mb-3 sm:mb-4 px-1 sm:px-0">
            My Retreat Applications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {myApplications.map((app) => (
              <div key={app.id} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">

                <div className="flex flex-col gap-2 sm:gap-3">
                  {app.retreat?.imageUrl ? (
                    <img src={app.retreat.imageUrl} alt={app.retreat.title} className="w-full h-24 sm:h-32 object-cover rounded-lg sm:rounded-xl shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-full h-24 sm:h-32 bg-gray-50 rounded-lg sm:rounded-xl shrink-0 flex items-center justify-center border border-gray-100">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">No Image</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{app.retreat?.title || 'Deleted Retreat'}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      Status: <span className="font-semibold text-gray-700">{app.status}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50">
                  {app.status === 'PENDING' && <div className="text-center w-full py-1.5 sm:py-2 bg-yellow-50 text-yellow-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-yellow-200">Under Review</div>}
                  {app.status === 'REJECTED' && <div className="text-center w-full py-1.5 sm:py-2 bg-red-50 text-red-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-red-200">Application Closed</div>}
                  {app.status === 'PAID' && <div className="text-center w-full py-1.5 sm:py-2 bg-green-50 text-green-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-green-200">Spot Confirmed!</div>}
                  {app.status === 'APPROVED' && (
                    <button onClick={() => handleRetreatPayment(app)} className="w-full bg-green-600 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-green-700 shadow-sm animate-pulse transition-colors">
                      Pay Fees (₹{app.retreat?.priceInr || 0})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================
          ACTIVE MEMBERSHIP BANNER
          Mobile: Stacked elements, smaller padding
          ========================================= */}
      {subscription && (
        <div className="mb-6 sm:mb-8">
          <h3 className="font-display text-lg sm:text-2xl text-[#600694] flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="currentColor" /> Active Membership
          </h3>
          <div className="bg-gradient-to-r from-[#600694] to-[#4a0473] rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="w-full">
              <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-[9px] sm:text-xs font-bold tracking-wider uppercase mb-2 sm:mb-3 border border-white/30">
                Satsang Subscriber
              </div>
              <h3 className="text-2xl sm:text-3xl font-display mb-1 sm:mb-2 text-white line-clamp-1">{subscription.plan?.name || "Premium Membership"}</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-white/80 text-[10px] sm:text-sm mt-2 sm:mt-4">
                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /> Renews: {new Date(subscription.expiryDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Video className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /> {subscription.remainingCredits} Webinar Credits Remaining</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          RECENT LEARNING & CALENDAR SPLIT
          Mobile: Stack vertically (1 col)
          Desktop: Split layout (1fr + 340px sidebar)
          ========================================= */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

        {/* Recent Learning */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 border border-gray-100 shadow-sm h-fit">
          <h3 className="font-display text-lg sm:text-xl text-[#600694] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> Recent Learning
          </h3>
          <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 divide-y divide-gray-100">
            {courses.slice(0, 5).map((course) => (
              <li key={course.id} className="flex items-center gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 first:pt-0">
                <span className="grid h-8 w-8 sm:h-10 sm:w-10 flex-none place-items-center rounded-lg sm:rounded-xl bg-[#600694]/10 text-[#600694]">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[11px] sm:text-sm font-semibold text-foreground">
                    Continued <span className="text-[#600694]">"{course.title}"</span>
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Enrolled: {course.lastAccessed}
                  </p>
                </div>
                <Link to={`/learn/${course.id}`} className="flex-none p-1.5 sm:p-2 rounded-full bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
                  <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </li>
            ))}
            {courses.length === 0 && (
              <div className="text-center p-4 sm:p-6 border-2 border-dashed border-gray-100 rounded-xl sm:rounded-2xl mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground">You haven't started any courses yet.</p>
                <button onClick={() => onChangeTab("practices")} className="mt-2 sm:mt-3 text-[#600694] font-semibold text-[10px] sm:text-xs">Browse Catalog &rarr;</button>
              </div>
            )}
          </ul>
        </div>

        {/* Live Events Sidebar / Bottom section on Mobile */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 border border-gray-100 shadow-sm h-fit flex flex-col">
            <h3 className="font-display text-lg sm:text-xl text-[#600694] flex items-center gap-2 mb-3">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" /> Live Events
            </h3>
            <MiniCalendar webinars={webinars} />
          </div>
        </aside>

      </div>
    </div>
  );
}