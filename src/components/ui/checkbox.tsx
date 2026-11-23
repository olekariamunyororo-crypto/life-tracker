"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

// Native checkbox styled to match the design system (accent color, no extra deps).
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 dark:border-gray-600 accent-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
