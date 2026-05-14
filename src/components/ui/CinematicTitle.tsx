import type { ReactNode } from "react";

interface CinematicTitleProps {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

export const CinematicTitle = ({ label, title, subtitle, className }: CinematicTitleProps) => {
  return (
    <div className={`cinematic-title${className ? ` ${className}` : ""}`}>
      {label && <p className="cinematic-title__label">{label}</p>}
      <div className="cinematic-title__title">{title}</div>
      {subtitle && <p className="cinematic-title__subtitle">{subtitle}</p>}
    </div>
  );
};
