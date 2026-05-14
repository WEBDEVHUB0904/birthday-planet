import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cinematic HTML overlay that sits on top of the 3D canvas.
 *
 * ─ Title reveal with staggered Framer Motion animations.
 * ─ Ambient corner labels (memory hub / infinite space).
 * ─ Subtle mouse-reactive parallax on all overlay elements.
 * ─ Vignette layers for atmospheric edge darkening.
 * ─ Breathing exploration prompt.
 */
export const HubOverlay = () => {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Fade-in after the canvas has had time to paint the first frames
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Track mouse for HTML parallax (smooth via CSS transition)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--mx", `${mouse.current.x}`);
        containerRef.current.style.setProperty("--my", `${mouse.current.y}`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={containerRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col overflow-hidden"
          style={{ "--mx": "0", "--my": "0" } as React.CSSProperties}
        >
          {/* ── Top title area ─────────────────────────────────── */}
          <motion.div
            className="flex flex-col items-center pt-16 md:pt-20"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            style={{
              transform: "translate3d(calc(var(--mx) * -8px), calc(var(--my) * -5px), 0)",
              transition: "transform 1.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <motion.p
              className="mb-4 text-xs md:text-sm tracking-[0.4em] uppercase"
              style={{ color: "rgba(196,160,255,0.65)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 1.2 }}
            >
              ✦ your memory universe ✦
            </motion.p>
            <h1
              className="font-display text-4xl md:text-6xl lg:text-7xl font-light italic text-center leading-tight"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(196,160,255,0.92) 35%, rgba(236,72,153,0.88) 65%, rgba(251,191,36,0.92) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                textShadow: "none",
              }}
            >
              A Universe of Us
            </h1>

            {/* Subtle shimmer line under title */}
            <motion.div
              className="mt-5 h-px w-40 md:w-56"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(196,160,255,0.4), rgba(236,72,153,0.3), transparent)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          {/* ── Spacer ────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Bottom area: exploration prompt ────────────────── */}
          <motion.div
            className="flex flex-col items-center pb-12 md:pb-16"
            initial={{ opacity: 0, scale: 0.985, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 2.0 }}
            style={{
              transform: "translate3d(calc(var(--mx) * -4px), calc(var(--my) * -3px), 0)",
              transition: "transform 2s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <motion.div
              className="mb-4 h-10 w-px"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))",
              }}
              animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <p
              className="text-[10px] md:text-xs tracking-[0.5em] uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              hover the orbs to explore
            </p>
          </motion.div>

          {/* ── Corner accent labels with parallax ────────────── */}
          <motion.div
            className="absolute top-8 left-8 md:top-12 md:left-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 2.8 }}
            style={{
              transform: "translate3d(calc(var(--mx) * -12px), calc(var(--my) * -8px), 0)",
              transition: "transform 2.2s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <p
              className="text-[9px] tracking-[0.4em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              memory hub
            </p>
          </motion.div>

          <motion.div
            className="absolute top-8 right-8 md:top-12 md:right-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 3.1 }}
            style={{
              transform: "translate3d(calc(var(--mx) * -14px), calc(var(--my) * -9px), 0)",
              transition: "transform 2.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <p
              className="text-[9px] tracking-[0.4em] uppercase text-right"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              ∞ infinite space
            </p>
          </motion.div>

          {/* ── Vignette overlays ─────────────────────────────── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(3,1,18,0.75) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-44 pointer-events-none"
            style={{
              background: "linear-gradient(to bottom, rgba(3,1,18,0.65) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-52 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(3,1,18,0.7) 0%, transparent 100%)",
            }}
          />

          {/* Subtle coloured edge glow for atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 20% 80%, rgba(124,58,237,0.08), transparent 60%), " +
                "radial-gradient(ellipse 60% 40% at 85% 20%, rgba(236,72,153,0.06), transparent 60%)",
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
