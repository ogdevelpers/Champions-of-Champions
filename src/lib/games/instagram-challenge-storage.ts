import type { SupabaseClient } from "@supabase/supabase-js";

export const INSTAGRAM_CHALLENGE_BUCKET = "instagram-challenge";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getInstagramChallengeStoragePath(storedUrl: string): string | null {
  const markers = [
    `/object/public/${INSTAGRAM_CHALLENGE_BUCKET}/`,
    `/object/sign/${INSTAGRAM_CHALLENGE_BUCKET}/`,
  ];

  for (const marker of markers) {
    const index = storedUrl.indexOf(marker);
    if (index === -1) continue;
    return decodeURIComponent(storedUrl.slice(index + marker.length).split("?")[0]);
  }

  return null;
}

export async function getInstagramChallengeSignedUrl(
  supabase: SupabaseClient,
  storedUrl: string
): Promise<string> {
  const path = getInstagramChallengeStoragePath(storedUrl);
  if (!path) return storedUrl;

  const { data, error } = await supabase.storage
    .from(INSTAGRAM_CHALLENGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Failed to create signed URL:", error?.message);
    return storedUrl;
  }

  return data.signedUrl;
}
