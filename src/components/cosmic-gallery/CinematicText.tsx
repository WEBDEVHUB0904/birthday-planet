import { useMemo, useRef } from "react";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";
import { AuroraText } from "@/components/ui/AuroraText";

export const CinematicText = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 36, duration: 1.6, stagger: 0.28 });

  const lines = useMemo(
    () => [
      "Some people",
      "leave fingerprints on your memory.",
      "You carry them quietly,",
      "long after the last conversation ends.",
    ],
    [],
  );

  const dust = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <section ref={sectionRef} className="cg-type">
      <div className="cg-type__mist" aria-hidden="true" />
      <div className="cg-type__text" data-reveal-group>
        {lines.map((line) => (
          <AuroraText key={line} as="span" className="cg-type__line" data-reveal-item>
            {line}
          </AuroraText>
        ))}
      </div>
      <div className="cg-type__dust" aria-hidden="true">
        {dust.map((d) => (
          <span
            key={d.id}
            className="cg-dust"
            style={{
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
};
