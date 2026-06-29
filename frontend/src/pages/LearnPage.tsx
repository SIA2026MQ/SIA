import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import {
  Loader2, ArrowLeft, PlayCircle, CheckCircle, Menu, X,
  ShieldCheck, MonitorPlay
} from "lucide-react";
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

  const [isVideoBuffering, setIsVideoBuffering] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  // 🚨 We only use a container ref now. We will inject the video manually to stop React from crashing!
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressLockRef = useRef<Set<string>>(new Set());

  // ---------------------------------------------------------------------------
  // 1. DATA FETCHING
  // ---------------------------------------------------------------------------
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

  const absoluteVideoUrl = useMemo(() => {
    if (!activeVideo) return "";
    return activeVideo.videoUrlR2;
  }, [activeVideo]);

  // ---------------------------------------------------------------------------
  // 2. BULLETPROOF HLS.JS + PLYR ENGINE 
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!absoluteVideoUrl || !playerContainerRef.current) return;
    if (absoluteVideoUrl.includes('LOCKED')) return;

    let hls: Hls;
    let player: Plyr;

    // 🚨 DOM CRASH FIX: Nuke the container and manually build the video tag
    playerContainerRef.current.innerHTML = '';
    const video = document.createElement('video');
    video.className = 'w-full h-full object-contain';
    video.crossOrigin = 'anonymous';
    playerContainerRef.current.appendChild(video);

    const initializePlayer = async () => {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";

      const defaultOptions: Plyr.Options = {
        controls: [
          'play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume',
          'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        fullscreen: { iosNative: true },
        ratio: '16:9' // Forces perfect aspect ratio
      };

      // 🚨 Attach manual event listeners to the native element
      video.addEventListener('waiting', () => setIsVideoBuffering(true));
      video.addEventListener('playing', () => setIsVideoBuffering(false));
      video.addEventListener('ended', () => {
        if (courseData && activeVideoIndex < courseData.videos.length - 1) {
          setActiveVideoIndex(prev => prev + 1);
        }
      });
      video.addEventListener('timeupdate', async (e) => {
        const target = e.target as HTMLVideoElement;
        if (!target.duration || !activeVideo || !courseId) return;

        const playedRatio = target.currentTime / target.duration;

        // 🚨 500 ERROR FIX: Instantly lock the state locally so we don't spam the server
        if (playedRatio >= 0.9 && !completedVideos.includes(activeVideo.id) && !progressLockRef.current.has(activeVideo.id)) {
          progressLockRef.current.add(activeVideo.id);
          setCompletedVideos(prev => [...prev, activeVideo.id]);

          try {
            await api.markVideoProgress(courseId, activeVideo.id);
          } catch (error) {
            console.error("Backend 500 Error: Progress API failed, but UI will continue normally.", error);
          }
        }
      });
      // Prevent right click
      video.addEventListener('contextmenu', (e) => e.preventDefault());

      if (Hls.isSupported()) {
        hls = new Hls({
          debug: false,
          xhrSetup: (xhr, url) => {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }
        });

        hls.loadSource(absoluteVideoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player = new Plyr(video, defaultOptions);
          player.play().catch(() => console.log("Autoplay blocked."));
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = `${absoluteVideoUrl}?token=${token}`;
        player = new Plyr(video, defaultOptions);
      }
    };

    initializePlayer();

    return () => {
      // 🚨 DOM CRASH FIX: Destroy everything cleanly on unmount
      if (hls) hls.destroy();
      if (player) player.destroy();
      if (playerContainerRef.current) playerContainerRef.current.innerHTML = '';
    };
  }, [absoluteVideoUrl, activeVideo, activeVideoIndex, courseData, courseId]);

  if (isLoading || authLoading) return <div className="flex min-h-screen items-center justify-center bg-[#060810]"><Loader2 className="h-12 w-12 animate-spin text-[#071A54]" /></div>;
  if (!courseData) return null;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-[#F8FAFC] overflow-hidden font-sans">

      <style dangerouslySetInnerHTML={{
        __html: `
        .plyr { width: 100%; height: 100%; --plyr-color-main: #071A54; }
        .plyr video { max-height: 100% !important; object-fit: contain !important; }
        .plyr__controls { z-index: 20 !important; }
      `}} />

      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <Link to="/my-learning" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#071A54] transition-colors">
            <ArrowLeft className="h-5 w-5" /> <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="font-display text-base md:text-lg text-[#071A54] font-bold truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
            {courseData.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
            <ShieldCheck size={14} /> Secure Stream
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-50 relative" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative bg-white">
        {/* MAIN CONTENT AREA */}
        <main className={`flex flex-col flex-1 overflow-y-auto bg-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:mr-[380px]' : ''}`}>

          {/* 🚨 RE-PROPORTIONED VIDEO CONTAINER */}
          <div className="relative bg-[#060810] w-full aspect-video max-h-[65vh] flex justify-center items-center">

            {/* The Black Box Container for Plyr */}
            <div ref={playerContainerRef} className="w-full h-full absolute inset-0 z-10" />

            {isVideoBuffering && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
            )}

            <div className="absolute top-6 left-6 z-30 opacity-40 pointer-events-none flex items-center gap-2 select-none">
              <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase drop-shadow-md">SIA Academy</span>
            </div>

            {activeVideo && absoluteVideoUrl && absoluteVideoUrl.includes('LOCKED') && (
              <div className="absolute inset-0 z-40 bg-[#060810] text-gray-400 flex flex-col items-center justify-center h-full gap-4">
                <MonitorPlay size={48} className="text-gray-600 opacity-50" />
                <span className="text-sm">Course access required to view this video.</span>
              </div>
            )}
          </div>

          {/* 🚨 RE-PROPORTIONED TEXT SECTION */}
          <div className="flex-1 bg-white p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center bg-[#071A54]/10 text-[#071A54] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                Lesson {activeVideoIndex + 1}
              </span>
              <span className="text-gray-300 text-sm font-medium">|</span>
              <span className="text-[#081E60] text-xs font-bold tracking-wide uppercase">{courseData.category}</span>
            </div>

            {/* Smaller, more professional heading */}
            <h2 className="font-display text-xl md:text-3xl text-gray-900 mb-4 leading-tight font-bold">
              {activeVideo ? activeVideo.title : "Introduction"}
            </h2>

            {/* Smaller, standardized text sizing */}
            <div className="prose prose-slate max-w-none text-gray-600">
              <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{activeVideo?.description}</p>
            </div>
          </div>
        </main>

        {/* SIDEBAR PLAYLIST */}
        <aside className={`absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white border-l border-gray-100 flex flex-col z-20 transition-transform duration-300 ease-in-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-gray-100 bg-[#FAFAFA] flex-shrink-0">
            <h3 className="font-bold text-[#071A54] text-lg mb-1">Course Curriculum</h3>
            <div className="flex justify-between items-end mt-4 mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Progress</span>
              <span className="text-xs font-extrabold text-[#081E60]">{Math.round((completedVideos.length / (courseData.videos?.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#081E60] h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(completedVideos.length / (courseData.videos?.length || 1)) * 100}%` }}></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar bg-white">
            {courseData.videos?.map((video: any, index: number) => {
              const isActive = activeVideoIndex === index;
              const isCompleted = completedVideos.includes(video.id);

              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setActiveVideoIndex(index);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`flex w-full items-start gap-4 p-5 text-left transition-all duration-200 border-b border-gray-50 hover:bg-[#F8FAFC] group ${isActive ? "bg-[#071A54]/5 hover:bg-[#071A54]/5 shadow-[inset_4px_0_0_#071A54]" : ""}`}
                >
                  <div className="mt-1 shrink-0 transition-transform group-hover:scale-110">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : isActive ? (
                      <PlayCircle className="h-5 w-5 text-[#071A54] fill-[#071A54]/10" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[9px] text-gray-400 font-bold group-hover:border-[#071A54] group-hover:text-[#071A54]">{index + 1}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm font-bold line-clamp-2 leading-snug ${isActive ? "text-[#071A54]" : "text-gray-800"}`}>{video.title}</p>
                    <p className="mt-1.5 text-xs text-gray-500 line-clamp-1 font-medium">{video.description}</p>
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