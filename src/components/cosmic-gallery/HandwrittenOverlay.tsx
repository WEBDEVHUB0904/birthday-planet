import { useMemo, useRef } from "react";
import { useGSAPReveal } from "@/hooks/useGSAPReveal";

interface Fragment {
  text: string;
  position: "left" | "right" | "center";
  delay?: number;
}

interface HandwrittenOverlayProps {
  fragments: Fragment[];
}

/**
 * Subtle handwritten emotional annotations that drift across sections.
 * Styled as diary marginalia — quiet, fading, restrained.
 */
export const HandwrittenOverlay = ({ fragments }: HandwrittenOverlayProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  useGSAPReveal(sectionRef, { y: 20, duration: 2.0, stagger: 0.4 });

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 8,
        opacity: 0.08 + Math.random() * 0.12,
      })),
    [],
  );

  return (
    <section ref={sectionRef} className="cg-handwritten-section">
      <div className="cg-handwritten-section__fog" aria-hidden="true" />
      <div className="cg-handwritten-section__content" data-reveal-group>
        {fragments.map((frag, i) => (
          <span
            key={i}
            className={`cg-handwritten cg-handwritten--${frag.position}`}
            data-reveal-item
            style={{ animationDelay: `${frag.delay ?? i * 0.6}s` }}
          >
            {frag.text}
          </span>
        ))}
      </div>
      <div className="cg-handwritten-section__dust" aria-hidden="true">
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
