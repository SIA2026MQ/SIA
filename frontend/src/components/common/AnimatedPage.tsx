import { motion } from "framer-motion";
import { pageTransition } from "@/utils/animations";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export function AnimatedPage({ children }: { children: React.ReactNode }) {
  useSmoothScroll();
  useScrollReveal();

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}
