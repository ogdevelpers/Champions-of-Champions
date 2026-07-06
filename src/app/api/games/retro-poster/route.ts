import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const posterId = formData.get("posterId") as string;
    const imageFile = formData.get("image") as File;

    if (!posterId || !imageFile) {
      return NextResponse.json({ error: "Missing poster or image data" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const fileName = `${session.employeeId}/${posterId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("retro-posters")
      .upload(fileName, imageFile, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("retro-posters").getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("retro_poster_submissions").insert({
      employee_id: session.employeeId,
      poster_id: posterId,
      image_url: urlData.publicUrl,
    });

    if (dbError) {
      const message = dbError.message || "Failed to save submission";
      console.error("DB error:", dbError);
      return NextResponse.json({ error: message, hint: "Run supabase/game-tables.sql in Supabase SQL Editor" }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
