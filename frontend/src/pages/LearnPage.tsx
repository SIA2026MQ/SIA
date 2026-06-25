import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js"; // 🚨 The official Enterprise Video Engine
import { Loader2, ArrowLeft, PlayCircle, CheckCircle, Menu, X, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { dbUser, loading: authLoading } = useAuth();

  const [courseData, setCourseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  // 🚨 Native Video Reference
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!dbUser) {
      navigate("/login?redirectTo=/my-learning");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        if (!courseId) throw new Error("Course ID missing");

        const response = await api.getCourseById(courseId);

        if (!response.hasAccess) {
          navigate(`/courses`);
          return;
        }

        setCourseData(response.course);
        if (response.completedVideoIds) {
          setCompletedVideos(response.completedVideoIds);
        }
      } catch (error) {
        console.error("Failed to load course details:", error);
        navigate("/my-learning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, dbUser, authLoading, navigate]);

  const activeVideo = courseData?.videos?.[activeVideoIndex];

  // 🚨 FIXED: Trust the secure Proxy URL sent directly from the Backend!
  const absoluteVideoUrl = useMemo(() => {
    if (!activeVideo) return "";
    
    // The backend already formatted this as http://localhost:5000/api/courses/secure-stream/...
    const finalUrl = activeVideo.videoUrlR2; 
    
    console.log("🔥 ATTEMPTING TO STREAM VIA PROXY:", finalUrl);
    return finalUrl;
  }, [activeVideo]);

  // ---------------------------------------------------------------------------
  // 🚨 NATIVE HLS.JS INTEGRATION (Unbreakable Video Engine)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!absoluteVideoUrl || !videoRef.current) return;
    if (absoluteVideoUrl.includes('LOCKED')) return;

    let hls: Hls;
    const video = videoRef.current;

    // We must wrap this in an async function to await the Firebase token
    const initializePlayer = async () => {
      // 🚨 1. Grab the secure Firebase Token
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";

      if (Hls.isSupported()) {
        hls = new Hls({
          debug: true,
          // 🚨 2. INJECT THE TOKEN: This tells HLS.js to attach your auth token to EVERY video chunk!
          xhrSetup: (xhr, url) => {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
        });

        hls.loadSource(absoluteVideoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("✅ HLS Manifest Loaded & Engine Attached!");
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("🚨 FATAL HLS ERROR:", data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("Network Error: Trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media Error: Trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      }
      // Safari natively supports HLS, so we bypass the engine for Apple users
      else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native video tags can't send headers, so we append the token to the URL as a fallback
        video.src = `${absoluteVideoUrl}?token=${token}`;
      }
    };

    initializePlayer();

    return () => {
      if (hls) hls.destroy(); // Clean up memory when user leaves the page
    };
  }, [absoluteVideoUrl]);

  // Enterprise Progress Tracker
  const handleVideoProgress = async (state: { played: number }) => {
    if (!activeVideo || !courseId) return;
    if (state.played >= 0.9 && !completedVideos.includes(activeVideo.id)) {
      setCompletedVideos(prev => [...prev, activeVideo.id]);
      try {
        await api.markVideoProgress(courseId, activeVideo.id);
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    }
  };

  const handleVideoEnded = () => {
    if (courseData && activeVideoIndex < courseData.videos.length - 1) {
      setActiveVideoIndex(prev => prev + 1);
    }
  };

  if (isLoading || authLoading) return <div className="flex min-h-screen items-center justify-center bg-[#0a0118]"><Loader2 className="h-12 w-12 animate-spin text-[#600694]" /></div>;
  if (!courseData) return null;

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden font-sans">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Link to="/my-learning" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#600694] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div className="hidden h-6 w-px bg-gray-300 md:block"></div>
          <h1 className="hidden md:block font-display text-lg text-gray-900 truncate max-w-xl">{courseData.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} /> Server Proxy Secured
          </div>
          <button className="md:hidden p-2 text-gray-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex flex-1 flex-col overflow-y-auto bg-black">

          {/* 🚨 NATIVE HTML5 PLAYER */}
          <div className="w-full bg-black flex justify-center items-center relative" style={{ aspectRatio: '16/9', maxHeight: '75vh' }}>
            {activeVideo && absoluteVideoUrl && !absoluteVideoUrl.includes('LOCKED') ? (
              <video
                ref={videoRef}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain outline-none"
                onTimeUpdate={(e) => {
                  const video = e.target as HTMLVideoElement;
                  if (video.duration) {
                    const playedRatio = video.currentTime / video.duration;
                    handleVideoProgress({ played: playedRatio });
                  }
                }}
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="text-gray-400">
                {absoluteVideoUrl.includes('LOCKED') ? 'Course access required to view this video.' : 'No video available for this session.'}
              </div>
            )}
          </div>

          <div className="flex-1 bg-white p-6 md:p-10 border-t border-gray-200">
            <h2 className="font-display text-3xl text-gray-900 mb-4">
              {activeVideo ? `${activeVideoIndex + 1}. ${activeVideo.title}` : "Introduction"}
            </h2>
            <div className="prose prose-purple max-w-none text-gray-600">
              <p className="whitespace-pre-wrap leading-relaxed text-lg">{activeVideo?.description}</p>
            </div>
          </div>
        </main>

        <aside className={`absolute right-0 top-0 h-full w-full max-w-[350px] bg-white border-l border-gray-200 flex flex-col z-10 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h3 className="font-bold text-gray-900">Course Content</h3>
            <p className="text-xs text-muted-foreground mt-1">{completedVideos.length} / {courseData.videos?.length || 0} Sessions Completed</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(completedVideos.length / (courseData.videos?.length || 1)) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {courseData.videos?.map((video: any, index: number) => {
              const isActive = activeVideoIndex === index;
              const isCompleted = completedVideos.includes(video.id);

              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setActiveVideoIndex(index);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`flex w-full items-start gap-4 border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${isActive ? "bg-purple-50/50 border-l-4 border-l-[#600694]" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="mt-1 shrink-0">
                    {isCompleted ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : isActive ? <PlayCircle className="h-5 w-5 text-[#600694] fill-[#600694]/10" /> : <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold line-clamp-2 ${isActive ? "text-[#600694]" : "text-gray-700"}`}>{index + 1}. {video.title}</p>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{video.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}