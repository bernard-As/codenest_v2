/* eslint-disable @typescript-eslint/no-empty-object-type */
// frontend/src/components/ui/aceternity/Input.tsx (Conceptual example)
"use client";
import React from 'react';
import { cn } from '../../../lib/utils'; // Adjust path
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface InputProps extends HTMLMotionProps<"input"> {}

const AceternityInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input // Example: using motion for potential animations
        type={type}
        className={cn(
          "flex h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder-text-neutral-600 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none transition duration-400",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
AceternityInput.displayName = "Input";
export { AceternityInput };