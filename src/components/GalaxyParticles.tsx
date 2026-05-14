import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const SPIRAL_COUNT = 1800;
const DUST_COUNT = 900;
const TWINKLE_COUNT = 320;

interface GalaxyParticlesProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

/* ------------------------------------------------------------------ */
/*  Round particle texture (generated once via canvas)                  */
/* ------------------------------------------------------------------ */

function createRoundTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.6)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.15)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Data builders                                                       */
/* ------------------------------------------------------------------ */

function buildSpiralData(count: number) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const purpleBase = new THREE.Color("#8b5cf6");
  const pinkBase = new THREE.Color("#ec4899");
  const blueBase = new THREE.Color("#6366f1");
  const cyanBase = new THREE.Color("#22d3ee");

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = i / count;
    const angle = t * Math.PI * 10 + (Math.random() - 0.5) * 0.25;
    const radius = 2 + Math.pow(t, 0.7) * 26 + (Math.random() - 0.5) * 1.6;
    const armOffset = (Math.random() - 0.5) * 4;

    pos[i3] = Math.cos(angle) * radius + armOffset;
    pos[i3 + 1] = (Math.random() - 0.5) * 4.2;
    pos[i3 + 2] = Math.sin(angle) * radius + armOffset;

    const r = Math.random();
    const base = r < 0.35 ? purpleBase : r < 0.55 ? pinkBase : r < 0.8 ? blueBase : cyanBase;
    col[i3] = base.r + (Math.random() - 0.5) * 0.1;
    col[i3 + 1] = base.g + (Math.random() - 0.5) * 0.1;
    col[i3 + 2] = base.b + (Math.random() - 0.5) * 0.1;
  }
  return { positions: pos, colors: col };
}

function buildDustData(count: number) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.sqrt(Math.random()) * 40;
    const a = Math.random() * Math.PI * 2;
    pos[i3] = Math.cos(a) * r;
    pos[i3 + 1] = (Math.random() - 0.5) * 12;
    pos[i3 + 2] = Math.sin(a) * r;

    const warmth = 0.65 + Math.random() * 0.35;
    col[i3] = warmth;
    col[i3 + 1] = warmth * 0.82;
    col[i3 + 2] = warmth * 0.95;
  }
  return { positions: pos, colors: col };
}

function buildTwinkleData(count: number) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.sqrt(Math.random()) * 45;
    const a = Math.random() * Math.PI * 2;
    pos[i3] = Math.cos(a) * r;
    pos[i3 + 1] = (Math.random() - 0.5) * 16;
    pos[i3 + 2] = Math.sin(a) * r - 10;

    col[i3] = 0.9 + Math.random() * 0.1;
    col[i3 + 1] = 0.85 + Math.random() * 0.15;
    col[i3 + 2] = 1.0;

    phases[i] = Math.random() * Math.PI * 2;
  }
  return { positions: pos, colors: col, phases };
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export const GalaxyParticles = ({ mouseRef }: GalaxyParticlesProps) => {
  const spiralRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const twinkleRef = useRef<THREE.Points>(null);

  const roundTex = useMemo(() => createRoundTexture(), []);
  const spiral = useMemo(() => buildSpiralData(SPIRAL_COUNT), []);
  const dust = useMemo(() => buildDustData(DUST_COUNT), []);
  const twinkle = useMemo(() => buildTwinkleData(TWINKLE_COUNT), []);

  const twinkleBaseSizes = useMemo(() => {
    const s = new Float32Array(TWINKLE_COUNT);
    for (let i = 0; i < TWINKLE_COUNT; i++) {
      s[i] = 0.07 + Math.random() * 0.12;
    }
    return s;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    // ── Spiral — very gentle rotation ────────────────────────
    if (spiralRef.current) {
      spiralRef.current.rotation.y += delta * 0.003;
      spiralRef.current.position.x = THREE.MathUtils.lerp(
        spiralRef.current.position.x,
        mx * -0.4,
        delta * 0.5,
      );
      spiralRef.current.position.y = THREE.MathUtils.lerp(
        spiralRef.current.position.y,
        my * -0.25,
        delta * 0.5,
      );
    }

    // ── Dust — barely drifting ────────────────────────────────
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.001;
      dustRef.current.position.x = THREE.MathUtils.lerp(
        dustRef.current.position.x,
        mx * -0.2,
        delta * 0.3,
      );
      dustRef.current.position.y = THREE.MathUtils.lerp(
        dustRef.current.position.y,
        my * -0.12,
        delta * 0.3,
      );
    }

    // ── Twinkle — per-particle shimmer ───────────────────────
    if (twinkleRef.current) {
      twinkleRef.current.rotation.y += delta * 0.001;
      twinkleRef.current.position.x = THREE.MathUtils.lerp(
        twinkleRef.current.position.x,
        mx * -0.6,
        delta * 0.7,
      );
      twinkleRef.current.position.y = THREE.MathUtils.lerp(
        twinkleRef.current.position.y,
        my * -0.35,
        delta * 0.7,
      );

      const sizeAttr = twinkleRef.current.geometry.getAttribute("size");
      if (sizeAttr) {
        const arr = sizeAttr.array as Float32Array;
        for (let i = 0; i < TWINKLE_COUNT; i++) {
          const phase = twinkle.phases[i];
          const tw = Math.sin(t * (1.2 + phase * 0.2) + phase) * 0.5 + 0.5;
          arr[i] = twinkleBaseSizes[i] * (0.35 + tw * 0.65);
        }
        sizeAttr.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {/* ── Spiral arms (round particles) ──────────────────── */}
      <points ref={spiralRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={SPIRAL_COUNT}
            array={spiral.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={SPIRAL_COUNT}
            array={spiral.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={roundTex}
          size={0.17}
          vertexColors
          transparent
          opacity={0.62}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      {/* ── Cosmic dust (round, faint) ─────────────────────── */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={DUST_COUNT}
            array={dust.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={DUST_COUNT}
            array={dust.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={roundTex}
          size={0.09}
          vertexColors
          transparent
          opacity={0.28}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      {/* ── Twinkling points (round, bright) ───────────────── */}
      <points ref={twinkleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TWINKLE_COUNT}
            array={twinkle.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={TWINKLE_COUNT}
            array={twinkle.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={TWINKLE_COUNT}
            array={twinkleBaseSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          map={roundTex}
          size={0.15}
          vertexColors
          transparent
          opacity={0.78}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          alphaTest={0.01}
        />
      </points>
    </>
  );
};
