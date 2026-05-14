import { useEffect, useMemo, useRef } from "react";

interface GalaxyBackgroundProps {
  density?: "hero" | "section";
  className?: string;
}

export const GalaxyBackground = ({ density = "section", className }: GalaxyBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starCount = density === "hero" ? 90 : 60;
  const particleCount = density === "hero" ? 36 : 20;

  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 0.6 + Math.random() * 1.6,
        opacity: 0.3 + Math.random() * 0.6,
        twinkle: 3 + Math.random() * 7,
        delay: Math.random() * 6,
      })),
    [starCount],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        drift: 16 + Math.random() * 20,
        delay: Math.random() * 6,
        opacity: 0.12 + Math.random() * 0.25,
      })),
    [particleCount],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--gx", `${x}`);
      el.style.setProperty("--gy", `${y}`);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`galaxy-bg galaxy-bg--${density}${className ? ` ${className}` : ""}`}
    >
      <div className="galaxy-bg__base" aria-hidden="true" />
      <div className="galaxy-bg__nebula" aria-hidden="true" />
      <div className="galaxy-bg__aurora" aria-hidden="true" />
      <div className="galaxy-bg__stars" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className="galaxy-star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: `${s.twinkle}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="galaxy-bg__particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="galaxy-particle"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.drift}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="galaxy-bg__vignette" aria-hidden="true" />
      <div className="galaxy-bg__grain" aria-hidden="true" />
    </div>
  );
};
