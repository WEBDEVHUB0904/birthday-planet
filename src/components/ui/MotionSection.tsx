import { motion } from "framer-motion";
import type { HTMLAttributes } from "react";

interface MotionSectionProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

export const MotionSection = ({ delay = 0, className, children, ...props }: MotionSectionProps) => {
  return (
    <motion.section
      className={`motion-section${className ? ` ${className}` : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
};
