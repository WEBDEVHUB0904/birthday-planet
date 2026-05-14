import { useEffect, useMemo, useRef } from "react";

/**
 * Persistent atmospheric overlay for the Cosmic Gallery.
 * Renders drifting glass shapes, light streaks, nebula blobs,
 * and particles as a fixed decorative layer.
 * CSS-only animation for performance. Mouse-reactive parallax.
 */
export const AtmosphereLayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── mouse parallax on atmosphere ──────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--ax", `${x}`);
      el.style.setProperty("--ay", `${y}`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const glassShapes = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: 15 + i * 18,
        left: 10 + ((i * 37) % 80),
        size: 60 + i * 30,
        duration: 20 + i * 6,
        delay: i * 3,
        opacity: 0.04 + (i % 3) * 0.02,
      })),
    [],
  );

  const lightStreaks = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        top: 20 + i * 30,
        rotation: -30 + i * 15,
        duration: 16 + i * 8,
        delay: i * 5,
        opacity: 0.03 + i * 0.01,
      })),
    [],
  );

  const floatingDots = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 12 + Math.random() * 16,
        delay: Math.random() * 10,
        opacity: 0.1 + Math.random() * 0.2,
      })),
    [],
  );

  const nebulaBlobs = useMemo(
    () => [
      {
        id: 0,
        top: "20%",
        left: "15%",
        size: 300,
        color: "rgba(140, 100, 220, 0.06)",
        duration: 45,
        delay: 0,
      },
      {
        id: 1,
        top: "60%",
        left: "70%",
        size: 250,
        color: "rgba(200, 140, 220, 0.05)",
        duration: 55,
        delay: -15,
      },
    ],
    [],
  );

  return (
    <div
      ref={containerRef}
      className="cg-atmosphere"
      aria-hidden="true"
      style={{ "--ax": "0", "--ay": "0" } as React.CSSProperties}
    >
      {/* nebula blobs — deep background atmosphere */}
      {nebulaBlobs.map((n) => (
        <span
          key={`nebula-${n.id}`}
          className="cg-atmo__nebula"
          style={{
            top: n.top,
            left: n.left,
            width: `${n.size}px`,
            height: `${n.size}px`,
            background: `radial-gradient(circle, ${n.color}, transparent 70%)`,
            animationDuration: `${n.duration}s`,
            animationDelay: `${n.delay}s`,
            transform: "translate3d(calc(var(--ax) * -20px), calc(var(--ay) * -16px), 0)",
            transition: "transform 2.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      ))}

      {/* glass shapes — midground */}
      {glassShapes.map((g) => (
        <span
          key={`glass-${g.id}`}
          className="cg-atmo__glass"
          style={{
            top: `${g.top}%`,
            left: `${g.left}%`,
            width: `${g.size}px`,
            height: `${g.size}px`,
            opacity: g.opacity,
            animationDuration: `${g.duration}s`,
            animationDelay: `${g.delay}s`,
          }}
        />
      ))}

      {/* light streaks — midground */}
      {lightStreaks.map((l) => (
        <span
          key={`streak-${l.id}`}
          className="cg-atmo__streak"
          style={{
            top: `${l.top}%`,
            transform: `rotate(${l.rotation}deg)`,
            opacity: l.opacity,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}

      {/* floating dots — foreground with parallax */}
      {floatingDots.map((d) => (
        <span
          key={`dot-${d.id}`}
          className="cg-atmo__dot"
          style={{
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            transform: `translate3d(calc(var(--ax) * ${-8 - d.id * 0.5}px), calc(var(--ay) * ${-6 - d.id * 0.4}px), 0)`,
            transition: "transform 2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      ))}
    </div>
  );
};
