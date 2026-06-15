import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, GraduationCap, BookOpen, Video, Flower2, Trophy } from "lucide-react";

import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api"; 

// 🚨 Import your new split components
import { Tab, EnrolledCourse } from "@/components/my-learning/types";
import { cn } from "@/components/my-learning/utils";
import { StudentDashboardPanel } from "@/components/my-learning/StudentDashboardPanel";
import { CourseGrid } from "@/components/my-learning/CourseGrid";
import { WebinarGrid } from "@/components/my-learning/WebinarGrid";

export default function MyLearningPage() {
  const { dbUser, loading } = useAuth(); 
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
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

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "practices", label: "My Practices", icon: GraduationCap },
    { id: "scriptures", label: "My Scriptures", icon: BookOpen },
    { id: "webinars", label: "Webinars", icon: Video },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50/50 pt-20 pb-20">
        
        {/* Header Section */}
        <div className="border-b border-[#600694]/10 bg-white">
          <div className="sia-container py-8 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#600694]/70 flex items-center gap-2">
                <Flower2 className="h-4 w-4" /> Your Sanctuary
              </p>
              <h1 className="font-display text-4xl text-[#600694] mt-2">My Learning</h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back to your journey, <span className="font-semibold text-[#600694]">{dbUser.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 border border-[#600694]/10 px-6 py-4 rounded-3xl shadow-sm">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Enrolled</p>
                <p className="font-display text-2xl text-[#600694] leading-none mt-1">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="sia-container py-10 grid gap-8 lg:grid-cols-[240px_1fr]">
          
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all",
                      active ? "bg-[#600694] text-white shadow-md" : "text-gray-600 hover:bg-[#600694]/10 hover:text-[#600694]"
                    )}
                  >
                    <Icon className="h-5 w-5" /> {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                {activeTab === "dashboard" && (
                  <StudentDashboardPanel courses={courses} webinars={webinars} subscription={subscription} onChangeTab={setActiveTab} />
                )}
                
                {(activeTab === "practices" || activeTab === "scriptures") && (
                  <CourseGrid courses={courses} category={activeTab} />
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