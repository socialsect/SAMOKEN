import { useEffect, useState } from 'react';

export default function useCamera(videoRef) {
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;

          // Only play once video metadata is loaded
          video.onloadedmetadata = () => {
            video.play().catch(err => {
              setError('Camera play() failed: ' + err.message);
            });
          };
        }
      } catch (err) {
        setError('Camera Error: ' + err.message);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  return { error };
}