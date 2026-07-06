import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "outline" | "muted";
}

export function Badge({ className, variant = "gold", children, ...props }: BadgeProps) {
  const variants = {
    gold: "bg-gold/15 text-gold border-gold/25",
    outline: "border border-gold/30 text-gold bg-transparent",
    muted: "bg-cream/5 text-cream/60 border-cream/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
