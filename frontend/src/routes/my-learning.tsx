import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, Clock, Trophy, BookOpen, User,
  LayoutDashboard, GraduationCap, CalendarDays, FileText, TrendingUp, ArrowRight, MapPin
} from "lucide-react";
import { Lotus } from "@/components/decorative";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth"; 
import { useEvents, useBlogs } from "@/lib/admin-store"; 

export const Route = createFileRoute("/my-learning")({
  head: () => ({
    meta: [
      { title: "My Learning · SIA" },
      { name: "description", content: "Access your enrolled courses, retreats, and spiritual practices." },
    ],
  }),
  component: MyLearningPage,
});

type Tab = "dashboard" | "practices" | "scriptures";

type EnrolledCourse = {
  id: string;
  title: string;
  type: string;
  category?: "practices" | "scriptures"; 
  image: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
};

function MyLearningPage() {
  const { user, hydrated } = useAuth(); 
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  
  const allEvents = useEvents();
  const allBlogs = useBlogs();

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const savedCourses = localStorage.getItem("sia_enrolled_courses");
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses));
      }
    }
  }, [user]);

  if (!hydrated) return null; 

  if (!user) {
    return (
      <section className="min-h-screen bg-[var(--color-cream)] pt-32 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-3xl p-12 sm:p-16 shadow-card max-w-lg mx-4">
          <Lotus className="h-12 w-12 text-[var(--color-gold)] mb-6" />
          <h2 className="font-serif text-3xl text-[#600694]">Your Sanctuary Awaits</h2>
          <p className="mt-4 text-[var(--color-text-mid)] leading-relaxed">
            Please sign in to access your enrolled courses, retreats, and spiritual practices.
          </p>
          <Link 
            to="/login" 
            search={{ redirect: "/my-learning" }} 
            className="mt-8 flex items-center gap-2 rounded-full bg-[#600694] px-8 py-3.5 btn-label text-white hover:bg-[#600694]/90 transition-colors"
          >
            <User className="h-4 w-4" /> Sign In to Continue
          </Link>
        </div>
      </section>
    );
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "practices", label: "My Practices", icon: GraduationCap },
    { id: "scriptures", label: "My Scriptures", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-20">
      
      <div className="border-b border-[#600694]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <p className="btn-label text-[var(--color-gold-deep)] flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Your Sanctuary
            </p>
            <h1 className="font-serif text-3xl text-[#600694] mt-1">My Learning</h1>
            <p className="mt-1 text-sm text-[var(--color-text-mid)]">
              Welcome back to your journey, <span className="font-semibold text-[#600694]">{user.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--color-cream)]/50 border border-[#600694]/10 px-5 py-3 rounded-2xl shadow-sm">
            <Trophy className="h-5 w-5 text-[var(--color-gold)]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-mid)] font-semibold">Total Enrolled</p>
              <p className="font-serif text-xl text-[#600694] leading-none mt-1">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    active ? "bg-[#600694] text-white shadow-card" : "text-[var(--color-text-dark)] hover:bg-[#600694]/10",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {activeTab === "dashboard" && (
                <StudentDashboardPanel courses={courses} events={allEvents} blogs={allBlogs} onChangeTab={setActiveTab} />
              )}
              {(activeTab === "practices" || activeTab === "scriptures") && (
                <CourseGrid courses={courses} category={activeTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

/* ================== SHARED CALENDAR COMPONENT WITH HOVER DETAILS ================== */
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

  // Modified to pull the full event objects for a specific day
  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    return events.filter(e => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year && !e.past;
    });
  };

  return (
    <div className="bg-[var(--color-cream)]/40 p-5 rounded-2xl border border-[#600694]/10 w-full mt-4">
      <div className="text-center font-serif text-lg text-[#600694] mb-4">{monthName} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--color-text-mid)] mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d, i) => {
          const dayEvents = getEventsForDay(d);
          const isEvent = dayEvents.length > 0;
          return (
            <div key={i} className="relative group flex justify-center">
              <div
                className={cn(
                  "h-8 w-8 flex items-center justify-center rounded-full transition-all",
                  isEvent ? "bg-[#600694] text-white shadow-md font-bold cursor-help" : "text-[var(--color-text-dark)]",
                  isEvent && animated ? "animate-pulse ring-2 ring-[#600694]/50" : ""
                )}
              >
                {d || ""}
              </div>

              {/* Hover Popover containing event details */}
              {isEvent && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#600694]/10 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-[#600694]/10"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    {dayEvents.map((ev, idx) => (
                      <div key={idx} className={cn("flex flex-col gap-1", idx > 0 ? "pt-3 border-t border-[#600694]/10" : "")}>
                        <span className="text-xs font-bold text-[#600694] leading-tight">{ev.title}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-gold-deep)] font-bold">{ev.type}</span>
                        
                        <div className="mt-1 space-y-1">
                          <span className="text-[10px] text-[var(--color-text-dark)] flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-[#600694]" /> {ev.time}
                          </span>
                          {ev.location && (
                            <span className="text-[10px] text-[var(--color-text-dark)] flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-[#600694]" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StudentDashboardPanel({ courses, events, blogs, onChangeTab }: { courses: EnrolledCourse[], events: any[], blogs: any[], onChangeTab: (tab: Tab) => void }) {
  
  const practicesCount = courses.filter(c => {
    const searchString = `${c.title} ${c.type} ${c.category || ""}`.toLowerCase();
    return !(searchString.includes("scripture") || searchString.includes("vedic") || searchString.includes("gita") || searchString.includes("upanishad") || searchString.includes("sutra") || searchString.includes("veda"));
  }).length;

  const scripturesCount = courses.length - practicesCount;
  
  const upcomingEvents = events.filter((e) => !e.past);

  const stats = [
    { label: "My Practices", value: practicesCount, icon: GraduationCap, bg: "bg-[#600694]", action: () => onChangeTab("practices") },
    { label: "My Scriptures", value: scripturesCount, icon: BookOpen, bg: "bg-[var(--color-gold-deep)]", action: () => onChangeTab("scriptures") },
  ];

  return (
    <div className="space-y-8">
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} onClick={s.action} className={cn("rounded-2xl bg-white p-5 shadow-card transition-all", s.action ? "cursor-pointer hover:shadow-card-lifted hover:-translate-y-1" : "")}>
              <div className={cn("inline-grid h-12 w-12 place-items-center rounded-xl text-white", s.bg)}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-[var(--color-text-mid)]">{s.label}</p>
              <p className="mt-1 font-serif text-3xl text-[#600694]">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        
        <div className="rounded-2xl bg-white p-6 shadow-card h-fit">
          <h3 className="font-serif text-xl text-[#600694] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-gold-deep)]" /> Your Recent Learning
          </h3>
          
          <ul className="mt-5 space-y-4 text-sm divide-y divide-[#600694]/5">
            {courses.slice(0, 5).map((course, i) => (
              <li key={i} className="flex items-center gap-4 pt-4 first:pt-0">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-[#600694]/10 text-[#600694]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text-dark)]">Continued <span className="text-[#600694]">"{course.title}"</span></p>
                  <p className="text-xs text-[var(--color-text-mid)] flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> Last accessed: {course.lastAccessed}
                  </p>
                </div>
                <Link to="/resume-journey/$courseId" params={{ courseId: course.id }} className="flex-none p-2 rounded-full bg-[#600694]/10 text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
                  <PlayCircle className="h-5 w-5" />
                </Link>
              </li>
            ))}

            {courses.length === 0 && (
               <div className="text-center p-6 border-2 border-dashed border-[#600694]/10 rounded-xl">
                 <p className="text-[var(--color-text-mid)]">You haven't started any courses yet.</p>
               </div>
            )}
          </ul>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-card h-fit flex flex-col">
            <h3 className="font-serif text-xl text-[#600694] flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[var(--color-gold-deep)]" /> Live Events
            </h3>
            
            <MiniCalendar events={upcomingEvents} animated={true} />
            
            
          </div>
        </aside>

      </div>
    </div>
  );
}

function CourseGrid({ courses, category }: { courses: EnrolledCourse[], category: "practices" | "scriptures" }) {
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const searchString = `${c.title} ${c.type} ${c.category || ""}`.toLowerCase();
      const isScripture = searchString.includes("scripture") || searchString.includes("vedic") || searchString.includes("gita") || searchString.includes("upanishad") || searchString.includes("sutra") || searchString.includes("veda");
      const actualCategory = isScripture ? "scriptures" : "practices";
      return actualCategory === category;
    });
  }, [courses, category]);

  if (filteredCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white/50 backdrop-blur-sm rounded-3xl p-16 shadow-sm border border-[#600694]/5 mt-6">
        <Lotus className="h-12 w-12 text-[#600694]/20 mb-4" />
        <h3 className="font-serif text-2xl text-[#600694]">No {category} enrolled yet</h3>
        <p className="mt-2 text-[var(--color-text-mid)]">Explore our offerings to add {category === "practices" ? "a new practice" : "sacred wisdom"} to your library.</p>
        <Link to="/courses" search={{ cat: category as any }} className="mt-6 rounded-full border-2 border-[#600694] px-6 py-2.5 btn-label text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
          Browse {category}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {filteredCourses.map((course, i) => (
        <motion.article layout key={course.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.05 }} className="group flex flex-col rounded-3xl bg-white shadow-card overflow-hidden border border-transparent hover:border-[#600694]/20 transition-all duration-300 hover:shadow-card-lifted">
          {category === "scriptures" && <span className="h-1.5 w-full bg-[var(--color-cream)]" />}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-[#600694] transform scale-90 group-hover:scale-100 transition-transform"><PlayCircle className="h-8 w-8 ml-0.5" /></div>
            </div>
            <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#600694] shadow-sm">{course.type}</span>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-serif text-lg text-[#600694] leading-snug line-clamp-2">{course.title}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-mid)]"><Clock className="h-3.5 w-3.5" /><span>Last accessed: {course.lastAccessed}</span></div>
            <div className="mt-6 pt-6 border-t border-[#600694]/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#600694]">{course.progress}% Completed</span>
                <span className="text-[10px] text-[var(--color-text-mid)]">{course.completedLessons} / {course.totalLessons} Sessions</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--color-cream)] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-[var(--color-gold)] rounded-full" /></div>
            </div>
            <Link to="/resume-journey/$courseId" params={{ courseId: course.id }} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#600694] px-5 py-2 btn-label text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
              Resume Journey
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}