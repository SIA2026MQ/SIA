import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Initializes Lenis smooth scroll once per app and bridges it to GSAP ScrollTrigger.
 * Disabled automatically when prefers-reduced-motion is set.
 */
export function useSmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || reduce) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Bridge to ScrollTrigger if present
    let cleanupScrollTrigger: (() => void) | undefined;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        const onScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onScroll);
        gsap.ticker.lagSmoothing(0);
        cleanupScrollTrigger = () => lenis.off("scroll", onScroll);
      } catch {
        /* ScrollTrigger optional */
      }
    })();

    return () => {
      cancelAnimationFrame(rafId);
      cleanupScrollTrigger?.();
      lenis.destroy();
    };
  }, [reduce]);
}
