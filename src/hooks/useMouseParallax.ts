import { useEffect, useRef } from "react";

/**
 * Smooth mouse-tracking hook with very soft damping and inertia.
 *
 * Returns a ref whose `.current` holds the current
 * smoothed { x, y } values in the -1…+1 range.
 *
 * Uses exponential damping for a dreamy, floating feel —
 * the universe drifts gently, never snaps.
 */

interface MouseValues {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
}

export const useMouseParallax = (damping = 0.025) => {
  const values = useRef<MouseValues>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    let rafId: number;

    const onPointerMove = (e: PointerEvent) => {
      values.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      values.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      const v = values.current;
      const prevX = v.x;
      const prevY = v.y;

      // Very soft exponential ease
      v.x += (v.targetX - v.x) * damping;
      v.y += (v.targetY - v.y) * damping;

      v.vx = v.x - prevX;
      v.vy = v.y - prevY;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);
    };
  }, [damping]);

  return values;
};
