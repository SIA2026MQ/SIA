import { useEffect, useRef } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * GSAP ScrollTrigger reveal — fades + slides children of the returned ref
 * into view when their parent crosses 85% of the viewport.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
  selector?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<T | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduce) return;
    const el = ref.current;

    let cleanup: (() => void) | undefined;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const targets = options?.selector
        ? el.querySelectorAll<HTMLElement>(options.selector)
        : (Array.from(el.children) as HTMLElement[]);

      if (!targets.length) return;

      const tween = gsap.fromTo(
        targets,
        { opacity: 0, y: options?.y ?? 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: options?.stagger ?? 0.12,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => cleanup?.();
  }, [reduce, options?.selector, options?.stagger, options?.y]);

  return ref;
}
