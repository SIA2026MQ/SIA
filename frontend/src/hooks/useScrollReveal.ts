import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(selector = ".reveal-on-scroll") {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const elements = gsap.utils.toArray<HTMLElement>(selector);
    const context = gsap.context(() => {
      const animations: gsap.core.Tween[] = [];

      elements.forEach((element, index) => {
        animations.push(
          gsap.fromTo(
            element,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.03,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true,
              },
            },
          ),
        );
      });
    });

    return () => {
      context.revert();
    };
  }, [selector]);
}
