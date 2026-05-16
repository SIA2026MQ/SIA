import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, CalendarDays, FileText, Tag, Plus, Pencil, Trash2, X, RotateCcw, Sparkles, TrendingUp, Users, ShoppingBag, Search, UploadCloud, Loader2, Film
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCourses, useEvents, useBlogs, useCoupons, adminApi, formatPrice, priceToNumber, type Coupon } from "@/lib/admin-store";
import type { SIACourse, SIAEvent, BlogPost } from "@/lib/sia-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · SIA" },
      { name: "description", content: "Manage SIA courses, events, blog posts and coupons." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "courses" | "events" | "blogs" | "coupons";

function AdminPage() {
  const { user, isAdmin, hydrated } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !isAdmin) {
      navigate({ to: "/login" });
    }
  }, [hydrated, isAdmin, navigate]);

  if (!hydrated || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-cream)]">
        <p className="text-[var(--color-text-mid)]">Verifying access...</p>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "blogs", label: "Blog Posts", icon: FileText },
    { id: "coupons", label: "Coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)] pt-20">
      <div className="border-b border-[#600694]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:px-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <p className="btn-label text-[var(--color-gold-deep)]">Admin</p>
            <h1 className="font-serif text-3xl text-[#600694]">Control Centre</h1>
            <p className="mt-1 text-sm text-[var(--color-text-mid)]">
              Welcome back, <span className="font-semibold text-[#600694]">{user?.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { if (confirm("Reset all content to original seed data?")) adminApi.resetAll(); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#600694]/20 bg-white px-4 py-2 text-xs font-semibold text-[#600694] hover:bg-[#600694]/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Data
            </button>
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-[#600694] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#600694]/90 transition-colors">
              View Site →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
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
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {tab === "dashboard" && <DashboardPanel onNavigate={setTab} />}
              {tab === "courses" && <CoursesPanel />}
              {tab === "events" && <EventsPanel />}
              {tab === "blogs" && <BlogsPanel />}
              {tab === "coupons" && <CouponsPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ================== SHARED CALENDAR COMPONENT ================== */
function MiniCalendar({ events, onDateClick, animated = false }: { events: any[], onDateClick?: (d: string) => void, animated?: boolean }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = today.toLocaleString('default', { month: 'long' });

  const hasEvent = (day: number | null) => {
    if (!day) return false;
    return events.some(e => {
      if (!e.date) return false;
      const eDate = new Date(e.date);
      return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year && !e.past;
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#600694]/10 w-full">
      <div className="text-center font-serif text-lg text-[#600694] mb-4">{monthName} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[var(--color-text-mid)] mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d, i) => {
          const isEvent = hasEvent(d);
          return (
            <div
              key={i}
              onClick={() => d && onDateClick && onDateClick(`${monthName} ${d}, ${year}`)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full mx-auto transition-all",
                !d ? "" : onDateClick ? "cursor-pointer hover:bg-[#600694]/10" : "",
                isEvent ? "bg-[#600694] text-white shadow-md font-bold" : "text-[var(--color-text-dark)]",
                isEvent && animated ? "animate-pulse ring-2 ring-[#600694]/50" : ""
              )}
            >
              {d || ""}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ================== DASHBOARD ================== */
function DashboardPanel({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const courses = useCourses();
  const events = useEvents();
  const blogs = useBlogs();
  const coupons = useCoupons();

  const stats = [
    { label: "Courses", value: courses.length, icon: GraduationCap, bg: "bg-[#600694]", action: () => onNavigate("courses") },
    { label: "Events", value: events.length, icon: CalendarDays, bg: "bg-[var(--color-gold-deep)]", action: () => onNavigate("events") },
    { label: "Blog Posts", value: blogs.length, icon: FileText, bg: "bg-[#8204cb]", action: () => onNavigate("blogs") },
    { label: "Coupons", value: coupons.filter((c) => c.active).length, icon: Tag, bg: "bg-[var(--color-gold)]", action: () => onNavigate("coupons") },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} onClick={s.action} className="rounded-2xl bg-white p-5 shadow-card cursor-pointer hover:-translate-y-1 transition-transform">
              <div className={cn("inline-grid h-12 w-12 place-items-center rounded-xl text-white", s.bg)}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-[var(--color-text-mid)]">{s.label}</p>
              <p className="mt-1 font-serif text-3xl text-[#600694]">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="font-serif text-xl text-[#600694] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--color-gold-deep)]" /> Recent activity
          </h3>
          <ul className="mt-5 space-y-4 text-sm">
            {[
              { i: ShoppingBag, txt: `${courses.length} courses live across practices & scriptures` },
              { i: Users, txt: `${events.filter((e) => !e.past).length} upcoming events scheduled` },
              { i: FileText, txt: `${blogs.length} reflections published in the journal` },
              { i: Tag, txt: `${coupons.filter((c) => c.active).length} of ${coupons.length} coupons currently active` },
            ].map((row, i) => {
              const Icon = row.i;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#600694]/10 text-[#600694]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[var(--color-text-dark)]">{row.txt}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#600694] p-6 text-white shadow-card-lifted">
          <Sparkles className="h-7 w-7 text-[var(--color-gold)]" />
          <h3 className="mt-4 font-serif text-2xl">Quick actions</h3>
          <p className="mt-2 text-sm opacity-90">Add new content to keep the sangha nourished.</p>
          <div className="mt-6 grid gap-2 text-sm font-semibold">
            <span className="opacity-80">Use the tabs on the left to add or edit:</span>
            <span>· New courses</span>
            <span>· Webinars & retreats</span>
            <span>· Blog posts</span>
            <span>· Discount coupons</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== COURSES ================== */
function CoursesPanel() {
  const courses = useCourses();
  const [editing, setEditing] = useState<SIACourse | null>(null);
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search],
  );

  return (
    <PanelShell
      title="Manage Courses"
      onAdd={() =>
        setEditing({
          id: `c-${Date.now()}`, title: "", category: "practices", tag: "", description: "", duration: "",
          lessons: 0, price: "Free", rating: 5, image: "", 
          // @ts-ignore
          curriculum: []
        })
      }
      search={search}
      setSearch={setSearch}
    >
      <ItemTable
        items={filtered}
        getKey={(c) => c.id}
        columns={[
          { label: "Course", render: (c) => <CellWithImage image={c.image} title={c.title} sub={c.category} /> },
          { label: "Tag", render: (c) => <span className="text-[var(--color-text-mid)]">{c.tag}</span> },
          { label: "Price", render: (c) => <span className="font-semibold text-[#600694]">{c.price}</span> },
        ]}
        onEdit={(c) => setEditing(c)}
        onDelete={(c) => { if (confirm(`Delete "${c.title}"?`)) adminApi.deleteCourse(c.id); }}
      />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title={editing?.title || "New course"}>
        {editing && <CourseForm initial={editing} onSave={(c) => { adminApi.saveCourse(c); setEditing(null); }} />}
      </FormDrawer>
    </PanelShell>
  );
}

type CurriculumItem = { id: string; title: string; videoUrl?: string; file?: File | null; };

function CourseForm({ initial, onSave }: { initial: SIACourse; onSave: (c: SIACourse) => void }) {
  const [c, setC] = useState(initial);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>((initial as any).curriculum || []);

  const handleAddSession = () => setCurriculum([...curriculum, { id: `vid-${Date.now()}`, title: "", file: null }]);
  const handleRemoveSession = (idToRemove: string) => setCurriculum(curriculum.filter(item => item.id !== idToRemove));
  const updateSession = (id: string, updates: Partial<CurriculumItem>) => setCurriculum(curriculum.map(item => item.id === id ? { ...item, ...updates } : item));

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const processedCurriculum: any[] = [];

    for (let i = 0; i < curriculum.length; i++) {
      const session = curriculum[i];
      setUploadProgress(`Processing ${i + 1} of ${curriculum.length}...`);
      if (session.file) {
        const formData = new FormData();
        formData.append("file", session.file);
        try {
          const response = await fetch("http://localhost:8000/upload", { method: "POST", body: formData });
          if (!response.ok) throw new Error(`Video upload failed for: ${session.title}`);
          const data = await response.json();
          processedCurriculum.push({ id: session.id, title: session.title, videoUrl: data.video.url });
        } catch (error) {
          alert(`Failed to upload "${session.title}". Make sure the Node server is running on port 8000.`);
          setIsUploading(false);
          return;
        }
      } else {
        processedCurriculum.push({ id: session.id, title: session.title, videoUrl: session.videoUrl || "" });
      }
    }

    const finalCourseData = { ...c, lessons: processedCurriculum.length, curriculum: processedCurriculum as any };
    onSave(finalCourseData);
    setIsUploading(false);
    setUploadProgress("");
  };

  return (
    <form onSubmit={handleUploadAndSave} className="space-y-6">
      <div className="space-y-5">
        <FormField label="Course Title" value={c.title} onChange={(v) => setC({ ...c, title: v })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Category" value={c.category} onChange={(v) => setC({ ...c, category: v as SIACourse["category"] })} options={[{ value: "practices", label: "Practices" }, { value: "scriptures", label: "Scriptures" }]} />
          <FormField label="Tag" value={c.tag} onChange={(v) => setC({ ...c, tag: v })} placeholder="e.g. Kundalini" />
        </div>
        <FormTextarea label="Description" value={c.description} onChange={(v) => setC({ ...c, description: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Duration" value={c.duration} onChange={(v) => setC({ ...c, duration: v })} placeholder="8 weeks" />
          <FormField label="Price" value={c.price} onChange={(v) => setC({ ...c, price: v })} placeholder="$99 or Free" />
        </div>
        <FormField label="Cover Image URL" value={c.image} onChange={(v) => setC({ ...c, image: v })} placeholder="https://..." />
      </div>

      <div className="mt-8 rounded-2xl border border-[#600694]/15 bg-[var(--color-cream)]/30 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-[#600694]/10 pb-3">
          <div>
            <h4 className="font-serif text-xl text-[#600694]">Course Curriculum</h4>
            <p className="text-xs text-[var(--color-text-mid)] mt-1">Add video sessions to this course.</p>
          </div>
          <button type="button" onClick={handleAddSession} className="flex items-center gap-1.5 rounded-full bg-[#600694] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#600694]/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Session
          </button>
        </div>
        
        <div className="space-y-4">
          {curriculum.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--color-text-mid)] border-2 border-dashed border-[#600694]/20 rounded-xl">
              No sessions added yet. Click "Add Session" to upload videos.
            </div>
          ) : (
            curriculum.map((session, index) => (
              <div key={session.id} className="relative bg-white rounded-xl border border-[#600694]/15 p-4 shadow-sm flex flex-col gap-3 group">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold-deep)]">Session {index + 1}</span>
                  <button type="button" onClick={() => handleRemoveSession(session.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
                <input type="text" placeholder="Session Title" value={session.title} onChange={(e) => updateSession(session.id, { title: e.target.value })} required className="w-full border-b border-[#600694]/15 pb-2 text-sm text-[#600694] font-medium focus:border-[#600694] focus:outline-none transition-colors" />
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#600694]/30 bg-[var(--color-cream)] px-3 py-3 text-xs text-[#600694] hover:bg-[#600694]/10 transition-colors">
                    <Film className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{session.file ? session.file.name : "Select Video File (.mp4)"}</span>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) updateSession(session.id, { file: e.target.files[0] }); }} />
                  </label>
                  {!session.file && session.videoUrl && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Video Saved</span>}
                  {!session.file && !session.videoUrl && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">Video Required</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button type="submit" disabled={isUploading} className="mt-6 flex w-full flex-col items-center justify-center gap-1 rounded-full bg-[#600694] px-6 py-4 btn-label text-white shadow-card hover:bg-[#600694]/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all">
        {isUploading ? (
          <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>{uploadProgress}</span></div>
        ) : (
          <div className="flex items-center gap-2"><UploadCloud className="h-5 w-5" /> <span>Upload Videos & Save Course</span></div>
        )}
      </button>
    </form>
  );
}

/* ================== EVENTS ================== */
function EventsPanel() {
  const events = useEvents();
  const [editing, setEditing] = useState<SIAEvent | null>(null);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase())), [events, search]);

  const handleDateClick = (dateString: string) => {
    setEditing({ id: `e-${Date.now()}`, title: "", type: "webinar", date: dateString, time: "", location: "Online", description: "", price: "FREE", image: "" });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <PanelShell title="Manage Events" onAdd={() => handleDateClick("")} search={search} setSearch={setSearch}>
        <ItemTable items={filtered} getKey={(e) => e.id} columns={[{ label: "Event", render: (e) => <CellWithImage image={e.image} title={e.title} sub={e.type} /> }, { label: "Date", render: (e) => <span className="text-[var(--color-text-mid)]">{e.date}</span> }, { label: "Price", render: (e) => <span className="font-semibold text-[#600694]">{e.price}</span> }]} onEdit={(e) => setEditing(e)} onDelete={(e) => { if (confirm(`Delete "${e.title}"?`)) adminApi.deleteEvent(e.id); }} />
      </PanelShell>
      
      {/* Calendar View for Admin */}
      <aside className="sticky top-24">
        <h3 className="font-serif text-xl text-[#600694] mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5" /> Schedule Event
        </h3>
        <p className="text-sm text-[var(--color-text-mid)] mb-4">Click any date to schedule a new gathering.</p>
        <MiniCalendar events={events} onDateClick={handleDateClick} animated={false} />
      </aside>

      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title={editing?.title || "New event"}>
        {editing && <EventForm initial={editing} onSave={(e) => { adminApi.saveEvent(e); setEditing(null); }} />}
      </FormDrawer>
    </div>
  );
}

function EventForm({ initial, onSave }: { initial: SIAEvent; onSave: (e: SIAEvent) => void }) {
  const [e, setE] = useState(initial);
  return (
    <FormBody onSubmit={(ev) => { ev.preventDefault(); onSave(e); }}>
      <FormField label="Title" value={e.title} onChange={(v) => setE({ ...e, title: v })} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect label="Type" value={e.type} onChange={(v) => setE({ ...e, type: v as SIAEvent["type"] })} options={[{ value: "satsang", label: "Satsang (Free)" }, { value: "webinar", label: "Webinar" }, { value: "retreat", label: "Retreat" }]} />
        <FormField label="Date" value={e.date} onChange={(v) => setE({ ...e, date: v })} placeholder="Apr 22, 2026" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Time" value={e.time} onChange={(v) => setE({ ...e, time: v })} placeholder="7:00 PM IST" />
        <FormField label="Location" value={e.location} onChange={(v) => setE({ ...e, location: v })} />
      </div>
      <FormTextarea label="Description" value={e.description} onChange={(v) => setE({ ...e, description: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Price" value={e.price} onChange={(v) => setE({ ...e, price: v })} placeholder="FREE or $24" />
        <FormField label="Image URL" value={e.image} onChange={(v) => setE({ ...e, image: v })} />
      </div>
      <label className="flex items-center gap-2 text-sm text-[var(--color-text-dark)]">
        <input type="checkbox" checked={!!e.past} onChange={(ev) => setE({ ...e, past: ev.target.checked })} className="h-4 w-4 accent-[#600694]" />
        Mark as past event (recording)
      </label>
    </FormBody>
  );
}

/* ================== BLOGS ================== */
function BlogsPanel() {
  const blogs = useBlogs();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => blogs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase())), [blogs, search]);

  return (
    <PanelShell title="Manage Blog Posts" onAdd={() => setEditing({ slug: `post-${Date.now()}`, title: "", category: "Spirituality", excerpt: "", body: "", author: "Jake Light", authorAvatar: "", date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }), readTime: "5 min read", image: "" })} search={search} setSearch={setSearch}>
      <ItemTable items={filtered} getKey={(b) => b.slug} columns={[{ label: "Post", render: (b) => <CellWithImage image={b.image} title={b.title} sub={b.category} /> }, { label: "Author", render: (b) => <span className="text-[var(--color-text-mid)]">{b.author}</span> }, { label: "Date", render: (b) => <span className="text-[var(--color-text-mid)] text-xs">{b.date}</span> }]} onEdit={(b) => setEditing(b)} onDelete={(b) => { if (confirm(`Delete "${b.title}"?`)) adminApi.deleteBlog(b.slug); }} />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title={editing?.title || "New post"}>
        {editing && <BlogForm initial={editing} onSave={(b) => { adminApi.saveBlog(b); setEditing(null); }} />}
      </FormDrawer>
    </PanelShell>
  );
}

function BlogForm({ initial, onSave }: { initial: BlogPost; onSave: (b: BlogPost) => void }) {
  const [b, setB] = useState(initial);
  return (
    <FormBody onSubmit={(e) => { e.preventDefault(); onSave(b); }}>
      <FormField label="Title" value={b.title} onChange={(v) => setB({ ...b, title: v })} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Slug" value={b.slug} onChange={(v) => setB({ ...b, slug: v.replace(/\s+/g, "-").toLowerCase() })} required />
        <FormSelect label="Category" value={b.category} onChange={(v) => setB({ ...b, category: v })} options={[{ value: "Spirituality", label: "Spirituality" }, { value: "Vedic Wisdom", label: "Vedic Wisdom" }]} />
      </div>
      <FormTextarea label="Excerpt" value={b.excerpt} onChange={(v) => setB({ ...b, excerpt: v })} />
      <FormTextarea label="Body (markdown)" value={b.body} onChange={(v) => setB({ ...b, body: v })} rows={10} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Author" value={b.author} onChange={(v) => setB({ ...b, author: v })} />
        <FormField label="Read time" value={b.readTime} onChange={(v) => setB({ ...b, readTime: v })} placeholder="6 min read" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date" value={b.date} onChange={(v) => setB({ ...b, date: v })} />
        <FormField label="Cover image URL" value={b.image} onChange={(v) => setB({ ...b, image: v })} />
      </div>
    </FormBody>
  );
}

/* ================== COUPONS ================== */
function CouponsPanel() {
  const coupons = useCoupons();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase())), [coupons, search]);

  return (
    <PanelShell title="Manage Coupons" onAdd={() => setEditing({ code: "", percent: 10, active: true, description: "" })} search={search} setSearch={setSearch}>
      <ItemTable items={filtered} getKey={(c) => c.code} columns={[{ label: "Code", render: (c) => <span className="font-mono font-bold uppercase tracking-wider text-[#600694]">{c.code}</span> }, { label: "Discount", render: (c) => <span className="rounded-full bg-[var(--color-gold)]/20 px-3 py-0.5 text-xs font-semibold text-[var(--color-text-dark)]">{c.percent}% off</span> }, { label: "Status", render: (c) => <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold", c.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>{c.active ? "Active" : "Inactive"}</span> }]} onEdit={(c) => setEditing({ ...c })} onDelete={(c) => { if (confirm(`Delete coupon "${c.code}"?`)) adminApi.deleteCoupon(c.code); }} />
      <FormDrawer open={!!editing} onClose={() => setEditing(null)} title={editing?.code || "New coupon"}>
        {editing && <CouponForm initial={editing} onSave={(c) => { adminApi.saveCoupon(c); setEditing(null); }} />}
      </FormDrawer>
    </PanelShell>
  );
}

function CouponForm({ initial, onSave }: { initial: Coupon; onSave: (c: Coupon) => void }) {
  const [c, setC] = useState(initial);
  return (
    <FormBody onSubmit={(e) => { e.preventDefault(); onSave({ ...c, code: c.code.trim().toUpperCase() }); }}>
      <FormField label="Code" value={c.code} onChange={(v) => setC({ ...c, code: v.toUpperCase() })} required placeholder="AWAKEN10" />
      <FormField label="Discount %" type="number" value={String(c.percent)} onChange={(v) => setC({ ...c, percent: Math.max(0, Math.min(100, Number(v) || 0)) })} />
      <FormField label="Description" value={c.description || ""} onChange={(v) => setC({ ...c, description: v })} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} className="h-4 w-4 accent-[#600694]" /> Active
      </label>
    </FormBody>
  );
}

/* ================== SHARED PRIMITIVES ================== */
function PanelShell({ title, onAdd, search, setSearch, children }: { title: string; onAdd: () => void; search: string; setSearch: (s: string) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden">
      <header className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-[#600694]/10 px-5 sm:px-6 py-5">
        <h2 className="font-serif text-2xl text-[#600694]">{title}</h2>
        <div className="flex gap-2">
          <div className="flex flex-1 sm:flex-none items-center gap-2 rounded-full border border-[#600694]/15 bg-[var(--color-cream)]/50 px-4 py-2 focus-within:border-[#600694] transition-colors">
            <Search className="h-4 w-4 text-[#600694]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="flex-1 sm:w-56 bg-transparent text-sm focus:outline-none" />
          </div>
          <button onClick={onAdd} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#600694] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-card hover:bg-[#600694]/90">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

function ItemTable<T>({ items, getKey, columns, onEdit, onDelete }: { items: T[]; getKey: (t: T) => string; columns: Array<{ label: string; render: (t: T) => React.ReactNode }>; onEdit: (t: T) => void; onDelete: (t: T) => void }) {
  if (items.length === 0) return <p className="px-6 py-16 text-center text-sm text-[var(--color-text-mid)]">No items yet.</p>;
  return (
    <div className="divide-y divide-[#600694]/10">
      {items.map((it) => (
        <div key={getKey(it)} className="flex flex-col gap-3 px-5 sm:px-6 py-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            {columns.map((col, i) => <div key={i} className={cn(i === 0 ? "flex-1 min-w-0" : "flex-none text-sm")}>{col.render(it)}</div>)}
          </div>
          <div className="flex gap-1 sm:ml-4">
            <button onClick={() => onEdit(it)} className="grid h-9 w-9 place-items-center rounded-lg text-[#600694] hover:bg-[#600694]/10" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => onDelete(it)} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CellWithImage({ image, title, sub }: { image: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-[#600694]/10">
        {image && <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--color-text-dark)]">{title || "Untitled"}</p>
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-mid)]">{sub}</p>
      </div>
    </div>
  );
}

function FormDrawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 32 }} className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-xl flex-col bg-[var(--color-cream)] shadow-2xl">
            <header className="flex items-center justify-between border-b border-[#600694]/10 bg-white px-6 py-5">
              <h3 className="font-serif text-xl text-[#600694] truncate pr-3">{title}</h3>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-[#600694] hover:bg-[#600694]/10"><X className="h-5 w-5" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function FormBody({ children, onSubmit }: { children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {children}
      <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#600694] px-6 py-3.5 btn-label text-white shadow-card hover:bg-[#600694]/90">Save changes</button>
    </form>
  );
}

function FormField({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-mid)]">{label}</span>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#600694]/15 bg-white px-4 py-2.5 text-sm text-[var(--color-text-dark)] focus:border-[#600694] focus:outline-none transition-colors" />
    </label>
  );
}

function FormTextarea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-mid)]">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#600694]/15 bg-white px-4 py-2.5 text-sm text-[var(--color-text-dark)] leading-relaxed focus:border-[#600694] focus:outline-none transition-colors" />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-mid)]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#600694]/15 bg-white px-4 py-2.5 text-sm text-[var(--color-text-dark)] focus:border-[#600694] focus:outline-none transition-colors">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}