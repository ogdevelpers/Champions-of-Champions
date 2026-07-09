import { createServiceClient } from "@/lib/supabase/server";

export interface MemorySubmissionSummary {
  actions: number;
  time_taken_seconds: number;
  created_at: string;
}

export async function getMemorySubmission(
  employeeId: string
): Promise<MemorySubmissionSummary | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("memory_game_results")
    .select("actions, time_taken_seconds, created_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch memory submission:", error.message);
    return null;
  }

  return data;
}
