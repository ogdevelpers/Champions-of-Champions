import { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PageShell } from "@/components/PageShell";

interface GamePageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  fitViewport?: boolean;
}

export function GamePageLayout({ title, subtitle, children, fitViewport = false }: GamePageLayoutProps) {
  return (
    <PageShell overlay={false} fitViewport={fitViewport}>
      <AppHeader title={title} subtitle={subtitle} showBack showLogout />
      {children}
    </PageShell>
  );
}
