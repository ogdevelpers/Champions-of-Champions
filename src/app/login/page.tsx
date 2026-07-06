import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";
import { PageShell } from "@/components/PageShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <PageShell>
      <div className="flex min-h-screen items-center justify-center p-4 film-strip">
        <Suspense fallback={<LoadingSpinner label="Loading..." />}>
          <LoginForm />
        </Suspense>
      </div>
    </PageShell>
  );
}
