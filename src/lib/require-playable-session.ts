import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { EVENT_SCHEDULE_MESSAGE } from "@/lib/games/config";

export async function requirePlayableSession() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!session.canPlayGames) {
    return {
      session: null,
      response: NextResponse.json(
        { error: EVENT_SCHEDULE_MESSAGE },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}
