import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen cinema-vignette">
      <div className="relative z-10">{children}</div>
    </div>
  );
}
