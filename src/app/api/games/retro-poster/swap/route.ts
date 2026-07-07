import { NextRequest, NextResponse } from "next/server";
import { requirePlayableSession } from "@/lib/require-playable-session";
import { POSTER_TEMPLATES } from "@/lib/game-data/posters";
import {
  buildReactorPayload,
  getReactorApiUrl,
  ReactorSwapResponse,
} from "@/lib/face-replacement/reactor";

export const runtime = "edge";

function mimeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function loadPosterAsDataUri(
  request: NextRequest,
  imageUrl: string
): Promise<string> {
  const origin = new URL(request.url).origin;
  const posterUrl = new URL(imageUrl, origin);
  const response = await fetch(posterUrl);

  if (!response.ok) {
    throw new Error(`Failed to load poster: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Poster asset is not an image (${contentType || "unknown"})`);
  }

  const buffer = await response.arrayBuffer();
  const mimeType = mimeFromUrl(imageUrl);

  return `data:${mimeType};base64,${arrayBufferToBase64(buffer)}`;
}

export async function POST(request: NextRequest) {
  const { response } = await requirePlayableSession();
  if (response) return response;

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

    const targetImage = await loadPosterAsDataUri(request, poster.imageUrl);
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
