import { useEffect, useRef } from 'react';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/analyze-frame`;

export default function useBallTracker(
  videoRef,
  canvasRef,
  running,
  onBall,      // callback(x, y)
  onComplete,  // callback({ avg, stddev, recommendation })
  onDetect,    // callback() when ball is detected
  intervalMs = 100
) {
  const timerRef = useRef();

  useEffect(() => {
    if (!running) {
      clearInterval(timerRef.current);
      return;
    }

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');

    timerRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      off.width  = video.videoWidth;
      off.height = video.videoHeight;
      offCtx.drawImage(video, 0, 0, off.width, off.height);

      off.toBlob(async (blob) => {
        if (!blob) return;

        try {
          // wrap in FormData under the key "frame"
          const form = new FormData();
          form.append('frame', blob, 'frame.jpg');

          const resp = await fetch(BACKEND_URL, {
            method: 'POST',
            body: form
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error('Tracker 400:', text);
            throw new Error(`${resp.status} ${resp.statusText}`);
          }

          const json = await resp.json();
          console.log('Tracker JSON:', json);

          if (json.putt_complete) {
            onComplete({
              avg:            json.avg,
              stddev:         json.stddev,
              recommendation: json.recommendation
            });
          } else if (
            typeof json.x === 'number' &&
            typeof json.y === 'number'
          ) {
            onDetect();
            onBall(json.x, json.y);
          }
        } catch (err) {
          console.error('Tracker error:', err);
        }
      }, 'image/jpeg');
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [running, videoRef, onBall, onComplete, intervalMs]);
}