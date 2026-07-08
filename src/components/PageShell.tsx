import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  overlay?: boolean;
  fitViewport?: boolean;
}

export function PageShell({ children, className, overlay = true, fitViewport = false }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative cinema-background",
        fitViewport ? "h-dvh overflow-hidden" : "min-h-screen",
        overlay && "cinema-vignette",
        !overlay && "cinema-background--clear cinema-vignette--clear",
        className
      )}
    >
      <div
        className={cn(
          "relative z-10 flex flex-col",
          fitViewport ? "h-full overflow-hidden" : "min-h-screen"
        )}
      >
        {children}
      </div>
    </div>
  );
}
