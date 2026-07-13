import { NextRequest, NextResponse } from "next/server";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { createServiceClient } from "@/lib/supabase/server";
import { isGameOpen } from "@/lib/games/config";
import { canPlayInstagramChallenge } from "@/lib/games/instagram-challenge";
import { getInstagramChallengeSubmission } from "@/lib/games/instagram-challenge-status";
import {
  INSTAGRAM_CHALLENGE_BUCKET,
  getInstagramChallengeSignedUrl,
} from "@/lib/games/instagram-challenge-storage";

export const runtime = "edge";

export async function GET() {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  if (!canPlayInstagramChallenge(session.employeeId)) {
    return NextResponse.json(
      { error: "Champion Click is only available for eligible employee IDs." },
      { status: 403 }
    );
  }

  const submission = await getInstagramChallengeSubmission(session.employeeId);
  return NextResponse.json({ submission });
}

export async function POST(request: NextRequest) {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  if (!canPlayInstagramChallenge(session.employeeId)) {
    return NextResponse.json(
      { error: "Champion Click is only available for eligible employee IDs." },
      { status: 403 }
    );
  }

  if (!isGameOpen("instagram-challenge")) {
    return NextResponse.json({ error: "This challenge is currently closed." }, { status: 403 });
  }

  try {
    const existing = await getInstagramChallengeSubmission(session.employeeId);
    if (existing?.instagram_screenshot_url) {
      return NextResponse.json(
        { error: "You have already completed this challenge." },
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

    const row = {
      employee_id: session.employeeId,
      branded_image_url: urlData.publicUrl,
      photo_captured_at: capturedAt,
      instagram_screenshot_url: null,
      likes_count: null,
      screenshot_uploaded_at: null,
    };

    const { error: dbError } = existing
      ? await supabase
          .from("instagram_challenge_submissions")
          .update(row)
          .eq("employee_id", session.employeeId)
      : await supabase.from("instagram_challenge_submissions").insert(row);

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
