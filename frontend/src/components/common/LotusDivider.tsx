import { motion } from "framer-motion";

export function LotusDivider() {
  return (
    <div className="lotus-divider" aria-hidden="true">
      <motion.svg
        width="180"
        height="24"
        viewBox="0 0 180 24"
        fill="none"
        initial={{ opacity: 0, scaleX: 0.8 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <path d="M4 12H66" stroke="currentColor" strokeWidth="1.4" />
        <path d="M114 12H176" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M90 4C94.8 4 98.8 7.4 100 12C98.8 16.6 94.8 20 90 20C85.2 20 81.2 16.6 80 12C81.2 7.4 85.2 4 90 4Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M90 8L92 12L90 16L88 12L90 8Z" fill="currentColor" />
      </motion.svg>
    </div>
  );
}
