import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, PlayCircle, BookOpen, Flower2 } from "lucide-react";
import { EnrolledCourse } from "./types";

export function CourseGrid({ courses, category }: { courses: EnrolledCourse[], category: "practices" | "scriptures" }) {
  const navigate = useNavigate();
  
  const filteredCourses = courses.filter((c) => c.category === category);

  if (filteredCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-white rounded-3xl p-16 border border-gray-100 shadow-sm mt-2">
        <Flower2 className="h-16 w-16 text-[#600694]/20 mb-6" />
        <h3 className="font-display text-3xl text-[#600694]">No {category} enrolled yet</h3>
        <p className="mt-3 text-muted-foreground max-w-md">Explore our offerings to add {category === "practices" ? "a new practice" : "sacred wisdom"} to your library.</p>
        <Link to="/courses" className="mt-8 rounded-full border-2 border-[#600694] px-8 py-3 text-sm font-bold text-[#600694] hover:bg-[#600694] hover:text-white transition-colors">
          Browse {category}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 mt-2">
      {filteredCourses.map((enrollment, i) => {
        // 🚨 BULLETPROOF DATA EXTRACTION: 
        // Handles both flattened data and nested database relations (enrollment.course)
        const actualCourse = (enrollment as any).course || enrollment;
        
        const courseId = enrollment.id || actualCourse.id;
        const title = enrollment.title || actualCourse.title || "Untitled Course";
        const imageSrc = enrollment.imageUrl || actualCourse.thumbnailUrl || actualCourse.imageUrl;

        return (
          <motion.article 
            layout 
            key={courseId} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4, delay: i * 0.05 }} 
            className="group flex flex-col rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:border-[#600694]/30 transition-all duration-300 hover:shadow-md"
          >
            {category === "scriptures" && <span className="h-2 w-full bg-yellow-500/20" />}
            
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              {/* 🚨 FIX: Now correctly uses `imageSrc` and `title` instead of `course.imageUrl` */}
              {imageSrc ? (
                <img src={imageSrc} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center"><BookOpen className="h-10 w-10 text-gray-300"/></div>
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl text-[#600694] transform scale-90 group-hover:scale-100 transition-transform">
                  <PlayCircle className="h-10 w-10 ml-1" />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-xl text-[#600694] leading-snug line-clamp-2">{title}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Enrolled on: {enrollment.lastAccessed || new Date().toLocaleDateString()}</span>
              </div>
              
              <div className="mt-auto pt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#600694]">{enrollment.progress || 0}% Completed</span>
                  <span className="text-[10px] text-muted-foreground">{enrollment.completedLessons || 0} / {enrollment.totalLessons || 0} Sessions</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${enrollment.progress || 0}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-yellow-500 rounded-full" />
                </div>
              </div>
              
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  navigate(`/learn/${courseId}`); 
                }} 
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#600694] px-5 py-2.5 text-sm font-bold text-[#600694] hover:bg-[#600694] hover:text-white transition-colors"
              >
                Resume Journey
              </button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}