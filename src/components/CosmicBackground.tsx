import { useEffect, useMemo, useRef, useState } from "react";
import heroGalaxy from "@/assets/cosmic-hero.jpg";

export function CosmicBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const stars = useMemo(
    () =>
      Array.from({ length: 220 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.8 + 0.3,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 6,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    [],
  );

  const asteroids = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 12,
        duration: 18 + Math.random() * 24,
        depth: 0.2 + Math.random() * 0.8,
      })),
    [],
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        top: Math.random() * 60,
        left: Math.random() * 60,
        delay: i * 4 + Math.random() * 6,
        duration: 2.4 + Math.random() * 1.4,
      })),
    [],
  );

  // Parallax on mouse
  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      const el = layerRef.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--mx", `${x}`);
      el.style.setProperty("--my", `${y}`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.06 0.04 280) 0%, oklch(0.02 0.02 280) 100%)",
      }}
    >
      {/* Deep nebula gradient base */}
      <div className="absolute inset-0 bg-cosmic opacity-90" />

      {/* Hero galaxy image — slow drift + parallax */}
      <div
        className="absolute inset-[-8%] will-change-transform"
        style={{
          transform: "translate3d(calc(var(--mx, 0) * -14px), calc(var(--my, 0) * -14px), 0)",
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <img
          src={heroGalaxy}
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-[0.78] mix-blend-screen animate-drift-slow"
          style={{ filter: "saturate(1.15) contrast(1.05)" }}
        />
      </div>

      {/* Distant nebula veil */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 70% 30%, oklch(0.45 0.22 300 / 0.35), transparent 70%), radial-gradient(ellipse 50% 35% at 25% 70%, oklch(0.45 0.22 250 / 0.3), transparent 70%), radial-gradient(ellipse 45% 30% at 80% 80%, oklch(0.55 0.22 340 / 0.25), transparent 70%)",
        }}
      />

      {/* Twinkling stars */}
      <div
        className="absolute inset-0"
        style={{
          transform: "translate3d(calc(var(--mx, 0) * -6px), calc(var(--my, 0) * -6px), 0)",
          transition: "transform 1.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 4}px rgba(255,255,255,0.85)`,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating asteroid dust with parallax depth */}
      <div className="absolute inset-0">
        {asteroids.map((a) => (
          <span
            key={`a-${a.id}`}
            className="absolute rounded-full"
            style={{
              top: `${a.top}%`,
              left: `${a.left}%`,
              width: `${a.size}px`,
              height: `${a.size}px`,
              background: "oklch(0.65 0.05 280)",
              opacity: 0.4 + a.depth * 0.4,
              filter: `blur(${(1 - a.depth) * 2}px)`,
              boxShadow: "0 0 6px oklch(0.7 0.18 300 / 0.6)",
              transform: `translate3d(calc(var(--mx, 0) * ${a.depth * -28}px), calc(var(--my, 0) * ${a.depth * -28}px), 0)`,
              animation: `float ${a.duration}s ease-in-out ${a.delay}s infinite`,
              transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        {mounted &&
          shootingStars.map((s) => (
            <span
              key={`ss-${s.id}`}
              className="absolute h-px w-40 origin-left"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                background:
                  "linear-gradient(90deg, transparent, oklch(0.95 0.05 320 / 0.95), transparent)",
                filter: "drop-shadow(0 0 6px oklch(0.85 0.18 320))",
                transform: "rotate(18deg)",
                animation: `shoot ${s.duration}s ease-in ${s.delay}s infinite`,
                opacity: 0,
              }}
            />
          ))}
      </div>

      {/* Volumetric light bloom */}
      <div
        className="absolute inset-0 mix-blend-screen opacity-50"
        style={{
          background:
            "radial-gradient(circle at 65% 35%, oklch(0.85 0.15 300 / 0.35), transparent 45%), radial-gradient(circle at 30% 75%, oklch(0.7 0.18 250 / 0.25), transparent 50%)",
        }}
      />

      {/* Ambient fog */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-[oklch(0.05_0.04_290/0.9)] via-[oklch(0.05_0.04_290/0.4)] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-linear-to-b from-[oklch(0.03_0.02_280/0.7)] to-transparent" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,oklch(0.02_0.02_280/0.85)_100%)]" />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}
