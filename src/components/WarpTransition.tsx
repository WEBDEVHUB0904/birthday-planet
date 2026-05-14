import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

interface WarpTransitionProps {
  onComplete: () => void;
}

const STAR_COUNT = 180;
const ENTER_DURATION = 700; // ms
const WARP_DURATION = 2500; // ms
const ARRIVE_DURATION = 1000; // ms
const TOTAL_DURATION = ENTER_DURATION + WARP_DURATION + ARRIVE_DURATION;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Cinematic "warp into the universe" transition.
 *
 * Renders a full-screen CSS-only starfield that accelerates
 * from gentle drift → streak → stretch, creating a sense of
 * traveling forward through space. Fully CSS-driven for
 * performance — no canvas or WebGL overhead.
 */
export const WarpTransition = ({ onComplete }: WarpTransitionProps) => {
  const [phase, setPhase] = useState<"enter" | "warp" | "arrive">("enter");
  const containerRef = useRef<HTMLDivElement>(null);
  const starElsRef = useRef<HTMLSpanElement[]>([]);
  const phaseRef = useRef<"enter" | "warp" | "arrive">("enter");
  const timeRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completeRef = useRef(false);
  const viewportRef = useRef({ w: 1, h: 1 });

  // Build stable random star data once
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const r = Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        return {
          id: i,
          x: Math.cos(a) * r,
          y: Math.sin(a) * r,
          z: 0.35 + Math.random() * 1.25,
          size: 0.8 + Math.random() * 2.2,
          speed: 0.6 + Math.random() * 1.6,
          brightness: 0.45 + Math.random() * 0.55,
          twinkle: Math.random() * Math.PI * 2,
          drift: 0.6 + Math.random() * 1.4,
        };
      }),
    [],
  );

  useEffect(() => {
    const updateViewport = () => {
      viewportRef.current = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    };

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const animate = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }

      const deltaMs = now - lastTimeRef.current;
      const delta = clamp(deltaMs / 1000, 0, 0.05);
      lastTimeRef.current = now;
      timeRef.current += deltaMs;

      const t = timeRef.current;
      const enterT = clamp(t / ENTER_DURATION, 0, 1);
      const warpT = clamp((t - ENTER_DURATION) / WARP_DURATION, 0, 1);
      const arriveT = clamp((t - ENTER_DURATION - WARP_DURATION) / ARRIVE_DURATION, 0, 1);

      let nextPhase: "enter" | "warp" | "arrive" = "enter";
      if (t >= ENTER_DURATION + WARP_DURATION) {
        nextPhase = "arrive";
      } else if (t >= ENTER_DURATION) {
        nextPhase = "warp";
      }

      if (phaseRef.current !== nextPhase) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      const speedEnter = lerp(0.35, 1.3, easeInOutCubic(enterT));
      const speedWarp = lerp(1.3, 6.8, easeInOutCubic(warpT));
      const speedArrive = lerp(6.8, 0.8, easeOutCubic(arriveT));

      const baseSpeed =
        t < ENTER_DURATION
          ? speedEnter
          : t < ENTER_DURATION + WARP_DURATION
            ? speedWarp
            : speedArrive;

      const warpIntensity = clamp((baseSpeed - 1.0) / 6.0, 0, 1);
      const arriveFade = clamp((t - ENTER_DURATION - WARP_DURATION) / ARRIVE_DURATION, 0, 1);

      if (containerRef.current) {
        containerRef.current.style.setProperty("--warp", warpIntensity.toFixed(3));
        containerRef.current.style.setProperty("--arrive", arriveFade.toFixed(3));
      }

      const { w, h } = viewportRef.current;
      const spread = 0.55;
      const depthMax = 1.6;
      const resetDepth = 1.55;

      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        const el = starElsRef.current[i];
        if (!el) continue;

        const depthFactor = 0.7 + (depthMax - star.z) * 0.45;
        star.z -= delta * baseSpeed * star.speed * depthFactor;

        if (star.z < 0.12) {
          const rr = Math.sqrt(Math.random());
          const aa = Math.random() * Math.PI * 2;
          star.x = Math.cos(aa) * rr;
          star.y = Math.sin(aa) * rr;
          star.z = resetDepth + Math.random() * 0.1;
          star.twinkle = Math.random() * Math.PI * 2;
        }

        const drift = Math.sin(now * 0.00025 * star.drift + star.twinkle) * 0.025;
        const dx = (star.x + drift) / star.z;
        const dy = (star.y + drift * 0.6) / star.z;

        const px = dx * w * spread;
        const py = dy * h * spread;
        const angle = Math.atan2(-py, -px) + Math.PI / 2;
        const depth = clamp(1 - star.z / depthMax, 0, 1);
        const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0012 + star.twinkle);
        const streakScale = lerp(0.18, 1.1 + depth * 2.8, warpIntensity);
        const opacity = clamp((0.35 + depth * 0.65) * twinkle * (1 - arriveFade), 0, 1);

        el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${angle}rad) scaleY(${streakScale})`;
        el.style.opacity = opacity.toFixed(3);
      }

      if (!completeRef.current && t >= TOTAL_DURATION) {
        completeRef.current = true;
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete, stars]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: "#020010",
        willChange: "opacity",
      }}
    >
      {/* ── Starfield ───────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          perspective: "700px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {stars.map((s) => {
          return (
            <span
              key={s.id}
              ref={(el) => {
                if (el) starElsRef.current[s.id] = el;
              }}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                width: `${s.size}px`,
                height: `${s.size * 8}px`,
                background: `linear-gradient(180deg, rgba(220,200,255,${s.brightness}) 0%, rgba(220,200,255,0) 100%)`,
                borderRadius: "999px",
                boxShadow: `0 0 ${s.size * 4}px rgba(190,170,255,0.35)`,
                transformOrigin: "50% 0%",
                willChange: "transform, opacity",
                opacity: 0,
              }}
            />
          );
        })}
      </div>

      {/* ── Central glow that intensifies during warp ────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(140,100,255,0.15) 0%, transparent 60%)",
          opacity: "calc(0.15 + var(--warp, 0) * 0.55)",
          transition: "opacity 0.4s ease-out",
        }}
      />

      {/* ── Nebula fog + atmospheric depth ───────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 70% 35%, rgba(110,70,220,0.28), transparent 65%), radial-gradient(ellipse 45% 35% at 20% 70%, rgba(220,120,200,0.22), transparent 70%), radial-gradient(ellipse 40% 30% at 50% 85%, rgba(80,120,220,0.2), transparent 70%)",
          opacity: "calc(0.28 + var(--warp, 0) * 0.35)",
          mixBlendMode: "screen",
          transition: "opacity 0.5s ease-out",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(4,2,18,0.0) 45%, rgba(2,0,16,0.85) 100%)",
          opacity: "calc(0.85 + var(--arrive, 0) * 0.1)",
        }}
      />

      {/* ── Speed lines (side streaks during warp) ──────────── */}
      {(phase === "warp" || phase === "arrive") && (
        <>
          <div
            className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
            style={{
              background: "linear-gradient(90deg, rgba(120,80,220,0.18), transparent)",
              opacity: "calc(0.25 + var(--warp, 0) * 0.45)",
              transition: "opacity 0.4s ease-out",
            }}
          />
          <div
            className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
            style={{
              background: "linear-gradient(-90deg, rgba(120,80,220,0.18), transparent)",
              opacity: "calc(0.25 + var(--warp, 0) * 0.45)",
              transition: "opacity 0.4s ease-out",
            }}
          />
        </>
      )}

      {/* ── Bright flash on arrival ──────────────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#e8e0ff" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "arrive" ? [0, 0.7, 0] : 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* ── Center text ─────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: phase === "arrive" ? 0 : [0, 1, 1],
          scale: phase === "warp" ? 0.95 : 1,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <motion.p
            className="text-xs md:text-sm tracking-[0.5em] uppercase"
            style={{ color: "rgba(196,160,255,0.6)" }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {phase === "enter" && "preparing your universe…"}
            {phase === "warp" && "traveling through space…"}
            {phase === "arrive" && "arriving…"}
          </motion.p>
        </div>
      </motion.div>

      {/* ── Bottom vignette ──────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,0,16,0.85) 100%)",
        }}
      />
    </motion.div>
  );
};
