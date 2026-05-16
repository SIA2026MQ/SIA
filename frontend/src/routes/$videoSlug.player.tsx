import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ReactPlayer from "react-player"; // Make sure to npm install react-player if you haven't

export const Route = createFileRoute("/$videoSlug/player")({
  component: VideoPlayerPage,
});

function VideoPlayerPage() {
  // Extract the video title slug from the URL
  const { videoSlug } = Route.useParams();

  // Convert slug back to a readable title format for display
  // e.g., "autonomous-ai-agent-demo" -> "Autonomous Ai Agent Demo"
  const displayTitle = videoSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <section className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Top Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Curriculum
          </button>
          <h1 className="mt-4 font-serif text-2xl sm:text-3xl text-white">
            {displayTitle}
          </h1>
        </div>

        {/* Video Player Wrapper */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=inpok4MKVLM" // Replace with your actual video source/HLS stream
            width="100%"
            height="100%"
            controls={true}
            playing={true}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </div>

        {/* Optional Context/Notes Area below video */}
        <div className="mt-8 rounded-2xl bg-[#141414] p-6 sm:p-8 border border-gray-800">
          <h3 className="font-serif text-xl text-gray-200">Session Notes</h3>
          <p className="mt-3 text-gray-400 leading-relaxed text-sm">
            Watch the video above to learn more about {displayTitle.toLowerCase()}. Make sure to follow along with the provided materials and adjust your environment accordingly.
          </p>
        </div>

      </div>
    </section>
  );
}