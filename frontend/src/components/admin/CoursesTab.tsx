import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil, Image as ImageIcon, Loader2, CloudUpload } from "lucide-react";
import { AdminFormField, ADMIN_INPUT_CLASS, ADMIN_TEXTAREA_CLASS, makeFallbackImage } from "./adminUtils";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";

type CourseFormState = {
  title: string;
  category: "Practices" | "Scriptures";
  priceINR: string | number;
  priceUSD: string | number;
  duration: string;
  thumbnailUrl: string;
  thumbnailFile?: File;
  lessonItems: Array<{ id?: string, title: string; videoDataUrl: string; videoName: string; rawFile?: File }>;
  rating: number;
  description: string;
};

const DEFAULT_FORM: CourseFormState = {
  title: "",
  category: "Practices",
  priceINR: "",
  priceUSD: "",
  duration: "",
  thumbnailUrl: "",
  lessonItems: [{ title: "", videoDataUrl: "", videoName: "" }],
  rating: 4.8,
  description: "",
};

export function CoursesTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [form, setForm] = useState<CourseFormState>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🚨 State to hold real-time progress percentages (0 to 100)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [deletedVideoIds, setDeletedVideoIds] = useState<string[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await api.getAllCourses();
      setCourses(res.courses);
    } catch (error) {
      console.error("Failed to load courses from DB", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addLesson = () => setForm(prev => ({ ...prev, lessonItems: [...prev.lessonItems, { title: "", videoDataUrl: "", videoName: "" }] }));

  const removeLesson = (index: number) => {
    const lessonToRemove = form.lessonItems[index];
    if (lessonToRemove.id) {
      setDeletedVideoIds(prev => [...prev, lessonToRemove.id as string]);
    }
    setForm(prev => ({ ...prev, lessonItems: prev.lessonItems.filter((_, i) => i !== index) }));
  };

  const updateLesson = (index: number, field: string, value: any) => {
    setForm(prev => ({ ...prev, lessonItems: prev.lessonItems.map((l, i) => i === index ? { ...l, [field]: value } : l) }));
  };

  const resetEditor = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setImagePreview(null);
    setUploadProgress({});
    setDeletedVideoIds([]); 
  };

  const editCourse = (course: any) => {
    setEditingId(course.id);
    setDeletedVideoIds([]); 

    const mappedLessons = course.videos && course.videos.length > 0
      ? course.videos.map((vid: any) => ({ id: vid.id, title: vid.title, videoDataUrl: vid.videoUrlR2, videoName: "Existing Video" }))
      : [{ title: "Session 1", videoDataUrl: "", videoName: "" }];

    setForm({
      title: course.title || "",
      category: course.category || "Practices",
      priceINR: course.priceInr ?? course.priceINR ?? "0",
      priceUSD: course.priceUsd ?? course.priceUSD ?? "0",
      duration: course.duration || "",
      thumbnailUrl: course.thumbnailUrl || "",
      lessonItems: mappedLessons,
      rating: course.rating || 4.8,
      description: course.description || ""
    });
    setImagePreview(course.thumbnailUrl || null);
  };

  const deleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.deleteCourse(id);
      await fetchCourses();
      if (editingId === id) resetEditor();
    } catch (error) {
      console.error("Failed to delete course", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, thumbnailFile: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      if (!baseUrl.endsWith('/api') && !baseUrl.includes('/api')) baseUrl += '/api';

      let finalThumbnailUrl = form.thumbnailUrl;

      // 1. Upload Thumbnail
      if (form.thumbnailFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", form.thumbnailFile);
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
        const uploadRes = await fetch(`${baseUrl}/upload`, {
          method: "POST",
          headers: { 'Authorization': `Bearer ${token}` },
          body: imageFormData
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image to Cloudflare");
        const uploadData = await uploadRes.json();
        finalThumbnailUrl = uploadData.url;
      }

      // 2. Build Payload
      const coursePayload = {
        title: form.title,
        description: form.description,
        priceInr: Number(form.priceINR),
        priceUsd: Number(form.priceUSD),
        category: form.category,
        duration: form.duration,
        rating: form.rating,
        thumbnailUrl: finalThumbnailUrl,
      };

      // 3. Create OR Update the Course Base Data
      let currentCourseId = editingId;
      if (!editingId) {
        const { course } = await api.createCourse(coursePayload);
        currentCourseId = course.id;
      } else {
        await api.updateCourse(editingId, coursePayload);
      }

      // 4. Process Videos with Real-Time XHR Progress Tracking
      if (currentCourseId) {
        for (let i = 0; i < form.lessonItems.length; i++) {
          const lesson = form.lessonItems[i];

          // Only upload if it's a completely NEW file
          if (lesson.title && lesson.rawFile) {
            
            // Initialize progress to 0% for this specific video
            setUploadProgress(prev => ({ ...prev, [i]: 0 }));

            const { uploadUrl, r2ObjectKey } = await api.requestVideoUploadUrl({
              fileName: lesson.rawFile.name,
              contentType: lesson.rawFile.type,
              courseId: currentCourseId
            });

            // 🚨 XHR UPLOAD ENGINE: Tracks bytes in real-time
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('PUT', uploadUrl, true);
              xhr.setRequestHeader('Content-Type', lesson.rawFile!.type);

              // Track upload progress
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.round((event.loaded / event.total) * 100);
                  setUploadProgress(prev => ({ ...prev, [i]: percentComplete }));
                }
              };

              // Handle completion
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  setUploadProgress(prev => ({ ...prev, [i]: 100 })); // Force to 100%
                  resolve();
                } else {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              };

              xhr.onerror = () => reject(new Error("Network error during upload"));
              xhr.send(lesson.rawFile);
            });

            // Tell the database and trigger the BullMQ worker
            await api.addVideoToCourse(currentCourseId, {
              title: lesson.title,
              description: "",
              videoUrlR2: r2ObjectKey,
              orderIndex: i + 1
            });
          }
        }
      }

      await fetchCourses();
      resetEditor();
      handlePostSave();
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to save course. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="sia-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold text-[#600694] mb-6">
        {editingId ? "Edit Course" : "Add Course"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AdminFormField label="Course Title">
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className={ADMIN_INPUT_CLASS} placeholder="Course title" />
          </AdminFormField>

          <AdminFormField label="Category">
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className={ADMIN_INPUT_CLASS}>
              <option>Practices</option>
              <option>Scriptures</option>
            </select>
          </AdminFormField>

          <div className="grid grid-cols-2 gap-4">
            <AdminFormField label="Price (INR)">
              <input type="number" min="0" required value={form.priceINR} onChange={e => setForm(p => ({ ...p, priceINR: e.target.value }))} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
            <AdminFormField label="Price (USD)">
              <input type="number" min="0" required value={form.priceUSD} onChange={e => setForm(p => ({ ...p, priceUSD: e.target.value }))} className={ADMIN_INPUT_CLASS} />
            </AdminFormField>
          </div>
        </div>

        <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 flex flex-col justify-center items-center relative overflow-hidden">
          {imagePreview ? (
            <div className="relative w-full h-full min-h-[200px] rounded-xl overflow-hidden group">
              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full absolute inset-0" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label htmlFor="thumbnail-upload" className="cursor-pointer bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-sm">
                  Change Image
                </label>
              </div>
            </div>
          ) : (
            <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-[#600694] transition-all">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-600">Upload Course Thumbnail</span>
              <span className="text-xs text-gray-400 mt-1">16:9 Aspect Ratio Recommended</span>
            </label>
          )}
          <input type="file" id="thumbnail-upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
        </div>

        <div className="md:col-span-2 border border-gray-100 rounded-3xl p-6 bg-gray-50/50 mt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground block mb-4">Course Videos</span>
          {form.lessonItems.map((lesson, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-2xl border border-gray-100 mb-4 relative ${lesson.id ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-purple-500'}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-[#600694]">
                  {lesson.id ? `EXISTING VIDEO ${idx + 1}` : `NEW VIDEO ${idx + 1}`}
                </p>
                <button type="button" onClick={() => removeLesson(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <input placeholder="Video Title" className={ADMIN_INPUT_CLASS + " mb-3 h-10"} value={lesson.title} onChange={e => updateLesson(idx, 'title', e.target.value)} />

              {!lesson.id && (
                <div className="flex items-center gap-3">
                  <input type="file" id={`vid-${idx}`} className="hidden" accept="video/mp4,video/mov,video/quicktime" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateLesson(idx, 'rawFile', file);
                      updateLesson(idx, 'videoName', file.name);
                    }
                  }} />
                  <label htmlFor={`vid-${idx}`} className="cursor-pointer text-xs font-bold text-[#600694] border border-[#600694]/20 px-3 py-2 rounded-full hover:bg-purple-50 transition-colors">
                    Select Video File
                  </label>
                  <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{lesson.videoName || "No file selected"}</span>
                </div>
              )}

              {/* 🚨 THE UPLOAD ANIMATION WIDGET */}
              {uploadProgress[idx] !== undefined && (
                <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs font-bold text-[#600694] mb-2 relative z-10">
                    <span className="flex items-center gap-2">
                      {uploadProgress[idx] < 100 ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                      {uploadProgress[idx] < 100 ? "Uploading securely to CDN..." : "Upload Complete! Sending to Worker..."}
                    </span>
                    <span>{uploadProgress[idx]}%</span>
                  </div>
                  
                  {/* Progress Bar Track */}
                  <div className="w-full bg-white rounded-full h-2.5 overflow-hidden relative z-10 border border-purple-100">
                    {/* The Fill */}
                    <div 
                      className="bg-gradient-to-r from-[#600694] to-[#8c1ac9] h-full rounded-full transition-all duration-300 relative" 
                      style={{ width: `${uploadProgress[idx]}%` }}
                    >
                      {/* Inner Shimmer Effect */}
                      <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_1.5s_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addLesson} className="flex items-center text-sm font-bold text-[#600694] gap-2 mt-2"><PlusCircle size={18} /> Add Another Video</button>
        </div>

        <AdminFormField label="Description" className="md:col-span-2">
          <textarea required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={ADMIN_TEXTAREA_CLASS} />
        </AdminFormField>

        <div className="md:col-span-2 flex justify-end gap-3">
          {editingId && <button type="button" onClick={resetEditor} className="px-6 py-3 rounded-full font-bold text-[#600694] border border-[#600694]/30 hover:bg-gray-50 transition-all">CANCEL EDIT</button>}
          <button type="submit" disabled={isLoading} className="bg-[#600694] text-white px-8 py-3 rounded-full font-bold hover:bg-[#4a0473] transition-all disabled:opacity-50">
            {isLoading ? "UPLOADING MEDIA..." : (editingId ? "UPDATE COURSE" : "SAVE COURSE")}
          </button>
        </div>
      </form>

      {courses.length > 0 && (
        <div className="mt-10 space-y-4 border-t border-gray-100 pt-6">
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">Live Database Courses</p>
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={course.thumbnailUrl || makeFallbackImage("Course")} alt={course.title} className="h-16 w-24 rounded-lg border border-border object-cover" />
                <div>
                  <p className="text-sm font-bold text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">INR: ₹{course.priceInr} | USD: ${course.priceUsd}</p>
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