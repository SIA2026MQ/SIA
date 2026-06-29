import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react"; 
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext"; 
import { api } from "@/lib/api";

// Import your modular tab components
import { DashboardTab } from "@/components/admin/DashboardTab";
import { CoursesTab } from "@/components/admin/CoursesTab";
import { AdminWebinarTab } from "@/components/admin/AdminWebinarTab"; 
import { RetreatsTab } from "@/components/admin/RetreatsTab";
import { BlogsTab } from "@/components/admin/BlogsTab";
import { CouponsTab } from "@/components/admin/CouponsTab";
import { InquiriesTab } from "@/components/admin/InquiriesTab";
import { DailySessionTab } from "@/components/admin/DailySessionTab";
import { SubscriptionTab } from "@/components/admin/SubscriptionTab";
import { UserLevelTab } from "@/components/admin/UserLevelTab";
import { ScheduleTab } from "@/components/admin/ScheduleTab";

type Tab = "dashboard" | "courses" | "webinars" | "retreats" | "blogs" | "coupons" | "inquiries" | "daily-session" | "subscriptions" | "users" | "schedules"; // Add "schedules" to the type

export default function AdminPage() {
  // 🚨 NEW: Read the active tab directly from the URL!
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "dashboard";

  // 🚨 NEW: Create a custom function to update the URL when a tab is clicked
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [pendingCoupons, setPendingCoupons] = useState(0); 
  const navigate = useNavigate();

  // 1. Pull the real user data and loading state from your secure Context
  const { dbUser, loading, logout } = useAuth();

  // Shared function passed to tabs so they can return to dashboard after saving
  const handlePostSave = () => {
    setActiveTab("dashboard");
  };

  // Fetch pending group requests to show the notification badge
  useEffect(() => {
    if (dbUser?.role === "ADMIN") {
      api.getAdminGroupRequests()
        .then((res) => {
          if (res.requests) {
            const pending = res.requests.filter((r: any) => r.status === "PENDING").length;
            setPendingCoupons(pending);
          }
        })
        .catch(console.error);
    }
  }, [dbUser, activeTab]); // Re-runs when you switch tabs so the badge updates immediately

  // 2. SECURITY GATE: Wait for Firebase & PostgreSQL to verify the user
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-[#600694]" />
        <p className="mt-4 font-semibold text-[#600694]">Verifying secure access...</p>
      </div>
    );
  }

  // 3. SECURITY GATE: Kick out anyone who isn't logged in OR isn't an ADMIN
  if (!dbUser || dbUser.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  // Dynamic Component Renderer
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab setActiveTab={setActiveTab as (tab: string) => void} />;
      case "courses":
        return <CoursesTab handlePostSave={handlePostSave} />;
      case "schedules":
        return <ScheduleTab />;
      case "webinars":
        return <AdminWebinarTab />; 
      case "daily-session":
        return <DailySessionTab handlePostSave={handlePostSave} />;  
      case "retreats":
        return <RetreatsTab handlePostSave={handlePostSave} />;
      case "subscriptions":
        return <SubscriptionTab handlePostSave={handlePostSave} />;
      case "blogs":
        return <BlogsTab handlePostSave={handlePostSave} />;
      case "coupons":
        return <CouponsTab handlePostSave={handlePostSave} />;
      case "inquiries":
        return <InquiriesTab />;
      case "users":
        return <UserLevelTab />;
      default:
        return null;
    }
  };

  // Build the tab list array so we can map over it and inject the badge
  const tabsList = [
    { key: "dashboard", label: "Dashboard" },
    { key: "courses", label: "Courses" },
    { key: "webinars", label: "Webinars" },
    { key: "retreats", label: "Retreats" },
    { key: "blogs", label: "Blogs" },
    { key: "coupons", label: "Coupons", notificationCount: pendingCoupons }, 
    { key: "inquiries", label: "Inquiries" },
    { key: "daily-session", label: "Daily Session" },
    { key: "subscriptions", label: "Subscriptions" },
    { key: "users", label: "Users" },
    { key: "schedules", label: "Schedules" },
  ];

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[100dvh]">
        <div className="sia-container space-y-6">

          {/* ======================================================= */}
          {/* HEADER & LOGOUT                                         */}
          {/* ======================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="sia-h1 text-[#600694]">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome back, {dbUser.name}. Manage courses, webinars, retreats, blogs, coupons, and retreat leads.
              </p>
            </div>
            <button
              type="button"
              className="sia-button-outline border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={async () => {
                await logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>

          {/* ======================================================= */}
          {/* TAB NAVIGATION MENU                                     */}
          {/* ======================================================= */}
          <nav className="flex flex-wrap gap-2">
            {tabsList.map((tab) => (
              <button
                key={tab.key}
                className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "border-[#600694] bg-[#600694] text-white shadow-md"
                    : "border-[#600694]/30 text-[#600694] hover:bg-[#600694]/10"
                }`}
                // 🚨 Trigger URL update here
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {/* THE RED NOTIFICATION DOT */}
                {tab.notificationCount ? (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm animate-bounce">
                    {tab.notificationCount}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* ======================================================= */}
          {/* ACTIVE TAB CONTENT (Rendered dynamically)                 */}
          {/* ======================================================= */}
          <div className="mt-6 animation-fade-in">
            {renderActiveTab()}
          </div>

        </div>
      </section>
    </AnimatedPage>
  );
}