import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { createServiceClient } from "@/lib/supabase/server";
import { TOTAL_QUESTIONS, calculateScore, type GuessResult } from "@/lib/game-data/actors";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  try {
    const { score, totalQuestions, timeTakenSeconds, results } = await request.json();

    if (
      typeof score !== "number" ||
      typeof totalQuestions !== "number" ||
      typeof timeTakenSeconds !== "number" ||
      !Array.isArray(results)
    ) {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    const verifiedScore = calculateScore(results as GuessResult[]);
    const isWinner = verifiedScore === TOTAL_QUESTIONS;

    const supabase = await createServiceClient();

    const { data: existingSubmission } = await supabase
      .from("guess_actor_submissions")
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

    const { error } = await supabase.from("guess_actor_submissions").insert({
      employee_id: session.employeeId,
      answers: results,
      score: verifiedScore,
      total_questions: totalQuestions,
      time_taken_seconds: timeTakenSeconds,
      is_winner: isWinner,
    });

    if (error) {
      const message = error.message || "Failed to save results";
      console.error("DB error:", error);
      return NextResponse.json({ error: message, hint: "Run supabase/game-tables.sql in Supabase SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true, score: verifiedScore, totalQuestions, isWinner });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("guess_actor_submissions")
    .select("employee_id, score, total_questions, time_taken_seconds, is_winner, created_at")
    .order("score", { ascending: false })
    .order("time_taken_seconds", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }

  return NextResponse.json({ leaderboard: data });
}
