import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS, fileToDataUrl, makeFallbackImage } from "./adminUtils";
import { loadManagedCourses, saveManagedCourses, type ManagedCourse, type CourseLesson } from "@/utils/contentStore";

type CourseFormState = {
  title: string; 
  category: "Practices" | "Scriptures"; 
  priceINR: string; 
  priceUSD: string; 
  duration: string;
  lessonItems: CourseLesson[]; 
  rating: number; 
  description: string;
};

const DEFAULT_FORM: CourseFormState = {
  title: "", 
  category: "Practices", 
  priceINR: "", 
  priceUSD: "", 
  duration: "",
  lessonItems: [{ title: "", videoDataUrl: "", videoName: "" }], // These map to CourseVideo
  rating: 4.8, 
  description: "",
};

export function CoursesTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [courses, setCourses] = useState<ManagedCourse[]>([]);
  const [form, setForm] = useState<CourseFormState>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { setCourses(loadManagedCourses()); }, []);

  const addLesson = () => {
    setForm(prev => ({ 
        ...prev, 
        lessonItems: [...prev.lessonItems, { title: "", videoDataUrl: "", videoName: "" }] 
    }));
  };

  const removeLesson = (index: number) => {
    setForm(prev => ({ 
        ...prev, 
        lessonItems: prev.lessonItems.filter((_, i) => i !== index) 
    }));
  };

  const updateLesson = (index: number, field: keyof CourseLesson, value: string) => {
    setForm(prev => ({
      ...prev,
      lessonItems: prev.lessonItems.map((l, i) => i === index ? { ...l, [field]: value } : l)
    }));
  };

  const resetEditor = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
  };

  const editCourse = (course: ManagedCourse) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      category: course.category,
      priceINR: course.priceINR?.toString() || "0",
      priceUSD: course.priceUSD?.toString() || "0",
      duration: course.duration,
      lessonItems: course.lessonItems && course.lessonItems.length > 0 
        ? course.lessonItems 
        : [{ title: "Session 1", videoDataUrl: "", videoName: "" }],
      rating: course.rating,
      description: course.description
    });
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter((item) => item.id !== id);
    setCourses(updated);
    saveManagedCourses(updated);
    if (editingId === id) resetEditor();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const imageDataUrl = await fileToDataUrl((formData.get("image") as File) || null);
    
    // This structure matches your Prisma model relationships
    const nextCourse: ManagedCourse = {
      id: editingId ?? crypto.randomUUID(),
      title: form.title,
      category: form.category,
      description: form.description,
      duration: form.duration,
      lessons: form.lessonItems.length,
      lessonTitles: form.lessonItems.map(l => l.title),
      lessonItems: form.lessonItems, // These will be used to create CourseVideo records
      rating: form.rating,
      priceINR: Number(form.priceINR),
      priceUSD: Number(form.priceUSD),
      imageDataUrl: imageDataUrl
    };

    const updated = editingId
      ? courses.map((item) => item.id === editingId ? { ...item, ...nextCourse, imageDataUrl: imageDataUrl || item.imageDataUrl } : item)
      : [...courses, nextCourse];

    setCourses(updated);
    saveManagedCourses(updated);
    resetEditor();
    handlePostSave();
  };

  return (
    <article className="sia-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold text-[#600694] mb-6">
        {editingId ? "Edit Course" : "Add Course"}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AdminFormField label="Course Title">
            <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className={ADMIN_INPUT_CLASS} placeholder="Course title" />
          </AdminFormField>
          
          <AdminFormField label="Category">
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value as any}))} className={ADMIN_INPUT_CLASS}>
              <option>Practices</option>
              <option>Scriptures</option>
            </select>
          </AdminFormField>

          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Price (INR)">
              <input type="number" min="0" required value={form.priceINR} onChange={e => setForm(p => ({...p, priceINR: e.target.value}))} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
            <AdminFormField label="Price (USD)">
              <input type="number" min="0" required value={form.priceUSD} onChange={e => setForm(p => ({...p, priceUSD: e.target.value}))} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
          </div>
        </div>

        <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground block mb-4">Course Videos</span>
          {form.lessonItems.map((lesson, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 mb-4 relative">
              <p className="text-xs font-bold text-[#600694] mb-2">VIDEO {idx + 1}</p>
              <button type="button" onClick={() => removeLesson(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
              <input 
                placeholder="Video Title" 
                className={ADMIN_INPUT_CLASS + " mb-3 h-10"} 
                value={lesson.title}
                onChange={e => updateLesson(idx, 'title', e.target.value)}
              />
              <div className="flex items-center gap-3">
                <input type="file" id={`vid-${idx}`} className="hidden" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const url = await fileToDataUrl(file);
                        updateLesson(idx, 'videoDataUrl', url);
                        updateLesson(idx, 'videoName', file.name);
                    }
                }} />
                <label htmlFor={`vid-${idx}`} className="cursor-pointer text-xs font-bold text-[#600694] border border-[#600694]/20 px-3 py-2 rounded-full">
                  Select Video File
                </label>
                <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{lesson.videoName || "No file"}</span>
              </div>
            </div>
          ))}
          <button type="button" onClick={addLesson} className="flex items-center text-sm font-bold text-[#600694] gap-2">
            <PlusCircle size={18} /> Add Another Video
          </button>
        </div>

        <AdminFormField label="Description" className="md:col-span-2">
          <textarea required value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={ADMIN_TEXTAREA_CLASS} />
        </AdminFormField>

        <div className="md:col-span-2 flex justify-end gap-3">
          {editingId && (
            <button type="button" onClick={resetEditor} className="px-6 py-3 rounded-full font-bold text-[#600694] border border-[#600694]/30 hover:bg-gray-50 transition-all">
              CANCEL EDIT
            </button>
          )}
          <button type="submit" className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a0473] transition-all">
            {editingId ? "UPDATE COURSE" : "SAVE COURSE"}
          </button>
        </div>
      </form>

      {courses.length > 0 && (
        <div className="mt-10 space-y-4 border-t border-gray-100 pt-6">
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">Managed Courses</p>
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={course.imageDataUrl || makeFallbackImage("Course")} alt={course.title} className="h-16 w-24 rounded-lg border border-border object-cover" />
                <div>
                  <p className="text-sm font-bold text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">INR: ₹{course.priceINR} | USD: ${course.priceUSD}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-primary hover:bg-primary/10 rounded-full" onClick={() => editCourse(course)}><Pencil size={18} /></button>
                <button type="button" className="p-2 text-red-500 hover:bg-red-50 rounded-full" onClick={() => deleteCourse(course.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}