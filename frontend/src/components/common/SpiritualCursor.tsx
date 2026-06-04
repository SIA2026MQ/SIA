import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function SpiritualCursor() {
  const isLarge = useMediaQuery("(min-width: 1024px)");
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLarge) return;

    let raf = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };

    const onMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate3d(${target.x - 10}px, ${target.y - 10}px, 0)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${current.x - 3}px, ${current.y - 3}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [isLarge]);

  if (!isLarge) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-5 w-5 rounded-full border border-primary/70 transition-transform"
      />
      <div
        ref={innerRef}
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-primary"
      />
    </>
  );
}
