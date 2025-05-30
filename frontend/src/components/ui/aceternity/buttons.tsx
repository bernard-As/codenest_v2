// frontend/src/components/ui/aceternity/buttons.tsx (Example - copy from Aceternity UI)
"use client"; // Required for many Aceternity components
import React from "react";
import { cn } from "../../../lib/utils"; // Adjust path
import { Link, type LinkProps } from "react-router-dom";

// Example: Moving Border Button (adapt from Aceternity UI's button examples)
interface MovingBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType;
  to?: LinkProps['to']; // For react-router-dom Link
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  children: React.ReactNode;
}

export const MovingBorderButton = React.forwardRef<HTMLButtonElement, MovingBorderButtonProps>(
  (
    {
      children,
      containerClassName,
      borderClassName,
      duration,
      className,
      as: Component = "button", // Default to button
      to, // For react-router-dom Link
      ...props
    },
    ref
  ) => {
    const ComponentToRender = to ? Link : Component;
    return (
      <ComponentToRender
        {...(to && { to })} // Spread 'to' prop only if it exists (for Link)
        className={cn(
          "bg-transparent relative text-xl p-[1px] overflow-hidden ",
          containerClassName
        )}
        {...props}
        ref={ref}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-lg",
            "bg-[radial-gradient(var(--blue-500)_40%,transparent_60%)]" // Example gradient
          )}
        />
        <span
          className={cn(
            `absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]`,
            borderClassName
          )}
        />

        <span
          className={cn(
            "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950/80 dark:bg-slate-900/90 px-6 py-3 text-sm font-medium text-white backdrop-blur-3xl",
            className
          )}
        >
          {children}
        </span>
      </ComponentToRender>
    );
  }
);
MovingBorderButton.displayName = "MovingBorderButton";