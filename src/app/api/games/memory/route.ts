import { NextRequest, NextResponse } from "next/server";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { createServiceClient } from "@/lib/supabase/server";
import { GAMES_CLOSED_HEADLINE, GAMES_CLOSED_MESSAGE, isGameOpen } from "@/lib/games/config";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  if (!isGameOpen("memory")) {
    return NextResponse.json(
      { error: `${GAMES_CLOSED_HEADLINE} ${GAMES_CLOSED_MESSAGE}` },
      { status: 403 }
    );
  }

  try {
    const { actions, timeTakenSeconds, completed } = await request.json();

    if (typeof actions !== "number" || typeof timeTakenSeconds !== "number") {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: existingSubmission } = await supabase
      .from("memory_game_results")
      .select("id")
      .eq("employee_id", session.employeeId)
      .limit(1)
      .maybeSingle();

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted your score for this game." },
        { status: 409 }
      );
    }

    const { error } = await supabase.from("memory_game_results").insert({
      employee_id: session.employeeId,
      actions,
      time_taken_seconds: timeTakenSeconds,
      completed: completed ?? true,
    });

    if (error) {
      const message = error.message || "Failed to save results";
      console.error("DB error:", error);
      return NextResponse.json({ error: message, hint: "Run supabase/game-tables.sql in Supabase SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
