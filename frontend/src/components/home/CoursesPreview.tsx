import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import scriptureStudy from "@/assets/scripture-study.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import { useCart } from "@/components/common/CartContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing"; 
import { api } from "@/lib/api"; // 🚨 Imported the real API

export function CoursesPreview() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing(); 

  // Fetch courses from the database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getAllCourses();
        if (res.courses) {
          setCourses(res.courses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const displayCourses = courses.slice(0, 4); // Always grab the top 4
  const hasMore = courses.length > 4; // Check if there are more hidden in the DB

  // Auto-scroll logic for the mobile slider
  useEffect(() => {
    let animationId: number;
    const container = scrollRef.current;

    const autoScroll = () => {
      if (container && !isInteracting) {
        // The speed of the continuous scroll (increase to make it faster)
        container.scrollLeft += 1; 

        // Infinite loop logic: Once we scroll past the first duplicated set, reset to the beginning
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    if (displayCourses.length > 0) {
      animationId = requestAnimationFrame(autoScroll);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, displayCourses]);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center bg-[#ffffff]">
        <Loader2 className="h-8 w-8 animate-spin text-[#600694]" />
      </div>
    );
  }

  if (courses.length === 0) return null; // Hide section completely if there are no courses

  // Helper function to render a single course card
  const renderCourseCard = (course: any, index: number, keyPrefix: string, isMobile: boolean) => {
    return (
      <article 
        key={`${keyPrefix}-${course.id}-${index}`} 
        className={`flex flex-col overflow-hidden border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow ${
          isMobile ? "w-[260px] sm:w-[320px] shrink-0" : "h-full w-full"
        }`}
      >
        <div className="h-32 w-full overflow-hidden shrink-0 relative group">
          <img 
            src={course.imageDataUrl || course.imageUrl || (index % 2 === 0 ? retreatMountain : scriptureStudy)} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            loading="lazy"
          />
        </div>

        <div className="p-4 flex flex-col flex-grow whitespace-normal">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">
            {course.category || "Course"}
          </span>
          <h3 className="mt-1 font-display text-lg leading-snug text-primary line-clamp-1">
            {course.title}
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 flex-grow leading-relaxed">
            {course.description}
          </p>
          
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
            <span className="font-bold text-primary">
              {localizePrice(course) || "Price Unavailable"}
            </span>
            <span className="text-muted-foreground">{course.duration || "N/A"}</span>
          </div>
          
          <button
            className="sia-button-primary mt-3 w-full py-2 text-[11px] uppercase tracking-wider flex items-center justify-center transition-transform hover:-translate-y-0.5"
            onClick={(e) => {
              e.preventDefault();
              addToCart(course);
            }}
          >
            <ShoppingCart className="mr-1.5 h-3 w-3" /> Add to Cart
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="section-odd py-16 bg-[#F7E7E7] overflow-hidden">
      
      {/* Injected CSS to hide the scrollbar for the mobile touch slider */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="sia-container space-y-10 px-4 max-w-7xl mx-auto">
        
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 gap-4">
           <h2 className="sia-h2 text-3xl md:text-5xl">Begin Your Journey</h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
            Welcome to the Pathless Path
          </p>
        </div>

        {/* MOBILE VIEW: Auto-scrolling AND Native Touchable Slider (< lg) */}
        <div 
          ref={scrollRef}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          className="lg:hidden flex overflow-x-auto gap-6 pb-6 pt-2 px-4 -mx-4 sm:mx-0 sm:px-0 hide-scrollbar cursor-grab active:cursor-grabbing"
        >
          {/* Duplicated array to allow seamless infinite looping */}
          {[...displayCourses, ...displayCourses].map((course, index) => 
            renderCourseCard(course, index, "mobile", true)
          )}
        </div>

        {/* DESKTOP VIEW: Static Responsive Grid (>= lg) */}
        <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {displayCourses.map((course, index) => 
            renderCourseCard(course, index, "desktop", false)
          )}
        </div>

        {/* SHOW SEE MORE BUTTON IF MORE THAN 4 COURSES EXIST */}
        {hasMore && (
          <div className="pt-4 flex justify-center">
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#600694] hover:text-[#4a0473] transition-colors border-b-2 border-transparent hover:border-[#4a0473] pb-1"
            >
              See More Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}