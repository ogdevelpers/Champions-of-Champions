import { EVENT_SCHEDULE_HEADLINE, EVENT_SCHEDULE_MESSAGE } from "@/lib/games/config";

export function EventScheduleNotice() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-gold/30 bg-amber-500/15 px-6 py-8 text-center">
      <p className="font-display text-2xl font-bold text-gold-light sm:text-3xl">
        {EVENT_SCHEDULE_HEADLINE}
      </p>
      <p className="text-body mt-4 text-base leading-relaxed text-cream/85 sm:text-lg">
        {EVENT_SCHEDULE_MESSAGE}
      </p>
    </div>
  );
}
