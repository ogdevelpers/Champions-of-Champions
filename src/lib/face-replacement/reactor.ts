export interface ReactorSwapRequest {
  source_image: string;
  target_image: string;
  source_faces_index: number[];
  face_index: number[];
  upscaler: string;
  scale: number;
  upscale_visibility: number;
  face_restorer: string;
  restorer_visibility: number;
  restore_first: number;
  model: string;
  gender_source: number;
  gender_target: number;
  save_to_file: number;
  result_file_path: string;
  device: string;
  mask_face: number;
  select_source: number;
  face_model: string;
  source_folder: string;
  random_image: number;
  upscale_force: number;
  det_thresh: number;
  det_maxnum: number;
}

export interface ReactorSwapResponse {
  image: string;
}

export function buildReactorPayload(
  sourceImage: string,
  targetImage: string
): ReactorSwapRequest {
  return {
    source_image: sourceImage,
    target_image: targetImage,
    source_faces_index: [0],
    face_index: [0],
    upscaler: "RealESRGAN_x2plus",
    scale: 1,
    upscale_visibility: 0.7,
    face_restorer: "CodeFormer",
    restorer_visibility: 0.3,
    restore_first: 0,
    model: "inswapper_128.onnx",
    gender_source: 0,
    gender_target: 0,
    save_to_file: 0,
    result_file_path: "",
    device: "CUDA",
    mask_face: 0,
    select_source: 0,
    face_model: "None",
    source_folder: "",
    random_image: 0,
    upscale_force: 0,
    det_thresh: 0.6,
    det_maxnum: 1,
  };
}

export function getReactorApiUrl(): string {
  return (
    process.env.REACTOR_API_URL ??
    "https://coherent-repeatedly-frog.ngrok-free.app/reactor/image"
  );
}
