import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MemoryItem } from "@/types/memory";

interface MemoryModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
}

/**
 * Cinematic fullscreen memory viewer.
 *
 * Opens with a smooth scale/fade transition via Framer Motion.
 * Blurred galaxy background + enlarged image + emotional caption.
 * Click anywhere or press Escape to close.
 */
export const MemoryModal = ({ memory, onClose }: MemoryModalProps) => {
  // Close on Escape
  useEffect(() => {
    if (!memory) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [memory, onClose]);

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          className="memory-modal__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          {/* Content card */}
          <motion.div
            className="memory-modal__content"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="memory-modal__image-container">
              <img
                src={memory.image}
                alt={memory.caption}
                className="memory-modal__image"
                draggable={false}
              />
              {/* Soft glow border */}
              <div className="memory-modal__image-glow" />
            </div>

            {/* Text */}
            <motion.div
              className="memory-modal__text"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="memory-modal__label">Memory</p>
              <h2 className="memory-modal__caption">{memory.caption}</h2>
              <p className="memory-modal__date">{memory.date}</p>
            </motion.div>

            <p className="memory-modal__hint">click anywhere to return</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
