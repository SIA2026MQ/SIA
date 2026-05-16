import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ url, thumbnail, title, className }: VideoPlayerProps) {
  // Prevent hydration mismatch errors in Next.js/SSR environments
  const [isClient, setIsClient] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div 
      className={cn(
        "relative group w-full rounded-2xl overflow-hidden shadow-card border border-[var(--color-gold)]/20 bg-[var(--color-cream)] transition-all duration-500 hover:shadow-lg hover:border-[var(--color-purple)]/30",
        className
      )}
    >
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        
        {/* Optional: Cinematic Title Overlay (Appears on Hover) */}
        {title && (
          <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <h3 className="text-white font-serif text-lg sm:text-xl md:text-2xl tracking-wide drop-shadow-md">
              {title}
            </h3>
          </div>
        )}

        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true} // Shows native controls ONLY after the video starts
          light={thumbnail || false} // Enables the custom play button overlay
          onReady={() => setIsReady(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onBuffer={() => setIsReady(false)}
          onBufferEnd={() => setIsReady(true)}
          style={{ position: 'absolute', top: 0, left: 0 }}
          
          // --- CUSTOM SIA BRANDED PLAY BUTTON ---
          playIcon={
            <button
              className="absolute inset-0 flex items-center justify-center w-full h-full group/btn z-10 outline-none"
              aria-label="Play video"
            >
              {/* Subtle dark backdrop blur on hover */}
              <div className="absolute inset-0 bg-[var(--color-purple)]/10 backdrop-blur-[2px] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

              {/* Glassmorphic Play Circle */}
              <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/85 backdrop-blur-md shadow-[0_8px_32px_rgba(96,6,148,0.25)] border-2 border-[var(--color-gold)]/60 text-[var(--color-purple)] transform transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:bg-[var(--color-purple)] group-hover/btn:text-[var(--color-cream)] group-hover/btn:border-[var(--color-purple-light)] pulse-glow">
                <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-2 fill-current transition-colors duration-300" />
              </div>
            </button>
          }
        />

        {/* Loading Spinner for HLS Buffering */}
        {!isReady && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-gold)]" />
          </div>
        )}
      </div>
    </div>
  );
}