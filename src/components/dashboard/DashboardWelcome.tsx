import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmployeeSession } from "@/lib/auth";

interface DashboardWelcomeProps {
  session: EmployeeSession;
}

export function DashboardWelcome({ session }: DashboardWelcomeProps) {
  return (
    <Card glow className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-gold/15 via-brand-header/80 to-brand-header/90 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <Badge variant="outline" className="mb-4">
              Employee Portal
            </Badge>
            <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl md:text-4xl">
              <span className="gold-gradient-text">Welcome back</span>
              {session.name ? `, ${session.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-body mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base md:mx-0">
              Watch the live event, then jump into the Bollywood games to compete and win.
            </p>
          </div>

          <dl className="grid w-full grid-cols-1 gap-3 sm:max-w-md md:max-w-xs md:shrink-0">
            <div className="rounded-2xl border border-gold/25 bg-brand-header/80 px-4 py-3 text-center sm:text-left">
              <dt className="text-label text-[11px] font-semibold uppercase tracking-wider">
                Employee ID
              </dt>
              <dd className="mt-1 font-bold text-gold-light">{session.employeeId}</dd>
            </div>
            <div className="rounded-2xl border border-gold/25 bg-brand-header/80 px-4 py-3 text-center sm:text-left">
              <dt className="text-label text-[11px] font-semibold uppercase tracking-wider">
                Game Access
              </dt>
              <dd className="mt-1 font-semibold text-cream">
                {session.canPlayGames ? (
                  <span className="text-emerald-200">Eligible to play</span>
                ) : (
                  <span className="text-amber-100">View only</span>
                )}
              </dd>
            </div>
            {session.email && (
              <div className="rounded-2xl border border-gold/25 bg-brand-header/80 px-4 py-3 text-center sm:text-left">
                <dt className="text-label text-[11px] font-semibold uppercase tracking-wider">
                  Email
                </dt>
                <dd className="text-body mt-1 break-all text-sm font-medium">{session.email}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Card>
  );
}
