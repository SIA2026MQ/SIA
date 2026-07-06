import { useReveal } from "@/hooks/use-reveal";

const stages = [
  {
    phase: "1",
    title: "Awakening & Clarity",
    subtitle: "The Awakening",
    desc: "One awakens and seeks direction and clarity to doubts",
  },
  {
    phase: "2",
    title: "Reflection on the Real",
    subtitle: "The Learning",
    desc: "One reflects and begins relating wisdom with one's experiences",
  },
  {
    phase: "3",
    title: "Destruction of Concepts",
    subtitle: "The Purging",
    desc: "One begins practicing to remove all clutter and concepts",
  },
  {
    phase: "4",
    title: "In the world yet not of it",
    subtitle: "The Blooming",
    desc: "One begins living less in body consciousness & more in divine presence",
  },
  {
    phase: "5",
    title: "Abiding in the Self",
    subtitle: "The Liberation",
    desc: "Grace magnetically absorbs the soul back into the Source.",
  },
];

export function Stages() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="stages" ref={ref} className="py-20 md:py-28 bg-[#F7E7E7] relative overflow-hidden">
      
      {/* HEADING */}
      <div className="mx-auto max-w-7xl px-6 mb-16 text-center">
        <h2 className="reveal font-display text-2xl md:text-3xl lg:text-4xl uppercase tracking-wide sia-h2">
          The basic theme of shifting into awareness{" "}
          <span className="lowercase font-serif italic  sia-h2">
            ~ the phases of a seeker of liberation
          </span>
        </h2>
      </div>

      {/* 5-COLUMN LAYOUT */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12">
          {stages.map((s, i) => (
            <div 
              key={s.phase} 
              className="reveal flex flex-col items-center group cursor-pointer"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              
              {/* ENLARGED BLOOMING LOTUS GRAPHIC */}
              <div className="relative w-40 h-36 mb-6 mx-auto transition-all duration-500">
                
                {/* Outer Left Petal */}
                <div 
                  className="absolute w-12 h-12 bottom-4 left-4 bg-gradient-to-br from-[#e23da6] to-[#4A8DB7] rotate-0 group-hover:-translate-x-4 group-hover:translate-y-2 group-hover:-rotate-12 transition-all duration-500 shadow-sm z-10"
                  style={{ borderRadius: "0 50% 50% 50%" }}
                />
                
                {/* Outer Right Petal */}
                <div 
                  className="absolute w-12 h-12 bottom-4 right-4 bg-gradient-to-br  from-[#e23da6] to-[#2191d6] rotate-90 group-hover:translate-x-4 group-hover:translate-y-2 group-hover:rotate-[102deg] transition-all duration-500 shadow-sm z-10"
                  style={{ borderRadius: "0 50% 50% 50%" }}
                />
                
                {/* Inner Left Petal */}
                <div 
                  className="absolute w-16 h-16 bottom-2 left-6 bg-gradient-to-br  from-[#e23da6] to-[#2191d6] rotate-[20deg] group-hover:-translate-x-3 group-hover:-translate-y-1 group-hover:rotate-[10deg] transition-all duration-500 shadow-md z-20"
                  style={{ borderRadius: "0 50% 50% 50%" }}
                />
                
                {/* Inner Right Petal */}
                <div 
                  className="absolute w-16 h-16 bottom-2 right-6 bg-gradient-to-br  from-[#e23da6] to-[#2191d6] rotate-[70deg] group-hover:translate-x-3 group-hover:-translate-y-1 group-hover:rotate-[80deg] transition-all duration-500 shadow-md z-20"
                  style={{ borderRadius: "0 50% 50% 50%" }}
                />
                
                {/* Center Petal */}
                <div 
                  className="absolute w-20 h-20 bottom-0 left-1/2 -ml-10 bg-gradient-to-br from-[#e23da6] to-[#2191d6] rotate-45 group-hover:-translate-y-3 group-hover:scale-110 transition-all duration-500 shadow-lg z-30"
                  style={{ borderRadius: "0 50% 50% 50%" }}
                />

                {/* Text inside Center Petal */}
                <div className="absolute inset-x-0 bottom-5 z-40 flex flex-col items-center pointer-events-none transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-105">
                  <span className="text-[10px] font-bold tracking-widest text-white drop-shadow-sm">PHASE</span>
                  <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">{s.phase}</span>
                </div>

              </div>
              
              {/* Main Title */}
              <h3 className="font-display text-center text-[17px] uppercase tracking-wider text-foreground h-12 flex items-end justify-center transition-colors group-hover:text-[#4B1D52]">
                {s.title}
              </h3>
              
              {/* Subtitle (Grey Box) */}
              <div className="w-full bg-[#f4f4f4] text-center py-1.5 mt-4 mb-5 transition-colors group-hover:bg-[#f0e8f2]">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium group-hover:text-[#4B1D52] transition-colors">
                  {s.subtitle}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-center text-[15px] text-muted-foreground leading-relaxed px-2 flex-grow">
                {s.desc}
              </p>
              
              {/* Call to Action Line */}
              <div className="w-full mt-8 pt-4 border-t-[3px] border-[#4B1D52] transition-all duration-500 group-hover:border-[#C45E9F]">
                <a 
                  href="/stages" 
                  className="block text-center text-xs font-bold uppercase tracking-widest text-[#4B1D52] transition-colors group-hover:text-[#C45E9F]"
                >
                  Know More
                </a>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}