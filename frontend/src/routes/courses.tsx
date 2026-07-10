import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, PlayCircle, CheckCircle, Infinity, Smartphone } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing";

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const { dbUser } = useAuth();
  
  const activeCat = searchParams.get("cat")?.toLowerCase() || "all";

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        // Fetch every page so the customer catalog is never limited to 10 courses.
        // The backend caps each request at 50, so we fetch page 1 first,
        // then load any remaining pages in parallel.
        const firstPage = await api.getAllCourses(1, 50);
        const allCourses = [...(firstPage.courses || [])];
        const totalPages = Math.max(firstPage.meta?.totalPages || 1, 1);

        if (totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              api.getAllCourses(index + 2, 50)
            )
          );

          remainingPages.forEach((pageResponse) => {
            allCourses.push(...(pageResponse.courses || []));
          });
        }

        const formatted = allCourses.map((c: any) => ({
          ...c,
          priceINR: c.priceInr,
          priceUSD: c.priceUsd,
          category:
            c.category ||
            (c.title.toLowerCase().includes("scripture")
              ? "Scriptures"
              : "Practices"),
          imageUrl: c.thumbnailUrl || null,
          duration: c.duration || "Self-paced",
          lessons: c.videos?.length || 0,
          rating: c.rating || 5.0,
        }));

        setDbCourses(formatted);

        if (dbUser) {
          try {
            const enrolledRes = await api.getMyEnrolledCourses();
            const ids = new Set<string>(enrolledRes.courses.map((c: any) => c.id));
            setPurchasedIds(ids);
          } catch (err) {
            console.warn("User not enrolled in any courses.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch catalog from DB", error);
      }
    };
    fetchCatalogData();
  }, [dbUser]);

  const filteredCourses = useMemo(() => {
    if (activeCat === "all") return dbCourses;

    const dbCategoryFilter =
      activeCat === "scriptures" ? "scriptures" : "practices";

    return dbCourses.filter(
      (course) =>
        String(course.category || "").trim().toLowerCase() === dbCategoryFilter
    );
  }, [dbCourses, activeCat]);

  return (
    <AnimatedPage>
      <section className="section-odd pt-32 pb-14">
        <div className="sia-container">
          <h1 className="sia-h1">
            {activeCat === "practices" ? "SIA Practices" 
              : activeCat === "scriptures" ? "Scriptures Wisdom" 
              : "All Courses"}
          </h1>
          <p className="mt-3 sia-body">
            {activeCat === "practices"
              ? "Guided pathways in embodied practice and inner transformation."
              : activeCat === "scriptures"
              ? "Timeless scripture wisdom and contemplative deep dives."
              : "Explore our complete catalog of transformative practices and scripture wisdom."}
          </p>
        </div>
      </section>

      <section className="section-odd py-14 min-h-[50vh]">
        {/* 🚨 CHANGED: Updated grid to md:grid-cols-3 and lg:grid-cols-4 for smaller PC cards */}
        <div className="sia-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          <AnimatePresence>
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onClick={setSelected}
                isPurchased={purchasedIds.has(course.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <CourseDetailsModal
            selected={selected}
            onClose={() => setSelected(null)}
            isPurchased={purchasedIds.has(selected.id)}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}

// ----------------------------------------------------------------------

function CourseCard({ course, index, onClick, isPurchased }: { course: any; index: number; onClick: (c: any) => void; isPurchased: boolean }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { localizePrice } = useRegionalPricing();
  const priceDisplay = localizePrice(course);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="sia-card group cursor-pointer overflow-hidden p-0 flex flex-col h-full bg-white border border-gray-100 hover:shadow-xl transition-all"
      onClick={() => onClick(course)}
    >
      <div className="overflow-hidden aspect-square relative bg-gray-50">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-contain transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-300">
            <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" />
          </div>
        )}
        {isPurchased && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <CheckCircle size={12} /> <span className="hidden sm:inline">Owned</span>
          </div>
        )}
      </div>

      {/* 🚨 CHANGED: Adjusted desktop padding (sm:p-4) to fit the new smaller card size */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="flex items-start justify-between">
          <span className="inline-flex rounded-full bg-purple-pale px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#600694]">
            {course.category}
          </span>
        </div>

        {/* 🚨 CHANGED: Adjusted title size (sm:text-lg) so it doesn't crowd the smaller card */}
        <h2 className="font-display text-sm sm:text-lg leading-snug text-gray-900 line-clamp-2">{course.title}</h2>
   

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs text-gray-500 pt-2 border-t border-gray-50 gap-1 sm:gap-0">
          <span>{course.duration} · {course.lessons} lessons</span>
          <span className="font-bold text-yellow-500">★ {course.rating}</span>
        </div>

        <div className="pt-2">
          {isPurchased ? (
            <button
              className="w-full rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold py-2 sm:py-2.5 hover:bg-emerald-100 transition-colors"
              onClick={(e) => { e.stopPropagation(); navigate(`/learn/${course.id}`); }}
            >
              Continue <span className="hidden sm:inline">Learning</span>
            </button>
          ) : (
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 xl:gap-0">
              <p className="font-display text-base sm:text-lg text-gray-900">{priceDisplay}</p>
              <button
                className="bg-[#600694] text-white px-3 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold shadow-md hover:bg-[#4a0473] transition-colors flex items-center justify-center gap-1 w-full xl:w-auto"
                onClick={(e) => { e.stopPropagation(); addToCart(course); }}
              >
                <ShoppingCart size={14} className="sm:w-4 sm:h-4" /> Add
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ----------------------------------------------------------------------

function CourseDetailsModal({ selected, onClose, isPurchased }: { selected: any; onClose: () => void; isPurchased: boolean }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { localizePrice } = useRegionalPricing();
  const priceDisplay = localizePrice(selected);

  const handleAction = () => {
    if (isPurchased) {
      navigate(`/learn/${selected.id}`);
    } else {
      addToCart(selected);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 md:p-10 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative mx-auto w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-md transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-y-auto max-h-[85vh]">
          <div className="w-full aspect-square md:aspect-auto md:h-96 bg-gray-50 relative flex items-center justify-center">
            {selected.imageUrl ? (
              <img 
                src={selected.imageUrl} 
                alt={selected.title} 
                className="w-full h-full object-contain p-4" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                <PlayCircle size={64} className="text-purple-300" />
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8 md:p-10 border-t border-gray-100">
            <span className="text-xs font-bold tracking-widest uppercase text-[#600694]">
              {selected.category} Pathway
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-gray-900 mt-2 leading-tight">
              {selected.title}
            </h2>
            <p className="text-gray-600 mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
              {selected.description}
            </p>
          </div>
        </div>

        <div className="w-full md:w-[380px] bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-6 sm:p-8 flex flex-col justify-center">
          {isPurchased ? (
            <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-900 text-lg">You own this course</h3>
              <p className="text-emerald-700 text-sm mt-1">Ready to pick up where you left off?</p>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Enrollment Fee</p>
              <p className="font-display text-4xl sm:text-5xl text-gray-900">{priceDisplay}</p>
            </div>
          )}

          <button
            onClick={handleAction}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${isPurchased
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-[#600694] hover:bg-[#4a0473] text-white shadow-purple-900/20'
              }`}
          >
            {isPurchased ? (
              <>Continue Learning <PlayCircle size={20} /></>
            ) : (
              <>Add to Cart <ShoppingCart size={20} /></>
            )}
          </button>

          <div className="mt-6 sm:mt-8 space-y-4">
            <p className="text-sm font-bold text-gray-900">What's included:</p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3"><PlayCircle size={18} className="text-[#600694]" /> {selected.lessons} On-Demand Sessions</li>
              <li className="flex items-center gap-3"><Infinity size={18} className="text-[#600694]" /> Full Lifetime Access</li>
              <li className="flex items-center gap-3"><Smartphone size={18} className="text-[#600694]" /> Access on mobile and desktop</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}