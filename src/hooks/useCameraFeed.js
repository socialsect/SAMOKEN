import { useEffect, useRef } from "react";

export default function useCameraFeed(enabled = true) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }

    startCamera();
  }, [enabled]);

  return videoRef;
}
