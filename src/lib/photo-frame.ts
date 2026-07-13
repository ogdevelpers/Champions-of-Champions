const FRAME_SRC = "/games/instagram-challenge/frame.png";

export const FRAME_IMAGE_SRC = FRAME_SRC;
export const FRAME_ASPECT_RATIO = 3 / 4;
export const FRAME_WIDTH = 768;
export const FRAME_HEIGHT = 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function isPlaceholderPixel(r: number, g: number, b: number): boolean {
  const isDark = r < 40 && g < 40 && b < 40;
  const isLight = r > 220 && g > 220 && b > 220;
  return isDark || isLight;
}

function getSourceSize(img: CanvasImageSource): { width: number; height: number } | null {
  if (img instanceof HTMLVideoElement) {
    return { width: img.videoWidth, height: img.videoHeight };
  }
  if (img instanceof HTMLImageElement || img instanceof HTMLCanvasElement) {
    return { width: img.width, height: img.height };
  }
  return null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const size = getSourceSize(img);
  if (!size || !size.width || !size.height) return;

  const scale = Math.max(w / size.width, h / size.height);
  const sw = size.width * scale;
  const sh = size.height * scale;
  const sx = x + (w - sw) / 2;
  const sy = y + (h - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh);
}

function createFrameOverlay(frame: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(frame, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    if (isPlaceholderPixel(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export async function loadFrameOverlayImage(): Promise<HTMLImageElement> {
  const frame = await loadImage(FRAME_SRC);
  const overlay = createFrameOverlay(frame);
  const dataUrl = overlay.toDataURL("image/png");
  return loadImage(dataUrl);
}

export function drawCameraPreview(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  overlay: HTMLImageElement,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  drawCover(ctx, video, 0, 0, width, height);
  ctx.restore();

  ctx.drawImage(overlay, 0, 0, width, height);
}

export async function composeBrandedPhoto(photoDataUrl: string): Promise<Blob> {
  const [frame, userPhoto, overlayImage] = await Promise.all([
    loadImage(FRAME_SRC),
    loadImage(photoDataUrl),
    loadFrameOverlayImage(),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, frame.width, frame.height);
  drawCover(ctx, userPhoto, 0, 0, frame.width, frame.height);
  ctx.drawImage(overlayImage, 0, 0, frame.width, frame.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create image"))),
      "image/jpeg",
      0.92
    );
  });
}
