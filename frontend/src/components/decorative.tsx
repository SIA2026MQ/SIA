import { cn } from "@/lib/utils";

interface DecorativeProps {
  className?: string;
  ariaHidden?: boolean;
}

/** Stylized lotus mark used throughout the site. */
export function Lotus({ className }: DecorativeProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("w-12 h-12", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 102c14-10 22-22 22-36 0-9-7-18-22-22-15 4-22 13-22 22 0 14 8 26 22 36Z" />
        <path d="M60 102c-2-18 6-32 22-44 6 4 10 12 8 22-3 14-15 22-30 22Z" opacity=".85" />
        <path d="M60 102c2-18-6-32-22-44-6 4-10 12-8 22 3 14 15 22 30 22Z" opacity=".85" />
        <path d="M60 102c10-14 28-22 48-22-2 12-12 22-26 24-9 1-16-1-22-2Z" opacity=".7" />
        <path d="M60 102c-10-14-28-22-48-22 2 12 12 22 26 24 9 1 16-1 22-2Z" opacity=".7" />
        <path d="M22 80c14 8 26 14 38 22 12-8 24-14 38-22" opacity=".5" />
      </g>
    </svg>
  );
}

/** Mandala overlay for parallax hero backgrounds. */
export function Mandala({ className }: DecorativeProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={cn("w-full h-full", className)}
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.8">
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i} transform={`rotate(${(i * 360) / 16} 300 300)`}>
            <path d="M300 60 C 340 180 340 420 300 540" opacity={0.5} />
            <circle cx="300" cy="120" r="6" />
            <circle cx="300" cy="180" r="3" />
          </g>
        ))}
        <circle cx="300" cy="300" r="220" />
        <circle cx="300" cy="300" r="160" />
        <circle cx="300" cy="300" r="100" />
        <circle cx="300" cy="300" r="40" />
      </g>
    </svg>
  );
}

/** Animated gold lotus divider between sections. */
export function LotusDivider({ className }: DecorativeProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4 my-16", className)} aria-hidden>
      <span className="h-px flex-1 max-w-[200px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-[var(--color-gold)]" />
      <Lotus className="w-8 h-8 text-[var(--color-gold)]" />
      <span className="h-px flex-1 max-w-[200px] bg-gradient-to-l from-transparent via-[var(--color-gold)] to-[var(--color-gold)]" />
    </div>
  );
}

/** A few drifting petals layered behind the hero. CSS-only. */
export function FloatingPetals() {
  const petals = [
    { left: "8%", delay: "0s", duration: "22s", size: 22 },
    { left: "24%", delay: "6s", duration: "28s", size: 18 },
    { left: "55%", delay: "3s", duration: "24s", size: 26 },
    { left: "78%", delay: "9s", duration: "30s", size: 20 },
    { left: "92%", delay: "12s", duration: "26s", size: 16 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          className="petal text-[var(--color-purple-light)]"
          style={{
            left: p.left,
            top: "-40px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.55,
          }}
        >
          <path
            d="M16 2c5 6 8 12 8 17a8 8 0 1 1-16 0c0-5 3-11 8-17Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}
