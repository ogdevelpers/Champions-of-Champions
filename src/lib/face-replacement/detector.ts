import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { FaceLandmarks, LANDMARK_INDEX } from "./landmarks";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

const WASM_BASE = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/face_landmarker.task";

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
    })();
  }
  return landmarkerPromise;
}

function pickLandmark(face: NormalizedLandmark[], index: number) {
  return { x: face[index].x, y: face[index].y };
}

export function landmarksFromDetection(face: NormalizedLandmark[]): FaceLandmarks {
  return {
    leftEye: pickLandmark(face, LANDMARK_INDEX.LEFT_EYE),
    rightEye: pickLandmark(face, LANDMARK_INDEX.RIGHT_EYE),
    nose: pickLandmark(face, LANDMARK_INDEX.NOSE_TIP),
    mouthLeft: pickLandmark(face, LANDMARK_INDEX.MOUTH_LEFT),
    mouthRight: pickLandmark(face, LANDMARK_INDEX.MOUTH_RIGHT),
    chin: pickLandmark(face, LANDMARK_INDEX.CHIN),
    forehead: pickLandmark(face, LANDMARK_INDEX.FOREHEAD),
    leftCheek: pickLandmark(face, LANDMARK_INDEX.LEFT_CHEEK),
    rightCheek: pickLandmark(face, LANDMARK_INDEX.RIGHT_CHEEK),
  };
}

function toDetectionCanvas(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): HTMLCanvasElement {
  if (source instanceof HTMLCanvasElement && source.width > 0 && source.height > 0) {
    return source;
  }

  let width = 0;
  let height = 0;

  if (source instanceof HTMLImageElement) {
    width = source.naturalWidth;
    height = source.naturalHeight;
  } else if (source instanceof HTMLVideoElement) {
    width = source.videoWidth;
    height = source.videoHeight;
  }

  if (!width || !height) {
    throw new Error("Image is not ready for face detection");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export async function detectFaceLandmarks(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<FaceLandmarks | null> {
  try {
    const landmarker = await getFaceLandmarker();
    const canvas = toDetectionCanvas(source);
    const result = landmarker.detect(canvas);
    if (!result.faceLandmarks?.length) return null;
    return landmarksFromDetection(result.faceLandmarks[0]);
  } catch {
    return null;
  }
}
