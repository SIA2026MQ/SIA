import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

let lenisInstance: Lenis | null = null;
let rafId = 0;
let subscribers = 0;

export function useSmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    subscribers += 1;
    if (!lenisInstance) {
      lenisInstance = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
    }

    const raf = (time: number) => {
      lenisInstance?.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    if (!rafId) {
      rafId = requestAnimationFrame(raf);
    }

    return () => {
      subscribers -= 1;
      if (subscribers <= 0) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        lenisInstance?.destroy();
        lenisInstance = null;
      }
    };
  }, []);
}
