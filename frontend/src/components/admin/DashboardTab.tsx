import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface DashboardTabProps {
  setActiveTab: (tab: string) => void;
}

export function DashboardTab({ setActiveTab }: DashboardTabProps) {
  // State to hold the numbers from the backend
  const [stats, setStats] = useState({
    courses: 0,
    webinars: 0,
    blogs: 0,
    coupons: 0,
    inquiries: 0
  });
  
  const [todaySession, setTodaySession] = useState<{ title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the data as soon as the dashboard tab opens
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and today's session at the exact same time for speed
        const [statsRes, sessionRes] = await Promise.all([
          api.getAdminStats(),
          api.getTodaySession().catch(() => null) // Catch 404 if no session today
        ]);

        if (statsRes) setStats(statsRes);
        if (sessionRes && sessionRes.session) setTodaySession(sessionRes.session);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#600694]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Card 1: Courses */}
      <div 
        onClick={() => setActiveTab("courses")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Managed Courses</h3>
        <p className="text-5xl font-display font-bold text-[#600694]">{stats.courses}</p>
      </div>

      {/* Card 2: Webinars */}
      <div 
        onClick={() => setActiveTab("webinars")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Managed Webinars</h3>
        <p className="text-5xl font-display font-bold text-[#600694]">{stats.webinars}</p>
      </div>

      {/* Card 3: Blogs */}
      <div 
        onClick={() => setActiveTab("blogs")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Managed Blogs</h3>
        <p className="text-5xl font-display font-bold text-[#600694]">{stats.blogs}</p>
      </div>

      {/* Card 4: Coupons */}
      <div 
        onClick={() => setActiveTab("coupons")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Coupons</h3>
        <p className="text-5xl font-display font-bold text-[#600694]">{stats.coupons}</p>
      </div>

      {/* Card 5: Retreat Inquiries */}
      <div 
        onClick={() => setActiveTab("inquiries")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Retreat Inquiries</h3>
        <p className="text-5xl font-display font-bold text-[#600694]">{stats.inquiries}</p>
      </div>

      {/* Card 6: Today's Session */}
      <div 
        onClick={() => setActiveTab("daily-session")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-[#600694]/20 bg-[#600694]/5 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-[#600694]/70 uppercase tracking-wider mb-2">Today's Session</h3>
        <p className="text-3xl font-display font-bold text-[#600694] leading-tight line-clamp-2">
          {todaySession ? todaySession.title : "No Session Today"}
        </p>
      </div>

      {/* 🚨 NEW: Card for Subscriptions */}
      <div 
        onClick={() => setActiveTab("subscriptions")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Manage Plans & Pricing</h3>
        {/* You can leave this as a static icon or text since we didn't add a specific stat counter for plans */}
        <p className="text-2xl font-display font-bold text-[#600694]">Subscriptions</p>
      </div>

      <div 
        onClick={() => setActiveTab("users")}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center cursor-pointer transition-all hover:-translate-y-1 hover:border-[#600694]/30 hover:shadow-md"
      >
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Student Management</h3>
        <p className="text-2xl font-display font-bold text-[#600694]">Users & Levels</p>
      </div>

    </div>
  );
}