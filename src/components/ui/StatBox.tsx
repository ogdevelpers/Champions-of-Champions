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
        "rounded-2xl border border-gold/30 bg-maroon/60 px-5 py-4 transition-all duration-300",
        urgent && "border-red-400/40 bg-red-950/30 animate-pulse",
        className
      )}
      {...props}
    >
      <p className="text-label text-[10px] font-bold uppercase tracking-[0.15em]">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-3xl font-bold tabular-nums",
          urgent ? "text-red-300" : "text-gold-light"
        )}
      >
        {value}
      </p>
    </div>
  );
}
