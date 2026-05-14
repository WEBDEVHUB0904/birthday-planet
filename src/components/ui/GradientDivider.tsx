import type { HTMLAttributes } from "react";

export const GradientDivider = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={`gradient-divider${className ? ` ${className}` : ""}`} {...props} />;
};
