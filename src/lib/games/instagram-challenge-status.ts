import { createServiceClient } from "@/lib/supabase/server";
import { getInstagramChallengeSignedUrl } from "@/lib/games/instagram-challenge-storage";

export interface InstagramChallengeSubmission {
  branded_image_url: string;
  photo_captured_at: string;
  instagram_screenshot_url: string | null;
  likes_count: number | null;
  screenshot_uploaded_at: string | null;
}

export async function getInstagramChallengeSubmission(
  employeeId: string
): Promise<InstagramChallengeSubmission | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("instagram_challenge_submissions")
    .select(
      "branded_image_url, photo_captured_at, instagram_screenshot_url, likes_count, screenshot_uploaded_at"
    )
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch instagram challenge submission:", error.message);
    return null;
  }

  if (!data) return null;

  const brandedImageUrl = await getInstagramChallengeSignedUrl(supabase, data.branded_image_url);
  const screenshotUrl = data.instagram_screenshot_url
    ? await getInstagramChallengeSignedUrl(supabase, data.instagram_screenshot_url)
    : null;

  return {
    ...data,
    branded_image_url: brandedImageUrl,
    instagram_screenshot_url: screenshotUrl,
  };
}
