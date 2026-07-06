import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-gold/30 bg-maroon/50 px-4 py-3 text-cream",
        "placeholder:text-cream/35 transition-all duration-300",
        "focus:border-gold focus:outline-none input-glow",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
