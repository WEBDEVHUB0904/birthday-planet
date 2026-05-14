import { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Variant configurations                                             */
/* ------------------------------------------------------------------ */

type OrbVariant = "memoryPlanet" | "musicOrb" | "secretCrystal" | "finalStar";

interface VariantConfig {
  /** Planet surface base colour */
  surfaceColor: string;
  /** Darker shade for depth */
  surfaceDark: string;
  /** Emissive glow colour */
  emissive: string;
  emissiveIntensity: number;
  /** Atmosphere rim colour */
  atmosphereColor: string;
  /** Outer halo colour */
  haloColor: string;
  /** Secondary surface accent for clouds/bands */
  surfaceAccent: string;
  /** Ring glow color */
  ringColor: string;
  /** Sparkle color */
  sparkleColor: string;
  geometry: "sphere" | "octahedron" | "dodecahedron" | "icosahedron";
  scale: number;
  floatSpeed: number;
  floatIntensity: number;
  rotationSpeed: number;
  hasRing?: boolean;
  hasBands?: boolean;
  hasShards?: boolean;
  label: string;
  sublabel: string;
}

const VARIANTS: Record<OrbVariant, VariantConfig> = {
  memoryPlanet: {
    surfaceColor: "#6d28d9",
    surfaceDark: "#4c1d95",
    emissive: "#8b5cf6",
    emissiveIntensity: 0.6,
    atmosphereColor: "#c4b5fd",
    haloColor: "#a78bfa",
    surfaceAccent: "#f5b4ff",
    ringColor: "#d8c2ff",
    sparkleColor: "#ffd6ff",
    geometry: "sphere",
    scale: 1.0,
    floatSpeed: 0.8,
    floatIntensity: 0.4,
    rotationSpeed: 0.06,
    hasRing: true,
    label: "Memory Planet",
    sublabel: "open photo gallery",
  },
  musicOrb: {
    surfaceColor: "#4338ca",
    surfaceDark: "#312e81",
    emissive: "#818cf8",
    emissiveIntensity: 0.7,
    atmosphereColor: "#f9a8d4",
    haloColor: "#ec4899",
    surfaceAccent: "#8be9ff",
    ringColor: "#ffb3e7",
    sparkleColor: "#8be9ff",
    geometry: "icosahedron",
    scale: 0.85,
    floatSpeed: 1.0,
    floatIntensity: 0.5,
    rotationSpeed: 0.08,
    hasBands: true,
    label: "Music Orb",
    sublabel: "your favourite song",
  },
  secretCrystal: {
    surfaceColor: "#0369a1",
    surfaceDark: "#0c4a6e",
    emissive: "#38bdf8",
    emissiveIntensity: 0.5,
    atmosphereColor: "#7dd3fc",
    haloColor: "#38bdf8",
    surfaceAccent: "#38bdf8",
    ringColor: "#5eead4",
    sparkleColor: "#67e8f9",
    geometry: "octahedron",
    scale: 0.7,
    floatSpeed: 0.6,
    floatIntensity: 0.35,
    rotationSpeed: 0.1,
    hasShards: true,
    label: "Secret Crystal",
    sublabel: "hidden messages",
  },
  finalStar: {
    surfaceColor: "#b45309",
    surfaceDark: "#78350f",
    emissive: "#f59e0b",
    emissiveIntensity: 0.9,
    atmosphereColor: "#fde68a",
    haloColor: "#fbbf24",
    surfaceAccent: "#ffd6a3",
    ringColor: "#ffdf8a",
    sparkleColor: "#ffd1a8",
    geometry: "dodecahedron",
    scale: 1.1,
    floatSpeed: 0.4,
    floatIntensity: 0.3,
    rotationSpeed: 0.04,
    hasRing: true,
    label: "Final Star",
    sublabel: "the ending you deserve",
  },
};

/* ------------------------------------------------------------------ */
/*  Geometry helper                                                    */
/* ------------------------------------------------------------------ */

function OrbGeometry({ type }: { type: VariantConfig["geometry"] }) {
  switch (type) {
    case "octahedron":
      return <octahedronGeometry args={[1, 3]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[1, 2]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1, 3]} />;
    case "sphere":
    default:
      return <sphereGeometry args={[1, 64, 64]} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Atmosphere rim shader (Fresnel-like, no custom GLSL)               */
/*  We fake it with a slightly larger transparent sphere with          */
/*  a MeshBasicMaterial in additive blending.                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface FloatingOrbProps {
  variant: OrbVariant;
  position: [number, number, number];
  mouseRef: React.RefObject<{ x: number; y: number }>;
  onClick?: () => void;
}

export const FloatingOrb = ({ variant, position, mouseRef, onClick }: FloatingOrbProps) => {
  const cfg = VARIANTS[variant];
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const shardRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const scaleTarget = useRef(cfg.scale);
  const appearDelay = useMemo(
    () => 0.6 + Math.abs(position[2]) * 0.12 + Math.random() * 0.3,
    [position],
  );
  const appearDuration = 2.4;

  // Create a canvas-based gradient texture for richer surface
  const surfaceTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Radial gradient to simulate lighting/depth
    const grad = ctx.createRadialGradient(
      size * 0.35,
      size * 0.35,
      0,
      size * 0.5,
      size * 0.5,
      size * 0.55,
    );
    grad.addColorStop(0, cfg.surfaceAccent);
    grad.addColorStop(0.45, cfg.surfaceColor);
    grad.addColorStop(0.8, cfg.surfaceDark);
    grad.addColorStop(1, "#0a0118");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    if (cfg.hasBands) {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-0.35);
      ctx.translate(-size / 2, -size / 2);
      for (let i = 0; i < 5; i++) {
        const y = size * (0.18 + i * 0.13) + Math.sin(i) * 6;
        const bandGrad = ctx.createLinearGradient(0, y, size, y + 16);
        bandGrad.addColorStop(0, "rgba(0,0,0,0)");
        bandGrad.addColorStop(0.35, "rgba(255,255,255,0.18)");
        bandGrad.addColorStop(0.7, "rgba(255,255,255,0.05)");
        bandGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, y, size, 14);
      }
      ctx.restore();
    }

    // Add subtle noise/texture dots for surface detail
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 2;
      const alpha = Math.random() * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    if (variant === "memoryPlanet") {
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 2.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,255,${0.06 + Math.random() * 0.12})`;
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [cfg.surfaceAccent, cfg.surfaceColor, cfg.surfaceDark, cfg.hasBands, variant]);

  const cloudTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    for (let i = 0; i < 10; i++) {
      const x = size * (0.2 + Math.random() * 0.6);
      const y = size * (0.2 + Math.random() * 0.6);
      const r = size * (0.18 + Math.random() * 0.22);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,255,255,${0.14 + Math.random() * 0.1})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const orbiters = useMemo(
    () =>
      Array.from({ length: 8 }, () => {
        const r = 1.4 + Math.random() * 0.6;
        const a = Math.random() * Math.PI * 2;
        return {
          x: Math.cos(a) * r,
          y: (Math.random() - 0.5) * 0.5,
          z: Math.sin(a) * r,
          size: 0.04 + Math.random() * 0.06,
        };
      }),
    [],
  );

  const shards = useMemo(
    () =>
      Array.from({ length: 6 }, () => {
        const r = 1.6 + Math.random() * 0.6;
        const a = Math.random() * Math.PI * 2;
        return {
          x: Math.cos(a) * r,
          y: (Math.random() - 0.5) * 0.7,
          z: Math.sin(a) * r,
          scale: 0.12 + Math.random() * 0.16,
          rot: Math.random() * Math.PI * 2,
        };
      }),
    [],
  );

  const handlePointerEnter = useCallback(() => {
    setHovered(true);
    scaleTarget.current = cfg.scale * 1.15;
    document.body.style.cursor = "pointer";
  }, [cfg.scale]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    scaleTarget.current = cfg.scale;
    document.body.style.cursor = "auto";
  }, [cfg.scale]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    const appearT = THREE.MathUtils.clamp((t - appearDelay) / appearDuration, 0, 1);
    const appearEase = 1 - Math.pow(1 - appearT, 3);
    const appearScale = THREE.MathUtils.lerp(0.65, 1, appearEase);

    // ── Very slow rotation ──────────────────────────────────
    meshRef.current.rotation.y += delta * cfg.rotationSpeed;
    meshRef.current.rotation.x += delta * cfg.rotationSpeed * 0.15;

    // ── Smooth scale lerp ───────────────────────────────────
    const currentScale = meshRef.current.scale.x;
    const targetScale = scaleTarget.current * appearScale;
    const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2.5);
    meshRef.current.scale.setScalar(lerpedScale);

    // ── Magnetic response (subtle) ──────────────────────────
    if (groupRef.current) {
      const mag = hovered ? 0.35 : 0.08;
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        mx * mag,
        delta * 1.5,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        my * -mag * 0.4,
        delta * 1.5,
      );
    }

    // ── Atmosphere rim breathing ────────────────────────────
    if (atmosphereRef.current) {
      const breathe = Math.sin(t * 0.8 + position[0] * 2) * 0.04 + 1.08;
      const hoverBoost = hovered ? 1.12 : 1;
      atmosphereRef.current.scale.setScalar(breathe * hoverBoost);

      const mat = atmosphereRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = (0.18 + (hovered ? 0.1 : 0) + Math.sin(t * 1.2) * 0.03) * appearEase;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 3);
    }

    // ── Outer halo pulse ────────────────────────────────────
    if (haloRef.current) {
      const pulse = Math.sin(t * 0.5 + position[2]) * 0.06 + 1;
      const hoverBoost = hovered ? 1.2 : 1;
      haloRef.current.scale.setScalar(2.2 * pulse * hoverBoost);

      const mat = haloRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = (0.05 + (hovered ? 0.04 : 0) + Math.sin(t * 0.4) * 0.015) * appearEase;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 2);
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y -= delta * cfg.rotationSpeed * 0.4;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.12;
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.35;
      orbitRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }

    if (shardRef.current) {
      shardRef.current.rotation.y += delta * 0.28;
      shardRef.current.rotation.z += delta * 0.18;
    }
  });

  return (
    <Float
      speed={cfg.floatSpeed}
      rotationIntensity={0.06}
      floatIntensity={cfg.floatIntensity}
      position={position}
    >
      <group ref={groupRef}>
        {/* ── Planet surface ──────────────────────────────────── */}
        <mesh
          ref={meshRef}
          scale={cfg.scale}
          onClick={onClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <OrbGeometry type={cfg.geometry} />
          <meshStandardMaterial
            map={surfaceTexture}
            emissive={cfg.emissive}
            emissiveIntensity={cfg.emissiveIntensity}
            roughness={0.55}
            metalness={0.25}
            toneMapped={false}
          />
        </mesh>

        {/* ── Cloud sheen layer ─────────────────────────────── */}
        <mesh ref={cloudRef} scale={1.02}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial
            map={cloudTexture}
            transparent
            opacity={variant === "secretCrystal" ? 0.12 : 0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* ── Atmosphere rim (Fresnel-like glow around edges) ── */}
        <mesh ref={atmosphereRef} scale={1.08}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color={cfg.atmosphereColor}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            toneMapped={false}
          />
        </mesh>

        {/* ── Outer diffuse halo ──────────────────────────────── */}
        <mesh ref={haloRef} scale={2.2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={cfg.haloColor}
            transparent
            opacity={0.05}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* ── Glow ring (memory + final) ────────────────────── */}
        {cfg.hasRing && (
          <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]} scale={1.25}>
            <torusGeometry args={[1.05, 0.015, 16, 120]} />
            <meshBasicMaterial
              color={cfg.ringColor}
              transparent
              opacity={0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        )}

        {/* ── Orbiting spark particles ──────────────────────── */}
        <group ref={orbitRef}>
          {orbiters.map((p, i) => (
            <mesh key={`orbiter-${i}`} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[p.size, 10, 10]} />
              <meshBasicMaterial
                color={cfg.sparkleColor}
                transparent
                opacity={0.65}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>

        {/* ── Crystal shards (secret planet) ───────────────── */}
        {cfg.hasShards && (
          <group ref={shardRef}>
            {shards.map((s, i) => (
              <mesh key={`shard-${i}`} position={[s.x, s.y, s.z]} rotation={[0, s.rot, s.rot]}>
                <icosahedronGeometry args={[s.scale, 0]} />
                <meshStandardMaterial
                  color={cfg.surfaceAccent}
                  emissive={cfg.emissive}
                  emissiveIntensity={0.7}
                  roughness={0.25}
                  metalness={0.45}
                  transparent
                  opacity={0.85}
                  toneMapped={false}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* ── Per-planet point light ──────────────────────────── */}
        <pointLight
          color={cfg.atmosphereColor}
          intensity={hovered ? 0.8 : 0.3}
          distance={6}
          decay={2}
        />

        {/* ── HTML label ─────────────────────────────────────── */}
        <Html
          center
          distanceFactor={10}
          style={{
            pointerEvents: "none",
            transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
            opacity: hovered ? 1 : 0.55,
            transform: hovered ? "translateY(-14px) scale(1.06)" : "translateY(0) scale(1)",
          }}
          position={[0, -2, 0]}
        >
          <div
            style={{
              background: hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              border: `1px solid ${hovered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "18px",
              padding: "12px 26px",
              textAlign: "center",
              whiteSpace: "nowrap",
              transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
              boxShadow: hovered
                ? "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.85)",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.4s",
              }}
            >
              {cfg.label}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                color: hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.4s",
              }}
            >
              {cfg.sublabel}
            </p>
          </div>
        </Html>
      </group>
    </Float>
  );
};
