import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { audioManager } from "@/lib/audioManager";

gsap.registerPlugin(ScrollTrigger);

/* ── Design tokens ───────────────────────────────────────────────── */
const GOLD = "#f5c842";
const ROSE = "#ff6b9d";

/* ── Letter map for "MISTU" (bounding-box grid) ──────────────── */
// Each letter is a 5×7 pixel grid encoded as a flat bit array (row-major)
const LETTER_MAPS: Record<string, number[]> = {
  M: [1,0,0,0,1, 1,1,0,1,1, 1,0,1,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1],
  I: [1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 1,1,1,1,1],
  S: [0,1,1,1,1, 1,0,0,0,0, 1,0,0,0,0, 0,1,1,1,0, 0,0,0,0,1, 0,0,0,0,1, 1,1,1,1,0],
  T: [1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
  U: [1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0],
};

const WORD = ["M","I","S","T","U"];

function buildNameTargets(): THREE.Vector3[] {
  const targets: THREE.Vector3[] = [];
  const letterW = 5, letterH = 7, gap = 1.5;
  const totalW = WORD.length * (letterW + gap) - gap;
  let offsetX = -totalW / 2;

  // Build letter targets
  for (const ch of WORD) {
    const map = LETTER_MAPS[ch] ?? LETTER_MAPS["M"];
    for (let row = 0; row < letterH; row++) {
      for (let col = 0; col < letterW; col++) {
        if (map[row * letterW + col]) {
          targets.push(new THREE.Vector3(
            offsetX + col * 1.2,
            (letterH - 1 - row) * 1.2 - letterH * 0.6,
            0,
          ));
        }
      }
    }
    offsetX += letterW + gap;
  }

  // // Heart pattern — positioned to the right of the name
  // const heartOffsetX = offsetX + 2;
  // const heartOffsetY = 0;
  // const heartScale = 0.55;
  // const heartPoints = 72;

  // for (let k = 0; k < heartPoints; k++) {
  //   const t = (k / heartPoints) * Math.PI * 2;
  //   // Parametric heart curve
  //   const hx = 16 * Math.pow(Math.sin(t), 3);
  //   const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  //   targets.push(new THREE.Vector3(
  //     heartOffsetX + hx * heartScale,
  //     heartOffsetY + hy * heartScale,
  //     0,
  //   ));
  // }

  return targets;
}

/* ─────────────────────────────────────────────────────────────────
   Sub-component: FloatingLanterns
───────────────────────────────────────────────────────────────── */
function FloatingLanterns() {
  const lanterns = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 28,
      startY: -12 - Math.random() * 6,
      z: -4 - Math.random() * 14,
      speed: 0.6 + Math.random() * 0.5,
      sway: 0.5 + Math.random() * 0.7,
      swaySpeed: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    })), []);

  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const yPos = useRef<number[]>(lanterns.map(l => l.startY));

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    lanterns.forEach((l, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      yPos.current[i] += l.speed * delta;
      if (yPos.current[i] > 15) yPos.current[i] = -14; // smooth reset
      mesh.position.y = yPos.current[i];
      mesh.position.x = l.x + Math.sin(t * l.swaySpeed + l.phase) * l.sway;
    });
  });

  return (
    <>
      {lanterns.map((l, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el as any; }} position={[l.x, l.startY, l.z]}>
          {/* Lantern body */}
          <mesh>
            <boxGeometry args={[0.5, 0.85, 0.5]} />
            <meshStandardMaterial
              color="#ff8c42"
              emissive="#ff6a00"
              emissiveIntensity={3}
              toneMapped={false}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Warm glow point light per lantern */}
          <pointLight color="#ff8c00" intensity={1.5} distance={5} decay={2} />
        </group>
      ))}
    </>
  );
}
/* ─────────────────────────────────────────────────────────────────
   Sub-component: FireworksParticles
───────────────────────────────────────────────────────────────── */
interface FireworksProps {
  triggeredRef: React.RefObject<boolean>;
}

interface Burst {
  positions: Float32Array;
  velocities: Float32Array;
  alphas: Float32Array;
  color: string;
  age: number;
}

function FireworksParticles({ triggeredRef }: FireworksProps) {
  const burstsRef = useRef<Burst[]>([]);
  const geomRefs = useRef<(THREE.BufferGeometry | null)[]>([]);
  const matRefs = useRef<(THREE.PointsMaterial | null)[]>([]);
  const wasTriggered = useRef(false);
  const COUNT = 80;
  const COLORS = ["#f5c842", "#ff6b9d", "#ffffff"];

  useFrame((_, delta) => {
    if (triggeredRef.current && !wasTriggered.current) {
      wasTriggered.current = true;
      burstsRef.current = Array.from({ length: 6 }, (__, bi) => {
        const positions = new Float32Array(COUNT * 3);
        const velocities = new Float32Array(COUNT * 3);
        const alphas = new Float32Array(COUNT).fill(1);
        for (let j = 0; j < COUNT; j++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = 2 + Math.random() * 5;
          const cx = (bi - 2.5) * 3;
          const cy = (Math.random() - 0.5) * 4;
          positions[j * 3] = cx;
          positions[j * 3 + 1] = cy;
          positions[j * 3 + 2] = 0;
          velocities[j * 3] = Math.sin(phi) * Math.cos(theta) * speed;
          velocities[j * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
          velocities[j * 3 + 2] = Math.cos(phi) * speed * 0.3;
        }
        return { positions, velocities, alphas, color: COLORS[bi % 3], age: 0 };
      });
    }

    burstsRef.current.forEach((burst, bi) => {
      burst.age += delta;
      const t = Math.min(burst.age / 2.5, 1);
      for (let j = 0; j < COUNT; j++) {
        burst.positions[j * 3] += burst.velocities[j * 3] * delta;
        burst.positions[j * 3 + 1] += burst.velocities[j * 3 + 1] * delta;
        burst.positions[j * 3 + 2] += burst.velocities[j * 3 + 2] * delta;
        burst.velocities[j * 3 + 1] -= 1.5 * delta;
        burst.alphas[j] = Math.max(0, 1 - t * t);
      }
      const geom = geomRefs.current[bi];
      if (geom) {
        (geom.attributes.position as THREE.BufferAttribute).set(burst.positions);
        geom.attributes.position.needsUpdate = true;
        const alphaBuf = geom.attributes.alpha as THREE.BufferAttribute | undefined;
        if (alphaBuf) { alphaBuf.set(burst.alphas); alphaBuf.needsUpdate = true; }
      }
      const mat = matRefs.current[bi];
      if (mat) mat.opacity = Math.max(0, 1 - t * t);
    });
  });

  return (
    <>
      {Array.from({ length: 6 }, (_, bi) => (
        <points key={bi}>
          <bufferGeometry
            ref={(g) => { geomRefs.current[bi] = g; }}
            onUpdate={(self) => {
              if (!burstsRef.current[bi]) return;
              self.setAttribute("position", new THREE.BufferAttribute(burstsRef.current[bi].positions, 3));
            }}
          >
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(COUNT * 3), 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={(m) => { matRefs.current[bi] = m; }}
            color={COLORS[bi % 3]}
            size={0.12}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-component: NameParticles
───────────────────────────────────────────────────────────────── */
interface NameParticlesProps {
  revealRef: React.RefObject<boolean>;
}

function NameParticles({ revealRef }: NameParticlesProps) {
  const COUNT = 500;
  const targets = useMemo(() => buildNameTargets(), []);
  const geomRef = useRef<THREE.BufferGeometry>(null);

  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const randoms = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      randoms[i * 3] = (Math.random() - 0.5) * 40;
      randoms[i * 3 + 1] = (Math.random() - 0.5) * 20;
      randoms[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return { positions, randoms };
  }, []);

  useFrame((_, delta) => {
    const geom = geomRef.current;
    if (!geom) return;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    const revealed = revealRef.current;

    for (let i = 0; i < COUNT; i++) {
      const target = revealed ? (targets[i % targets.length] ?? new THREE.Vector3()) : null;
      const tx = target ? target.x : randoms[i * 3];
      const ty = target ? target.y : randoms[i * 3 + 1];
      const tz = target ? target.z : randoms[i * 3 + 2];
      const lf = delta * (revealed ? 0.3 : 0.15);
      pos.setXYZ(
        i,
        THREE.MathUtils.lerp(pos.getX(i), tx, lf),
        THREE.MathUtils.lerp(pos.getY(i), ty, lf),
        THREE.MathUtils.lerp(pos.getZ(i), tz, lf),
      );
    }
    pos.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={GOLD}
        size={0.18}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-component: NightSkyCanvas
───────────────────────────────────────────────────────────────── */
interface NightSkyCanvasProps {
  fireworksRef: React.RefObject<boolean>;
  nameRevealRef: React.RefObject<boolean>;
}

function NightSkyCanvas({ fireworksRef, nameRevealRef }: NightSkyCanvasProps) {
  return (
    <Canvas
      frameloop="always"                         
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 18], fov: 55 }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
      gl={{ antialias: false, alpha: true }}
    >
      <Stars count={4000} depth={60} factor={5} fade speed={0.5} />
      <ambientLight intensity={0.05} color="#c4b5fd" />
      <FloatingLanterns />
      <FireworksParticles triggeredRef={fireworksRef} />
      <NameParticles revealRef={nameRevealRef} />
    </Canvas>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sub-component: FinalOrbContent  (scroll sections + GSAP)
───────────────────────────────────────────────────────────────── */
interface FinalOrbContentProps {
  fireworksRef: React.RefObject<boolean>;
  nameRevealRef: React.RefObject<boolean>;
}

function FinalOrbContent({ fireworksRef, nameRevealRef }: FinalOrbContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shimmerInjected, setShimmerInjected] = useState(false);

  useEffect(() => {
  // Load Playfair Display + Dancing Script
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@600&display=swap";
  document.head.appendChild(link);
  return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
  audioManager.play("/audio/final.mp3", 0.35);
  return () => audioManager.stop();
  }, []);

  /* inject @keyframes shimmer once */
  useEffect(() => {
    if (shimmerInjected) return;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fo-shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes fo-glow-pulse {
        0%, 100% { text-shadow: 0 0 20px rgba(245,200,66,0.4), 0 0 60px rgba(245,200,66,0.15); }
        50%       { text-shadow: 0 0 40px rgba(245,200,66,0.8), 0 0 80px rgba(245,200,66,0.35); }
      }
    `;
    document.head.appendChild(style);
    setShimmerInjected(true);
  }, [shimmerInjected]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Section 2: Lantern message ── */
      gsap.fromTo(".fo-lantern-text", { y: 60, opacity: 0 }, {
        y: 0, opacity: 1,
        scrollTrigger: { trigger: ".fo-section-2", start: "top 75%", end: "top 30%", scrub: 1.5 },
      });
      gsap.fromTo(".fo-lantern-sub", { opacity: 0 }, {
        opacity: 1,
        scrollTrigger: { trigger: ".fo-section-2", start: "top 55%", end: "top 20%", scrub: 1.5 },
      });

      /* ── Section 3: Fireworks letters ── */
      gsap.fromTo(".fo-fw-letter", { y: 80, opacity: 0 }, {
        y: 0, opacity: 1,
        stagger: 0.05,
        scrollTrigger: { trigger: ".fo-section-3", start: "top 70%", end: "top 20%", scrub: 1 },
      });
      ScrollTrigger.create({
        trigger: ".fo-section-3",
        start: "top 60%",
        onEnter: () => { fireworksRef.current = true; },
        onLeaveBack: () => { fireworksRef.current = false; },
      });

      /* ── Section 4: Name reveal ── */
      ScrollTrigger.create({
        trigger: ".fo-section-4",
        start: "top 60%",
        onEnter: () => { nameRevealRef.current = true; },
        onLeaveBack: () => { nameRevealRef.current = false; },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [fireworksRef, nameRevealRef]);

  const fwText = "TODAY IS YOUR DAY";

  return (
    <div ref={containerRef} className="relative z-10">

      {/* ── Section 1: Hero ─────────────────────────────────── */}
      <section className="fo-section-1 relative flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="text-center px-6"
        >
          <p
            className="text-6xl md:text-8xl text-white italic leading-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: "0 0 40px rgba(245,200,66,0.35), 0 0 80px rgba(245,200,66,0.15)",
              animation: "fo-glow-pulse 4s ease-in-out infinite",
            }}
          >
            Tonight, the universe speaks your name.
          </p>
        </motion.div>
      </section>

      {/* ── Section 2: Lantern message ──────────────────────── */}
      <section className="fo-section-2 relative flex h-screen flex-col items-center justify-center px-6 text-center">
        <p
          className="fo-lantern-text text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl"
          style={{ fontFamily: "'Playfair Display', serif", opacity: 0 }}
        >
          Every wish you ever made…<br />is remembered.
        </p>
        <p
          className="fo-lantern-sub mt-8 text-lg italic text-white/60"
          style={{ opacity: 0 }}
        >
          The universe kept count.
        </p>
      </section>

      {/* ── Section 3: Fireworks ────────────────────────────── */}
      <section className="fo-section-3 relative flex h-screen items-center justify-center px-4 text-center overflow-hidden">
        <h2
          className="text-7xl md:text-9xl font-black uppercase tracking-widest"
          style={{ color: GOLD }}
          aria-label="TODAY IS YOUR DAY"
        >
          {fwText.split("").map((ch, i) => (
            <span key={i} className="fo-fw-letter inline-block" style={{ opacity: 0 }}>
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h2>
      </section>

      {/* ── Section 4: Name in stars ─────────────────────────── */}
      <section className="fo-section-4 relative flex h-screen flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 3 }}
          viewport={{ once: true }}
          className="text-lg italic text-white/70"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Written in the stars, always.
        </motion.p>
      </section>

      {/* ── Section 5: Birthday wish card ────────────────────── */}
      <section className="fo-section-5 relative min-h-[120vh] flex items-center justify-center py-24 px-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-2xl w-full mx-auto rounded-3xl p-10 md:p-16"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 0 60px rgba(245,200,66,0.12), 0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Sparkle line */}
          <p className="text-center text-xl animate-pulse mb-8" style={{ color: GOLD }}>
            ✦ &nbsp; ✦ &nbsp; ✦
          </p>

          {/* Happy Birthday */}
          <h2
            className="text-6xl md:text-7xl font-bold text-center mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: `linear-gradient(90deg, ${GOLD} 0%, #fff8c0 40%, ${GOLD} 80%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "fo-shimmer 3s linear infinite",
            }}
          >
            Happy Birthday
          </h2>

          {/* Name */}
          <p
            className="text-4xl italic text-center mb-10"
            style={{ color: ROSE, fontFamily: "'Playfair Display', serif" }}
          >
            Mistu💗
          </p>

          {/* Message */}
          <p
            className="text-base md:text-lg leading-loose text-white/80 text-center"
            style={{ fontFamily: "system-ui, Lato, sans-serif" }}
          >
            You are the kind of light that doesn't announce itself — it simply warms every room it
            enters. May this year bring you all the quiet magic you've been pouring into others,
            returned to you in ways that make you feel truly seen. Your dreams are not too big, and
            your heart is not too much — they are the exact right size for the life being woven
            for you. On this day, the whole universe pauses to celebrate the rare and beautiful
            fact of you.
          </p>

          {/* Signature */}
          <p
            className="mt-10 text-sm italic text-white/40 text-right"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            — Always yours 🕯️
          </p>
        </motion.div>
      </section>

      {/* ── Section 6: Outro ─────────────────────────────────── */}
      <section className="fo-section-6 relative h-screen flex items-center justify-center overflow-hidden">
        <p
          className="text-5xl font-light text-white text-center animate-pulse"
          style={{
            fontFamily: "'Playfair Display', serif",
            textShadow: "0 0 30px rgba(255,255,255,0.3)",
          }}
        >
          Make a wish…
        </p>
        {/* Fade to black at bottom */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-64"
          style={{ background: "linear-gradient(to bottom, transparent, #020208)" }}
        />
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main export: FinalOrb
───────────────────────────────────────────────────────────────── */
export default function FinalOrb() {
  useLenis();
  const fireworksRef = useRef<boolean>(false);
  const nameRevealRef = useRef<boolean>(false);

  // ← ADD THIS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Dancing+Script:wght@600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <main className="relative w-full" style={{ background: "#0a0a1a", minHeight: "100vh" }}>
      <NightSkyCanvas fireworksRef={fireworksRef} nameRevealRef={nameRevealRef} />
      <FinalOrbContent fireworksRef={fireworksRef} nameRevealRef={nameRevealRef} />
    </main>
  );
}
