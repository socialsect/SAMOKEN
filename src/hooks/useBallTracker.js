
import { useEffect } from 'react';

const BACKEND_URL = 'https://runner-web-app-backend.onrender.com/analyze-frame';

export default function useBallTracker(videoRef, running, setResult) {
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(async () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];

        try {
          const res = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: base64Data })
          });
          const json = await res.json();
          setResult(json);
        } catch (err) {
          console.error('Tracker error:', err);
        }
      }, 500);
    }

    return () => clearInterval(interval);
  }, [running, videoRef, setResult]);
}