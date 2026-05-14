import { useRef, useCallback } from "react";
import type { MemoryCardProps } from "@/types/memory";

/**
 * Cinematic polaroid-inspired memory card.
 *
 * All hover effects use GPU-composited CSS properties only
 * (transform, opacity, box-shadow) — zero React re-renders.
 *
 * The card is styled as a premium nostalgic polaroid with
 * a warm white border, soft glow, and paper-like texture.
 */
export const MemoryCard = ({ memory, index, onSelect }: MemoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onSelect(memory);
  }, [memory, onSelect]);

  // Stagger entry animation
  const delay = index * 0.04;

  return (
    <div
      ref={cardRef}
      className="memory-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {/* Outer glow layer */}
      <div className="memory-card__glow" />

      {/* Polaroid frame */}
      <div className="memory-card__frame">
        {/* Photo area */}
        <div className="memory-card__image-wrap">
          <img
            src={memory.image}
            alt={memory.caption}
            className="memory-card__image"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          {/* Soft inner shadow for depth */}
          <div className="memory-card__image-overlay" />
        </div>

        {/* Caption area (bottom of polaroid) */}
        <div className="memory-card__caption-area">
          <p className="memory-card__caption">{memory.caption}</p>
          <p className="memory-card__date">{memory.date}</p>
        </div>
      </div>
    </div>
  );
};
