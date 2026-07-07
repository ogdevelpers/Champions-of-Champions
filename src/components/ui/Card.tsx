import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  interactive?: boolean;
}

export function Card({ className, glow, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-6",
        glow && "shadow-xl shadow-gold/10",
        interactive &&
          "card-shine cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/15",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
