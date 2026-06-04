import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AnimatedPage } from "@/components/common/AnimatedPage";

// Import your new modular tab components
import { DashboardTab } from "@/components/admin/DashboardTab";
import { CoursesTab } from "@/components/admin/CoursesTab";
import { WebinarsTab } from "@/components/admin/WebinarsTab";
import { RetreatsTab } from "@/components/admin/RetreatsTab";
import { BlogsTab } from "@/components/admin/BlogsTab";
import { CouponsTab } from "@/components/admin/CouponsTab";
import { InquiriesTab } from "@/components/admin/InquiriesTab";

type Tab = "dashboard" | "courses" | "webinars" | "retreats" | "blogs" | "coupons" | "inquiries";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isAuthed, setIsAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Authentication Check
  useEffect(() => {
    setIsAuthed(window.localStorage.getItem("sia-admin-auth") === "true");
    setHydrated(true);
  }, []);

  // Redirect to login if not authenticated
  if (hydrated && !isAuthed) {
    return <Navigate to="/admin/login" replace />;
  }

  // Shared function passed to tabs so they can return to dashboard after saving
  const handlePostSave = () => {
    setActiveTab("dashboard");
  };

  // Dynamic Component Renderer
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab setActiveTab={setActiveTab as (tab: string) => void} />;
      case "courses":
        return <CoursesTab handlePostSave={handlePostSave} />;
      case "webinars":
        return <WebinarsTab handlePostSave={handlePostSave} />;
      case "retreats":
        return <RetreatsTab handlePostSave={handlePostSave} />;
      case "blogs":
        return <BlogsTab handlePostSave={handlePostSave} />;
      case "coupons":
        return <CouponsTab handlePostSave={handlePostSave} />;
      case "inquiries":
        return <InquiriesTab />;
      default:
        return null;
    }
  };

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-16 min-h-[100dvh]">
        <div className="sia-container space-y-6">
          
          {/* ======================================================= */}
          {/* HEADER & LOGOUT                                           */}
          {/* ======================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="sia-h1 text-[#600694]">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage courses, webinars, retreats, blogs, coupons, and retreat leads.
              </p>
            </div>
            <button
              type="button"
              className="sia-button-outline border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                window.localStorage.removeItem("sia-admin-auth");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>

          {/* ======================================================= */}
          {/* TAB NAVIGATION MENU                                       */}
          {/* ======================================================= */}
          <nav className="flex flex-wrap gap-2">
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "courses", label: "Courses" },
              { key: "webinars", label: "Webinars" },
              { key: "retreats", label: "Retreats" },
              { key: "blogs", label: "Blogs" },
              { key: "coupons", label: "Coupons" },
              { key: "inquiries", label: "Inquiries" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "border-[#600694] bg-[#600694] text-white shadow-md"
                    : "border-[#600694]/30 text-[#600694] hover:bg-[#600694]/10"
                }`}
                onClick={() => setActiveTab(tab.key as Tab)}
              >
                {tab.label}
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