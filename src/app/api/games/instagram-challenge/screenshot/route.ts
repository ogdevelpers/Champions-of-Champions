import { NextRequest, NextResponse } from "next/server";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { createServiceClient } from "@/lib/supabase/server";
import { isGameOpen } from "@/lib/games/config";
import {
  canUploadScreenshot,
  // getScreenshotDeadlineLabel,
  getScreenshotUnlockLabel,
  // isScreenshotSubmissionClosed,
} from "@/lib/games/instagram-challenge";
import { getInstagramChallengeSubmission } from "@/lib/games/instagram-challenge-status";
import {
  INSTAGRAM_CHALLENGE_BUCKET,
  getInstagramChallengeSignedUrl,
} from "@/lib/games/instagram-challenge-storage";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { session, response } = await requirePlayableSession();
  if (response) return response;

  if (!isGameOpen("instagram-challenge")) {
    return NextResponse.json({ error: "This challenge is currently closed." }, { status: 403 });
  }

  try {
    const submission = await getInstagramChallengeSubmission(session.employeeId);
    if (!submission) {
      return NextResponse.json({ error: "Save your branded photo first." }, { status: 400 });
    }

    if (submission.instagram_screenshot_url) {
      return NextResponse.json({ error: "Screenshot already uploaded." }, { status: 409 });
    }

    // Closing window check — re-enable later with SCREENSHOT_DEADLINE_AT
    // if (isScreenshotSubmissionClosed()) {
    //   return NextResponse.json(
    //     { error: `Screenshot upload closed at ${getScreenshotDeadlineLabel()}.` },
    //     { status: 403 }
    //   );
    // }

    if (!canUploadScreenshot(submission.photo_captured_at)) {
      return NextResponse.json(
        { error: `Screenshot upload unlocks on ${getScreenshotUnlockLabel()}.` },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const screenshotFile = formData.get("screenshot") as File | null;
    const likesRaw = formData.get("likesCount");

    if (!screenshotFile) {
      return NextResponse.json({ error: "Missing screenshot image" }, { status: 400 });
    }

    const likesCount = Number(likesRaw);
    if (!Number.isFinite(likesCount) || likesCount < 0) {
      return NextResponse.json({ error: "Enter a valid likes count." }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const ext = screenshotFile.type.includes("png") ? "png" : "jpg";
    const fileName = `${session.employeeId}/screenshot-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(INSTAGRAM_CHALLENGE_BUCKET)
      .upload(fileName, screenshotFile, {
        contentType: screenshotFile.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Screenshot upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload screenshot" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(INSTAGRAM_CHALLENGE_BUCKET).getPublicUrl(fileName);
    const uploadedAt = new Date().toISOString();
    const screenshotUrl = await getInstagramChallengeSignedUrl(supabase, urlData.publicUrl);

    const { error: dbError } = await supabase
      .from("instagram_challenge_submissions")
      .update({
        instagram_screenshot_url: urlData.publicUrl,
        likes_count: Math.floor(likesCount),
        screenshot_uploaded_at: uploadedAt,
      })
      .eq("employee_id", session.employeeId);

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Failed to save screenshot details" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      screenshotUrl,
      likesCount: Math.floor(likesCount),
      screenshotUploadedAt: uploadedAt,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
