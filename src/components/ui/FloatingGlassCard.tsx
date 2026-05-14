import type { HTMLAttributes } from "react";

export const FloatingGlassCard = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`floating-glass${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </div>
  );
};
