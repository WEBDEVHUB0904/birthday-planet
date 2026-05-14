import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CLOUD_COUNT = 12;

/**
 * Creates a canvas-based nebula cloud texture —
 * a soft radial gradient with organic noise,
 * giving each cloud a unique, natural shape.
 */
function createCloudTexture(color1: string, color2: string, seed: number): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Main radial gradient
  const cx = size * (0.4 + Math.sin(seed) * 0.1);
  const cy = size * (0.45 + Math.cos(seed * 2) * 0.1);
  const grad = ctx.createRadialGradient(cx, cy, 0, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, color1);
  grad.addColorStop(0.4, color2);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Add organic noise blobs for texture
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 10 + Math.random() * 40;
    const blobGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    blobGrad.addColorStop(0, `rgba(180,140,255,${0.02 + Math.random() * 0.04})`);
    blobGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = blobGrad;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a canvas texture of a simple spiral galaxy shape.
 */
function createGalaxyTexture(hue: number): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;

  // Draw spiral arms
  for (let arm = 0; arm < 3; arm++) {
    const armAngleOffset = (arm / 3) * Math.PI * 2;
    for (let i = 0; i < 200; i++) {
      const t = i / 200;
      const angle = armAngleOffset + t * Math.PI * 3;
      const radius = t * size * 0.4;
      const x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 8;
      const y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 8;
      const r = (1 - t) * 4 + 1;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 60%, 75%, ${(1 - t) * 0.12})`;
      ctx.fill();
    }
  }

  // Central bright core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12);
  coreGrad.addColorStop(0, `hsla(${hue}, 50%, 85%, 0.2)`);
  coreGrad.addColorStop(0.5, `hsla(${hue}, 60%, 70%, 0.08)`);
  coreGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a soft, wide galaxy band texture for distant arcs.
 */
function createArcTexture(hue: number): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.55);
  grad.addColorStop(0, `hsla(${hue}, 60%, 70%, 0.22)`);
  grad.addColorStop(0.4, `hsla(${hue}, 55%, 60%, 0.12)`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.48, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export const NebulaClouds = () => {
  const groupRef = useRef<THREE.Group>(null);
  const galaxyGroupRef = useRef<THREE.Group>(null);

  const cloudConfigs = useMemo(
    () =>
      Array.from({ length: CLOUD_COUNT }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 18,
          -18 - Math.random() * 35,
        ] as [number, number, number],
        scale: 16 + Math.random() * 26,
        rotation: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.003,
        driftSpeed: 0.008 + Math.random() * 0.015,
        opacity: 0.05 + Math.random() * 0.05,
      })),
    [],
  );

  const cloudTextures = useMemo(
    () =>
      cloudConfigs.map((_, i) => {
        const colors: [string, string][] = [
          ["rgba(107,33,168,0.3)", "rgba(67,56,202,0.1)"],
          ["rgba(124,58,237,0.25)", "rgba(99,102,241,0.08)"],
          ["rgba(67,56,202,0.2)", "rgba(30,58,95,0.08)"],
          ["rgba(190,24,93,0.2)", "rgba(124,58,237,0.08)"],
          ["rgba(76,29,149,0.25)", "rgba(49,46,129,0.1)"],
          ["rgba(88,28,135,0.22)", "rgba(55,48,163,0.08)"],
          ["rgba(30,58,95,0.2)", "rgba(67,56,202,0.06)"],
          ["rgba(157,23,77,0.18)", "rgba(88,28,135,0.06)"],
        ];
        const [c1, c2] = colors[i % colors.length];
        return createCloudTexture(c1, c2, i * 7.3);
      }),
    [cloudConfigs],
  );

  // Distant spiral galaxy shapes
  const galaxyConfigs = useMemo(
    () => [
      { position: [-25, 8, -50] as [number, number, number], scale: 18, rotation: 0.4, hue: 270 },
      { position: [30, -5, -60] as [number, number, number], scale: 14, rotation: -0.3, hue: 220 },
      { position: [10, 12, -55] as [number, number, number], scale: 10, rotation: 0.8, hue: 310 },
      { position: [-5, -10, -65] as [number, number, number], scale: 12, rotation: -0.6, hue: 250 },
    ],
    [],
  );

  const galaxyTextures = useMemo(
    () => galaxyConfigs.map((g) => createGalaxyTexture(g.hue)),
    [galaxyConfigs],
  );

  const arcConfigs = useMemo(
    () => [
      {
        position: [0, -6, -35] as [number, number, number],
        scale: [48, 20, 1] as [number, number, number],
        rotation: -0.25,
        hue: 270,
        opacity: 0.16,
      },
      {
        position: [6, 5, -42] as [number, number, number],
        scale: [42, 18, 1] as [number, number, number],
        rotation: 0.35,
        hue: 230,
        opacity: 0.12,
      },
      {
        position: [-8, 2, -48] as [number, number, number],
        scale: [40, 16, 1] as [number, number, number],
        rotation: -0.1,
        hue: 320,
        opacity: 0.14,
      },
    ],
    [],
  );

  const arcTextures = useMemo(() => arcConfigs.map((a) => createArcTexture(a.hue)), [arcConfigs]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      if (i >= cloudConfigs.length) return;
      const cfg = cloudConfigs[i];
      const mesh = child as THREE.Mesh;

      mesh.position.x = cfg.position[0] + Math.sin(t * cfg.driftSpeed) * 2.5;
      mesh.position.y = cfg.position[1] + Math.cos(t * cfg.driftSpeed * 0.6) * 1.2;
      mesh.rotation.z = cfg.rotation + t * cfg.speed;

      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = cfg.opacity + Math.sin(t * 0.2 + i * 1.2) * 0.01;
    });

    // Subtle galaxy rotation
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.rotation.z += 0.0001; // near-imperceptible spin
      });
    }
  });

  return (
    <>
      {/* ── Nebula clouds ────────────────────────────────────── */}
      <group ref={groupRef}>
        {cloudConfigs.map((c, i) => (
          <mesh key={i} position={c.position} scale={c.scale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={cloudTextures[i]}
              transparent
              opacity={c.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* ── Distant spiral galaxies ──────────────────────────── */}
      <group ref={galaxyGroupRef}>
        {galaxyConfigs.map((g, i) => (
          <mesh
            key={`galaxy-${i}`}
            position={g.position}
            scale={g.scale}
            rotation={[0, 0, g.rotation]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={galaxyTextures[i]}
              transparent
              opacity={0.38}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* ── Galaxy arcs / bands ─────────────────────────────── */}
      <group>
        {arcConfigs.map((a, i) => (
          <mesh
            key={`arc-${i}`}
            position={a.position}
            scale={a.scale}
            rotation={[0, 0, a.rotation]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={arcTextures[i]}
              transparent
              opacity={a.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
};
