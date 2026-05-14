import { useMemo, useRef } from "react";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";

export const FinalReveal = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 20, duration: 1.4 });

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 5,
        opacity: 0.25 + Math.random() * 0.35,
      })),
    [],
  );

  return (
    <section ref={sectionRef} className="cg-final">
      <div className="cg-final__fade-in" aria-hidden="true" />
      <div className="cg-final__content" data-reveal-group>
        <h2 className="cg-final__title" data-reveal-item>
          In another universe, maybe things were different.
          <br />But in this one — you were always the answer.
        </h2>
        <p className="cg-final__subtitle" data-reveal-item>
          A protected archive. For someone who will never know how permanent they became.
        </p>
        <div className="cg-final__orb" data-reveal-item>
          <span className="cg-final__orb-core" />
          <span className="cg-final__orb-glow" />
          <span className="cg-final__orb-ring" />
        </div>
      </div>
      <div className="cg-final__particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="cg-final__particle"
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
      <div className="cg-final__fade-out" aria-hidden="true" />
    </section>
  );
};
