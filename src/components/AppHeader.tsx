"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  showBack?: boolean;
  showLogout?: boolean;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  backHref = "/dashboard",
  showBack = false,
  showLogout = false,
  className,
}: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const hasGameNav = showBack && (title || subtitle);
  const hasTitleBlock = title || subtitle || showBack;

  return (
    <header
      className={cn(
        "header-gradient sticky top-0 z-50 w-full shrink-0 border-b border-gold/20",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-2 py-1.5 sm:px-4 sm:py-3 md:px-6">
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
          <Image
            src="/images/left-logo.png"
            alt="Champion of Champions 2026"
            width={767}
            height={325}
            priority
            className="h-8 w-auto shrink-0 object-contain object-left sm:h-9 md:h-11 lg:h-12"
            sizes="(max-width: 640px) 110px, (max-width: 768px) 140px, 320px"
          />

          {hasTitleBlock && !hasGameNav && (
            <div className="hidden min-w-0 flex-1 items-center gap-1.5 sm:flex sm:gap-2.5">
              {showBack && (
                <Link
                  href={backHref}
                  className="group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10 sm:h-9 sm:w-9"
                  aria-label="Back to dashboard"
                >
                  <span className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5 sm:text-base">
                    ←
                  </span>
                </Link>
              )}
              {(title || subtitle) && (
                <div className="min-w-0 flex-1">
                  {title && (
                    <h1 className="truncate font-display text-sm font-bold text-cream sm:text-base md:text-lg">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-body truncate text-xs sm:text-sm">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {hasTitleBlock && !hasGameNav && <div className="min-w-0 flex-1 sm:hidden" />}

          {hasGameNav && (
            <div className="hidden min-w-0 flex-1 items-center gap-2.5 sm:flex">
              <Link
                href={backHref}
                className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10"
                aria-label="Back to dashboard"
              >
                <span className="text-base transition-transform duration-300 group-hover:-translate-x-0.5">
                  ←
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="truncate font-display text-base font-bold text-cream md:text-lg">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-body truncate text-sm">{subtitle}</p>
                )}
              </div>
            </div>
          )}

          {!hasTitleBlock && <div className="min-w-0 flex-1" />}
          {hasGameNav && <div className="min-w-0 flex-1 sm:hidden" />}

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {showLogout && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="px-2 py-1 text-[10px] sm:px-3 sm:py-2 sm:text-xs md:text-sm"
              >
                Logout
              </Button>
            )}
            <Image
              src="/images/right-logo.png"
              alt="TATA AIG Insurance — 25 Years"
              width={800}
              height={400}
              priority
              className="h-8 w-auto shrink-0 object-contain object-right sm:h-9 md:h-11 lg:h-12"
              sizes="(max-width: 640px) 110px, (max-width: 768px) 120px, 240px"
            />
          </div>
        </div>

        {hasGameNav && (
          <div className="mt-2 flex items-center gap-2 sm:hidden">
            <Link
              href={backHref}
              className="group flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-300 hover:border-gold hover:bg-gold/10"
              aria-label="Back to dashboard"
            >
              <span className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="truncate font-display text-sm font-bold text-cream">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-body truncate text-xs">{subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
