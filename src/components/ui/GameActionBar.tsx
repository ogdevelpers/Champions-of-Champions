import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GameActionBarProps {
  children: ReactNode;
  className?: string;
}

export function GameActionBar({ children, className }: GameActionBarProps) {
  return (
    <div
      className={cn(
        "glass-panel w-full rounded-2xl border border-gold/30 p-4 shadow-xl shadow-black/30",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        {children}
      </div>
    </div>
  );
}

export const gameActionButtonClass = "w-full sm:w-auto sm:min-w-[9rem]";
