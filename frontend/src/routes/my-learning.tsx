import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, GraduationCap, Video, Flower2, Trophy } from "lucide-react";

import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

import { EnrolledCourse } from "@/components/my-learning/types";
import { cn } from "@/components/my-learning/utils";
import { StudentDashboardPanel } from "@/components/my-learning/StudentDashboardPanel";
import { CourseGrid } from "@/components/my-learning/CourseGrid";
import { WebinarGrid } from "@/components/my-learning/WebinarGrid";

export default function MyLearningPage() {
  const { dbUser, loading } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [subscription, setSubscription] = useState<any | null>(null);

  // 🚨 Updated state to use standard strings to avoid type conflicts with your existing 'Tab' interface
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [courseSubTab, setCourseSubTab] = useState<"practices" | "scriptures">("practices");

  const [webinars, setWebinars] = useState<any[]>([]);
  const [loadingWebinars, setLoadingWebinars] = useState(true);

  useEffect(() => {
    if (!loading && !dbUser) {
      navigate("/login?redirectTo=/my-learning");
    } else if (dbUser) {
      const fetchMyLearningData = async () => {
        try {
          const res = await api.getMyEnrolledCourses();
          if (res.subscription) setSubscription(res.subscription);

          const rawCourses = res.courses || (res.enrolled ? res.enrolled.map((r: any) => ({ ...r.course, purchasedAt: r.purchasedAt })) : []);

          const formattedCourses: EnrolledCourse[] = rawCourses.map((courseData: any) => ({
            id: courseData.id,
            title: courseData.title,
            imageUrl: courseData.imageDataUrl || courseData.imageUrl || undefined,
            progress: 0,
            totalLessons: courseData.videos?.length || 0,
            completedLessons: 0,
            lastAccessed: courseData.purchasedAt ? new Date(courseData.purchasedAt).toLocaleDateString() : new Date().toLocaleDateString(),
            category: courseData.category === "Scriptures" ? "scriptures" : "practices"
          }));

          setCourses(formattedCourses);
        } catch (error) {
          console.error("Failed to load learning data:", error);
        }
      };

      api.getWebinars()
        .then(res => setWebinars(res.webinars || []))
        .catch(err => console.error("Failed to fetch webinars:", err))
        .finally(() => setLoadingWebinars(false));

      fetchMyLearningData();
    }
  }, [dbUser, loading, navigate]);

  if (loading || !dbUser) return null;

  // 🚨 1. Consolidate to only 3 Main Tabs
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "webinars", label: "Webinars", icon: Video },
  ];

  // Helper to handle tab changes safely (in case StudentDashboardPanel passes old tab names)
  const handleTabChange = (newTab: string) => {
    if (newTab === "practices" || newTab === "scriptures") {
      setActiveTab("courses");
      setCourseSubTab(newTab as "practices" | "scriptures");
    } else {
      setActiveTab(newTab);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50/50 pt-20 pb-20">

        {/* Header Section */}
        <div className="border-b border-[#600694]/10 bg-white">
          <div className="sia-container py-6 sm:py-8 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#600694]/70 flex items-center gap-1.5 sm:gap-2">
                <Flower2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Your Sanctuary
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-[#600694] mt-1 sm:mt-2">My Learning</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
                Welcome back to your journey, <span className="font-semibold text-[#600694]">{dbUser.name}</span>
              </p>
            </div>
            {/* Total Enrolled Card - Full width on mobile, auto on desktop */}
            <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 border border-[#600694]/10 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm w-full sm:w-auto">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Enrolled</p>
                <p className="font-display text-xl sm:text-2xl text-[#600694] leading-none mt-0.5 sm:mt-1">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="sia-container py-6 sm:py-10 grid gap-6 lg:gap-8 lg:grid-cols-[240px_1fr]">

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all",
                      active ? "bg-[#600694] text-white shadow-md" : "text-gray-600 hover:bg-[#600694]/10 hover:text-[#600694]"
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" /> {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {activeTab === "dashboard" && (
                  <StudentDashboardPanel courses={courses} webinars={webinars} subscription={subscription} onChangeTab={handleTabChange} />
                )}

                {/* 🚨 2. New Nested Sub-Panel for Courses */}
                {activeTab === "courses" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex gap-4 sm:gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                      <button
                        onClick={() => setCourseSubTab("practices")}
                        className={`pb-2.5 sm:pb-3 text-xs sm:text-sm whitespace-nowrap font-bold uppercase tracking-wider transition-colors border-b-2 ${courseSubTab === "practices" ? "text-[#600694] border-[#600694]" : "text-gray-500 border-transparent hover:text-gray-800"
                          }`}
                      >
                        SiA Practices
                      </button>
                      <button
                        onClick={() => setCourseSubTab("scriptures")}
                        className={`pb-2.5 sm:pb-3 text-xs sm:text-sm whitespace-nowrap font-bold uppercase tracking-wider transition-colors border-b-2 ${courseSubTab === "scriptures" ? "text-[#600694] border-[#600694]" : "text-gray-500 border-transparent hover:text-gray-800"
                          }`}
                      >
                        Scriptures
                      </button>
                    </div>

                    {/* Passes the specific sub-category to your existing CourseGrid */}
                    <CourseGrid courses={courses} category={courseSubTab} />
                  </div>
                )}

                {activeTab === "webinars" && (
                  <WebinarGrid webinars={webinars} setWebinars={setWebinars} loading={loadingWebinars} subscription={subscription} setSubscription={setSubscription} />
                )}

              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </AnimatedPage>
  );
}