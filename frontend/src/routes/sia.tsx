import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Calendar, MonitorPlay, Mountain, 
  BookOpen, MapPin, Info 
} from "lucide-react";

// Modern component imports from your system
import { LotusDivider } from "@/components/common/LotusDivider";
import { AnimatedPage } from "@/components/common/AnimatedPage";

// Asset Validations


export default function SIAPage() {
  const [searchParams] = useSearchParams();
  
  // Extract active query identifier (e.g., /sia?tab=about, /sia?tab=jake)
  const activeTab = searchParams.get("tab")?.toLowerCase() || "about";

  // Force scroll target calculation behavior resets to top on render cycles
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <AnimatedPage>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {/* ========================================================================= */}
          {/* VIEW DYNAMIC BRANCH CONDITIONALS: ABOUT SIA                               */}
          {/* ========================================================================= */}
          {activeTab === "about" && (
            <section className="section-odd pt-32 pb-20 bg-[var(--color-cream)]">
              <div className="sia-container space-y-16">
                <div className="max-w-4xl space-y-6">
                  <h1 className="sia-h1 text-[#600694]">About SIA</h1>
                  <p className="sia-body text-lg sm:text-xl leading-relaxed">
                    Shifting Into Awareness is a platform that helps seekers of truth make the shift from ignorance to wisdom, 
                    from darkness to light, and from bondage to freedom. We facilitate the transition from the "mind-ego" 
                    — dominated by reactive thoughts and past conditioning — to the state of pure presence or the "Self."
                  </p>
                  <blockquote className="font-display text-2xl sm:text-3xl italic text-primary/80 border-l-4 border-primary/30 pl-6 py-2">
                    “It’s only when one lives in awareness that one can remain unentangled with the dramas of life, leading to the state of Jeevanamukta (liberated while in the body).”
                  </blockquote>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 pt-4 border-t border-border/40">
                  <div className="lg:col-span-7 space-y-8">
                    <h3 className="font-serif text-3xl text-primary font-semibold">Key Aspects of the Shift</h3>
                    <div className="space-y-6">
                      {[
                        { title: "Moving from Mind to Presence", desc: "The core of the practice is shifting the seat of your existence from the constant “doing” and “chatter” of the mind to the “being” of the Self." },
                        { title: "Dissolving the “Doer”", desc: "A major objective is to dissolve the egoic sense of being the “meditator” or “practitioner,” eventually reaching a state where you are unentangled with life’s highs and lows." },
                        { title: "Witnessing Consciousness", desc: "It involves activating the “Inner Guru” and living as an observer of your thoughts and emotions, rather than being controlled by them." },
                        { title: "Practical Benefits", desc: "Supporters of this shift claim it leads to a “neutral and enriching life,” reduces stress and anxiety, and ultimately leads to Self-Realisation." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider text-primary">{item.title}</h4>
                            <p className="text-muted-foreground text-sm sm:text-base mt-1">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-card/60 rounded-3xl p-8 border border-border/80 space-y-6">
                    <h3 className="font-serif text-2xl text-primary font-semibold">Our Objectives</h3>
                    <ul className="space-y-3 text-sm sm:text-base text-muted-foreground">
                      {[
                        "To begin living in awareness",
                        "Power of Satsang to keep you persistent",
                        "Purging, releasing & cleansing the inner-core",
                        "Breakdown of all beliefs, concepts, conditioning",
                        "Begin living as divine presence, not the body",
                        "Begin the process of knowing who you are",
                        "Meditate on deeper wisdom of higher scriptures",
                        "Annihilating all doership, living in divine flow"
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="text-primary font-bold">•</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* VIEW DYNAMIC BRANCH CONDITIONALS: JAKE LIGHT                              */}
          {/* ========================================================================= */}
          {activeTab === "jake" && (
  <section className="section-even pt-32 pb-20 bg-white">
    <div className="sia-container space-y-16">
      
      {/* --- PHASE 1: CORE PROFILE GRID --- */}
      <div className="grid gap-12 lg:grid-cols-12 items-center">
        
        {/* Left Column: Portrait & Languages */}
        <div className="lg:col-span-5 space-y-6 max-w-md mx-auto lg:max-w-none w-full">
          <div className="overflow-hidden rounded-3xl border border-gold/60 p-2 bg-white shadow-soft">
            <img
              src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/jP.jpg"
              alt="Jake Light"
              className="aspect-[4/5] w-full object-cover rounded-2xl"
              width={1024}
              height={1280}
              loading="lazy"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['English', 'Hindi', 'Malayalam', 'Marathi', 'Kannada'].map((lang) => (
              <span key={lang} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/10">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Introduction */}
        <div className="lg:col-span-7 space-y-6 sia-body text-base sm:text-lg leading-relaxed">
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2D1A4A] font-bold">Jake Light</h2>
          <p className="italic text-xl text-[var(--color-gold-deep)] font-medium">
            "It all began with exploration of the inner self!"
          </p>
          
          <p className="sia-body text-muted-foreground text-xl">
            Jake Light is an Inner Journey Coach, helping seekers in their inward journey, helping them navigate through life without forgetting their main goal of life. He has been a wanderer, having travelled extensively to multiple remote locations in India, including forests, mountains, caves, Siddha locations and spent decades meditating at Jeeva Samadhis, meeting innumerable saints, mystics and enlightened masters throughout his life.
          </p>
          
          <p className="sia-body text-muted-foreground text-xl">
            Firmly surrendered to the natural flow of life, he follows the pathless path – the middle path – and teaches others through his own life experiences. He has a deep insight into all the deep scriptures of every religion and professes the same through practical examples. He believes in living a simple life of meaningful existence, deeply emphasizing always that spirituality is very simple but we complicate it.
          </p>
          
          <div className="p-5 rounded-2xl bg-primary/5 border-l-4 border-primary text-primary font-medium italic my-6 shadow-sm text-xl">
            "He has a no-nonsense approach towards inner evolution, without clinging to the endless philosophies, methodologies and props of religion, cults, traditions and spirituality."
          </div>

          <p className="sia-body text-muted-foreground text-xl">
            His presence is elevating – be it in online events, personal sessions or physical retreats. One can easily shift into deep awareness in his presence, practices and teachings. His prime focus is to help everyone turn within and realize that there is nothing really to do or run behind, for their true liberated nature itself is pure and free.
          </p>
        </div>
      </div>

      {/* --- PHASE 2: IN-DEPTH JOURNEY (Centered Readable Column) --- */}
      <div className="max-w-3xl mx-auto pt-12 border-t border-border/60 space-y-8 sia-body text-base sm:text-lg leading-relaxed">
        <h3 className="text-3xl font-serif text-center text-[#2D1A4A] font-bold mb-8">
          Know More About Jake
        </h3>
        
        <p className="sia-body text-muted-foreground text-xl">
          Jake was born in a Roman Catholic family and since childhood loved Christ but could not relate with any Orthodox things. Always aloof and in his own world, something always told him that there is a larger existence and meaning to life. This whole life was a search and exploration of the same.
        </p>
        <p className="sia-body text-muted-foreground text-xl">
          Music and poetry naturally flowed out of him, and his passions were filled with life and creativity. Sufferings were immense in every stage of life, which once, in adulthood went to the extreme of devastating him to the point where alcohol and cigarettes badly gripped him. Through those moments of despair, some grace shined upon him when accidentally a book fell into his hands that led him to set out for exploring and finding his own truth.
        </p>
        <p className="sia-body text-muted-foreground text-xl">
          He found himself being led to the Mahasamadhi of a great Mystic named Nityananda, in Ganeshpuri, after which his whole life and perspective changed 180 degrees. From there (2008) till now, ‘That One’ led him to many places, mystics and Masters. 
        </p>

        {/* --- 🖼️ NEW RESPONSIVE IMAGE GRID --- */}
        {/* Mobile: 1 column (stacked), smaller gaps & radii. PC: 2 columns, larger gaps & radii. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 my-10 sm:my-14">
          <div className="group w-full aspect-square overflow-hidden rounded-2xl sm:rounded-3xl border border-[#600694]/10 shadow-lg">
            {/* Replace `image1` with your actual imported image variable */}
            <img
              src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/j1.jpeg"
              alt="Jake's Journey 1"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div className="group w-full aspect-square overflow-hidden rounded-2xl sm:rounded-3xl border border-[#600694]/10 shadow-lg">
            {/* Replace `image2` with your actual imported image variable */}
            <img
              src="https://pub-6daec8e7d55e44cda2c702f6f7b08759.r2.dev/sia-assets/j2.jpeg"
              alt="Jake's Journey 2"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>
        {/* ------------------------------------- */}

        <p className="sia-body text-muted-foreground text-xl">
          One of his closest Masters was Shri. Avadhoot Shivanand, from whom he received initiation into the path of Kundalini and the nondualist practices of Sri Vidya. But above all these practices what he cherished the most always, and even now, is the love and grace of his Master. He had the blessing of living with and serving his master for close to 7 years. At that time, he was quite popularly known as Jacob Shivanand, as he associated his second name to the identity-less name of his Guru. Later, in order to dissolve another identity created with the name, he dissolved these identities by preferring to use the name ‘Jake Light’ (Jake being the short-form of Jacob and Light symbolizing the child of Light).
        </p>
        <p className="sia-body text-muted-foreground text-xl">
          He prefers walking the path alone without any identities and hence prefers not to use anything that identifies with anyone or anything. The love and grace of his Master has been profound, due to which he was able to spread the divine love and light to those who eagerly sought for it.
        </p>
        <p className="sia-body text-muted-foreground text-xl">
          He was also blessed to have physical presence and blessings of 11 Avadhuts in his lifetime. This whole life revolved only around the great mystics and their hardcore practical teachings. At a certain point in time, deep wisdom began flowing out of him which eventually he realized were all coming from the truths encoded in the scriptures across all religions. He had multiple enlightening awakenings in Arunachala, Tiruvannamalai after which he spontaneously began sharing the wisdom with those seekers who longed for nothing other than the truth.
        </p>
        <p className="sia-body text-muted-foreground text-xl">
          He is grounded to his living experience as a human and likes to live life very practically without adorning any garb or titles in spirituality. He uses this website as the platform to reach out to those who are seeking illumination, ultimate peace and freedom from the pangs of birth & death cycle.
        </p>
      </div>

      {/* --- PHASE 3: VIDEO PODCAST --- */}
      <div className="border border-border rounded-3xl p-6 sm:p-10 bg-card max-w-4xl mx-auto space-y-6 text-center shadow-soft pt-12">
        <div className="space-y-1">
          <h4 className="font-serif text-2xl text-primary font-bold">Video Podcast Interview</h4>
          <p className="text-sm text-muted-foreground">This video podcast where Sukhdev Virdee interviewed him gives some insights into his life transitions.</p>
        </div>
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-border">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/8lwHB1X1PG0" 
            title="Jake Light Interview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        </div>
      </div>

    </div>
  </section>
)}

          {/* ========================================================================= */}
          {/* VIEW DYNAMIC BRANCH CONDITIONALS: OUR MISSION & SIGN UP                   */}
          {/* ========================================================================= */}
          {activeTab === "mission" && (
            <section className="section-odd pt-32 pb-20 bg-[var(--color-cream)]">
              <div className="sia-container space-y-16">
                <div className="space-y-6 text-center max-w-3xl mx-auto">
                  <h1 className="sia-h1 text-[#600694]">Our Mission</h1>
                  <p className="text-xl italic text-[var(--color-gold-deep)] font-medium">
                    "The shift sought outside is already complete within."
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-3xl text-primary font-bold text-center">The Phases of Awareness</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 pt-4">
                    {[
                      { step: "Phase 1", title: "Awakening & Clarity", desc: "Questioning the experiences, meaning, and true purpose of life." },
                      { step: "Phase 2", title: "Reflection on the Real", desc: "Clarifying doubts through authenticated scriptures and realized masters." },
                      { step: "Phase 3", title: "Destruction of Concepts", desc: "Purging out unwanted clutter and mind projections built up over lifetimes." },
                      { step: "Phase 4", title: "In the World, Not of It", desc: "Certainty that liberation comes from living out of true presence, not ego." },
                      { step: "Phase 5", title: "Abiding in the Self", desc: "Pure grace absorbs the soul back into the Source. Active doing stops; pure being remains." }
                    ].map((p, i) => (
                      <div key={i} className="sia-card space-y-3 border-t-4 border-primary/40 bg-white p-6 rounded-2xl shadow-soft">
                        <span className="text-[11px] font-black tracking-widest text-primary uppercase block">{p.step}</span>
                        <h4 className="font-serif text-base font-bold text-foreground leading-tight">{p.title}</h4>
                        <p className="text-muted-foreground text-xs leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-3xl mx-auto border border-border bg-white rounded-3xl p-6 sm:p-12 shadow-soft space-y-8">
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-primary">WhatsApp Broadcast Request List</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Request access to private live sessions</p>
                  </div>
                  
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name *" required className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                      <input type="number" placeholder="Age *" required className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                      <input type="email" placeholder="Email Address *" required className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                      <input type="text" placeholder="City & State *" required className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Current Spiritual Practice *</label>
                      <textarea rows={3} required placeholder="Describe your background..." className="w-full p-4 rounded-xl border border-border bg-background outline-none focus:border-primary resize-none" />
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                        <Info className="h-4 w-4" /> Membership Agreement Note
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        New seekers must complete the foundational basic entry path to establish consistent validation routines before joining late night sessions.
                      </p>
                      <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer pt-1">
                        <input type="checkbox" required className="accent-primary h-4 w-4" /> I understand and agree to the guidelines.
                      </label>
                    </div>

                    <button type="submit" className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all uppercase tracking-wider text-xs">
                      Submit and Request Access
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* VIEW DYNAMIC BRANCH CONDITIONALS: ACTIVITIES SUMMARY CARD MATRIX          */}
          {/* ========================================================================= */}
          {activeTab === "activities" && (
            <section className="section-even pt-32 pb-20 bg-white">
              <div className="sia-container space-y-16">
                <div className="text-center space-y-1 max-w-xl mx-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-deep)]">What We Offer</span>
                  <h1 className="sia-h1 text-[#600694]">Activities of the Sangha</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: Calendar, title: "Satsangs", text: "Private sessions conducted at 9 pm IST to keep you continually connected to your true core purpose." },
                    { icon: MonitorPlay, title: "Webinars", text: "Life-transformative online structured modules covering deep Purification and Ascension." },
                    { icon: Mountain, title: "Retreats", text: "Power-packed immersive transformations in high energetic hotspots like Tiruvannamalai." },
                    { icon: BookOpen, title: "Online Courses", text: "Recorded streaming archives covering higher scripts like the Avadhuta Gita and Shiva Sutras." }
                  ].map((act, i) => (
                    <article key={i} className="sia-card space-y-4 flex flex-col justify-between border border-border/60 p-6 rounded-2xl bg-card shadow-soft">
                      <div className="space-y-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <act.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-primary">{act.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{act.text}</p>
                      </div>
                      <Link to="/events" className="text-xs font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5 pt-2 hover:underline">
                        Explore →
                      </Link>
                    </article>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-card border border-border p-6 sm:p-10 rounded-3xl items-stretch shadow-soft">
                  <div className="space-y-3 p-2">
                    <div className="flex items-center gap-2 text-primary font-serif text-xl font-bold">
                      <MapPin className="h-5 w-5 shrink-0" /> Tiruvannamalai (Tamil Nadu)
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect cleanly with the pure structural transmission lines of holy Arunachala. Includes cave meditation and mindful walking routines to shift directly from doing to being.
                    </p>
                  </div>
                  <div className="space-y-3 p-2 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
                    <div className="flex items-center gap-2 text-primary font-serif text-xl font-bold">
                      <MapPin className="h-5 w-5 shrink-0" /> Kanhangad (Kerala)
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Immersive meditation configurations inside the 43 holy release spaces built by Bhagwan Nityananda. Focused entirely on deep emotional purging and inner static clutter cleanup.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

        </motion.div>
      </AnimatePresence>
      <LotusDivider />
    </AnimatedPage>
  );
}