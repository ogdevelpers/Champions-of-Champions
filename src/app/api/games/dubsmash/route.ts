import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const clipId = formData.get("clipId") as string;
    const videoFile = formData.get("video") as File;

    if (!clipId || !videoFile) {
      return NextResponse.json({ error: "Missing clip or video data" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const ext = videoFile.type.includes("webm") ? "webm" : "mp4";
    const fileName = `${session.employeeId}/${clipId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("dubsmash-videos")
      .upload(fileName, videoFile, { contentType: videoFile.type, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("dubsmash-videos").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("dubsmash_submissions").insert({
      employee_id: session.employeeId,
      clip_id: clipId,
      video_url: urlData.publicUrl,
    });

    if (dbError) {
      const message = dbError.message || "Failed to save submission";
      console.error("DB error:", dbError);
      return NextResponse.json({ error: message, hint: "Run supabase/game-tables.sql in Supabase SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true, videoUrl: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
