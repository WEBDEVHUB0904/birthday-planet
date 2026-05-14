import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";

interface StarsBackgroundProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

/**
 * Multi-layered starfield with soft depth parallax.
 *
 * Uses Drei's <Sparkles> exclusively (renders as round billboard sprites)
 * instead of <Stars> (which renders as square-ish points).
 *
 * Three depth zones with very gentle rotation and mouse response:
 *   ─ FAR  → barely moves, tiny dots
 *   ─ MID  → moderate, medium sparkles
 *   ─ NEAR → slightly more parallax, larger soft glows
 *
 * Rotation speeds are extremely slow to avoid any spinning feel.
 */
export const StarsBackground = ({ mouseRef }: StarsBackgroundProps) => {
  const farRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const nearRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    // ── Far layer — almost stationary, very gentle shift ───────
    if (farRef.current) {
      farRef.current.rotation.y += delta * 0.001; // barely perceptible
      farRef.current.position.x = THREE.MathUtils.lerp(
        farRef.current.position.x,
        mx * -0.15,
        delta * 0.4,
      );
      farRef.current.position.y = THREE.MathUtils.lerp(
        farRef.current.position.y,
        my * -0.1,
        delta * 0.4,
      );
    }

    // ── Mid layer — gentle drift ──────────────────────────────
    if (midRef.current) {
      midRef.current.rotation.y += delta * 0.002;
      midRef.current.position.x = THREE.MathUtils.lerp(
        midRef.current.position.x,
        mx * -0.5,
        delta * 0.6,
      );
      midRef.current.position.y = THREE.MathUtils.lerp(
        midRef.current.position.y,
        my * -0.35,
        delta * 0.6,
      );
    }

    // ── Near layer — moderate parallax ────────────────────────
    if (nearRef.current) {
      nearRef.current.rotation.y += delta * 0.003;
      nearRef.current.position.x = THREE.MathUtils.lerp(
        nearRef.current.position.x,
        mx * -1.0,
        delta * 0.8,
      );
      nearRef.current.position.y = THREE.MathUtils.lerp(
        nearRef.current.position.y,
        my * -0.6,
        delta * 0.8,
      );
    }
  });

  return (
    <>
      {/* ═══════════════ FAR LAYER ═══════════════════════════════ */}
      <group ref={farRef}>
        {/* Thousands of tiny round stars */}
        <Sparkles count={720} scale={140} size={1.1} speed={0.06} color="#c2c3e8" opacity={0.32} />
        <Sparkles count={520} scale={120} size={0.75} speed={0.04} color="#8f90c2" opacity={0.18} />
        {/* Faint warm-tint far field */}
        <Sparkles count={260} scale={160} size={0.55} speed={0.03} color="#c9b0df" opacity={0.14} />
        {/* Milky haze band */}
        <Sparkles count={380} scale={180} size={0.85} speed={0.025} color="#9b8ed9" opacity={0.1} />
      </group>

      {/* ═══════════════ MID LAYER ═══════════════════════════════ */}
      <group ref={midRef}>
        <Sparkles count={300} scale={60} size={2.1} speed={0.13} color="#c9b0ff" opacity={0.48} />
        <Sparkles count={180} scale={45} size={2.6} speed={0.1} color="#dfc8ff" opacity={0.38} />
        {/* Organic bobbing cluster */}
        <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.25}>
          <Sparkles count={80} scale={25} size={3.5} speed={0.1} color="#ff9cf5" opacity={0.35} />
        </Float>
      </group>

      {/* ═══════════════ NEAR LAYER ══════════════════════════════ */}
      <group ref={nearRef}>
        <Sparkles count={60} scale={20} size={4.8} speed={0.18} color="#e6d6ff" opacity={0.4} />
        <Float speed={0.5} rotationIntensity={0.04} floatIntensity={0.3}>
          <Sparkles count={36} scale={14} size={5.6} speed={0.14} color="#ffd1f5" opacity={0.28} />
        </Float>
        {/* Deep violet accent field */}
        <Float speed={0.2} rotationIntensity={0.02} floatIntensity={0.1}>
          <Sparkles count={60} scale={70} size={1.4} speed={0.05} color="#7e73ff" opacity={0.22} />
        </Float>
      </group>
    </>
  );
};
