import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactPlayer from "react-player";
import { ShoppingCart, X } from "lucide-react";
import scriptureStudy from "@/assets/scripture-study.jpg";
import retreatMountain from "@/assets/retreat-mountain.jpg";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing";
import { api } from "@/lib/api"; // <-- Import the API

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const activeCat = searchParams.get("cat") || "practices";

  // Fetch live catalog from database
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.getAllCourses();
        
        // Map backend camelCase fields to match your frontend components
        const formatted = res.courses.map((c: any) => ({
          ...c,
          priceINR: c.priceInr,
          priceUSD: c.priceUsd,
          category: c.category || (c.title.toLowerCase().includes("scripture") ? "Scriptures" : "Practices"),
          imageUrl: c.imageDataUrl || null,
          duration: c.duration || "Self-paced",
          lessons: c.videos?.length || 0,
          rating: c.rating || 5.0,
        }));
        
        setDbCourses(formatted);
      } catch (error) {
        console.error("Failed to fetch courses from DB", error);
      }
    };
    fetchCatalog();
  }, []);

  // Filter content based on URL category
  // Filter content based on URL category
  const filteredCourses = useMemo(() => {
    // 1. Get the URL param (e.g., "scriptures")
    const activeCatLower = (activeCat || "practices").toLowerCase();
    
    // 2. Format it to match your Prisma Enum ("Scriptures" or "Practices")
    const dbCategoryFilter = activeCatLower === "scriptures" ? "Scriptures" : "Practices";
    
    // 3. Filter using the strict DB column
    return dbCourses.filter((c) => c.category === dbCategoryFilter);
  }, [dbCourses, activeCat]);

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-14">
        <div className="sia-container">
          <h1 className="sia-h1">
            {activeCat === "practices" ? "SIA Practices" : "Scriptures Wisdom"}
          </h1>
          <p className="mt-3 sia-body">
            {activeCat === "practices" 
              ? "Guided pathways in embodied practice and inner transformation." 
              : "Timeless scripture wisdom and contemplative deep dives."}
          </p>
        </div>
      </section>

      <section className="section-odd py-14">
        <div className="sia-container grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredCourses.map((course, index) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                index={index} 
                onClick={setSelected} 
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Modal View */}
      {selected && <CourseModal selected={selected} onClose={() => setSelected(null)} />}
    </AnimatedPage>
  );
}

// ... (Keep CourseCard and CourseModal exactly as they are) ...

// ----------------------------------------------------------------------

function CourseCard({ course, index, onClick }: { course: any, index: number, onClick: (c: any) => void }) {
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing();
  
  // FIX: Wrapped in motion.article to allow AnimatePresence to work correctly
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="sia-card group cursor-pointer overflow-hidden p-0" 
      onClick={() => onClick(course)}
    >
      <div className="overflow-hidden">
        <img
          src={course.imageUrl || (index % 2 === 0 ? retreatMountain : scriptureStudy)}
          alt={course.title}
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="space-y-3 p-5">
        <span className="inline-flex rounded-full bg-purple-pale px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-primary">
          {course.category}
        </span>
        <h2 className="font-display text-[22px] leading-tight text-primary">{course.title}</h2>
        <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{course.description}</p>
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-muted-foreground">{course.duration} · {course.lessons} lessons</span>
          <span className="font-semibold text-primary">★ {course.rating}</span>
        </div>
        
        <p className="font-semibold text-primary">{localizePrice(course)}</p>
        
        <button
          className="sia-button-primary w-full"
          onClick={(e) => { e.stopPropagation(); addToCart(course); }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
// ----------------------------------------------------------------------

function CourseModal({ selected, onClose }: { selected: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-primary/50 p-4 backdrop-blur-sm md:p-10 flex items-center justify-center">
      <div className="mx-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="sia-h2 text-4xl">{selected.title}</h3>
          <button className="rounded-full border border-border p-2" onClick={onClose}><X className="h-6 w-6" /></button>
        </div>
        <ReactPlayer url="https://www.youtube.com/watch?v=2OEL4P1Rz04" width="100%" controls />
        <p className="mt-6 text-muted-foreground leading-relaxed">{selected.description}</p>
      </div>
    </div>
  );
}