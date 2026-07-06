import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = "md", label, className }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-gold border-t-transparent",
          sizes[size]
        )}
      />
      {label && <p className="text-sm text-gold/80 animate-pulse">{label}</p>}
    </div>
  );
}
