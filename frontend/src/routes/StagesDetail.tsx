import { motion } from "framer-motion";
import { BookOpen, Video, CircleDot, Milestone } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage"; // Assuming you have this wrapper

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const stages = [
  {
    phase: "PHASE 1",
    title: "AWAKENING & CLARITY",
    subtitle: "THE SEEKING OF A PATH – Awakening",
    tagline: "One awakens and seeks direction and clarity to doubts",
    description: "This is the beginning of seeking when a seeker experiences awakening. The awakening usually involves an incident or situation where one begins questioning the experiences of life and the meaning and purpose of life. This phase is full of doubts and one keeps seeking the truth across all the paths.",
    courses: ["Shifting Into Awareness (Eng)", "Jagrukta Ki Zindagi (Hindi)", "Deepening Awareness (Eng)"],
    scriptures: ["Chidakasha Gita (Eng)", "Chidakasha Gita (Hindi)"]
  },
  {
    phase: "PHASE 2",
    title: "REFLECTION ON THE REAL",
    subtitle: "THE WISDOM OF THE PATH – The Learning",
    tagline: "One reflects and begins relating wisdom with one’s experiences",
    description: "On seeking multiple paths and knowledge keeps presenting itself to the seeker until the seeker keeps clarifying all doubts. These clarifications can be from those who have realised the truth or through authentic scriptures that act as guidance. Finally, one comes inline of the knowing that one’s ego is the cause of all bondage of life and that the ultimate goal of human life is to realise this ignorance by abiding more in one’s true Self.",
    courses: ["Inner Child Healing (Eng)", "Inner Alchemy (Eng)", "Purge & Reset (Eng)", "New Beginnings (Eng)", "Seedha Marg, Seedhi Baat"],
    scriptures: ["Yog Vashist (Eng)", "Upadesa Saram (Eng)", "Upadesa Saram (Hindi)"]
  },
  {
    phase: "PHASE 3",
    title: "DESTRUCTION OF CONCEPTS",
    subtitle: "THE CHURNING OF THE PATH – The Purging",
    tagline: "One begins practicing to remove all clutter and concepts",
    description: "Having realised that the obstacles to one realising one’s true nature, the seeker makes all efforts to purge out all the unwanted clutter gathered during lifetimes in ignorance. While most of the cleansing happens, one realises that the greatest obstacle to realising the Self is the removal of concepts that were gathered with the ignorant projections of the mind.",
    courses: ["Living In Divine Presence", "Living In Divine Presence (Advance)", "Appo Deepo Bhava"],
    scriptures: ["Avadhuta Gita (Eng)", "Avadhuta Gita (Hindi)", "Sarva Jnanottara (Eng)"]
  },
  {
    phase: "PHASE 4",
    title: "IN THE WORLD YET NOT OF IT",
    subtitle: "THE GRACE OF THE PATH – The Blooming",
    tagline: "One begins living less in body consciousness & more in divine presence",
    description: "In this stage, though the seeker still is bound by ego and it’s false projections, one becomes certain that liberation is not by living in the mind/ego and all it’s projections but by living more in one’s true nature. The seeker begins living more and more in one’s own presence rather than the false identity one carries.",
    courses: ["Who Am I?", "I am Shiva"],
    scriptures: ["Devikallotara (Eng)", "Devikallotara (Hindi)", "Vigyan Bhairav Tantra", "Shiva Sutras"]
  },
  {
    phase: "PHASE 5",
    title: "ABIDING IN THE SELF",
    subtitle: "THE PATHLESS PATH – The Liberation",
    tagline: "Grace magnetically absorbs the soul back into the Source.",
    description: "With more and more expansion of one’s divine presence of divine love and light, the seeker gradually moves into the state of being free even while being in the body. The body or mind, though alive, does not hold the soul that is living in freedom in the body, going about doing it’s regular activities. All previous phases involve the active participation of the seeker but this stage is of pure grace. In this state there is nothing worth DOING but is pure BEING. Grace purely absorbs the soul back into its Source. One simply becomes THAT.",
    courses: ["Being", "Silence Between Words", "Pathless Path"],
    scriptures: ["Ulludu Narpudu", "Ribhu Gita"]
  }
];

export default function StagesDetail() {
  return (
    <AnimatedPage>
      {/* --- HERO IMAGE & INTRO (section-odd) --- */}
      <section className="section-odd pt-32 pb-16">
        <div className="sia-container max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Rectangular Hero Image with Border */}
            <motion.div
              variants={fadeInUp}
              className="aspect-video md:aspect-[21/9] w-full overflow-hidden rounded-3xl border border-primary/20 shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1519682577862-22b62b24e493?q=80&w=2070&auto=format&fit=crop"
                alt="Spiritual Evolution Journey"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div className="mx-auto max-w-4xl text-center space-y-6">
              <motion.div variants={fadeInUp} className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Milestone className="text-primary" size={32} />
              </motion.div>
              <motion.h1 variants={fadeInUp} className="sia-h1 text-primary mb-6">
                The Journey of Spiritual Evolution
              </motion.h1>
              <motion.p variants={fadeInUp} className="sia-body text-xl text-muted-foreground mx-auto">
                Before becoming God one needs to become human first. Explore the 5 stages of spiritual evolution, from the initial awakening to ultimate liberation.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- TIMELINE JOURNEY (section-even) --- */}
      <section className="section-even py-16 pb-32 bg-[#f7e7e7]">
        <div className="sia-container max-w-6xl mx-auto px-4 md:px-6">
          
          {/* Main List Container */}
          <div className="space-y-12">
            {stages.map((stage) => (
              <motion.div
                key={stage.phase}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full"
              >
                
                {/* LEFT: Big Rectangle (Info & Heading) */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex-1 sia-card relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
                >
                  {/* Background Glow */}
                  <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-[80px] group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    {/* Phase Header */}
                    <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary">
                      {stage.phase}
                    </div>
                    
                    <h2 className="mb-2 text-2xl md:text-3xl font-bold text-foreground">
                      {stage.title}
                    </h2>
                    <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-primary/80">
                      {stage.subtitle}
                    </h3>
                    
                    <p className="mb-4 text-lg italic text-foreground/90 border-l-2 border-primary pl-4">
                      "{stage.tagline}"
                    </p>
                    <p className="sia-body text-muted-foreground">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>

                {/* RIGHT: Small Square (Courses & Scriptures) */}
                <motion.div 
                  variants={fadeInUp}
                  className="w-full lg:w-[350px] shrink-0 sia-card relative overflow-hidden group hover:border-primary/30 transition-all duration-500 flex flex-col justify-center"
                >
                   {/* Background Glow */}
                   <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-[80px] group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
                   
                   <div className="relative z-10 space-y-8">
                    {/* Suggested Courses */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                        <Video size={16} className="text-primary" />
                        Suggested Courses
                      </h4>
                      <ul className="space-y-2">
                        {stage.courses.map((course, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            <span className="text-primary mt-0.5 opacity-50">•</span>
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested Scriptures */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                        <BookOpen size={16} className="text-primary/80" />
                        Suggested Scriptures
                      </h4>
                      <ul className="space-y-2">
                        {stage.scriptures.map((scripture, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            <span className="text-primary mt-0.5 opacity-50">•</span>
                            {scripture}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </AnimatedPage>
  );
}