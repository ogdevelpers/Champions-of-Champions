import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "outline" | "muted";
}

export function Badge({ className, variant = "gold", children, ...props }: BadgeProps) {
  const variants = {
    gold: "bg-gold/20 text-gold-light border-gold/40 font-semibold",
    outline: "border border-gold/45 text-gold-light bg-gold/10 font-semibold",
    muted: "bg-cream/10 text-cream border-cream/20 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
