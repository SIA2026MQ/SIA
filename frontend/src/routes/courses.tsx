import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, PlayCircle, CheckCircle, Infinity, Smartphone } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage";
import { useCart } from "@/components/common/CartContext";
import { useRegionalPricing } from "@/hooks/useRegionalPricing";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext"; // Import Auth to check login status

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  
  const { dbUser } = useAuth();
  const activeCat = searchParams.get("cat") || "practices";

  // 1. Fetch live catalog and user's purchased portfolio
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        // Fetch public catalog
        const res = await api.getAllCourses();
        const formatted = res.courses.map((c: any) => ({
          ...c,
          priceINR: c.priceInr,
          priceUSD: c.priceUsd,
          category: c.category || (c.title.toLowerCase().includes("scripture") ? "Scriptures" : "Practices"),
          imageUrl: c.thumbnailUrl || null, // 🚨 Strictly uses R2 Thumbnail URL
          duration: c.duration || "Self-paced",
          lessons: c.videos?.length || 0,
          rating: c.rating || 5.0,
        }));
        setDbCourses(formatted);

        // Fetch purchased IDs if logged in
        if (dbUser) {
          try {
            const enrolledRes = await api.getMyEnrolledCourses();
            const ids = new Set<string>(enrolledRes.courses.map((c: any) => c.id));
            setPurchasedIds(ids);
          } catch (enrollErr) {
            console.warn("User not enrolled in any courses or session invalid.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch catalog from DB", error);
      }
    };
    fetchCatalogData();
  }, [dbUser]);

  // 2. Filter content based on URL category
  const filteredCourses = useMemo(() => {
    const activeCatLower = (activeCat || "practices").toLowerCase();
    const dbCategoryFilter = activeCatLower === "scriptures" ? "Scriptures" : "Practices";
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

      <section className="section-odd py-14 min-h-[50vh]">
        <div className="sia-container grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

      {/* Enterprise Sales Details Modal */}
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

function CourseCard({ course, index, onClick, isPurchased }: { course: any, index: number, onClick: (c: any) => void, isPurchased: boolean }) {
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing();
  const navigate = useNavigate();
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="sia-card group cursor-pointer overflow-hidden p-0 flex flex-col h-full bg-white border border-gray-100 hover:shadow-xl transition-all" 
      onClick={() => onClick(course)}
    >
      <div className="overflow-hidden aspect-video relative bg-gray-100">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-300">
            <PlayCircle size={48} opacity={0.5} />
          </div>
        )}
        
        {isPurchased && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <CheckCircle size={14} /> Owned
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="flex items-start justify-between">
          <span className="inline-flex rounded-full bg-purple-pale px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#600694]">
            {course.category}
          </span>
        </div>
        
        <h2 className="font-display text-[20px] leading-snug text-gray-900 line-clamp-2">{course.title}</h2>
        <p className="line-clamp-2 text-sm text-gray-500 flex-1">{course.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
          <span>{course.duration} · {course.lessons} lessons</span>
          <span className="font-bold text-yellow-500">★ {course.rating}</span>
        </div>
        
        <div className="pt-2">
          {isPurchased ? (
            <button
              className="w-full rounded-xl bg-emerald-50 text-emerald-700 font-bold py-3 hover:bg-emerald-100 transition-colors"
              onClick={(e) => { e.stopPropagation(); navigate(`/learn/${course.id}`); }}
            >
              Continue Learning
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-display text-xl text-gray-900">{localizePrice(course)}</p>
              <button
                className="bg-[#600694] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#4a0473] transition-colors flex items-center gap-2"
                onClick={(e) => { e.stopPropagation(); addToCart(course); }}
              >
                <ShoppingCart size={16} /> Add
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ----------------------------------------------------------------------

function CourseDetailsModal({ selected, onClose, isPurchased }: { selected: any, onClose: () => void, isPurchased: boolean }) {
  const { addToCart } = useCart();
  const { localizePrice } = useRegionalPricing();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isPurchased) {
      navigate(`/learn/${selected.id}`);
    } else {
      addToCart(selected);
      onClose(); // Optionally close modal after adding to cart
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
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Close Button */}
        <button 
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-md transition-colors" 
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Hero Image & Details */}
        <div className="flex-1 overflow-y-auto max-h-[85vh]">
          <div className="w-full aspect-video bg-gray-100 relative">
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-100">
                <PlayCircle size={64} className="text-purple-300" />
              </div>
            )}
          </div>
          
          <div className="p-8 md:p-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#600694]">
              {selected.category} Pathway
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-gray-900 mt-2 leading-tight">
              {selected.title}
            </h2>
            <p className="text-gray-600 mt-6 text-lg leading-relaxed whitespace-pre-wrap">
              {selected.description}
            </p>
          </div>
        </div>

        {/* Right Side: Floating Action Card */}
        <div className="w-full md:w-[380px] bg-gray-50 border-l border-gray-200 p-8 flex flex-col justify-center">
          
          {isPurchased ? (
            <div className="bg-emerald-100 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-emerald-900 text-lg">You own this course</h3>
              <p className="text-emerald-700 text-sm mt-1">Ready to pick up where you left off?</p>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Enrollment Fee</p>
              <p className="font-display text-5xl text-gray-900">{localizePrice(selected)}</p>
            </div>
          )}

          <button
            onClick={handleAction}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              isPurchased 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-[#600694] hover:bg-[#4a0473] text-white shadow-purple-900/20'
            }`}
          >
            {isPurchased ? (
              <>Continue Learning <PlayCircle size={20}/></>
            ) : (
              <>Add to Cart <ShoppingCart size={20}/></>
            )}
          </button>

          <div className="mt-8 space-y-4">
            <p className="text-sm font-bold text-gray-900">What's included:</p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3"><PlayCircle size={18} className="text-[#600694]"/> {selected.lessons} On-Demand Sessions</li>
              <li className="flex items-center gap-3"><Infinity size={18} className="text-[#600694]"/> Full Lifetime Access</li>
              <li className="flex items-center gap-3"><Smartphone size={18} className="text-[#600694]"/> Access on mobile and desktop</li>
            </ul>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}