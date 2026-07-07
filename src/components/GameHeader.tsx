"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  showBack?: boolean;
}

export function GameHeader({ title, subtitle, backHref = "/dashboard", showBack = true }: GameHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 animate-fade-in-down border-b border-gold/20 bg-maroon-dark/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          {showBack && (
            <Link
              href={backHref}
              className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-300 hover:scale-105 hover:border-gold hover:bg-gold/10 hover:shadow-lg hover:shadow-gold/20"
              aria-label="Back to dashboard"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            </Link>
          )}
          <div>
            <p className="text-label text-[10px] font-bold uppercase tracking-[0.25em] md:text-xs">
              ★ Champions of Champions ★
            </p>
            <h1 className="font-display text-lg font-bold text-cream md:text-2xl">{title}</h1>
            {subtitle && (
              <p className="text-body text-xs md:text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
          Logout
        </Button>
      </div>
    </header>
  );
}
