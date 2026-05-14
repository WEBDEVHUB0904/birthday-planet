import { useMemo, useRef } from "react";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";

interface EmotionalBreatherProps {
  line: string;
  subline?: string;
  annotation?: string;
}

export const EmotionalBreather = ({ line, subline, annotation }: EmotionalBreatherProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 40, duration: 1.6, stagger: 0.2 });

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 6,
        opacity: 0.15 + Math.random() * 0.25,
      })),
    [],
  );

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
