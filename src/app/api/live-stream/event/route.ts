import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { LIVE_STREAM_ACTIONS, getLiveStreamUrl, parseStreamEventId } from "@/lib/live-stream";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, metadata, streamUrl } = body as {
      action?: string;
      metadata?: Record<string, unknown>;
      streamUrl?: string;
    };

    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const resolvedStreamUrl =
      typeof streamUrl === "string" && streamUrl.trim()
        ? streamUrl
        : getLiveStreamUrl(session.employeeId);
    const streamEventId = parseStreamEventId(resolvedStreamUrl);

    const supabase = await createServiceClient();
    const { error } = await supabase.from("live_stream_events").insert({
      employee_id: session.employeeId,
      stream_event_id: streamEventId,
      action,
      stream_url: resolvedStreamUrl,
      metadata: {
        ...(metadata ?? {}),
        employee_name: session.name,
        employee_email: session.email,
        is_known_action: LIVE_STREAM_ACTIONS.includes(
          action as (typeof LIVE_STREAM_ACTIONS)[number]
        ),
      },
    });

    if (error) {
      console.error("Live stream event save failed:", error.message);
      return NextResponse.json(
        { error: "Failed to save live stream event", hint: "Run supabase/migration-live-stream-events.sql" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
