export async function createMixedRecordingStream(
  cameraStream: MediaStream,
  audioUrl: string
): Promise<{
  stream: MediaStream;
  dialogueAudio: HTMLAudioElement;
  cleanup: () => void;
}> {
  const audioContext = new AudioContext();
  await audioContext.resume();

  const destination = audioContext.createMediaStreamDestination();

  if (cameraStream.getAudioTracks().length > 0) {
    const micSource = audioContext.createMediaStreamSource(cameraStream);
    const micGain = audioContext.createGain();
    micGain.gain.value = 0.4;
    micSource.connect(micGain);
    micGain.connect(destination);
  }

  const dialogueAudio = new Audio(audioUrl);
  dialogueAudio.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    if (dialogueAudio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve();
      return;
    }
    dialogueAudio.addEventListener("canplaythrough", () => resolve(), { once: true });
    dialogueAudio.addEventListener("error", () => reject(new Error("Failed to load dialogue audio")), {
      once: true,
    });
    dialogueAudio.load();
  });

  const dialogueSource = audioContext.createMediaElementSource(dialogueAudio);
  const dialogueGain = audioContext.createGain();
  dialogueGain.gain.value = 1;
  dialogueSource.connect(dialogueGain);
  dialogueGain.connect(destination);
  dialogueGain.connect(audioContext.destination);

  const mixedStream = new MediaStream([
    ...cameraStream.getVideoTracks(),
    ...destination.stream.getAudioTracks(),
  ]);

  const cleanup = () => {
    dialogueAudio.pause();
    dialogueAudio.currentTime = 0;
    void audioContext.close();
  };

  return { stream: mixedStream, dialogueAudio, cleanup };
}
