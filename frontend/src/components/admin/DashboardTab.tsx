import { Link } from "react-router-dom";
import { ExternalLink, PlusCircle, Sparkles } from "lucide-react";
import {
  loadCoupons, loadManagedBlogs, loadManagedCourses, loadManagedWebinars, loadRetreatInquiries,
} from "@/utils/contentStore";

export function DashboardTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  // Load the current stats from the store
  const stats = [
    { label: "Managed Courses", value: loadManagedCourses().length },
    { label: "Managed Webinars", value: loadManagedWebinars().length },
    { label: "Managed Blogs", value: loadManagedBlogs().length },
    { label: "Coupons", value: loadCoupons().length },
    { label: "Retreat Inquiries", value: loadRetreatInquiries().length },
    { label: "Today's Session", value: "Today Live Section" },
  ];

  return (
    <div className="space-y-6">
      
      {/* ======================================================= */}
      {/* MISSING STATS GRID RESTORED HERE                          */}
      {/* ======================================================= */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((card) => (
          <article key={card.label} className="sia-card bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-4xl font-bold text-[#600694]">
              {card.value}
            </p>
          </article>
        ))}
      </div>

      {/* ======================================================= */}
      {/* QUICK ACTIONS & PREVIEW CARDS                             */}
      {/* ======================================================= */}
      <div className="grid gap-4 md:grid-cols-2">
        <article className="sia-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="sia-h3 text-xl font-bold text-[#600694] mb-4">Quick Actions</h2>
          <div className="grid gap-2">
            <button className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" onClick={() => setActiveTab("courses")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add a course
            </button>
            <button className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" onClick={() => setActiveTab("webinars")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add a webinar
            </button>
            <button 
              className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" 
              onClick={() => setActiveTab("daily-session")} // This triggers the switch
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add daily session
            </button>
            <button className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" onClick={() => setActiveTab("retreats")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add a retreat
            </button>
            <button className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" onClick={() => setActiveTab("blogs")}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add a blog post
            </button>
            <button className="sia-button-outline justify-start border-[#600694]/20 text-[#600694] hover:bg-[#600694] hover:text-white transition-all w-full text-left px-4 py-2 rounded-lg flex items-center" onClick={() => setActiveTab("coupons")}>
              <Sparkles className="mr-2 h-4 w-4" /> Generate coupon
            </button>
          </div>
        </article>

        <article className="sia-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="sia-h3 text-xl font-bold text-[#600694]">Store Preview</h2>
          <p className="mt-2 text-sm text-muted-foreground mb-4">Check frontend views anytime:</p>
          <div>
            <Link to="/" className="sia-button-outline border-[#600694] text-[#600694] hover:bg-[#600694] hover:text-white px-4 py-2 rounded-full inline-flex items-center transition-all">
              <ExternalLink className="mr-2 h-4 w-4" /> Visit Site
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {["courses", "blog", "events", "cart"].map(route => (
              <Link key={route} to={`/${route}`} className="rounded-full border border-[#600694]/30 px-3 py-1.5 text-[#600694] hover:bg-[#600694]/10 transition-colors capitalize">
                {route}
              </Link>
            ))}
          </div>
        </article>
      </div>

    </div>
  );
}