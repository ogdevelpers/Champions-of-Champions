import { FaceLandmarks, Point, distance, midpoint, toPixelLandmarks } from "./landmarks";

function computeSimilarityTransform(
  src: FaceLandmarks,
  dst: FaceLandmarks,
  scaleBoost = 1.12
): { translateX: number; translateY: number; rotation: number; scale: number; srcCenter: Point } {
  const srcCenter = midpoint(src.leftEye, src.rightEye);
  const dstCenter = midpoint(dst.leftEye, dst.rightEye);

  const srcEyeDist = distance(src.leftEye, src.rightEye);
  const dstEyeDist = distance(dst.leftEye, dst.rightEye);
  const scale = (dstEyeDist / srcEyeDist) * scaleBoost;

  const srcAngle = Math.atan2(src.rightEye.y - src.leftEye.y, src.rightEye.x - src.leftEye.x);
  const dstAngle = Math.atan2(dst.rightEye.y - dst.leftEye.y, dst.rightEye.x - dst.leftEye.x);
  const rotation = dstAngle - srcAngle;

  const noseShift = {
    x: dst.nose.x - dstCenter.x - (src.nose.x - srcCenter.x) * scale,
    y: dst.nose.y - dstCenter.y - (src.nose.y - srcCenter.y) * scale,
  };

  return {
    translateX: dstCenter.x + noseShift.x * 0.35,
    translateY: dstCenter.y + noseShift.y * 0.35,
    rotation,
    scale,
    srcCenter,
  };
}

function applyTransform(
  ctx: CanvasRenderingContext2D,
  transform: ReturnType<typeof computeSimilarityTransform>,
  draw: () => void
) {
  ctx.save();
  ctx.translate(transform.translateX, transform.translateY);
  ctx.rotate(transform.rotation);
  ctx.scale(transform.scale, transform.scale);
  ctx.translate(-transform.srcCenter.x, -transform.srcCenter.y);
  draw();
  ctx.restore();
}

function drawSoftFaceMask(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarks,
  featherRatio = 0.18
) {
  const center = midpoint(
    midpoint(landmarks.leftEye, landmarks.rightEye),
    midpoint(landmarks.nose, landmarks.chin)
  );
  const rx = distance(landmarks.leftCheek, landmarks.rightCheek) * 0.58;
  const ry = distance(landmarks.forehead, landmarks.chin) * 0.62;
  const angle = Math.atan2(
    landmarks.rightEye.y - landmarks.leftEye.y,
    landmarks.rightEye.x - landmarks.leftEye.x
  );

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);

  const innerRx = rx * (1 - featherRatio);
  const innerRy = ry * (1 - featherRatio);
  const gradient = ctx.createRadialGradient(0, 0, Math.min(innerRx, innerRy), 0, 0, Math.max(rx, ry));
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.95)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function applyVintageGrade(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(196, 154, 108, 0.12)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(255, 230, 190, 0.08)";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export async function compositeFaceOnPoster(
  posterImg: HTMLImageElement,
  selfieImg: HTMLImageElement,
  targetLandmarks: FaceLandmarks,
  sourceLandmarks: FaceLandmarks
): Promise<string> {
  const width = posterImg.naturalWidth;
  const height = posterImg.naturalHeight;

  const dst = toPixelLandmarks(targetLandmarks, width, height);
  const src = toPixelLandmarks(sourceLandmarks, selfieImg.naturalWidth, selfieImg.naturalHeight);

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const outputCtx = output.getContext("2d")!;

  outputCtx.drawImage(posterImg, 0, 0, width, height);

  const faceLayer = document.createElement("canvas");
  faceLayer.width = width;
  faceLayer.height = height;
  const faceCtx = faceLayer.getContext("2d")!;

  const transform = computeSimilarityTransform(src, dst);
  applyTransform(faceCtx, transform, () => {
    faceCtx.drawImage(selfieImg, 0, 0);
  });

  const maskLayer = document.createElement("canvas");
  maskLayer.width = width;
  maskLayer.height = height;
  const maskCtx = maskLayer.getContext("2d")!;
  drawSoftFaceMask(maskCtx, dst);

  faceCtx.globalCompositeOperation = "destination-in";
  faceCtx.drawImage(maskLayer, 0, 0);
  faceCtx.globalCompositeOperation = "source-over";

  applyVintageGrade(faceCtx, width, height);

  outputCtx.drawImage(faceLayer, 0, 0);

  return output.toDataURL("image/png");
}

/** Fallback when landmark detection fails — uses target face region only */
export async function compositeFaceOnPosterFallback(
  posterImg: HTMLImageElement,
  selfieImg: HTMLImageElement,
  targetLandmarks: FaceLandmarks
): Promise<string> {
  const width = posterImg.naturalWidth;
  const height = posterImg.naturalHeight;
  const dst = toPixelLandmarks(targetLandmarks, width, height);

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const ctx = output.getContext("2d")!;

  ctx.drawImage(posterImg, 0, 0, width, height);

  const faceLayer = document.createElement("canvas");
  faceLayer.width = width;
  faceLayer.height = height;
  const faceCtx = faceLayer.getContext("2d")!;

  const center = midpoint(
    midpoint(dst.leftEye, dst.rightEye),
    midpoint(dst.nose, dst.chin)
  );
  const faceW = distance(dst.leftCheek, dst.rightCheek) * 1.35;
  const faceH = distance(dst.forehead, dst.chin) * 1.25;
  const angle = Math.atan2(dst.rightEye.y - dst.leftEye.y, dst.rightEye.x - dst.leftEye.x);

  faceCtx.save();
  faceCtx.translate(center.x, center.y);
  faceCtx.rotate(angle);
  faceCtx.drawImage(
    selfieImg,
    -faceW / 2,
    -faceH / 2,
    faceW,
    faceH
  );
  faceCtx.restore();

  const maskLayer = document.createElement("canvas");
  maskLayer.width = width;
  maskLayer.height = height;
  const maskCtx = maskLayer.getContext("2d")!;
  drawSoftFaceMask(maskCtx, dst);

  faceCtx.globalCompositeOperation = "destination-in";
  faceCtx.drawImage(maskLayer, 0, 0);

  applyVintageGrade(faceCtx, width, height);
  ctx.drawImage(faceLayer, 0, 0);

  return output.toDataURL("image/png");
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
