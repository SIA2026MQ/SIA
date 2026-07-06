import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import scriptureStudy from "@/assets/scripture-study.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import { useCart } from "@/components/common/CartContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing"; 
import { api } from "@/lib/api"; // 🚨 Imported the real API

export function CoursesPreview() {
  // 🚨 1. Replaced useSiteContent with real State
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing(); 

  // 🚨 2. Fetch courses from the database
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

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center bg-[#ffffff]">
        <Loader2 className="h-8 w-8 animate-spin text-[#600694]" />
      </div>
    );
  }

  if (courses.length === 0) return null; // Hide section completely if there are no courses

  // 🚨 3. Calculate how many courses to show
  const displayCourses = courses.slice(0, 4); // Always grab the top 4
  const hasMore = courses.length > 4; // Check if there are more hidden in the DB

  return (
    <section className="section-odd py-16 bg-[#F7E7E7]">
      <div className="sia-container space-y-10 px-4">
        
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 gap-4">
           <h2 className="sia-h2 text-3xl md:text-5xl">Begin Your Journey</h2>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022]">
            Welcome to the Pathless Path
          </p>
        </div>

        {/* GRID LOGIC:
            grid-cols-1: Mobile (1 card)
            sm:grid-cols-2: Tablet (2 cards)
            lg:grid-cols-3: Laptop (3 cards)
            xl:grid-cols-4: Desktop (4 cards)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayCourses.map((course, index) => (
            <article 
              key={course.id} 
              className="h-full flex flex-col overflow-hidden border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-32 w-full overflow-hidden shrink-0">
                <img 
                  src={course.imageDataUrl || course.imageUrl || (index % 2 === 0 ? retreatMountain : scriptureStudy)} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow">
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
                  {/* Safety check to fix NaN */}
                  <span className="font-bold text-primary">
                    {localizePrice(course) || "Price Unavailable"}
                  </span>
                  <span className="text-muted-foreground">{course.duration || "N/A"}</span>
                </div>
                
                <button
                  className="sia-button-primary mt-3 w-full py-2 text-[11px] uppercase tracking-wider flex items-center justify-center transition-transform hover:-translate-y-0.5"
                  onClick={() => addToCart(course)}
                >
                  <ShoppingCart className="mr-1.5 h-3 w-3" /> Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* 🚨 4. SHOW SEE MORE BUTTON IF MORE THAN 4 COURSES EXIST */}
        {hasMore && (
          <div className="pt-8 flex justify-center">
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