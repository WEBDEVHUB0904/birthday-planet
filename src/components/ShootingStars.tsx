import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SHOOTING_STAR_COUNT = 6;

/**
 * Occasional shooting stars that streak across the deep field.
 * Each star activates on a random timer, travels in a straight line,
 * then fades and re-arms itself — giving the universe a living pulse.
 */
export const ShootingStars = () => {
  const linesRef = useRef<THREE.Group>(null);

  // Pre-compute stable random seeds per star
  const seeds = useMemo(
    () =>
      Array.from({ length: SHOOTING_STAR_COUNT }, () => ({
        delay: 4 + Math.random() * 12,           // seconds between activations
        speed: 8 + Math.random() * 14,            // units per second
        length: 1.5 + Math.random() * 2.5,        // tail length
        startPhase: Math.random() * 20,            // stagger
        dirAngle: Math.random() * Math.PI * 0.3 - 0.15, // slight angle variation
        yOffset: (Math.random() - 0.5) * 12,
        xStart: -15 - Math.random() * 10,
        zOffset: -5 - Math.random() * 20,
        brightness: 0.6 + Math.random() * 0.4,
      })),
    []
  );

  // Each star gets a simple line geometry (2 points)
  const lineGeos = useMemo(() => {
    return seeds.map((s) => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, -s.length, 0, 0]);
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return geo;
    });
  }, [seeds]);

  useFrame((state) => {
    if (!linesRef.current) return;
    const t = state.clock.elapsedTime;

    linesRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const line = child as THREE.Line;

      // Cyclic activation: how far through the current cycle
      const cycle = (t + s.startPhase) % s.delay;
      const travelTime = 2.0; // visible window (seconds)

      if (cycle < travelTime) {
        const progress = cycle / travelTime;
        const x = s.xStart + progress * (Math.abs(s.xStart) * 2 + 20);
        const y = s.yOffset + Math.sin(s.dirAngle) * progress * 8;
        const z = s.zOffset;

        line.position.set(x, y, z);
        line.rotation.z = s.dirAngle;

        // Fade in then out
        const alpha =
          progress < 0.15
            ? progress / 0.15
            : progress > 0.75
              ? (1 - progress) / 0.25
              : 1;

        (line.material as THREE.LineBasicMaterial).opacity =
          alpha * s.brightness * 0.7;
        line.visible = true;
      } else {
        line.visible = false;
      }
    });
  });

  return (
    <group ref={linesRef}>
      {lineGeos.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial
            color="#e8d5ff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </line>
      ))}
    </group>
  );
};
