import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface StatBoxProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  urgent?: boolean;
}

export function StatBox({ label, value, urgent, className, ...props }: StatBoxProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gold/20 bg-maroon/40 px-5 py-4 transition-all duration-300",
        urgent && "border-red-400/40 bg-red-950/30 animate-pulse",
        className
      )}
      {...props}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold/70">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-3xl font-bold tabular-nums",
          urgent ? "text-red-400" : "text-gold"
        )}
      >
        {value}
      </p>
    </div>
  );
}
