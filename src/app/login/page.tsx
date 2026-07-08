import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { LoginForm } from "@/components/LoginForm";
import { PageShell } from "@/components/PageShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <PageShell overlay={false}>
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <Suspense fallback={<LoadingSpinner label="Loading..." />}>
          <LoginForm />
        </Suspense>
      </div>
    </PageShell>
  );
}
