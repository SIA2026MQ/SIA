import { AnimatedPage } from "@/components/common/AnimatedPage";
import { LotusDivider } from "@/components/common/LotusDivider";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { BlogTicker } from "@/components/home/BlogTicker";
import { CoursesPreview } from "@/components/home/CoursesPreview";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { HeroSection } from "@/components/home/HeroSection";
import { WebinarCards } from "@/components/home/WebinarCards";

export default function HomePage() {
  return (
    <AnimatedPage>
      <HeroSection />
      <AboutTeaser />
      <LotusDivider />
      <GalleryStrip />
      <BlogTicker />
      <WebinarCards />
      <CoursesPreview />
    </AnimatedPage>
  );
}
