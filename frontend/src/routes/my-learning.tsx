import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, Clock, Trophy, BookOpen, User,
  LayoutDashboard, GraduationCap, CalendarDays, TrendingUp, Flower2, MapPin
} from "lucide-react";

import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import type { CartItem } from "@/components/common/CartContext";

// Simple class merger utility
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

type Tab = "dashboard" | "practices" | "scriptures";

// Extend CartItem to include learning-specific data
interface EnrolledCourse extends CartItem {
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  category: "practices" | "scriptures";
}

export default function MyLearningPage() {
  const { dbUser, loading } = useAuth(); 
  const navigate = useNavigate();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

 // Authentication Protection & Data Loading
  useEffect(() => {
    if (!loading && !dbUser) {
      navigate("/login?redirectTo=/my-learning");
    } else if (dbUser) {
      // We use 'any[]' here temporarily to safely read the newly added category field
      const savedPurchases = JSON.parse(
        window.localStorage.getItem(`sia-purchased-${dbUser.id}`) || "[]"
      ) as any[]; 

      const formattedCourses: EnrolledCourse[] = savedPurchases.map(item => {
        // 1. Safely grab the saved category and title
        const itemCategory = item.category?.toLowerCase() || "";
        const itemTitle = item.title?.toLowerCase() || "";
        
        // 2. Check the explicitly saved category first! 
        // (Fallback to title keywords just in case of older cart items)
        const isScripture = 
          itemCategory === "scriptures" || 
          itemCategory === "scripture" ||
          itemTitle.includes("scripture") || 
          itemTitle.includes("vedic") || 
          itemTitle.includes("gita") || 
          itemTitle.includes("upanishad");
        
        return {
          ...item,
          progress: 0,
          totalLessons: 12,
          completedLessons: 0,
          lastAccessed: "Just enrolled",
          // 3. Assign the exact category for the dashboard tabs
          category: isScripture ? "scriptures" : "practices"
        };
      });

      setCourses(formattedCourses);
    }
  }, [dbUser, loading, navigate]);

  if (loading || !dbUser) return null; 

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "practices", label: "My Practices", icon: GraduationCap },
    { id: "scriptures", label: "My Scriptures", icon: BookOpen },
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
          
          {/* Sidebar Navigation */}
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

          {/* Tab Content Area */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {activeTab === "dashboard" && (
                  <StudentDashboardPanel courses={courses} onChangeTab={setActiveTab} />
                )}
                {(activeTab === "practices" || activeTab === "scriptures") && (
                  <CourseGrid courses={courses} category={activeTab} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </AnimatedPage>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StudentDashboardPanel({ courses, onChangeTab }: { courses: EnrolledCourse[], onChangeTab: (tab: Tab) => void }) {
  const practicesCount = courses.filter(c => c.category === "practices").length;
  const scripturesCount = courses.filter(c => c.category === "scriptures").length;

  const stats = [
    { label: "My Practices", value: practicesCount, icon: GraduationCap, bg: "bg-[#600694]", action: () => onChangeTab("practices") },
    { label: "My Scriptures", value: scripturesCount, icon: BookOpen, bg: "bg-purple-800", action: () => onChangeTab("scriptures") },
  ];

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
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
        {/* Recent Learning List */}
        <div className="rounded-3xl bg-white p-8 border border-gray-100 shadow-sm h-fit">
          <h3 className="font-display text-2xl text-[#600694] flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-yellow-500" /> Recent Learning
          </h3>
          
          <ul className="mt-6 space-y-4 divide-y divide-gray-100">
            {courses.slice(0, 5).map((course) => (
              <li key={course.id} className="flex items-center gap-4 pt-4 first:pt-0">
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#600694]/10 text-[#600694]">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-foreground">Continued <span className="text-[#600694]">"{course.title}"</span></p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Last accessed: {course.lastAccessed}
                  </p>
                </div>
                <Link to={`/courses/${course.id}`} className="flex-none p-3 rounded-full bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
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

        {/* Live Events Sidebar */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm h-fit flex flex-col">
            <h3 className="font-display text-xl text-[#600694] flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-yellow-500" /> Live Events
            </h3>
            <MiniCalendar events={[]} animated={true} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function CourseGrid({ courses, category }: { courses: EnrolledCourse[], category: "practices" | "scriptures" }) {
  const filteredCourses = courses.filter((c) => c.category === category);

  if (filteredCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-3xl p-16 border border-gray-100 shadow-sm mt-2">
        <Flower2 className="h-16 w-16 text-[#600694]/20 mb-6" />
        <h3 className="font-display text-3xl text-[#600694]">No {category} enrolled yet</h3>
        <p className="mt-3 text-muted-foreground max-w-md">Explore our offerings to add {category === "practices" ? "a new practice" : "sacred wisdom"} to your library.</p>
        <Link to="/courses" className="mt-8 rounded-full border-2 border-[#600694] px-8 py-3 text-sm font-bold text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
          Browse {category}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 mt-2">
      {filteredCourses.map((course, i) => (
        <motion.article 
          layout 
          key={course.id} 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4, delay: i * 0.05 }} 
          className="group flex flex-col rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:border-[#600694]/30 transition-all duration-300 hover:shadow-md"
        >
          {category === "scriptures" && <span className="h-2 w-full bg-yellow-500/20" />}
          
          <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="flex h-full items-center justify-center"><BookOpen className="h-10 w-10 text-gray-300"/></div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl text-[#600694] transform scale-90 group-hover:scale-100 transition-transform">
                <PlayCircle className="h-10 w-10 ml-1" />
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-xl text-[#600694] leading-snug line-clamp-2">{course.title}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span>Last accessed: {course.lastAccessed}</span></div>
            
            <div className="mt-auto pt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#600694]">{course.progress}% Completed</span>
                <span className="text-[10px] text-muted-foreground">{course.completedLessons} / {course.totalLessons} Sessions</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-yellow-500 rounded-full" />
              </div>
            </div>
            
            <Link to={`/courses/${course.id}`} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#600694] px-5 py-2.5 text-sm font-bold text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
              Resume Journey
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

// ============================================================================
// SHARED CALENDAR COMPONENT
// ============================================================================
function MiniCalendar({ events, animated = false }: { events: any[], animated?: boolean }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = today.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 w-full mt-4">
      <div className="text-center font-display text-lg text-[#600694] mb-4">{monthName} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm font-medium">
        {days.map((d, i) => (
          <div key={i} className="flex justify-center">
            <div className={cn("h-8 w-8 flex items-center justify-center rounded-full text-gray-600", d === today.getDate() && "bg-[#600694]/10 text-[#600694] font-bold")}>
              {d || ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}