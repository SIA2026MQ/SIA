import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import {
  Loader2, ArrowLeft, PlayCircle, CheckCircle, Menu, X,
  ShieldCheck, MonitorPlay, AlertCircle
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
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressLockRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

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
    // The backend returns a signed URL for raw videos; for HLS it returns the .m3u8 key.
    return activeVideo.videoUrlR2;
  }, [activeVideo]);

  const isHlsStream = useMemo(() => {
    if (!absoluteVideoUrl) return false;
    return absoluteVideoUrl.endsWith('.m3u8');
  }, [absoluteVideoUrl]);

  // Reset error when changing video
  useEffect(() => {
    setPlaybackError(null);
  }, [absoluteVideoUrl]);

  // ---------------------------------------------------------------------------
  // 2. DUAL‑ENGINE PLAYER (HLS + raw)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!absoluteVideoUrl || !playerContainerRef.current) return;
    if (absoluteVideoUrl.includes('LOCKED')) return;

    // Cleanup previous player
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    playerContainerRef.current.innerHTML = '';

    // Create video element
    const video = document.createElement('video');
    video.className = 'w-full h-full object-contain';
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    playerContainerRef.current.appendChild(video);

    // Shared event listeners
    const handleWaiting = () => setIsVideoBuffering(true);
    const handlePlaying = () => setIsVideoBuffering(false);
    const handleError = (e: Event) => {
      console.error('Video playback error:', e);
      setPlaybackError('Failed to load video. Please try again later.');
    };
    const handleEnded = () => {
      if (courseData && activeVideoIndex < courseData.videos.length - 1) {
        setActiveVideoIndex(prev => prev + 1);
      }
    };
    const handleTimeUpdate = async (e: Event) => {
      const target = e.target as HTMLVideoElement;
      if (!target.duration || !activeVideo || !courseId) return;
      const playedRatio = target.currentTime / target.duration;

      if (playedRatio >= 0.9 && !completedVideos.includes(activeVideo.id) && !progressLockRef.current.has(activeVideo.id)) {
        progressLockRef.current.add(activeVideo.id);
        setCompletedVideos(prev => [...prev, activeVideo.id]);
        try {
          await api.markVideoProgress(courseId, activeVideo.id);
        } catch (error) {
          console.error("Progress API failed (non‑critical)", error);
        }
      }
    };
    const handleContextMenu = (e: Event) => e.preventDefault();

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('contextmenu', handleContextMenu);
    video.addEventListener('error', handleError);

    const defaultOptions: Plyr.Options = {
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'duration',
        'mute', 'volume', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      fullscreen: { iosNative: true },
      ratio: '16:9'
    };

    const initPlayer = async () => {
      try {
        if (isHlsStream) {
          // --- HLS (chunked) ---
          const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
          if (Hls.isSupported()) {
            const hls = new Hls({
              debug: false,
              xhrSetup: (xhr) => {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
              }
            });
            hlsRef.current = hls;
            hls.loadSource(absoluteVideoUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              playerRef.current = new Plyr(video, defaultOptions);
              playerRef.current.play().catch(() => {});
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS
            video.src = `${absoluteVideoUrl}?token=${token}`;
            playerRef.current = new Plyr(video, defaultOptions);
          } else {
            setPlaybackError('HLS not supported in this browser.');
          }
        } else {
          // --- RAW MP4 / MOV (signed URL) ---
          // The backend already returns a signed URL, so we can use it directly.
          video.src = absoluteVideoUrl;
          // Optional: set type hint for better browser handling
          const ext = absoluteVideoUrl.split('.').pop()?.toLowerCase();
          if (ext === 'mp4') video.setAttribute('type', 'video/mp4');
          else if (ext === 'mov') video.setAttribute('type', 'video/quicktime');
          // Wait for the video to be ready
          video.load();
          playerRef.current = new Plyr(video, defaultOptions);
          playerRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error('Player initialization error:', err);
        setPlaybackError('Failed to initialize video player.');
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('contextmenu', handleContextMenu);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
      }
    };
  }, [absoluteVideoUrl, isHlsStream, activeVideo, activeVideoIndex, courseData, courseId]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060810]">
        <Loader2 className="h-12 w-12 animate-spin text-[#071A54]" />
      </div>
    );
  }
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
          <div className="relative bg-[#060810] w-full aspect-video max-h-[65vh] flex justify-center items-center">
            <div ref={playerContainerRef} className="w-full h-full absolute inset-0 z-10" />

            {isVideoBuffering && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
            )}

            {playbackError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 text-white p-4">
                <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                <p className="text-lg font-semibold">Playback Error</p>
                <p className="text-sm text-gray-300 mt-2">{playbackError}</p>
                <button
                  onClick={() => {
                    setPlaybackError(null);
                    // Trigger reload by resetting video source
                    if (playerRef.current) {
                      const video = playerRef.current.elements?.original;
                      if (video) {
                        video.load();
                        playerRef.current.play();
                      }
                    }
                  }}
                  className="mt-4 px-6 py-2 bg-[#071A54] text-white rounded-full hover:bg-[#0a2a7a] transition-colors"
                >
                  Retry
                </button>
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

          <div className="flex-1 bg-white p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center bg-[#071A54]/10 text-[#071A54] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                Lesson {activeVideoIndex + 1}
              </span>
              <span className="text-gray-300 text-sm font-medium">|</span>
              <span className="text-[#081E60] text-xs font-bold tracking-wide uppercase">{courseData.category}</span>
            </div>
            <h2 className="font-display text-xl md:text-3xl text-gray-900 mb-4 leading-tight font-bold">
              {activeVideo ? activeVideo.title : "Introduction"}
            </h2>
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