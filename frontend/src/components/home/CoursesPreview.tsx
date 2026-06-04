import { ShoppingCart } from "lucide-react";
import scriptureStudy from "@/assets/scripture-study.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import { useCart } from "@/components/common/CartContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useRegionalPricing } from "@/hooks/useRegionalPricing"; 

export function CoursesPreview() {
  const { courses } = useSiteContent();
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing(); 

  return (
    <section className="section-odd py-16">
      <div className="sia-container space-y-10 px-4">
        <div className="text-center reveal-on-scroll">
          <h2 className="sia-h2 text-3xl">Begin Your Journey</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#fdb022] mt-2">
            Welcome to the Pathless Path
          </p>
        </div>

        {/* 
           GRID LOGIC:
           grid-cols-1: Mobile (1 card)
           sm:grid-cols-2: Tablet (2 cards)
           lg:grid-cols-3: Laptop (3 cards)
           xl:grid-cols-4: Desktop (4 cards)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.slice(-4).map((course, index) => (
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
                  className="sia-button-primary mt-3 w-full py-2 text-[11px] uppercase tracking-wider flex items-center justify-center"
                  onClick={() => addToCart(course)}
                >
                  <ShoppingCart className="mr-1.5 h-3 w-3" /> Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}