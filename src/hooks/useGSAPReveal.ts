import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = {
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
};

export const useGSAPReveal = (
  scopeRef: React.RefObject<HTMLElement>,
  options: RevealOptions = {},
) => {
  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      const y = options.y ?? 40;
      const duration = options.duration ?? 1.2;
      const stagger = options.stagger ?? 0.14;
      const start = options.start ?? "top 80%";

      const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");
      groups.forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
        if (!items.length) return;

        gsap.fromTo(
          items,
          { y, opacity: 0, filter: "blur(4px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration,
            ease: "power3.out",
            stagger,
            scrollTrigger: {
              trigger: group,
              start,
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      const singles = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      singles.forEach((el) => {
        gsap.fromTo(
          el,
          { y, opacity: 0, filter: "blur(4px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [options.duration, options.stagger, options.start, options.y, scopeRef]);
};
