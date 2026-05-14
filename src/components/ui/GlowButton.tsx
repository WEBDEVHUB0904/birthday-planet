import type { ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const GlowButton = ({ label, className, children, ...props }: GlowButtonProps) => {
  return (
    <button type="button" className={`glow-button${className ? ` ${className}` : ""}`} {...props}>
      {children ?? label}
    </button>
  );
};
