import { useEffect, useState } from "react";
import { Calendar, Clock, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

export default function SatsungsQnAPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const { dbUser, loading } = useAuth();
  
  // We assume true initially to prevent flashing the locked screen before the API responds
  const [isSubscribed, setIsSubscribed] = useState(true); 

  useEffect(() => {
    const checkSubAndFetch = async () => {
      // Don't do anything until Firebase auth has finished loading
      if (loading) return;

      // If they aren't logged in at all, they definitely aren't subscribed
      if (!dbUser) {
        setIsSubscribed(false);
        return;
      }

      try {
        // 1. Properly check if they are an ADMIN or have an ACTIVE SUBSCRIPTION
        let hasAccess = dbUser.role === 'ADMIN';

        if (!hasAccess) {
          try {
            const subRes = await api.getUserSubscription();
            if (subRes && subRes.subscription) {
              hasAccess = true;
            }
          } catch (e) {
            console.warn("User does not have an active subscription.");
          }
        }

        setIsSubscribed(hasAccess);

        // 2. If they have access, fetch the upcoming schedule!
        if (hasAccess) {
          const scheduleRes = await api.getSchedules();
          setSchedules(scheduleRes.schedules || []);
        }

      } catch (err) {
        console.error("Error fetching schedules", err);
      }
    };
    
    checkSubAndFetch();
  }, [dbUser, loading]);

  // 🚨 LOCKED STATE: What non-subscribed users see
  if (!isSubscribed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <Lock className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          You must have an active subscription to view the upcoming schedule and access live sessions.
        </p>
        <Link 
          to="/subscription" 
          className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#4a0473] transition-colors"
        >
          View Plans
        </Link>
      </div>
    );
  }

  // ✅ UNLOCKED STATE: What subscribed users see
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display text-[#600694] mb-4">Upcoming Schedule</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your itinerary for upcoming Live Satsungs and Q&A sessions.
          </p>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold text-lg">No upcoming events scheduled at the moment.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for new dates!</p>
          </div>
        ) : (
          /* 🚨 4 CARDS PER ROW GRID 🚨 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {schedules.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"
              >
                {/* Top Decorative accent line based on category */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${event.category === 'QnA' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                
                {/* Date Block */}
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-bold mb-5 shadow-sm ${
                  event.category === 'QnA' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                }`}>
                  <span className="text-[11px] opacity-90 uppercase tracking-widest mt-1">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-2xl leading-none mb-1">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 line-clamp-3 group-hover:text-[#600694] transition-colors">
                    {event.title}
                  </h3>
                </div>
                
                {/* Footer (Category & Time) */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    event.category === 'QnA' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    {event.category}
                  </span>
                  
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                    <Clock size={14} className={event.category === 'QnA' ? 'text-blue-400' : 'text-orange-400'}/> 
                    {event.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}