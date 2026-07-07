import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

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
        { error: "You are not eligible to play games. Please contact your administrator." },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}
