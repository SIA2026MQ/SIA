import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage"; // Assuming wrapper
import act_web from "@/assets/act_web.jpeg"; // Example image
import act_satsang from "@/assets/act_sut.jpeg"; // Example image
import act_course from "@/assets/act_cor.jpeg"; // Example image
import act_retreat from "@/assets/act_ret.jpeg"; // Example image
import act_gathering from "@/assets/act_gat.jpeg"; // Example image

// Premium custom easing curve for a buttery smooth feel
const smoothEase = [0.16, 1, 0.3, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// Blur and slide up for text elements
const textReveal = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: smoothEase } 
  },
};

// Cinematic clip-path unmasking for images
const imageReveal = {
  hidden: { opacity: 0, scale: 1.1, clipPath: "inset(10% 10% 10% 10% round 24px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    clipPath: "inset(0% 0% 0% 0% round 24px)",
    transition: { duration: 1.2, ease: smoothEase } 
  },
};

const activitiesData = [
  {
    id: 1,
    title: "Guided Webinars",
    description: "Two webinars are conducted every month that share the practices, secrets and training on this path.",
    buttonText: "Check for Events",
    buttonLink: "#events",
    imageSrc: act_web,
    imageAlt: "SiA Webinars",
  },
  {
    id: 2,
    title: "Daily Satsangs",
    description: "Regular satsangs are conducted every daily to enhance the wisdom and to bring clarity on the webinars and also a place for all members to interact directly with Jake Light.",
    buttonText: "Join The Satsangs",
    buttonLink: "#satsangs",
    imageSrc: act_satsang,
    imageAlt: "SiA Satsangs",
  },
  {
    id: 3,
    title: "Wisdom Courses",
    description: "Courses are important webinars that become available into member's account for unlimited viewing for an unlimited period of time.",
    buttonText: "See all Courses",
    buttonLink: "#courses",
    imageSrc: act_course,
    imageAlt: "SiA Courses",
  },
  {
    id: 4,
    title: "Sacred Retreats",
    description: "Regular Residential Retreats are conducted in holy places like Tiruvannamalai, Ganeshpuri & Kanhangad.",
    buttonText: "Upcoming Retreats",
    buttonLink: "#retreats",
    imageSrc: act_retreat,
    imageAlt: "SiA Retreats",
  },
  {
    id: 5,
    title: "In-Person Gatherings",
    description: "Satsangs in-person are conducted on invitation to bring the community together in shared physical presence.",
    buttonText: "Invite for Satsang",
    buttonLink: "#invite",
    imageSrc: act_gathering,
    imageAlt: "SiA In-person Satsangs",
  },
];

export default function Activity() {
  return (
    <AnimatedPage>
      <main className="min-h-screen bg-[#ffffff] pt-32 pb-24 font-sans selection:bg-[#600694] selection:text-white">
        <div className="sia-container max-w-7xl">
          
          {/* Header Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-24"
          >
            <motion.h3 variants={textReveal} className="text-xs md:text-sm uppercase tracking-[0.2em] text-primary mb-4 font-bold">
              What We Offer
            </motion.h3>
            <motion.h2 variants={textReveal} className="sia-h1 text-[#600694] mb-8">
              Activities of the Sangha
            </motion.h2>

            {/* Premium Glassmorphism Blockquote */}
            <motion.div 
              variants={textReveal}
              className="mx-auto max-w-4xl p-8 md:p-10 rounded-3xl bg-white  border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[#600694]" />
              <p className="text-lg md:text-xl italic text-white leading-relaxed relative z-10">
                Without an outer satsang you can never be led to the inner satsang. Without an outer Without the outer
                guru you can never be led to the inner guru. Without an outer experience you can never be led to the inner experience.Without an outer noise you can never be led to the inner silence. Choosing one over the other is still ignorance. Only when you have played both sides well, can you be free from the play of both.
                <br/>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <b>-Jake Light</b>
              </p>
            </motion.div>
          </motion.div>

          {/* Activities Alternating List */}
          <div className="space-y-32 md:space-y-48">
            {activitiesData.map((activity, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div 
                  key={activity.id} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-150px" }}
                  variants={staggerContainer}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center relative"
                >
                  
                  {/* Image Container */}
                  <div className={`order-1 ${isEven ? 'lg:order-1' : 'lg:order-2'} relative`}>
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full -z-10" />
                    
                    <motion.div 
                      variants={imageReveal}
                      className="w-full aspect-[4/3] md:aspect-[16/10] relative overflow-hidden rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] group"
                    >
                      {/* Glass Overlay */}
                      <div className="absolute inset-0 bg-[#0a0a0c]/10 group-hover:bg-transparent transition-colors duration-700 z-10" />
                      
                      <img 
                        src={activity.imageSrc} 
                        alt={activity.imageAlt} 
                        className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                      />
                    </motion.div>
                  </div>

                  {/* Text Container */}
                  <div className={`order-2 ${isEven ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-center relative z-10`}>
                    
                    {/* Giant Faint Number Background */}
                    <span className="absolute -top-16 -left-8 text-[10rem] md:text-[14rem] font-bold italic text-white/[0.02] leading-none pointer-events-none select-none">
                      0{activity.id}
                    </span>

                    <motion.div variants={textReveal} className="relative z-10 space-y-6">
                      <h3 className="text-3xl md:text-4xl font-bold text-[#600694] tracking-tight">
                        {activity.title}
                      </h3>
                      
                      <p className="sia-body text-lg text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>

                      <div className="pt-4">
                        <a 
                          href={activity.buttonLink}
                          className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-purple-600 border border-white/10 px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/[0.1] hover:border-primary/50 hover:shadow-[0_0_30px_rgba(77,145,255,0.15)] active:scale-95"
                        >
                          <span className="relative z-10 tracking-wide text-sm">{activity.buttonText}</span>
                          <ArrowRight size={16} className="relative z-10 text-primary transition-transform group-hover:translate-x-1" />
                        </a>
                      </div>
                    </motion.div>

                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>
      </main>
    </AnimatedPage>
  );
}