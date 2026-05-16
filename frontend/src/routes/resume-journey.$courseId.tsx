import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle, ArrowLeft, Play, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCourses } from "@/lib/admin-store"; // <-- 1. Import our database

export const Route = createFileRoute("/resume-journey/$courseId")({
  component: ResumeJourneyPage,
});

function ResumeJourneyPage() {
  const { courseId } = Route.useParams();
  const { user, hydrated } = useAuth();
  
  // 2. Fetch the LIVE courses from the database
  const allCourses = useCourses();
  
  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="min-h-screen pt-32 text-center bg-[var(--color-cream)] text-[var(--color-purple)]">
        <h2>Please sign in to view this curriculum.</h2>
      </div>
    );
  }

  // 3. Verify the user is enrolled by checking local storage
  const enrolledCourses = JSON.parse(localStorage.getItem("sia_enrolled_courses") || "[]");
  const isEnrolled = enrolledCourses.some((c: any) => c.id === courseId);

  // 4. ALWAYS grab the live curriculum from the database, not the local storage snapshot!
  const liveCourse = allCourses.find((c) => c.id === courseId);
  const curriculum = (liveCourse as any)?.curriculum || [];

  if (!isEnrolled || !liveCourse) {
    return (
      <div className="min-h-screen pt-32 text-center bg-[var(--color-cream)] text-[var(--color-purple)]">
        <h2>Course not found. Have you enrolled yet?</h2>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[var(--color-cream)] pt-28 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        
        <div className="mb-10">
          <Link to="/my-learning" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-mid)] hover:text-[var(--color-purple)] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to My Learning
          </Link>
          <h1 className="mt-6 font-serif italic text-4xl sm:text-5xl text-[var(--color-purple)]">{liveCourse.title}</h1>
          <p className="mt-3 text-[var(--color-text-mid)]">Select a session to continue your journey.</p>
        </div>

        <div className="rounded-3xl bg-white shadow-card border border-[var(--color-purple)]/5 overflow-hidden">
          <div className="divide-y divide-[var(--color-purple)]/10">
            {curriculum.length === 0 ? (
              <div className="p-10 text-center text-[var(--color-text-mid)]">
                The guide is currently preparing the curriculum for this path. Please check back later.
              </div>
            ) : (
              curriculum.map((video: any, index: number) => (
                <div key={video.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-8 sm:py-5 hover:bg-[var(--color-peach)]/30 transition-colors">
                  <div className="flex items-start sm:items-center gap-4 pr-4">
                    <PlayCircle className="h-5 w-5 flex-none text-[var(--color-text-mid)] group-hover:text-[var(--color-purple)] transition-colors mt-0.5 sm:mt-0" />
                    <span className="text-base font-medium text-[var(--color-text-dark)] group-hover:text-[var(--color-purple)] transition-colors leading-snug">
                      <span className="text-[var(--color-gold-deep)] font-bold text-xs uppercase tracking-widest mr-3">Session {index + 1}</span>
                      {video.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-6 self-end sm:self-auto shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    {video.videoUrl ? (
                      <Link
                        to="/player/$courseId/$videoId"
                        params={{ courseId: liveCourse.id, videoId: video.id }}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-[var(--color-purple)] px-4 py-2 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-4 w-4 fill-current" /> Play
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-mid)]">
                        <Lock className="h-4 w-4" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}