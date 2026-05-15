import { useEffect, useRef, useCallback, useMemo } from "react";
import { MemoryCard } from "./MemoryCard";
import { MEMORIES, DOME_ROWS } from "./memoryData";
import type { MemoryItem } from "@/types/memory";

interface MemoryWallProps {
  scrollRef: React.RefObject<{ progress: number; scrollY: number }>;
  onSelect: (memory: MemoryItem) => void;
}

/*
 * ── Concave Dome Geometry ────────────────────────────────────────────
 *
 * Cards are placed on the INNER surface of a cylinder using:
 *   rotateY(-angle) translateZ(-R)
 *
 * This creates a CONCAVE dome — center card is farthest from
 * the viewer, side panels wrap inward toward the viewer.
 *
 * Center card (angle=0°):
 *   z = -R + CYLINDER_Z = -550 + 100 = -450
 *   scale = 1400 / (1400 + 450) = 0.757
 *
 * Edge card (angle=±70°):
 *   z = -R·cos(70°) + CYLINDER_Z = -188 + 100 = -88
 *   scale = 1400 / (1400 + 88) = 0.941
 *
 * Result: edges appear LARGER and wrap toward the viewer — true
 * concave IMAX dome feel. The viewer sits INSIDE the curvature.
 */
const PERSPECTIVE = 1800;
const DOME_RADIUS = 550;
const CYLINDER_Z = 100; // slight forward push so dome isn't too far

/** Scroll rotates dome ±40° around the viewer */
const SCROLL_ROTATION_RANGE = 90;

/** Vertical spacing between card rows */
const ROW_HEIGHT = 250;

/**
 * Curved panoramic memory wall — concave IMAX theater layout.
 *
 * The cylinder is placed so the viewer sits at its center.
 * Scrolling rotates the dome around the viewer.
 * Mouse adds subtle parallax.
 */
export const MemoryWall = ({ scrollRef, onSelect }: MemoryWallProps) => {
  const wallRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const rows = useMemo(() => {
    const grouped: MemoryItem[][] = Array.from({ length: DOME_ROWS }, () => []);
    MEMORIES.forEach((m) => {
      grouped[m.position.row].push(m);
    });
    return grouped;
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      if (!wallRef.current || !containerRef.current) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const progress = scrollRef.current?.progress ?? 0;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const scrollRotation =
        progress * SCROLL_ROTATION_RANGE - SCROLL_ROTATION_RANGE / 2;

      const mouseRotY = mx * 2.5;
      const mouseRotX = my * -1;

      // Push cylinder slightly forward, then rotate around the viewer
      wallRef.current.style.transform = [
        `translateZ(${CYLINDER_Z}px)`,
        `rotateY(${-scrollRotation + mouseRotY}deg)`,
        `rotateX(${mouseRotX}deg)`,
      ].join(" ");

      containerRef.current.style.transform =
        `translate3d(${mx * -6}px, ${my * -4}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scrollRef]);

  const handleSelect = useCallback(
    (memory: MemoryItem) => {
      onSelect(memory);
    },
    [onSelect],
  );

  const ROW_OFFSET_START = -((DOME_ROWS - 1) * ROW_HEIGHT) / 2;

  return (
    <div
      className="memory-wall__perspective"
      ref={containerRef}
      style={{ perspective: `${PERSPECTIVE}px` }}
    >
      <div className="memory-wall__cylinder" ref={wallRef}>
        {rows.map((rowMemories, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="memory-wall__row"
            style={{
              transform: `translateY(${ROW_OFFSET_START + rowIdx * ROW_HEIGHT}px)`,
            }}
          >
            {rowMemories.map((memory) => {
              const angle = memory.position.angle;
              const depth = memory.depth;
              const rotation = memory.rotation;
              const globalIdx = MEMORIES.indexOf(memory);

              return (
                <div
                  key={memory.id}
                  className="memory-wall__card-slot"
                  style={{
                    transform: [
                      `rotateY(${-angle}deg)`,
                      `translateZ(${-(DOME_RADIUS + depth)}px)`,
                      `rotateZ(${rotation}deg)`,
                    ].join(" "),
                  }}
                >
                  <MemoryCard
                    memory={memory}
                    index={globalIdx}
                    onSelect={handleSelect}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
