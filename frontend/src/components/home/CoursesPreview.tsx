    import { useEffect, useState, useRef } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { ShoppingCart, Loader2, ArrowRight, X, PlayCircle, CheckCircle, Infinity, Smartphone } from "lucide-react";
    import { motion, AnimatePresence } from "framer-motion";
    import scriptureStudy from "@/assets/scripture-study.jpg";
    import retreatMountain from "@/assets/retreat-mountain.jpg";
    import { useCart } from "@/components/common/CartContext";
    import { useRegionalPricing } from "@/hooks/useRegionalPricing"; 
    import { api } from "@/lib/api";
    import { useAuth } from "@/context/AuthContext";

    export function CoursesPreview() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // 🚨 NEW: Added State for Modal and Purchased Tracking
    const [selected, setSelected] = useState<any | null>(null);
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const { addToCart } = useCart();
    const { localizePrice } = useRegionalPricing(); 
    const { dbUser } = useAuth();
    const navigate = useNavigate();

    // Fetch courses and user enrollment from the database
    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await api.getAllCourses();
            if (res.courses) {
            setCourses(res.courses);
            }

            // 🚨 NEW: Fetch purchased courses if user is logged in
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
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
        };
        
        fetchData();
    }, [dbUser]);

    const displayCourses = courses.slice(0, 4); 
    const hasMore = courses.length > 4; 

    // Auto-scroll logic for the mobile slider
    useEffect(() => {
        let animationId: number;
        const container = scrollRef.current;

        const autoScroll = () => {
        // 🚨 NEW: Pause scrolling if the user is interacting OR if the modal is open
        if (container && !isInteracting && !selected) {
            container.scrollLeft += 1; 

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
    }, [isInteracting, displayCourses, selected]);

    if (loading) {
        return (
        <div className="py-16 flex items-center justify-center bg-[#ffffff]">
            <Loader2 className="h-8 w-8 animate-spin text-[#600694]" />
        </div>
        );
    }

    if (courses.length === 0) return null; 

    // Helper function to render a single course card
    const renderCourseCard = (course: any, index: number, keyPrefix: string, isMobile: boolean) => {
        const isPurchased = purchasedIds.has(course.id);

        return (
        <article 
            key={`${keyPrefix}-${course.id}-${index}`} 
            // 🚨 NEW: Added onClick and cursor-pointer to trigger the Modal
            onClick={() => setSelected(course)}
            className={`flex flex-col overflow-hidden border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
            isMobile ? "w-[260px] sm:w-[320px] shrink-0" : "h-full w-full"
            }`}
        >
            <div className="aspect-square w-full overflow-hidden shrink-0 relative group bg-gray-50">
            <img 
                src={course.thumbnailUrl} 
                alt={course.title} 
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                loading="lazy"
            />
            {/* 🚨 NEW: Added Owned Badge if purchased */}
            {isPurchased && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <CheckCircle size={12} /> Owned
                </div>
            )}
            </div>

            <div className="p-4 flex flex-col flex-grow whitespace-normal">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">
                {course.category || "Course"}
            </span>
            <h3 className="mt-1 font-display text-xl leading-snug text-primary line-clamp-1">
                {course.title}
            </h3>
            
            
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                <span className="font-bold text-primary">
                {localizePrice(course) || "Price Unavailable"}
                </span>
                <span className="text-muted-foreground">{course.duration || "N/A"}</span>
            </div>
            
            {/* 🚨 NEW: Toggles between Continue Learning and Add to Cart depending on purchase status */}
            {isPurchased ? (
                <button
                className="mt-3 w-full py-2 text-[11px] uppercase tracking-wider flex items-center justify-center transition-transform hover:-translate-y-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                onClick={(e) => {
                    e.stopPropagation(); // Prevents modal from opening
                    e.preventDefault();
                    navigate(`/learn/${course.id}`);
                }}
                >
                <PlayCircle className="mr-1.5 h-3 w-3" /> Continue Learning
                </button>
            ) : (
                <button
                className="sia-button-primary mt-3 w-full py-2 text-lg uppercase tracking-wider flex items-center justify-center transition-transform hover:-translate-y-0.5"
                onClick={(e) => {
                    e.stopPropagation(); // Prevents modal from opening
                    e.preventDefault();
                    addToCart(course);
                }}
                >
                <ShoppingCart className="mr-1.5 h-3 w-3" /> Add to Cart
                </button>
            )}
            </div>
        </article>
        );
    };

    return (
        <section className="section-odd py-16 bg-[#F7E7E7] overflow-hidden">
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
            <p className="text-[10px] sm:text-lg font-bold uppercase tracking-widest text-[#fdb022]">
                Welcome to the Pathless Path
            </p>
            </div>

            <div 
            ref={scrollRef}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            className="lg:hidden flex overflow-x-auto gap-6 pb-6 pt-2 px-4 -mx-4 sm:mx-0 sm:px-0 hide-scrollbar cursor-grab active:cursor-grabbing"
            >
            {[...displayCourses, ...displayCourses].map((course, index) => 
                renderCourseCard(course, index, "mobile", true)
            )}
            </div>

            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
            {displayCourses.map((course, index) => 
                renderCourseCard(course, index, "desktop", false)
            )}
            </div>

            {hasMore && (
            <div className="pt-4 flex justify-center">
                <Link 
                to="/courses" 
                className="inline-flex items-center gap-2 text-xl font-bold uppercase tracking-wider text-[#600694] hover:text-[#4a0473] transition-colors border-b-2 border-transparent hover:border-[#4a0473] pb-1"
                >
                See More Courses <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            )}

        </div>

        {/* 🚨 NEW: The Modal Render Component */}
        <AnimatePresence>
            {selected && (
            <CourseDetailsModal
                selected={selected}
                onClose={() => setSelected(null)}
                isPurchased={purchasedIds.has(selected.id)}
            />
            )}
        </AnimatePresence>
        </section>
    );
    }

    // ----------------------------------------------------------------------
    // 🚨 NEW: Modal Component (Extracted exactly from your CoursesPage)
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // 🚨 FIXED: Modal Component
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

    // 🚨 FIX 1: Safely grab the image whether the DB calls it thumbnailUrl or imageUrl
    const displayImage = selected.thumbnailUrl || selected.imageUrl || selected.imageDataUrl;

    // 🚨 FIX 2: Safely calculate total sessions (checking videos array length first)
    const totalSessions = selected.videos?.length || selected.totalLessons || selected.lessons || 0;

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
                {/* 🚨 APPLIED FIX 1 HERE */}
                {displayImage ? (
                <img 
                    src={displayImage} 
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
                {/* 🚨 APPLIED FIX 2 HERE */}
                <li className="flex items-center gap-3"><PlayCircle size={18} className="text-[#600694]" /> {totalSessions} On-Demand Sessions</li>
                <li className="flex items-center gap-3"><Infinity size={18} className="text-[#600694]" /> Full Lifetime Access</li>
                <li className="flex items-center gap-3"><Smartphone size={18} className="text-[#600694]" /> Access on mobile and desktop</li>
                </ul>
            </div>
            </div>
        </motion.div>
        </motion.div>
    );
    }