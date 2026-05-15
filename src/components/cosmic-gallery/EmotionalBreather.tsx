// import { useMemo, useRef } from "react";
// import { useGSAPReveal } from "@/hooks/useGSAPReveal";

// interface EmotionalBreatherProps {
//   line: string;
//   subline?: string;
//   annotation?: string;
// }

// export const EmotionalBreather = ({ line, subline, annotation }: EmotionalBreatherProps) => {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   useGSAPReveal(sectionRef, { y: 40, duration: 1.6, stagger: 0.2 });

//   const particles = useMemo(
//     () =>
//       Array.from({ length: 12 }, (_, i) => ({
//         id: i,
//         top: Math.random() * 100,
//         left: Math.random() * 100,
//         size: 1.5 + Math.random() * 2.5,
//         duration: 8 + Math.random() * 10,
//         delay: Math.random() * 6,
//         opacity: 0.15 + Math.random() * 0.25,
//       })),
//     [],
//   );

import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface EmotionalBreatherProps {
  line: string;
  subline?: string;
  annotation?: string;
}

export const EmotionalBreather = ({ line, subline, annotation }: EmotionalBreatherProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Main line — dramatic blur + scale entrance
      gsap.fromTo(".cg-breather__line",
        { y: 80, opacity: 0, scale: 0.92, filter: "blur(16px)" },
        {
          y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
          duration: 1.8, ease: "expo.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.fromTo(".cg-breather__subline",
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.3, ease: "power3.out", delay: 0.35,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.fromTo(".cg-breather__handwritten",
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0, duration: 1.2, ease: "power2.out", delay: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [subline, annotation]);

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.25,
    })), []);

  return (
    <section ref={sectionRef} className="cg-breather">
      <div className="cg-breather__glow" aria-hidden="true" />
      <div className="cg-breather__fog" aria-hidden="true" />
      <div className="cg-breather__content" data-reveal-group>
        <h2 className="cg-breather__line" data-reveal-item>
          {line}
        </h2>
        {subline && (
          <p className="cg-breather__subline" data-reveal-item>
            {subline}
          </p>
        )}
        {annotation && (
          <span className="cg-breather__handwritten" data-reveal-item>
            {annotation}
          </span>
        )}
      </div>
      <div className="cg-breather__dust" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="cg-dust"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
};
