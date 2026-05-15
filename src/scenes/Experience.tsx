import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { StarsBackground } from "@/components/StarsBackground";
import { GalaxyParticles } from "@/components/GalaxyParticles";
import { FloatingOrb } from "@/components/FloatingOrb";
import { ShootingStars } from "@/components/ShootingStars";
import { NebulaClouds } from "@/components/NebulaClouds";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useNavigate } from '@tanstack/react-router';

/* ------------------------------------------------------------------ */
/*  Reusable vectors (avoid GC pressure inside useFrame)               */
/* ------------------------------------------------------------------ */

const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

/**
 * The main 3D scene placed inside the R3F <Canvas>.
 *
 * ① Mouse-reactive cinematic drifting camera.
 * ② Multi-layer parallax starfield + galaxy particles.
 * ③ Shooting stars + nebula clouds.
 * ④ Four floating interactive orb objects.
 * ⑤ Premium emotional lighting rig.
 * ⑥ Atmospheric fog for infinite depth illusion.
 */
export const Experience = ({
  onMemoryPlanet,
  onSecretCrystal,
}: {
  onMemoryPlanet?: () => void;
  onSecretCrystal?: () => void;
}) => {
  const { camera } = useThree();
  const mouseRef = useMouseParallax(0.035); // soft damping
  const navigate = useNavigate();
  // Orbit group for gentle foreground parallax shift
  const orbGroupRef = useRef<THREE.Group>(null);

  // ── Smooth cinematic camera drift + mouse influence ──────────
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    const intro = THREE.MathUtils.clamp(t / 3.4, 0, 1);
    const introEase = 1 - Math.pow(1 - intro, 3);
    const zoomOffset = (1 - introEase) * 7.5;

    // ─── Base Lissajous drift (breathing, organic) ──────────
    const baseX = Math.sin(t * 0.06) * 1.8 + Math.sin(t * 0.025) * 0.5;
    const baseY = Math.cos(t * 0.045) * 0.9 + Math.sin(t * 0.02) * 0.3 + 0.2;
    const baseZ = Math.sin(t * 0.03) * 1.5 + 12 + zoomOffset;

    // ─── Mouse influence on camera position ─────────────────
    const mouseInfluenceX = mx * 1.8;
    const mouseInfluenceY = my * -1.0;

    _camTarget.set(baseX + mouseInfluenceX, baseY + mouseInfluenceY, baseZ);

    // Smooth lerp camera position (very soft, cinematic)
    camera.position.lerp(_camTarget, delta * 1.2);

    // ─── Look-ahead — camera gaze drifts organically ────────
    const lookX = Math.sin(t * 0.04) * 0.8 + mx * 0.5;
    const lookY = Math.cos(t * 0.055) * 0.5 + my * -0.3;
    const lookZ = -2 + Math.sin(t * 0.02) * 0.5 + zoomOffset * -0.08;

    _lookTarget.set(lookX, lookY, lookZ);

    // Use quaternion slerp for ultra-smooth rotation
    const currentQuat = camera.quaternion.clone();
    camera.lookAt(_lookTarget);
    const targetQuat = camera.quaternion.clone();
    camera.quaternion.copy(currentQuat);
    camera.quaternion.slerp(targetQuat, delta * 1.5);

    // ─── Foreground orb group parallax ──────────────────────
    if (orbGroupRef.current) {
      orbGroupRef.current.position.x = THREE.MathUtils.lerp(
        orbGroupRef.current.position.x,
        mx * -0.5,
        delta * 1.8,
      );
      orbGroupRef.current.position.y = THREE.MathUtils.lerp(
        orbGroupRef.current.position.y,
        my * 0.3,
        delta * 1.8,
      );
    }
  });

  return (
    <>
      {/* ═══════════════ ATMOSPHERIC FOG ═══════════════════════════ */}
      <fog attach="fog" args={["#040114", 8, 70]} />

      {/* ═══════════════ LIGHTING RIG ═════════════════════════════ */}
      {/* Ambient — deep violet fill */}
      <ambientLight intensity={0.12} color="#b8a0e8" />

      {/* Key light — warm cosmic glow from upper right */}
      <directionalLight position={[12, 10, 6]} intensity={0.35} color="#e8d5ff" />
      {/* Fill — subtle blue from below-left */}
      <directionalLight position={[-8, -4, 3]} intensity={0.15} color="#6366f1" />

      {/* Accent point lights — positioned to rim-light the orbs */}
      <pointLight position={[-7, 4, -5]} intensity={0.7} color="#a855f7" distance={28} decay={2} />
      <pointLight position={[6, -3, 4]} intensity={0.55} color="#ec4899" distance={22} decay={2} />
      <pointLight position={[0, 6, -10]} intensity={0.45} color="#6366f1" distance={35} decay={2} />
      <pointLight position={[5, 2, -7]} intensity={0.6} color="#fbbf24" distance={25} decay={2} />

      {/* Distant nebula glow — large soft fill */}
      <pointLight
        position={[-15, 0, -30]}
        intensity={0.3}
        color="#7c3aed"
        distance={60}
        decay={1.5}
      />
      <pointLight
        position={[18, -5, -25]}
        intensity={0.25}
        color="#be185d"
        distance={50}
        decay={1.5}
      />

      {/* ═══════════════ BACKGROUND LAYERS ════════════════════════ */}
      <StarsBackground mouseRef={mouseRef} />
      <GalaxyParticles mouseRef={mouseRef} />
      <ShootingStars />
      <NebulaClouds />

      {/* ═══════════════ FOREGROUND — INTERACTIVE ORBS ════════════ */}
      <group ref={orbGroupRef}>
        <FloatingOrb
          variant="memoryPlanet"
          position={[-4.5, 1.2, -3]}
          mouseRef={mouseRef}
          onClick={onMemoryPlanet}
        />
        {/* <FloatingOrb variant="musicOrb" position={[3.5, -0.5, -5]} mouseRef={mouseRef} /> */}
        <FloatingOrb
          variant="secretCrystal"
          position={[-2, -1.8, -7]}
          mouseRef={mouseRef}
          onClick={onSecretCrystal}
        />
        <FloatingOrb
            variant="finalStar"
            position={[1.5, 2.5, -4.5]}
            mouseRef={mouseRef}
            onClick={() => navigate({ to: '/final-orb' })}
/>
      </group>
    </>
  );
};
