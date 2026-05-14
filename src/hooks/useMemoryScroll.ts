import { useEffect, useRef, useCallback } from "react";

interface MemoryScrollValues {
  /** Smoothed scroll offset (pixels) */
  scrollY: number;
  /** Raw target scroll offset */
  targetY: number;
  /** Normalized progress 0–1 across total scroll range */
  progress: number;
  /** Whether the user is actively scrolling */
  isScrolling: boolean;
}

interface UseMemoryScrollOptions {
  /** Total scrollable range in pixels */
  totalRange?: number;
  /** Scroll sensitivity multiplier */
  sensitivity?: number;
  /** Lerp damping (0–1, lower = smoother) */
  damping?: number;
  /** Whether scrolling is enabled */
  enabled?: boolean;
}

/**
 * Cinematic scroll hook for the Memory Dome.
 *
 * Captures wheel events and provides ultra-smooth lerp-interpolated
 * scroll values via a ref (no React re-renders during scrolling).
 *
 * Designed to match the project's existing performance-first pattern
 * (see useMouseParallax.ts).
 */
export function useMemoryScroll({
  totalRange = 3000,
  sensitivity = 1.2,
  damping = 0.06,
  enabled = true,
}: UseMemoryScrollOptions = {}) {
  const values = useRef<MemoryScrollValues>({
    scrollY: 0,
    targetY: 0,
    progress: 0,
    isScrolling: false,
  });

  const scrollTimeout = useRef<number>(0);

  const clamp = useCallback(
    (v: number) => Math.max(0, Math.min(totalRange, v)),
    [totalRange],
  );

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      values.current.targetY = clamp(
        values.current.targetY + e.deltaY * sensitivity,
      );
      values.current.isScrolling = true;

      // Clear and reset the "stopped scrolling" timer
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = window.setTimeout(() => {
        values.current.isScrolling = false;
      }, 150);
    };

    const tick = () => {
      const v = values.current;
      // Smooth exponential ease toward target
      v.scrollY += (v.targetY - v.scrollY) * damping;
      v.progress = totalRange > 0 ? v.scrollY / totalRange : 0;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId);
      clearTimeout(scrollTimeout.current);
    };
  }, [enabled, totalRange, sensitivity, damping, clamp]);

  return values;
}
