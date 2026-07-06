import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { ACTOR_QUESTIONS, calculateScore } from "@/lib/game-data/actors";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { answers, timeTakenSeconds } = await request.json();

    if (!answers || typeof timeTakenSeconds !== "number") {
      return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
    }

    const score = calculateScore(answers);
    const totalQuestions = ACTOR_QUESTIONS.length;
    const isWinner = score === totalQuestions;

    const supabase = await createServiceClient();
    const { error } = await supabase.from("guess_actor_submissions").insert({
      employee_id: session.employeeId,
      answers,
      score,
      total_questions: totalQuestions,
      time_taken_seconds: timeTakenSeconds,
      is_winner: isWinner,
    });

    if (error) {
      const message = error.message || "Failed to save results";
      console.error("DB error:", error);
      return NextResponse.json({ error: message, hint: "Run supabase/game-tables.sql in Supabase SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true, score, totalQuestions, isWinner });
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
