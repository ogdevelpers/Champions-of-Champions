export interface Point {
  x: number;
  y: number;
}

/** Normalized 0–1 coordinates on the poster image */
export interface FaceLandmarks {
  leftEye: Point;
  rightEye: Point;
  nose: Point;
  mouthLeft: Point;
  mouthRight: Point;
  chin: Point;
  forehead: Point;
  leftCheek: Point;
  rightCheek: Point;
}

export const LANDMARK_INDEX = {
  NOSE_TIP: 1,
  FOREHEAD: 10,
  LEFT_EYE: 33,
  MOUTH_LEFT: 61,
  CHIN: 152,
  RIGHT_EYE: 263,
  MOUTH_RIGHT: 291,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
} as const;

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function toPixelLandmarks(landmarks: FaceLandmarks, width: number, height: number): FaceLandmarks {
  const scale = (p: Point): Point => ({ x: p.x * width, y: p.y * height });
  return {
    leftEye: scale(landmarks.leftEye),
    rightEye: scale(landmarks.rightEye),
    nose: scale(landmarks.nose),
    mouthLeft: scale(landmarks.mouthLeft),
    mouthRight: scale(landmarks.mouthRight),
    chin: scale(landmarks.chin),
    forehead: scale(landmarks.forehead),
    leftCheek: scale(landmarks.leftCheek),
    rightCheek: scale(landmarks.rightCheek),
  };
}
