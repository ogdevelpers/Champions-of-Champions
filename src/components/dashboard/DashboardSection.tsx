import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  variant?: "default" | "elevated" | "stream";
}

export function DashboardSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
  variant = "default",
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24",
        variant === "stream" &&
          "panel-surface rounded-2xl border border-gold/30 p-4 sm:rounded-3xl sm:p-6 md:p-8",
        variant === "elevated" &&
          "panel-elevated rounded-2xl border border-gold/30 p-4 shadow-xl shadow-black/30 sm:rounded-3xl sm:p-6 md:p-8",
        variant === "default" && "space-y-6",
        className
      )}
    >
      <header className={cn(variant !== "default" && "mb-5 text-center sm:mb-6 sm:text-left md:mb-8")}>
        {eyebrow && (
          <p className="text-label text-[11px] font-bold uppercase tracking-[0.28em]">
            {eyebrow}
          </p>
        )}
        <h2 className={cn("font-display text-2xl font-bold text-cream md:text-3xl", eyebrow && "mt-2")}>
          {title}
        </h2>
        {description && (
          <p className="text-body mt-2 max-w-2xl text-sm leading-relaxed md:text-base">
            {description}
          </p>
        )}
      </header>

      <div className={contentClassName}>{children}</div>
    </section>
  );
}
