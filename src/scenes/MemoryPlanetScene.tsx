import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, Preload, Sparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

interface MemoryNodeData {
  id: string;
  title: string;
  note: string;
  date: string;
  palette: [string, string];
  t: number;
  size: [number, number];
  tilt: [number, number, number];
}

const MEMORY_NODES: MemoryNodeData[] = [
  {
    id: "m1",
    title: "One of my favorite moments.",
    note: "This smile deserved its own galaxy.",
    date: "May 12, 2022",
    palette: ["#f7b1ff", "#b58cff"],
    t: 0.08,
    size: [1.7, 2.1],
    tilt: [0.05, 0.12, -0.04],
  },
  {
    id: "m2",
    title: "Still thinking about this day.",
    note: "Every laugh echoed forever.",
    date: "Aug 03, 2021",
    palette: ["#8bd7ff", "#ff9bd9"],
    t: 0.22,
    size: [1.6, 1.95],
    tilt: [0.02, -0.15, 0.05],
  },
  {
    id: "m3",
    title: "A quiet moment, just us.",
    note: "Soft light, softer memories.",
    date: "Nov 18, 2020",
    palette: ["#5eead4", "#6366f1"],
    t: 0.38,
    size: [1.45, 1.85],
    tilt: [-0.03, 0.14, 0.04],
  },
  {
    id: "m4",
    title: "A wish whispered to the stars.",
    note: "You were the brightest.",
    date: "Jan 02, 2023",
    palette: ["#ffd7a1", "#ff9cc7"],
    t: 0.55,
    size: [1.35, 1.75],
    tilt: [0.05, -0.12, -0.07],
  },
  {
    id: "m5",
    title: "The day everything felt perfect.",
    note: "A little universe in one photo.",
    date: "Jul 25, 2022",
    palette: ["#c7a7ff", "#ffb4f5"],
    t: 0.72,
    size: [1.5, 1.9],
    tilt: [0.02, 0.08, 0.03],
  },
  {
    id: "m6",
    title: "Your laugh still echoes.",
    note: "I keep it close to my heart.",
    date: "Sep 14, 2023",
    palette: ["#9ef6ff", "#b59cff"],
    t: 0.86,
    size: [1.55, 1.95],
    tilt: [-0.02, 0.1, -0.02],
  },
];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Reusable vectors — avoid GC pressure inside useFrame
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

const LANE_POINTS = [
  new THREE.Vector3(0.2, 0.4, 2),
  new THREE.Vector3(-0.6, 0.2, -2),
  new THREE.Vector3(0.8, 0.6, -6),
  new THREE.Vector3(-0.5, -0.2, -10),
  new THREE.Vector3(0.6, 0.4, -14),
  new THREE.Vector3(-0.4, 0.1, -18),
  new THREE.Vector3(0.5, -0.3, -22),
  new THREE.Vector3(-0.2, 0.15, -26),
];

function createMemoryTexture(palette: [string, string], seed: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(1, palette[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(
    size * 0.35,
    size * 0.35,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.7,
  );
  glow.addColorStop(0, "rgba(255,255,255,0.3)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 160; i++) {
    const x = (Math.sin(i * 12.8 + seed) * 0.5 + 0.5) * size;
    const y = (Math.cos(i * 8.2 + seed) * 0.5 + 0.5) * size;
    const r = 0.8 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
  }

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.8 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createMistTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  for (let i = 0; i < 9; i++) {
    const x = size * (0.2 + Math.random() * 0.6);
    const y = size * (0.2 + Math.random() * 0.6);
    const r = size * (0.25 + Math.random() * 0.25);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(187,147,255,0.32)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const MemoryNode = ({
  item,
  curve,
  progress,
  onSelect,
  globalFade,
}: {
  item: MemoryNodeData;
  curve: THREE.CatmullRomCurve3;
  progress: number;
  onSelect: (m: MemoryNodeData) => void;
  globalFade: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const photoRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const borderGlowRef = useRef<THREE.Mesh>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  // Use ref for hover to avoid React re-renders (keeps Sparkles stable)
  const hoveredRef = useRef(false);
  // Smooth blend factor: 0 = idle, 1 = fully hovered (interpolated each frame)
  const hoverBlend = useRef(0);

  const texture = useMemo(() => createMemoryTexture(item.palette, item.t * 100), [item]);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const baseRot = useMemo(() => new THREE.Euler(...item.tilt), [item.tilt]);

  // Polaroid dimensions (stable — no recalc)
  const photoW = item.size[0] * 0.88;
  const photoH = item.size[1] * 0.72;
  const frameW = item.size[0] * 1.05;
  const frameH = item.size[1] * 1.18;
  const bottomPadding = frameH * 0.18;

  const onPointerEnter = useMemo(() => () => { hoveredRef.current = true; }, []);
  const onPointerLeave = useMemo(() => () => { hoveredRef.current = false; }, []);
  const onClick = useMemo(() => () => onSelect(item), [onSelect, item]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // ── Smooth hover blend (cinematic lerp speed) ──────────
    const hTarget = hoveredRef.current ? 1 : 0;
    hoverBlend.current = lerp(hoverBlend.current, hTarget, delta * 1.8);
    const h = hoverBlend.current; // 0..1 smooth

    // ── Idle floating motion (always active, unaffected by hover) ──
    const nodePos = curve.getPointAt(item.t);
    const drift = Math.sin(t * 0.18 + item.t * 5) * 0.2;
    const bob = Math.cos(t * 0.22 + item.t * 7) * 0.14;

    const posLerp = delta * 0.7;
    groupRef.current.position.x = lerp(groupRef.current.position.x, nodePos.x + drift, posLerp);
    groupRef.current.position.y = lerp(groupRef.current.position.y, nodePos.y + bob, posLerp);
    groupRef.current.position.z = lerp(groupRef.current.position.z, nodePos.z, posLerp);

    // ── Subtle rotation drift (independent of hover) ──────
    const rotLerp = delta * 0.6;
    const rotDriftX = Math.sin(t * 0.12 + item.t * 3) * 0.03;
    const rotDriftY = Math.cos(t * 0.1 + item.t * 4) * 0.04;
    const rotDriftZ = Math.sin(t * 0.08 + item.t * 6) * 0.02;

    groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, baseRot.x + rotDriftX + bob * 0.06, rotLerp);
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, baseRot.y + rotDriftY + drift * 0.05, rotLerp);
    groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, baseRot.z + rotDriftZ, rotLerp);

    // ── Scale: gentle hover lift blended with reveal ──────
    const reveal = clamp((progress - item.t + 0.18) / 0.25, 0, 1);
    const hoverScale = 1 + h * 0.06; // subtle 6% grow
    const targetScale = hoverScale * lerp(0.65, 1, reveal) * globalFade;
    groupRef.current.scale.setScalar(lerp(groupRef.current.scale.x, targetScale, delta * 1.6));

    // ── Material updates (soft lerp, no re-renders) ───────
    const matLerp = delta * 1.8;

    if (frameRef.current) {
      const mat = frameRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = lerp(mat.emissiveIntensity, 0.08 + h * 0.28, matLerp);
    }

    if (photoRef.current) {
      const mat = photoRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = lerp(mat.emissiveIntensity, 0.25 + h * 0.2, matLerp);
    }

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = lerp(mat.opacity, (0.22 + h * 0.3) * reveal * globalFade, matLerp);
    }

    if (borderGlowRef.current) {
      const mat = borderGlowRef.current.material as THREE.MeshBasicMaterial;
      const pulseBase = 0.08 + h * 0.22;
      mat.opacity = lerp(mat.opacity, pulseBase * reveal * globalFade, matLerp);
    }

    // ── Caption DOM update via ref (no React re-render) ───
    if (captionRef.current) {
      captionRef.current.style.opacity = String(h);
      captionRef.current.style.transform = `translateY(${(1 - h) * 8}px)`;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer atmospheric glow behind polaroid */}
      <mesh ref={glowRef} position={[0, 0, -0.08]} scale={1.8}>
        <planeGeometry args={[frameW, frameH]} />
        <meshBasicMaterial
          map={glowTexture}
          color={item.palette[1]}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Soft border glow — white halo around frame */}
      <mesh ref={borderGlowRef} position={[0, 0, -0.04]} scale={1.2}>
        <planeGeometry args={[frameW, frameH]} />
        <meshBasicMaterial
          map={glowTexture}
          color="#ffffff"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* White polaroid frame — the main card body */}
      <mesh
        ref={frameRef}
        position={[0, 0, -0.01]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[frameW, frameH, 1, 1]} />
        <meshStandardMaterial
          color="#f5f0f0"
          roughness={0.65}
          metalness={0.02}
          emissive="#ffffff"
          emissiveIntensity={0.08}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Photo image area — inset within the frame */}
      <mesh
        ref={photoRef}
        position={[0, bottomPadding * 0.4, 0.01]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        <planeGeometry args={[photoW, photoH]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.3}
          metalness={0.15}
          emissive={new THREE.Color(item.palette[0])}
          emissiveIntensity={0.25}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Sparkles — static props, no re-mount on hover */}
      <group position={[0, 0, 0.1]}>
        <Sparkles
          count={14}
          scale={[frameW * 1.3, frameH * 1.3, 0.5]}
          size={2.5}
          speed={0.2}
          color={item.palette[0]}
          opacity={0.4}
        />
      </group>

      {/* Caption — uses ref for DOM updates, never re-renders */}
      <Html
        position={[0, -frameH * 0.56, 0.08]}
        center
        distanceFactor={10}
      >
        <div
          ref={captionRef}
          style={{
            pointerEvents: "none",
            textAlign: "center",
            color: "rgba(255,255,255,0.9)",
            fontFamily: "Cormorant Garamond, serif",
            letterSpacing: "0.06em",
            fontSize: "13px",
            textShadow: "0 0 16px rgba(180,140,255,0.6), 0 0 40px rgba(120,80,200,0.3)",
            opacity: 0,
            transform: "translateY(8px)",
            transition: "none",
            width: "160px",
            willChange: "opacity, transform",
          }}
        >
          <div style={{ fontStyle: "italic", fontWeight: 300 }}>{item.title}</div>
          <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "6px", letterSpacing: "0.12em" }}>{item.date}</div>
        </div>
      </Html>
    </group>
  );
};

const MemoryLane = ({ curve, progress }: { curve: THREE.CatmullRomCurve3; progress: number }) => {
  const coreRef = useRef<any>(null);
  const glowRef = useRef<any>(null);
  const outerRef = useRef<any>(null);
  const bloomRef = useRef<any>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => curve.getPoints(220), [curve]);

  // Create glow sprite texture for point lights along path
  const pathGlowTex = useMemo(() => {
    const s = 64;
    const c = document.createElement("canvas");
    c.width = s; c.height = s;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    g.addColorStop(0,"rgba(220,180,255,0.7)");
    g.addColorStop(0.3,"rgba(200,160,255,0.3)");
    g.addColorStop(0.7,"rgba(180,130,255,0.08)");
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,s,s);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.55 + Math.sin(t * 0.6) * 0.2 + Math.sin(t * 1.3) * 0.08;
    const breathe = 0.4 + Math.sin(t * 0.4) * 0.15;
    if (coreRef.current) coreRef.current.material.opacity = pulse * 0.85;
    if (glowRef.current) glowRef.current.material.opacity = 0.35 + breathe * 0.4;
    if (outerRef.current) outerRef.current.material.opacity = 0.18 + breathe * 0.2;
    if (bloomRef.current) bloomRef.current.material.opacity = 0.1 + Math.sin(t * 0.3) * 0.06;

    // Animate pulse lights along the path
    if (pulseGroupRef.current) {
      pulseGroupRef.current.children.forEach((child, i) => {
        const speed = 0.08 + i * 0.03;
        const pos = ((t * speed + i * 0.33) % 1);
        const pt = curve.getPointAt(pos);
        child.position.set(pt.x, pt.y, pt.z);
        const glow = 0.5 + Math.sin(t * 1.5 + i * 2) * 0.3;
        (child as any).material.opacity = glow * 0.6;
        child.scale.setScalar(0.6 + glow * 0.5);
      });
    }
  });

  const fade = clamp(progress + 0.2, 0, 1);

  return (
    <group>
      {/* Outermost bloom — wide diffuse purple/pink */}
      <Line
        ref={bloomRef}
        points={points}
        color="#b060e0"
        lineWidth={8}
        transparent
        opacity={0.12 * fade}
      />
      {/* Outer glow — soft purple haze */}
      <Line
        ref={outerRef}
        points={points}
        color="#c9a3ff"
        lineWidth={5}
        transparent
        opacity={0.3 * fade}
      />
      {/* Mid glow — brighter lilac */}
      <Line
        ref={glowRef}
        points={points}
        color="#dcc8ff"
        lineWidth={3}
        transparent
        opacity={0.5 * fade}
      />
      {/* Core — bright white center */}
      <Line
        ref={coreRef}
        points={points}
        color="#f8f2ff"
        lineWidth={1.5}
        transparent
        opacity={0.7 * fade}
      />

      {/* Traveling light pulses along the path */}
      <group ref={pulseGroupRef}>
        {[0,1,2].map((i) => (
          <sprite key={i}>
            <spriteMaterial
              map={pathGlowTex}
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              color="#e0c0ff"
            />
          </sprite>
        ))}
      </group>

      {/* Soft point lights along fixed positions to illuminate nearby space */}
      {[0.15, 0.4, 0.65, 0.85].map((t, i) => {
        const p = curve.getPointAt(t);
        return (
          <pointLight
            key={i}
            position={[p.x, p.y, p.z]}
            intensity={0.25 * fade}
            color="#d4b0ff"
            distance={5}
            decay={2}
          />
        );
      })}
    </group>
  );
};

const MemoryWorld = ({
  onSelect,
  exiting,
  onExitComplete,
}: {
  onSelect: (m: MemoryNodeData) => void;
  exiting: boolean;
  onExitComplete: () => void;
}) => {
  const { camera } = useThree();
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(LANE_POINTS, false, "catmullrom", 0.6),
    [],
  );
  const mistTexture = useMemo(() => createMistTexture(), []);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const exitBlend = useRef(0);

  useEffect(() => {
    if (exiting) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * 0.0007;
      targetProgress.current = clamp(targetProgress.current + delta, 0, 1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [exiting]);

  useFrame((state, delta) => {
    if (exiting) {
      exitBlend.current = clamp(exitBlend.current + delta * 0.6, 0, 1);
      targetProgress.current = lerp(targetProgress.current, 0, delta * 1.2);
    }

    currentProgress.current = lerp(currentProgress.current, targetProgress.current, delta * 1.4);
    const progress = clamp(currentProgress.current, 0, 1);
    const basePoint = curve.getPointAt(progress);
    const lookPoint = curve.getPointAt(clamp(progress + 0.03, 0, 1));

    const driftX = Math.sin(state.clock.elapsedTime * 0.1) * 0.25;
    const driftY = Math.cos(state.clock.elapsedTime * 0.08) * 0.18;
    const pullBack = exitBlend.current * 6;

    _camTarget.set(basePoint.x + driftX, basePoint.y + driftY, basePoint.z + 10 + pullBack);
    camera.position.lerp(_camTarget, delta * 1.1);

    // Use slerp for ultra-smooth camera rotation during scroll
    _lookTarget.set(lookPoint.x, lookPoint.y + 0.2, lookPoint.z - 6);
    const prevQuat = camera.quaternion.clone();
    camera.lookAt(_lookTarget);
    const targetQuat = camera.quaternion.clone();
    camera.quaternion.copy(prevQuat);
    camera.quaternion.slerp(targetQuat, delta * 2.0);

    if (exiting && exitBlend.current >= 1) {
      onExitComplete();
    }
  });

  const globalFade = 1 - exitBlend.current;

  return (
    <>
      <fog attach="fog" args={["#050118", 4, 42]} />

      {/* Richer emotional lighting */}
      <ambientLight intensity={0.18} color="#c8a5ff" />
      <directionalLight position={[6, 8, 4]} intensity={0.5} color="#f6d5ff" />
      <directionalLight position={[-6, -4, 6]} intensity={0.25} color="#8fb7ff" />
      <pointLight position={[0, 3, -6]} intensity={1.1} color="#f8b4ff" distance={20} decay={2} />
      <pointLight position={[3, -2, -10]} intensity={0.55} color="#8bd7ff" distance={22} decay={2} />
      <pointLight position={[-3, 1, -16]} intensity={0.4} color="#c490ff" distance={18} decay={2} />
      <pointLight position={[2, -1, -22]} intensity={0.35} color="#ff9bd9" distance={16} decay={2} />

      {/* Primary sparkle field — cosmic dust */}
      <Sparkles count={420} scale={32} size={2.8} speed={0.18} color="#d7c5ff" opacity={0.5} />
      {/* Secondary — warm pink motes */}
      <Sparkles count={280} scale={26} size={1.8} speed={0.1} color="#ffe3f6" opacity={0.35} />
      {/* Tiny distant stars */}
      <Sparkles count={180} scale={40} size={1.2} speed={0.06} color="#ffffff" opacity={0.25} />

      {/* Deep background nebula mist */}
      <mesh position={[0, 0, -20]} scale={[35, 20, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={mistTexture}
          transparent
          opacity={0.45 * globalFade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary nebula layer — offset for depth */}
      <mesh position={[-5, 2, -28]} scale={[25, 14, 1]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={mistTexture}
          transparent
          opacity={0.25 * globalFade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ff80d0"
        />
      </mesh>

      {/* Galaxy center glow */}
      <mesh position={[0, 0, -32]} scale={[18, 18, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={mistTexture}
          transparent
          opacity={0.2 * globalFade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#7040c0"
        />
      </mesh>

      <MemoryLane curve={curve} progress={currentProgress.current} />

      <group>
        {MEMORY_NODES.map((item) => (
          <MemoryNode
            key={item.id}
            item={item}
            curve={curve}
            progress={currentProgress.current}
            onSelect={onSelect}
            globalFade={globalFade}
          />
        ))}
      </group>
    </>
  );
};

export const MemoryPlanetScene = ({ onExit }: { onExit?: () => void }) => {
  const [selected, setSelected] = useState<MemoryNodeData | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleExit = () => {
    if (exiting) return;
    setExiting(true);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: "#050113" }}>
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0.3, 18], fov: 50, near: 0.1, far: 220 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <MemoryWorld onSelect={setSelected} exiting={exiting} onExitComplete={() => onExit?.()} />
          <Preload all />
        </Suspense>
      </Canvas>

      <motion.button
        type="button"
        onClick={handleExit}
        className="absolute left-6 top-6 z-30 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] uppercase tracking-[0.4em] text-white/80"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        return to universe
      </motion.button>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(null)}
            style={{
              background: "rgba(6, 2, 20, 0.55)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-[min(82vw,460px)] rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
              style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}
            >
              <div
                className="mx-auto mb-6 h-56 w-full rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${selected.palette[0]}, ${selected.palette[1]})`,
                  boxShadow: "inset 0 0 40px rgba(255,255,255,0.25)",
                }}
              />
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Memory</p>
              <h2 className="mt-3 text-2xl font-light text-white">{selected.title}</h2>
              <p className="mt-4 text-sm text-white/70">{selected.note}</p>
              <p className="mt-6 text-[11px] uppercase tracking-[0.35em] text-white/50">
                {selected.date}
              </p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/40">
                click anywhere to return
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exiting && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(200,170,255,0.2), rgba(6,2,20,0.9) 75%)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
