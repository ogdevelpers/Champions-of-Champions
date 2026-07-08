import { createServiceClient } from "@/lib/supabase/server";

export interface GuessActorSubmissionSummary {
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  created_at: string;
}

export async function getGuessActorSubmission(
  employeeId: string
): Promise<GuessActorSubmissionSummary | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("guess_actor_submissions")
    .select("score, total_questions, time_taken_seconds, created_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch guess actor submission:", error.message);
    return null;
  }

  return data;
}
