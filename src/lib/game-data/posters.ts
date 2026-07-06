import { FaceLandmarks } from "../face-replacement/landmarks";

export interface PosterTemplate {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  imageUrl: string;
  accentColor: string;
  /** Pre-calibrated hero face landmarks on the poster (normalized 0–1) */
  targetFace: FaceLandmarks;
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "don",
    title: "DON",
    subtitle: "The Chase Begins Again",
    year: "1978",
    imageUrl: "/games/posters/don.jpg",
    accentColor: "#FFD700",
    targetFace: {
      leftEye: { x: 0.198, y: 0.168 },
      rightEye: { x: 0.398, y: 0.152 },
      nose: { x: 0.278, y: 0.278 },
      mouthLeft: { x: 0.218, y: 0.372 },
      mouthRight: { x: 0.368, y: 0.358 },
      chin: { x: 0.288, y: 0.468 },
      forehead: { x: 0.288, y: 0.082 },
      leftCheek: { x: 0.152, y: 0.268 },
      rightCheek: { x: 0.428, y: 0.252 },
    },
  },
  {
    id: "sholay",
    title: "SHOLAY",
    subtitle: "The Greatest Story Ever Told",
    year: "1975",
    imageUrl: "/games/posters/sholay.jpg",
    accentColor: "#FFD700",
    targetFace: {
      leftEye: { x: 0.545, y: 0.118 },
      rightEye: { x: 0.625, y: 0.115 },
      nose: { x: 0.585, y: 0.158 },
      mouthLeft: { x: 0.552, y: 0.188 },
      mouthRight: { x: 0.618, y: 0.185 },
      chin: { x: 0.585, y: 0.218 },
      forehead: { x: 0.585, y: 0.092 },
      leftCheek: { x: 0.528, y: 0.152 },
      rightCheek: { x: 0.642, y: 0.148 },
    },
  },
  {
    id: "mughal-e-azam",
    title: "MUGHAL-E-AZAM",
    subtitle: "An Epic of Eternal Love",
    year: "1960",
    imageUrl: "/games/posters/mughal-e-azam.jpg",
    accentColor: "#c9a227",
    targetFace: {
      leftEye: { x: 0.168, y: 0.208 },
      rightEye: { x: 0.318, y: 0.198 },
      nose: { x: 0.238, y: 0.298 },
      mouthLeft: { x: 0.188, y: 0.368 },
      mouthRight: { x: 0.308, y: 0.358 },
      chin: { x: 0.238, y: 0.428 },
      forehead: { x: 0.238, y: 0.128 },
      leftCheek: { x: 0.128, y: 0.288 },
      rightCheek: { x: 0.358, y: 0.278 },
    },
  },
  {
    id: "joker",
    title: "MERA NAAM JOKER",
    subtitle: "The Show Must Go On",
    year: "1970",
    imageUrl: "/games/posters/joker.jpg",
    accentColor: "#ff6b35",
    targetFace: {
      leftEye: { x: 0.378, y: 0.132 },
      rightEye: { x: 0.588, y: 0.128 },
      nose: { x: 0.478, y: 0.238 },
      mouthLeft: { x: 0.408, y: 0.328 },
      mouthRight: { x: 0.558, y: 0.322 },
      chin: { x: 0.478, y: 0.388 },
      forehead: { x: 0.478, y: 0.062 },
      leftCheek: { x: 0.318, y: 0.248 },
      rightCheek: { x: 0.648, y: 0.242 },
    },
  },
];
