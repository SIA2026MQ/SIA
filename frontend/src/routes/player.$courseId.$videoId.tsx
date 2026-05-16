import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ReactPlayer from "react-player"; 
import { useAuth } from "@/lib/auth"; 
import { useCourses } from "@/lib/admin-store"; // <-- 1. Import the live database!

export const Route = createFileRoute("/player/$courseId/$videoId")({
  component: VideoPlayerPage,
});

function VideoPlayerPage() {
  const { courseId, videoId } = Route.useParams();
  const { hydrated, user } = useAuth();
  
  // 2. Fetch the live data from the database
  const allCourses = useCourses();

  // 3. Prevent rendering on the server completely to avoid SSR crashes
  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 text-white text-center">
        <h2>Please sign in to view this video.</h2>
      </div>
    );
  }

  // 4. Safely check if the user is enrolled (using local storage)
  const enrolledCourses = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("sia_enrolled_courses") || "[]") 
    : [];
  const isEnrolled = enrolledCourses.some((c: any) => c.id === courseId);

  // 5. CRITICAL FIX: Pull the actual video URL from the LIVE database, not local storage!
  const liveCourse = allCourses.find((c) => c.id === courseId);
  const curriculum = (liveCourse as any)?.curriculum || [];
  const activeVideo = curriculum.find((v: any) => v.id === videoId);

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 text-white text-center">
        <h2>You are not enrolled in this course.</h2>
        <button onClick={() => window.history.back()} className="mt-4 text-[var(--color-gold)] underline cursor-pointer">Go back</button>
      </div>
    );
  }

  if (!liveCourse || !activeVideo) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-24 text-white text-center">
        <h2 className="text-[#600694]">Video not found.</h2>
        <button onClick={() => window.history.back()} className="mt-4 text-[var(--color-gold)] underline cursor-pointer">Go back</button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Curriculum
          </button>
          <h1 className="mt-4 font-serif text-2xl sm:text-3xl text-white">
            {activeVideo.title}
          </h1>
          <p className="text-[var(--color-gold)] text-sm mt-1">{liveCourse.title}</p>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800">
          <ReactPlayer
  url={activeVideo.videoUrl} 
  width="100%"
  height="100%"
  controls={true}
  playing={false}
  style={{ position: 'absolute', top: 0, left: 0 }}
  config={{
    file: {
      forceHLS: true, // <-- Forces the player to load the M3U8 stream correctly
    }
  }}
/>
        </div>

      </div>
    </section>
  );
}