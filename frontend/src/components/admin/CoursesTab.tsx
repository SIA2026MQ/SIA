import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil, Image as ImageIcon } from "lucide-react";
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
  
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  
  // 🚨 NEW: State to hold videos marked for deletion during edit mode
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
  
  // 🚨 FIXED: When removing a lesson, check if it's an existing DB video. If yes, mark it for permanent deletion.
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
    setDeletedVideoIds([]); // Clear deleted queue
  };

  const editCourse = (course: any) => {
    setEditingId(course.id);
    setDeletedVideoIds([]); // Clear any previous deletions

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

  const uploadMultipartFile = async (file: File, courseId: string, videoIndex: number): Promise<string> => {
    const CHUNK_SIZE = 5 * 1024 * 1024;
    const partsCount = Math.ceil(file.size / CHUNK_SIZE);
    
    setUploadProgress(prev => ({ ...prev, [videoIndex]: 0 }));

    const { uploadId, r2ObjectKey } = await api.initMultipartUpload({
      fileName: file.name, contentType: file.type, courseId
    });

    const { urls } = await api.getMultipartUrls({ r2ObjectKey, uploadId, partsCount });

    const uploadedParts: { ETag: string, PartNumber: number }[] = [];
    let completedChunks = 0;

    for (let i = 0; i < partsCount; i += 3) {
      const batch = [];
      for (let j = 0; j < 3 && i + j < partsCount; j++) {
        const partIndex = i + j;
        const chunk = file.slice(partIndex * CHUNK_SIZE, Math.min((partIndex + 1) * CHUNK_SIZE, file.size));

        const uploadPromise = new Promise<{ ETag: string, PartNumber: number }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', urls[partIndex], true);
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const etag = xhr.getResponseHeader('ETag')?.replace(/"/g, '') || '';
              resolve({ ETag: etag, PartNumber: partIndex + 1 });
            } else reject(new Error(`Chunk ${partIndex} failed`));
          };
          xhr.onerror = reject;
          xhr.send(chunk);
        }).then(res => {
          completedChunks++;
          setUploadProgress(prev => ({ ...prev, [videoIndex]: Math.round((completedChunks / partsCount) * 100) }));
          return res;
        });

        batch.push(uploadPromise);
      }
      const results = await Promise.all(batch);
      uploadedParts.push(...results);
    }

    uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);
    await api.completeMultipartUpload({ r2ObjectKey, uploadId, parts: uploadedParts });

    return r2ObjectKey;
  };

  // Replace your handleSubmit function with this robust version
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1. Upload Thumbnail (Same as before)
    let finalThumbnailUrl = form.thumbnailUrl;
    if (form.thumbnailFile) {
      // ... (Thumbnail upload logic) ...
      const uploadRes = await fetch(`${baseUrl}/upload`, { method: "POST", headers: { 'Authorization': `Bearer ${token}` }, body: imageFormData });
      const uploadData = await uploadRes.json();
      finalThumbnailUrl = uploadData.url;
    }

    const coursePayload = {
      title: form.title,
      description: form.description,
      priceInr: Number(form.priceINR) || 0,
      priceUsd: Number(form.priceUSD) || 0,
      category: form.category,
      duration: form.duration,
      rating: Number(form.rating) || 4.8,
      thumbnailUrl: finalThumbnailUrl,
    };

    // 2. Perform Deletions FIRST (If editing)
    if (editingId && deletedVideoIds.length > 0) {
      console.log("Cleaning up trashed videos...");
      // Use Promise.allSettled so one failure doesn't stop the whole process
      await Promise.allSettled(deletedVideoIds.map(vidId => api.deleteCourseVideo(editingId, vidId)));
    }

    // 3. Update or Create Course
    let targetCourseId = editingId;
    if (!editingId) {
      const { course } = await api.createCourse(coursePayload);
      targetCourseId = course.id;
    } else {
      await api.updateCourse(editingId, coursePayload);
    }

    // 4. Process NEW Videos
    if (targetCourseId) {
      for (let i = 0; i < form.lessonItems.length; i++) {
        const lesson = form.lessonItems[i];
        if (lesson.title && lesson.rawFile) {
          const r2ObjectKey = await uploadMultipartFile(lesson.rawFile, targetCourseId, i);
          await api.addVideoToCourse(targetCourseId, {
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
    alert("Operation failed. Check the browser console for details.");
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

              {uploadProgress[idx] !== undefined && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex justify-between text-[10px] font-bold text-[#600694] mb-2">
                    <span>{uploadProgress[idx] < 100 ? "Uploading in parallel chunks..." : "Processing & Finalizing..."}</span>
                    <span>{uploadProgress[idx]}%</span>
                  </div>
                  <div className="w-full bg-purple-200/50 rounded-full h-2 overflow-hidden relative">
                    <div className="bg-[#600694] h-full rounded-full transition-all duration-300 relative" style={{ width: `${uploadProgress[idx]}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
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
            {isLoading ? "SAVING TO DB..." : (editingId ? "UPDATE COURSE" : "SAVE COURSE")}
          </button>
        </div>
      </form>

      {/* ... Rest of live courses list map remains untouched */}
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