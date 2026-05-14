interface BlurOrbProps {
  size: number;
  x: string;
  y: string;
  opacity?: number;
  className?: string;
}

export const BlurOrb = ({ size, x, y, opacity = 0.35, className }: BlurOrbProps) => {
  return (
    <span
      className={`blur-orb${className ? ` ${className}` : ""}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: x,
        top: y,
        opacity,
      }}
    />
  );
};
