import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { POSTER_TEMPLATES } from "@/lib/game-data/posters";
import {
  buildReactorPayload,
  getReactorApiUrl,
  ReactorSwapResponse,
} from "@/lib/face-replacement/reactor";

export const runtime = "nodejs";

function toBase64DataUri(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function loadPosterAsDataUri(imageUrl: string): Promise<string> {
  const relativePath = imageUrl.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relativePath);
  const buffer = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mimeType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  return toBase64DataUri(buffer, mimeType);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceImage, posterId } = body as {
      sourceImage?: string;
      posterId?: string;
    };

    if (!sourceImage || !posterId) {
      return NextResponse.json(
        { error: "Missing source image or poster selection" },
        { status: 400 }
      );
    }

    const poster = POSTER_TEMPLATES.find((p) => p.id === posterId);
    if (!poster) {
      return NextResponse.json({ error: "Invalid poster" }, { status: 400 });
    }

    const targetImage = await loadPosterAsDataUri(poster.imageUrl);
    const payload = buildReactorPayload(sourceImage, targetImage);

    const reactorResponse = await fetch(getReactorApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    if (!reactorResponse.ok) {
      const errorText = await reactorResponse.text();
      return NextResponse.json(
        { error: "Face swap failed", details: errorText },
        { status: 502 }
      );
    }

    const data = (await reactorResponse.json()) as ReactorSwapResponse;

    if (!data.image) {
      return NextResponse.json(
        { error: "Face swap returned no image" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      image: `data:image/jpeg;base64,${data.image}`,
    });
  } catch (error) {
    console.error("Reactor swap error:", error);
    return NextResponse.json(
      { error: "Could not generate poster. Please try again." },
      { status: 500 }
    );
  }
}
