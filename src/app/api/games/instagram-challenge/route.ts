import { NextRequest, NextResponse } from "next/server";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { createServiceClient } from "@/lib/supabase/server";
import { isGameOpen } from "@/lib/games/config";
import { getInstagramChallengeSubmission } from "@/lib/games/instagram-challenge-status";
import {
  INSTAGRAM_CHALLENGE_BUCKET,
  getInstagramChallengeSignedUrl,
} from "@/lib/games/instagram-challenge-storage";

export const runtime = "edge";

export async function GET() {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  const submission = await getInstagramChallengeSubmission(session.employeeId);
  return NextResponse.json({ submission });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  if (!isGameOpen("instagram-challenge")) {
    return NextResponse.json({ error: "This challenge is currently closed." }, { status: 403 });
  }

  try {
    const existing = await getInstagramChallengeSubmission(session.employeeId);
    if (existing) {
      return NextResponse.json(
        { error: "You have already saved your branded photo." },
        { status: 409 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const fileName = `${session.employeeId}/branded-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(INSTAGRAM_CHALLENGE_BUCKET)
      .upload(fileName, imageFile, { contentType: imageFile.type || "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload branded photo" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(INSTAGRAM_CHALLENGE_BUCKET).getPublicUrl(fileName);
    const capturedAt = new Date().toISOString();
    const brandedImageUrl = await getInstagramChallengeSignedUrl(supabase, urlData.publicUrl);

    const { error: dbError } = await supabase.from("instagram_challenge_submissions").insert({
      employee_id: session.employeeId,
      branded_image_url: urlData.publicUrl,
      photo_captured_at: capturedAt,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        {
          error: dbError.message || "Failed to save submission",
          hint: "Run supabase/game-tables.sql in Supabase SQL Editor",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brandedImageUrl,
      photoCapturedAt: capturedAt,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
