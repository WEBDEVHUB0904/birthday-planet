import type { ElementType, ReactNode } from "react";

interface AuroraTextProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export const AuroraText = ({ as: Component = "span", children, className }: AuroraTextProps) => {
  return (
    <Component className={`aurora-text${className ? ` ${className}` : ""}`}>{children}</Component>
  );
};
