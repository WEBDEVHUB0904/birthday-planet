interface FloatingHeartProps {
  size?: number;
  x: string;
  y: string;
  delay?: number;
  className?: string;
}

export const FloatingHeart = ({ size = 18, x, y, delay = 0, className }: FloatingHeartProps) => {
  return (
    <span
      className={`floating-heart${className ? ` ${className}` : ""}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: x,
        top: y,
        animationDelay: `${delay}s`,
      }}
    />
  );
};
