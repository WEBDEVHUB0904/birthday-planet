import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { MemoryWall } from "./MemoryWall";
import { MemoryPath } from "./MemoryPath";
import { MemoryModal } from "./MemoryModal";
import { useMemoryScroll } from "@/hooks/useMemoryScroll";
import type { MemoryDomeProps } from "@/types/memory";
import type { MemoryItem } from "@/types/memory";

/** SVG heart path for glass hearts */
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

interface GlassHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  blur: number;
  duration: number;
  delay: number;
  hue: number; // pink-purple range
}

/**
 * MemoryDome — Root orchestrator for the cinematic memory experience.
 *
 * Composes the concave memory wall, constellation paths, modal,
 * glass hearts atmosphere, floating particles, and nebula layers.
 */
export const MemoryDome = ({ onExit }: MemoryDomeProps) => {
  const [selected, setSelected] = useState<MemoryItem | null>(null);

  const scrollRef = useMemoryScroll({
    totalRange: 3000,
    sensitivity: 1.2,
    damping: 0.06,
    enabled: !selected,
  });

  const handleSelect = useCallback((memory: MemoryItem) => {
    setSelected(memory);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelected(null);
  }, []);

  // Floating particles
  const particles = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        duration: 15 + Math.random() * 25,
        delay: Math.random() * 10,
        opacity: 0.12 + Math.random() * 0.3,
      })),
    [],
  );

  // Glass hearts — subtle, dreamy, behind the wall
  const hearts = useMemo<GlassHeart[]>(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 5 + Math.random() * 85,
        size: 28 + Math.random() * 50,
        opacity: 0.04 + Math.random() * 0.06,
        rotation: Math.random() * 40 - 20,
        blur: 2 + Math.random() * 6,
        duration: 20 + Math.random() * 30,
        delay: Math.random() * 15,
        hue: 310 + Math.random() * 40, // pink-purple range
      })),
    [],
  );

  return (
    <div className="memory-dome">
      {/* ═══════════ BACKGROUND ATMOSPHERE ═══════════════════ */}

      {/* Deep space base */}
      <div className="memory-dome__bg-base" />

      {/* Nebula glow layers — enhanced */}
      <div className="memory-dome__nebula memory-dome__nebula--purple" />
      <div className="memory-dome__nebula memory-dome__nebula--pink" />
      <div className="memory-dome__nebula memory-dome__nebula--blue" />
      <div className="memory-dome__nebula memory-dome__nebula--deep" />

      {/* Depth fog — center glow */}
      <div className="memory-dome__depth-fog" />

      {/* Floating particles */}
      <div className="memory-dome__particles" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="memory-dome__particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ═══════════ GLASS HEARTS ═══════════════════ */}
      <div className="memory-dome__hearts" aria-hidden="true">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="memory-dome__heart"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              opacity: h.opacity,
              transform: `rotate(${h.rotation}deg)`,
              filter: `blur(${h.blur}px)`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`hg-${h.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={`hsl(${h.hue}, 80%, 80%)`} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={`hsl(${h.hue + 20}, 70%, 70%)`} stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <path
                d={HEART_PATH}
                fill={`url(#hg-${h.id})`}
                stroke={`hsl(${h.hue}, 60%, 85%)`}
                strokeWidth="0.3"
                strokeOpacity="0.3"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Vignette */}
      <div className="memory-dome__vignette" />

      {/* ═══════════ CONSTELLATION PATHS ═══════════════════ */}
      <MemoryPath />

      {/* ═══════════ CURVED MEMORY WALL ═══════════════════ */}
      <MemoryWall scrollRef={scrollRef} onSelect={handleSelect} />

      {/* ═══════════ TOP HEADER ═══════════════════ */}
      <motion.div
        className="memory-dome__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="memory-dome__header-label">✦ memory dome ✦</p>
        <h2 className="memory-dome__header-title">Our Story in Starlight</h2>
        <div className="memory-dome__header-line" />
      </motion.div>

      {/* ═══════════ SCROLL HINT ═══════════════════ */}
      <motion.div
        className="memory-dome__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        <div className="memory-dome__scroll-line" />
        <p className="memory-dome__scroll-text">scroll to journey through memories</p>
      </motion.div>

      {/* ═══════════ RETURN BUTTON ═══════════════════ */}
      <motion.button
        type="button"
        onClick={onExit}
        className="memory-dome__exit-btn"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        return to universe
      </motion.button>

      {/* ═══════════ MEMORY MODAL ═══════════════════ */}
      <MemoryModal memory={selected} onClose={handleCloseModal} />
    </div>
  );
};
