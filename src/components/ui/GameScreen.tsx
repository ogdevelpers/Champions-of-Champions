import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/Animated";

interface GameStartCardProps {
  emoji: string;
  title: string;
  subtitle?: string;
  description: string;
  ctaLabel?: string;
  onStart: () => void;
}

export function GameStartCard({
  emoji,
  title,
  subtitle,
  description,
  ctaLabel = "Start Game",
  onStart,
}: GameStartCardProps) {
  return (
    <FadeIn className="mx-auto max-w-lg">
      <Card glow className="text-center">
        <div className="animate-float mb-6 text-7xl">{emoji}</div>
        <h2 className="font-display text-3xl font-bold gold-gradient-text">{title}</h2>
        {subtitle && <p className="text-body mt-2 text-lg">{subtitle}</p>}
        <p className="text-body mx-auto mt-5 max-w-sm leading-relaxed">{description}</p>
        <Button onClick={onStart} className="mt-8 animate-pulse-gold" size="lg">
          {ctaLabel}
        </Button>
      </Card>
    </FadeIn>
  );
}

interface GameResultCardProps {
  emoji: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function GameResultCard({ emoji, title, children, footer }: GameResultCardProps) {
  return (
    <FadeIn className="mx-auto max-w-lg">
      <Card glow className="text-center">
        <div className="animate-confetti mb-4 text-7xl">{emoji}</div>
        <h2 className="font-display text-2xl font-bold gold-gradient-text">{title}</h2>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-8">{footer}</div>}
      </Card>
    </FadeIn>
  );
}
