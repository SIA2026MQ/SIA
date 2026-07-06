import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, CircleDot, ArrowRight } from "lucide-react";
import { AnimatedPage } from "@/components/common/AnimatedPage"; // Assuming you have this wrapper
import satsung from "@/assets/satsung-logo.jpg"; // Example image

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function AboutPage() {
  return (
    <AnimatedPage>
      {/* --- 1. HERO IMAGE & INTRO (section-odd) --- */}
      <section className="section-odd pt-32 pb-16">
        <div className="sia-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Rectangular Image with Border */}
            <motion.div
              
              className="aspect-video md:aspect-[21/9] w-full overflow-hidden rounded-3xl border border-primary/20 shadow-lg"
            >
              <img
                src={satsung}
                alt="Shifting Into Awareness Hero"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div className="max-w-4xl space-y-6">
              <motion.h1  className="sia-h1 text-primary">
                Shifting Into Awareness
              </motion.h1>
              <motion.p  className="sia-body text-muted-foreground text-lg">
                <strong className="text-foreground">Shifting Into Awareness</strong>, as the name
                reveals, is a platform that helps seekers of truth to make the shift from ignorance
                to wisdom, from darkness to light, from bondage to freedom, from falseness to truth.
                It helps fully shift our existence from the mind ego to the Self (soul
                consciousness). It’s only when one lives in awareness that one can remain unentangled
                with the (highs and lows) dramas of life. It leads to the state of Jeevanamukta
                (liberated while in the body).
              </motion.p>

              <motion.blockquote
                
                className="sia-card my-8 border-l-4 border-l-primary p-8 text-xl italic leading-relaxed text-primary shadow-md"
              >
                “Shifting into awareness” refers to a spiritual and psychological transition from
                living in the “mind-ego”—a state dominated by reactive thoughts, past conditioning,
                and a false sense of identity—to living in a state of pure presence or the “Self”
              </motion.blockquote>

              <motion.p  className="sia-body text-muted-foreground text-lg">
                This shift is often associated with the teachings of Jake Light and his platform,
                Shifting Into Awareness, which provides a roadmap for seekers to move from ignorance
                to wisdom.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. KEY ASPECTS (section-even) --- */}
      <section className="section-even py-16 bg-[#F7E7E7]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="sia-container"
        >
          <motion.h2  className="sia-h2 mb-10 flex items-center gap-3">
            <Sparkles className="text-primary" size={28} /> Key Aspects
          </motion.h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Moving from Mind to Presence",
                desc: "The core of the practice is shifting the seat of your existence from the constant “doing” and “chatter” of the mind to the “being” of the Self.",
              },
              {
                title: "Dissolving the “Doer”",
                desc: "A major objective is to dissolve the egoic sense of being the “meditator” or “practitioner,” eventually reaching a state where you are unentangled with life’s highs and lows.",
              },
              {
                title: "Witnessing Consciousness",
                desc: "It involves activating the “Inner Guru” and living as an observer of your thoughts and emotions, rather than being controlled by them.",
              },
              {
                title: "Practical Benefits",
                desc: "Supporters of this shift claim it leads to a “neutral and enriching life,” reduces stress and anxiety, and ultimately leads to Self-Realisation.",
              },
            ].map((aspect, i) => (
              <motion.div key={i}  className="sia-card group">
                <h3 className="mb-3 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {aspect.title}
                </h3>
                <p className="sia-body text-muted-foreground">{aspect.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- 3. OBJECTIVES (section-odd) --- */}
      <section className="section-odd py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="sia-container"
        >
          <motion.h2  className="sia-h2 mb-10">
            Objectives of Shifting Into Awareness
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-5xl">
            {[
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
            ].map((obj, i) => (
              <motion.div key={i}  className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />
                <p className="sia-body text-foreground">{obj}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            
            className="mt-10 overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8"
          >
            <p className="font-display text-2xl italic leading-tight text-primary">
              By this, the main goal is to finally realise that “I am moving around in this human
              suit, having a human experience for the time being.”
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 4. THE PHASES (section-even) --- */}
      <section className="section-even py-16 bg-[#F7E7E7]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="sia-container"
        >
          <motion.h2  className="sia-h2 mb-12">
            Basic Theme ~ The Phases
          </motion.h2>
          <div className="space-y-6">
            {[
              {
                phase: "PHASE 1",
                title: "AWAKENING & CLARITY",
                subtitle: "the awakening",
                text: "One awakens and seeks direction and clarity to doubts. This is the beginning of seeking when a seeker experiences awakening. The awakening usually involves an incident or situation where one begins questioning the experiences of life and the meaning and purpose of life. This phase is full of doubts and one keeps seeking the truth across all the paths.",
              },
              {
                phase: "PHASE 2",
                title: "REFLECTION ON THE REAL",
                subtitle: "the learning",
                text: "One reflects and begins relating wisdom with one’s experiences. On seeking multiple paths and knowledge keeps presenting itself to the seeker until the seeker keeps clarifying all doubts. These clarifications can be from those who have realised the truth or through authentic scriptures that act as guidance. Finally, one comes inline of the knowing that one’s ego is the cause of all bondage of life and that the ultimate goal of human life is to realise this ignorance by abiding more in one’s true Self.",
              },
              {
                phase: "PHASE 3",
                title: "DESTRUCTION OF CONCEPTS",
                subtitle: "the purging",
                text: "One begins practicing to remove all clutter and concepts. Having realised that the obstacles to one realising one’s true nature, the seeker makes all efforts to purge out all the unwanted clutter gathered during lifetimes in ignorance. While most of the cleansing happens, one realises that the greatest obstacle to realising the Self is the removal of concepts that were gathered with the ignorant projections of the mind.",
              },
              {
                phase: "PHASE 4",
                title: "IN THE WORLD YET NOT OF IT",
                subtitle: "the blooming",
                text: "One begins living less in body consciousness & more in divine presence. In this stage, though the seeker still is bound by ego and it’s false projections, one becomes certain that liberation is not by living in the mind/ego and all it’s projections but by living more in one’s true nature. The seeker begins living more and more in one’s own presence rather than the false identity one carries.",
              },
              {
                phase: "PHASE 5",
                title: "ABIDING IN THE SELF",
                subtitle: "the liberation",
                text: "Grace magnetically absorbs the soul back into the Source. With more and more expansion of one’s divine presence of divine love and light, the seeker gradually moves into the state of being free even while being in the body. The body or mind, though alive, does not hold the soul that is living in freedom in the body, going about doing it’s regular activities. All previous phases involve the active participation of the seeker but this stage is of pure grace. In this state there is nothing worth DOING but is pure BEING. Nothing much is done here but pure surrender to the grace to purely absorbs back the soul back into its Source. One simply becomes THAT.",
              },
            ].map((item, i) => (
              <motion.div key={i}  className="sia-card relative overflow-hidden">
                <div className="absolute right-0 top-0 rounded-bl-3xl bg-primary/10 px-6 py-2 text-sm font-bold tracking-widest text-primary">
                  {item.phase}
                </div>
                <div className="mb-4 pr-32">
                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                  <span className="text-sm italic text-muted-foreground">{item.subtitle}</span>
                </div>
                <p className="sia-body text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- 5. WHAT WE DO (section-odd) --- */}
      <section className="section-odd py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="sia-container"
        >
          <motion.h2  className="sia-h2 mb-10">
            What We Do
          </motion.h2>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              {[
                "Life Resets through Cleansing, Uncluttering, Inner Work & Purification!",
                "Igniting the Light of Wisdom, Deepening Spiritual Evolution, Inner Joy & Freedom!",
                "Activating the Light of Awareness! Inner Awakening! Spiritual Growth! Life Transformation!",
                "Moving towards Inner Peace, Contentment, Happiness & Inner Freedom!",
                "Regular Satsangs to stay consistent, connected to the Truth and updated",
              ].map((text, i) => (
                <motion.div key={i}  className="sia-card flex items-start gap-4">
                  <ArrowRight className="mt-0.5 shrink-0 text-primary" size={20} />
                  <p className="font-medium text-foreground">{text}</p>
                </motion.div>
              ))}
            </div>
            <motion.div  className="space-y-6 text-lg text-muted-foreground">
              <p>
                We welcome you to the exciting inner journey of life ~ which transforms your external
                journey of life. There are regular free internal Zoom sessions, paid and free webinars
                and deep residential retreats conducted at powerful locations like Tiruvannamalai
                (Tamilnadu), Kanhangad (Kerala), Ganeshpuri, Delhi/Ghaziabad, Uttarkashi, Gorakhpur,
                etc.
              </p>
              <p>
                The practices are very simple but powerful processes, involving only practices of
                activating your awareness and Shifting Into Awareness until you gradually begin living
                in awareness aware, without using the aid of any props, yantras, tantra, mantras,
                techniques, yoga, etc, which needs the active ‘doership’ of the seeker. Shifting Into
                Awareness aims at dissolving the doer, the practitioner, the meditator itself.
              </p>
              <p>
                One learns to activate one’s Divine Presence and live from not the mind, but from
                that pure presence, in consistent meditative awareness – 24×7. Thus, one eventually
                realises that one is not the body but just that pure presence. In this state, it is
                easier to remain unentangled with the worldly events. Thus, one is able to complete
                one’s responsibilities (outcome of previous karma and karmic ties) and begins gaining
                inner freedom and peace.
              </p>
            </motion.div>
          </div>

          <motion.div
            
            className="mt-16 overflow-hidden rounded-3xl bg-primary p-10 text-center text-primary-foreground shadow-xl lg:p-16"
          >
            <p className="mx-auto mb-6 max-w-4xl font-display text-xl leading-relaxed opacity-90 md:text-2xl">
              All these programs are hosted and taught by Jake Light, who had a spiritual awakening
              at a young age, after which life catapulted him into a series of dramatic life events
              including meeting many living masters and mystics during his nearly two-decade search
              for the purpose and Ultimate Truth of life.
            </p>
            <p className="font-display text-2xl font-bold leading-tight md:text-3xl">
              The ultimate goal of the whole process is to make one eventually free from all
              clinging and dependancy on anything and everything and abide in only the Self – which
              is when one realises the Self.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 6. HOW IT BEGAN & FOOTER IMAGES (section-even) --- */}
      <section className="section-even py-16 pb-32 bg-[#F7E7E7]">
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={staggerContainer}
    className="sia-container"
  >
    {/* Heading */}
    <div className="mb-16 max-w-3xl">
      <motion.h2  className="sia-h2 mb-6">
        How did SiA begin?
      </motion.h2>

      <motion.p
        
        className="sia-body mb-4 text-muted-foreground text-lg"
      >
        SiA is not affiliated or connected in any manner with any spiritual or
        religious organisation. It is purely the product of grace of the Divine
        and the unbiased, unconditional infinite Ascended Masters whom Jake is
        connected with.
      </motion.p>

      <motion.p
        
        className="sia-body mb-8 text-muted-foreground text-lg"
      >
        SiA came into existence after a series of spontaneous events, under the
        guidance, support and love of the Ascended Masters, to whom Jake owes
        everything to.
      </motion.p>

      {/* Second Heading - Same Style */}
      <motion.h2
        
        className="sia-h2 text-[#5F1380] mt-12"
      >
        OUR ROLE MODELS ~ ASCENDED MASTERS
      </motion.h2>
    </div>

    {/* Images */}
    <div className="grid gap-8 md:grid-cols-2">
      <motion.div
        
        className="group aspect-[4/3] w-full overflow-hidden rounded-3xl border border-primary/10 shadow-lg md:aspect-auto md:h-[500px]"
      >
        <img
          src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2000&auto=format&fit=crop"
          alt="Meditation and peace"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </motion.div>

      <motion.div
        
        className="group aspect-[4/3] w-full overflow-hidden rounded-3xl border border-primary/10 shadow-lg md:mt-12 md:aspect-auto md:h-[500px]"
      >
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2000&auto=format&fit=crop"
          alt="Spiritual awakening"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </motion.div>
    </div>
  </motion.div>
</section>
    </AnimatedPage>
  );
}