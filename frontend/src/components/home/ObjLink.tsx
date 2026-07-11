import { motion } from "framer-motion";
import { CheckCircle2, Play } from "lucide-react";


// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
  },
};

// --- Data ---
const objectivesList = [
  "To begin living in awareness",
  "Benefit of the power of Satsang to keep you persistent",
  "Purging, releasing & cleansing the inner-core",
  "Breakdown of all beliefs, concepts, conditioning",
  "Begin living as not the body, but divine presence",
  "Begin the process of knowing who you are",
  "Meditate on deeper wisdom of higher scriptures",
  "Learn the highest wisdom & reflect on it",
  "Annihilating all doership, living in total divine flow",
  "Nothing to Do but Abide in the Self",
];

const videoData = [
  {
    id: 1,
    tag: "Deepen Your Practice",
    title: "WHY AM I NOT ABLE TO GO DEEP INWARD?",
    desc1: "A deep session on one of the practical higher teachings of Ramana?",
    desc2: "In this video we investigate and reveal what prevents us from going deep towards the journey of self-realisation. You are most welcome to join the free sessions.",
    // FIXED: Converted to /embed/ format
    videoUrl: "https://www.youtube.com/embed/a5KKcjgrY9M"
  },
  {
    id: 2,
    tag: "Watch & Discover",
    title: "NO MEDITATION OR PRACTICE CAN GRANT YOU SELF-REALISATION",
    desc1: "A Hindi & English session revealing some direct truths?",
    desc2: "Shifting Into Awareness reveals the higher secrets of moving towards the Self. It demonstrates how the popular belief that doing many meditational practices will grant one Self-Realisation is not true. You are most welcome to join the free sessions.",
    // FIXED: Converted to /embed/ format
    videoUrl: "https://www.youtube.com/embed/KYN9QSXCnbc" 
  }
];

export function ObjLink() {
  return (
    <div className="w-full">
      
      {/* =========================================
          SECTION 1: VIDEOS (Alternating Layout)
          Background: Light Lilac (#F7F3FA)
          ========================================= */}
      <section className="py-20 md:py-32 bg-[#F7F3FA] relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 md:px-12">
    
    {/* NEW: 2-Column Layout (Heading Left, Image Right) */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 md:mb-32">
      
      {/* LEFT SIDE: Big Heading */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display text-[#600694] font-bold leading-tight">
          WHAT WE DO
        </h1>
        <div className="w-24 h-2 bg-[#7D2E61] mt-8 rounded-full" />
      </motion.div>

      {/* RIGHT SIDE: Square Image */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-center lg:justify-end w-full"
      >
        <div className="relative w-full max-w-md lg:max-w-lg overflow-hidden rounded-2xl border-2 border-white shadow-xl aspect-square-[4/3]">
          {/* Replace the src with your actual image import or URL */}
          <img 
            src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/WhatWeDo.jpeg"
            alt="What We Do" 
            className="w-full h-full object-cover transition-transform duration-700 "
          />
        </div>
      </motion.div>

    </div>

    {/* EXISTING VIDEO LIST */}
    <div className="flex flex-col gap-24 md:gap-32">
      {videoData.map((video, index) => {
        const isEven = index % 2 === 0;

        return (
          <div 
            key={video.id} 
            className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${
              isEven ? "" : "lg:flex-row-reverse"
            }`}
          >
            
            {/* VIDEO COLUMN */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={isEven ? fadeRight : fadeLeft}
              className="w-full lg:w-1/2"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
                <iframe 
                  className="absolute inset-0 w-full h-full z-10"
                  src={video.videoUrl} 
                  title={video.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>

            {/* INFORMATION COLUMN */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={isEven ? fadeLeft : fadeRight}
              className="w-full lg:w-1/2 flex flex-col justify-center"
            >
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#7D2E61] mb-4">
                {video.tag}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-4xl font-display text-[#600694] tracking-tight mb-8">
                {video.title}
              </h2>
              <div className="w-16 h-1 bg-[#7D2E61] mb-8 rounded-full" />
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light mb-6">
                {video.desc1}
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                {video.desc2}
              </p>
            </motion.div>

          </div>
        );
      })}
    </div>

  </div>
</section>

      {/* =========================================
          SECTION 2: OBJECTIVES
          ========================================= */}
      <section className="py-12 md:py-16 bg-[#F7E7E7] relative overflow-hidden text-[#600694]">
  {/* Background glow effects adjusted for light background */}
  <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#7D2E61] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />
  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ab8cec] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none" />

  <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
    
    {/* Header */}
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="text-center mb-10"
    >
      <h2 className="sia-h2 text-3xl md:text-5xl">
        Objectives of Shifting Into Awareness
      </h2>
      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#fdb022] mt-4">
        The core milestones and transformative goals on the path to true liberation.
      </p>
    </motion.div>

    {/* Content Wrapper: Objectives Grid + Side Image */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 items-center">
      
      {/* Objectives Grid (Takes up 8 of 12 columns on desktop) */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
      >
        {objectivesList.map((objective, index) => (
          <motion.div 
            key={index} 
            variants={fadeUp}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-[#600694]/10 hover:bg-white hover:shadow-md transition-all duration-300 h-full"
          >
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-[#7D2E61]" />
            </div>
            <p className="text-xl font-medium leading-relaxed text-[#600694]/90">
              {objective}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Side Image (Takes up 4 of 12 columns on desktop) */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        className="lg:col-span-4 relative w-full aspect-square overflow-hidden rounded-3xl border border-[#600694]/20 shadow-lg h-100"
      >
        {/* Replace the src with your actual image variable/path */}
        <img 
          src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/standing_J.webp" 
          alt="Objectives of Awareness" 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </motion.div>

    </div>

    {/* Main Goal Banner */}
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
      className="relative p-1 rounded-2xl bg-gradient-to-r from-[#7D2E61] to-[#ab8cec] shadow-xl"
    >
      <div className="bg-[#600694] rounded-[14px] px-6 py-8 md:px-12 md:py-10 text-center">
        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#C45E9F] mb-4">
          The Ultimate Realization
        </span>
        <p className="text-xl md:text-2xl lg:text-3xl font-serif italic text-white leading-relaxed">
          “I am moving around in this human suit, having a human experience for the time being.”
        </p>
      </div>
    </motion.div>

  </div>
</section>  

    </div>
  );
}