import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
