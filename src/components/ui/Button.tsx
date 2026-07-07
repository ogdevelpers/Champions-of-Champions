import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-gold to-gold-light text-maroon shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:brightness-110 active:scale-[0.97]",
      secondary:
        "border-2 border-gold/60 text-gold bg-gold/5 hover:bg-gold/15 hover:border-gold active:scale-[0.97]",
      ghost:
        "border border-cream/25 text-cream bg-white/5 hover:bg-white/10 hover:border-gold/40 hover:text-cream active:scale-[0.97]",
      danger:
        "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-[0.97]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
          "transition-all duration-300 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
