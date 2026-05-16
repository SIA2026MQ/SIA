import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="btn-label text-[var(--color-gold)] mb-4"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[var(--color-purple)] leading-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-5 text-base sm:text-lg text-[var(--color-text-mid)] leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-purple)]"
      aria-hidden
    >
      
      
    </motion.div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  asChild?: boolean;
}

export function SiaButton({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 btn-label transition-all duration-300 hover:-translate-y-0.5";
  const styles = {
    primary: "bg-[var(--color-purple)] text-[var(--color-cream)] hover:bg-[var(--color-purple-light)] hover:shadow-glow",
    outline: "border-2 border-[var(--color-purple)] text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-[var(--color-cream)]",
    ghost: "text-[var(--color-purple)] hover:bg-[var(--color-purple-pale)]",
  } as const;
  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}
