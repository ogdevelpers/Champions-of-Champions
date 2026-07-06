import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  direction?: "up" | "down" | "none";
}

export function FadeIn({
  className,
  delay = 0,
  direction = "up",
  children,
  style,
  ...props
}: FadeInProps) {
  const anim =
    direction === "up"
      ? "animate-fade-in-up"
      : direction === "down"
        ? "animate-fade-in-down"
        : "animate-fade-in";

  return (
    <div
      className={cn(anim, className)}
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

interface StaggerProps extends HTMLAttributes<HTMLDivElement> {
  index?: number;
  baseDelay?: number;
}

export function Stagger({
  className,
  index = 0,
  baseDelay = 80,
  children,
  style,
  ...props
}: StaggerProps) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${index * baseDelay}ms`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
